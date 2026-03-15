#!/usr/bin/env bash
# biletsatis Docker redeploy — pratik tarzı (sunucuda birden fazla proje)
# Proje kökünde: ./deploy/redeploy-docker.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
sed -i 's/\r$//' "$0" 2>/dev/null || true

# --- Müşteri / port (pratik ile çakışmasın) ---
NAME="biletsatis"
DOMAIN="${DOMAIN:-biletsatis.omurgenc.dev}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-devbros123}"
DB_PORT="${DB_PORT:-5433}"
NGINX_HTTP_PORT="${NGINX_HTTP_PORT:-9001}"
NGINX_HTTPS_PORT="${NGINX_HTTPS_PORT:-9441}"
ACCESS_TOKEN_SECRET="${ACCESS_TOKEN_SECRET:-$(openssl rand -hex 32)}"
REFRESH_TOKEN_SECRET="${REFRESH_TOKEN_SECRET:-$(openssl rand -hex 32)}"

# deploy/.env.production varsa oradan oku (şifreler repoda olmasın)
PROD_ENV="$APP_DIR/deploy/.env.production"
if [ -f "$PROD_ENV" ]; then
  sed -i 's/\r$//' "$PROD_ENV" 2>/dev/null || true
  v=$(grep -E "^DB_PASSWORD=" "$PROD_ENV" 2>/dev/null | cut -d= -f2- | sed 's/^["\t ]*//;s/["\t \r]*$//'); [ -n "$v" ] && POSTGRES_PASSWORD="$v"
  v=$(grep -E "^ACCESS_TOKEN_SECRET=" "$PROD_ENV" 2>/dev/null | cut -d= -f2- | sed 's/^["\t ]*//;s/["\t \r]*$//'); [ -n "$v" ] && ACCESS_TOKEN_SECRET="$v"
  v=$(grep -E "^REFRESH_TOKEN_SECRET=" "$PROD_ENV" 2>/dev/null | cut -d= -f2- | sed 's/^["\t ]*//;s/["\t \r]*$//'); [ -n "$v" ] && REFRESH_TOKEN_SECRET="$v"
fi

echo "=== biletsatis Docker redeploy ==="
echo "Domain: $DOMAIN"
echo "DB port: $DB_PORT  Nginx HTTP: $NGINX_HTTP_PORT  HTTPS: $NGINX_HTTPS_PORT"
echo ""

# --- Eski container'ları durdur ---
echo "Container'lar durduruluyor..."
cd "$APP_DIR"
docker compose down 2>/dev/null || true
for c in biletsatis_db biletsatis_backend biletsatis_frontend biletsatis_nginx; do
  docker stop "$c" 2>/dev/null || true
  docker rm -f "$c" 2>/dev/null || true
done
echo ""

# --- .env (docker-compose için) ---
echo ".env güncelleniyor..."
cat > "$APP_DIR/.env" << EOF
DOMAIN=$DOMAIN
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
DB_PORT=$DB_PORT
NGINX_HTTP_PORT=$NGINX_HTTP_PORT
NGINX_HTTPS_PORT=$NGINX_HTTPS_PORT
ACCESS_TOKEN_SECRET=$ACCESS_TOKEN_SECRET
REFRESH_TOKEN_SECRET=$REFRESH_TOKEN_SECRET
EOF
echo ""

# --- Build ve up ---
echo "Build alınıyor..."
docker compose build --no-cache

echo "Container'lar başlatılıyor..."
docker compose up -d --remove-orphans --force-recreate

echo "DB hazır olana kadar bekleniyor..."
for i in $(seq 1 30); do
  if PGPASSWORD="$POSTGRES_PASSWORD" psql -h 127.0.0.1 -p "$DB_PORT" -U postgres -d biletsatis -c "select 1" >/dev/null 2>&1; then
    echo "  PostgreSQL hazır."
    break
  fi
  [ "$i" -eq 30 ] && echo "  UYARI: DB 30 denemede hazır olmadı."
  sleep 2
done
echo ""

# --- Şema veya yedek (pratik gibi) ---
DB_BACKUP=""
for f in "$APP_DIR/deploy/db-backup/biletsatisdbyedek.sql" "$APP_DIR/deploy/db-backup/biletsatisdbyedek"; do
  [ -f "$f" ] && DB_BACKUP="$f" && break
done
if [ -n "$DB_BACKUP" ]; then
  echo "DB yedek yükleniyor: $DB_BACKUP"
  export PGPASSWORD="$POSTGRES_PASSWORD"
  if head -c 5 "$DB_BACKUP" 2>/dev/null | grep -q "PGDMP"; then
    pg_restore -h 127.0.0.1 -p "$DB_PORT" -U postgres -d biletsatis --clean --if-exists --no-owner --no-acl "$DB_BACKUP" 2>/dev/null || echo "  UYARI: pg_restore hata verdi."
  else
    psql -h 127.0.0.1 -p "$DB_PORT" -U postgres -d biletsatis -v ON_ERROR_STOP=0 -f "$DB_BACKUP" 2>/dev/null || echo "  UYARI: yedek yüklenemedi."
  fi
  unset PGPASSWORD
else
  echo "Şema uygulanıyor (schema.sql)..."
  export PGPASSWORD="$POSTGRES_PASSWORD"
  psql -h 127.0.0.1 -p "$DB_PORT" -U postgres -d biletsatis -v ON_ERROR_STOP=0 -f "$APP_DIR/b/sql/schema.sql" 2>/dev/null || echo "  UYARI: schema.sql hata verdi."
  unset PGPASSWORD
fi
echo ""

# --- Özet ---
echo "=== Docker deploy tamamlandı ==="
echo "  Site (container): http://127.0.0.1:$NGINX_HTTP_PORT"
echo "  Dış erişim: Ana sunucu Nginx'i $NGINX_HTTP_PORT'a proxy edip SSL ekleyebilir (pratik gibi)."
echo "  Log: docker compose logs -f"
echo ""
