#!/usr/bin/env bash
# biletsatis redeploy — pratik redeploy yapısına uygun: önce temizlik, sonra tam kurulum
# Sunucuda: chmod +x deploy.sh && ./deploy.sh

set -e

# CRLF düzelt (Windows'tan kopyalanınca "bash\r" hatası olmasın)
SCRIPT_PATH="$(cd "$(dirname "$0")" && pwd)/$(basename "$0")"
sed -i 's/\r$//' "$SCRIPT_PATH" 2>/dev/null || true

NAME="biletsatis"
DOMAIN="${DOMAIN:-biletsatis.omurgenc.dev}"
APP_DIR="${APP_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
BACKEND_DIR="$APP_DIR/b"
FRONTEND_DIR="$APP_DIR/f"
BACKEND_ENV="$BACKEND_DIR/.env.production"
DEPLOY_ENV="$APP_DIR/deploy/.env.production"
EXAMPLE="$APP_DIR/deploy/.env.production.example"

echo "=== biletsatis redeploy ==="
echo "Domain: $DOMAIN"
echo "App dir: $APP_DIR"
echo ""

# --- 1) Kalıntı temizliği (pratik’teki gibi önce temizle) ---
echo "Eski build ve kalıntılar temizleniyor..."
rm -rf "$BACKEND_DIR/dist"
rm -rf "$FRONTEND_DIR/dist"
# Opsiyonel: node_modules cache (npm ci zaten temiz kurar)
rm -rf "$BACKEND_DIR/node_modules/.cache" 2>/dev/null || true
rm -rf "$FRONTEND_DIR/node_modules/.cache" 2>/dev/null || true
echo "  b/dist, f/dist ve cache temizlendi."
echo ""

# --- 2) Production env (deploy/.env.production -> b/.env.production) ---
echo "Production env güncelleniyor..."
if [ -f "$DEPLOY_ENV" ]; then
  cp "$DEPLOY_ENV" "$BACKEND_ENV"
  sed -i 's/\r$//' "$DEPLOY_ENV" "$BACKEND_ENV" 2>/dev/null || true
  echo "  b/.env.production güncellendi (deploy/.env.production'tan)."
elif [ ! -f "$BACKEND_ENV" ]; then
  if [ -f "$EXAMPLE" ]; then
    cp "$EXAMPLE" "$BACKEND_ENV"
    echo "  Oluşturuldu: $BACKEND_ENV (örnekten). DB_PASSWORD, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET düzenleyin, sonra tekrar ./deploy.sh çalıştırın."
    exit 1
  else
    echo "HATA: $BACKEND_ENV yok. deploy/.env.production veya deploy/.env.production.example bulunamadı."
    exit 1
  fi
fi
echo ""

# .env'den DB bilgilerini oku (pratik gibi tek kullanıcı: postgres)
DB_HOST=$(grep -E "^DB_HOST=" "$BACKEND_ENV" 2>/dev/null | cut -d= -f2- | sed -e 's/^[ "\t]*//;s/[ "\t\r]*$//') || true
DB_PORT=$(grep -E "^DB_PORT=" "$BACKEND_ENV" 2>/dev/null | cut -d= -f2- | sed -e 's/^[ "\t]*//;s/[ "\t\r]*$//') || true
DB_USER=$(grep -E "^DB_USER=" "$BACKEND_ENV" 2>/dev/null | cut -d= -f2- | sed -e 's/^[ "\t]*//;s/[ "\t\r]*$//') || true
DB_NAME=$(grep -E "^DB_NAME=" "$BACKEND_ENV" 2>/dev/null | cut -d= -f2- | sed -e 's/^[ "\t]*//;s/[ "\t\r]*$//') || true
DB_PASS=$(grep -E "^DB_PASSWORD=" "$BACKEND_ENV" 2>/dev/null | cut -d= -f2- | sed -e 's/^["\t ]*//;s/["\t \r]*$//') || true

# --- 3) DB: pratik gibi — yedek varsa pg_restore, yoksa schema.sql (ikisi de postgres ile) ---
if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_NAME" ] || [ -z "$DB_PASS" ]; then
  echo "UYARI: DB_HOST/DB_USER/DB_NAME/DB_PASSWORD .env.production'da yok; DB adımları atlanıyor."
else
  export PGPASSWORD="$DB_PASS"
  if [ "${CREATE_DB}" = "1" ]; then
    echo "Veritabanı oluşturuluyor (pratik gibi)..."
    psql -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" -d postgres -v ON_ERROR_STOP=0 -c "CREATE DATABASE ${DB_NAME};" 2>/dev/null || true
    echo "  DB hazır."
  fi
  DB_BACKUP_DIR="$APP_DIR/deploy/db-backup"
  DB_BACKUP_FILE=""
  for f in "$DB_BACKUP_DIR/biletsatisdbyedek.sql" "$DB_BACKUP_DIR/biletsatisdbyedek"; do
    if [ -f "$f" ]; then DB_BACKUP_FILE="$f"; break; fi
  done
  if [ -n "$DB_BACKUP_FILE" ]; then
    echo "DB yedek yükleniyor (pratik gibi): $DB_BACKUP_FILE"
    if head -c 5 "$DB_BACKUP_FILE" 2>/dev/null | grep -q "PGDMP"; then
      pg_restore -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" --clean --if-exists --no-owner --no-acl "$DB_BACKUP_FILE" 2>/dev/null || echo "  UYARI: pg_restore hata verdi, devam ediliyor."
    else
      psql -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=0 -f "$DB_BACKUP_FILE" || echo "  UYARI: yedek yüklenemedi, devam ediliyor."
    fi
  else
    echo "Şema uygulanıyor (yedek yok, schema.sql)..."
    psql -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=0 -f "$BACKEND_DIR/sql/schema.sql" 2>/dev/null || echo "  UYARI: schema.sql hata verdi, devam ediliyor."
  fi
  echo "  Postgres erisim haklari veriliyor (tum tablo/sequence: $DB_USER)..."
  psql -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=0 -c "GRANT ALL ON ALL TABLES IN SCHEMA public TO $DB_USER; GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO $DB_USER; GRANT USAGE ON SCHEMA public TO $DB_USER;" 2>/dev/null || true
  unset PGPASSWORD
  echo ""
fi

# --- 4) Backend: bağımlılıklar, build (db:init yok, pratik gibi) ---
echo "Backend: bağımlılıklar ve build..."
cd "$BACKEND_DIR"
mkdir -p uploads/posters

# Tek seferlik: deploy/posters-backup içindeki afişleri b/uploads/posters'a kopyala (DB yedeğiyle uyumlu)
POSTERS_BACKUP="$APP_DIR/deploy/posters-backup"
if [ -d "$POSTERS_BACKUP" ] && [ -n "$(ls -A "$POSTERS_BACKUP" 2>/dev/null)" ]; then
  echo "Afiş yedegi kopyalaniyor: $POSTERS_BACKUP -> b/uploads/posters"
  cp -a "$POSTERS_BACKUP"/* "$BACKEND_DIR/uploads/posters/" 2>/dev/null || true
  echo "  Posterler yuklendi."
fi

npm ci
export NODE_ENV=production

echo "Backend build alınıyor..."
npm run build
echo ""

# --- 5) Frontend: build (devDependencies gerekli: typescript, vite) ---
echo "Frontend: bağımlılıklar ve build..."
cd "$FRONTEND_DIR"
npm ci --include=dev
VITE_API_BASE_URL="https://${DOMAIN}/api" npm run build
if [ ! -f "$FRONTEND_DIR/dist/index.html" ]; then
  echo "HATA: Frontend build index.html uretmedi. f/dist/index.html yok."
  exit 1
fi
echo "  Frontend build tamam (index.html mevcut)."
echo ""

# --- 6) PM2: backend’i yeniden başlat ---
echo "PM2: eski process kaldiriliyor, temiz baslatiliyor..."
cd "$BACKEND_DIR"
pm2 delete biletsatis-api 2>/dev/null || true
NODE_ENV=production pm2 start dist/app.js --name biletsatis-api
pm2 save
echo "  biletsatis-api temiz baslatildi (env: b/.env.production)."
echo "  Backend saglik kontrolu (3 sn)..."
sleep 3
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3001/api/health 2>/dev/null || echo "000")
if [ "$HEALTH" = "200" ]; then
  echo "  Backend yanit veriyor (200)."
else
  echo "  UYARI: Backend /api/health $HEALTH dondu. pm2 logs biletsatis-api ile kontrol edin."
fi
echo ""

# --- 7) Nginx: config kopyala ve reload ---
echo "Nginx config güncelleniyor..."
if [ -d /etc/nginx/sites-available ]; then
  if [ -f "$APP_DIR/deploy/nginx.conf" ]; then
    sudo cp "$APP_DIR/deploy/nginx.conf" /etc/nginx/sites-available/biletsatis
    [ -d /etc/nginx/sites-enabled ] && sudo ln -sf /etc/nginx/sites-available/biletsatis /etc/nginx/sites-enabled/
    if sudo nginx -t 2>/dev/null; then
      sudo systemctl reload nginx
      echo "  Nginx guncellendi ve reload edildi."
    else
      echo "  HATA: nginx -t basarisiz. Config hatali."
      exit 1
    fi
  fi
else
  echo "  /etc/nginx/sites-available yok, Nginx atlandi."
fi
echo ""

# --- 8) SSL (certbot) ---
if command -v certbot &>/dev/null; then
  echo "SSL sertifikası kontrol ediliyor..."
  if sudo certbot certificates 2>/dev/null | grep -q "biletsatis.omurgenc.dev"; then
    sudo certbot install --cert-name biletsatis.omurgenc.dev --nginx --non-interactive 2>/dev/null || true
  else
    sudo certbot --nginx -d biletsatis.omurgenc.dev --non-interactive --agree-tos --register-unsafely-without-email 2>/dev/null || true
  fi
  sudo nginx -t && sudo systemctl reload nginx 2>/dev/null || true
  echo "  SSL güncellendi."
  echo ""
fi

# --- Özet (pratik’teki gibi) ---
echo "=== Deploy tamamlandı ==="
echo "  Backend:  pm2 biletsatis-api  (log: pm2 logs biletsatis-api)"
echo "  Frontend: $FRONTEND_DIR/dist"
echo "  Site:     https://$DOMAIN"
echo ""
echo "=== Hızlı test ==="
echo "  curl -s -o /dev/null -w '%{http_code}' https://$DOMAIN/api/health"
echo ""
