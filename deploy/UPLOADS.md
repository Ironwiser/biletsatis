# Afiş / uploads dosyalarını sunucuya yükleme

Afişler ve organizasyon görselleri **sunucuda** `b/uploads/posters/` dizininde tutulur. Backend bu dizinden `/uploads/posters/...` olarak servis eder.

## 0) Tek seferlik kurulum: deploy ile poster yükleme

DB yedeğiyle birlikte afişleri de tek seferde yüklemek için:

1. **Yerelde** (veya yedeğinizde) afiş dosyalarınızı `deploy/posters-backup/` klasörüne koyun. Dosya adları DB’deki `poster_url` ile uyumlu olmalı (örn. `xyz-uuid.webp`).
2. Projeyi sunucuya atarken `deploy/posters-backup/` içeriğini de götürün (veya sunucuda bu klasöre dosyaları kopyalayın).
3. `./deploy.sh` çalıştırın. Script, `deploy/posters-backup/` doluysa içeriğini otomatik olarak `b/uploads/posters/` içine kopyalar.

Yerelde posterler `b/uploads/posters/` içindeyse, deploy öncesi sunucuda şunu yapabilirsiniz:
```bash
# Sunucuda, proje kökünde
mkdir -p deploy/posters-backup
cp -a b/uploads/posters/. deploy/posters-backup/
# Sonra ./deploy.sh
```
Veya yerelden sunucuya `deploy/posters-backup`’ı doldurup deploy’u sunucuda çalıştırın.

## 1) Uygulama üzerinden yükleme (yeni afişler)

- **Organizatör** olarak giriş yap → Organizasyon / Etkinlik oluştur veya düzenle → Afiş yükle.
- Yüklenen dosyalar sunucudaki `b/uploads/posters/` içine UUID ile kaydedilir (`.webp`).

## 2) Mevcut afiş dosyalarını sunucuya kopyalama

Yerelde veya yedekte zaten `b/uploads/posters/` içinde dosyalar varsa, bunları sunucuya kopyalayabilirsiniz.

### Windows → Sunucu (ör. WinSCP)

1. WinSCP ile sunucuya bağlanın.
2. Yerelde: `biletsatis\b\uploads\posters\` içindeki tüm dosyaları seçin.
3. Sunucuda: `.../b/uploads/posters/` dizinine yapıştırın (dizin yoksa oluşturun).

### rsync (Linux/macOS veya WSL)

Yerelden sunucuya (sunucu kullanıcı ve host’u kendinize göre değiştirin):

```bash
# Proje kökünden
rsync -avz b/uploads/posters/ KULLANICI@SUNUCU_IP_veya_HOST:/path/to/biletsatis/b/uploads/posters/
```

Örnek:

```bash
rsync -avz b/uploads/posters/ ubuntu@biletsatis.omurgenc.dev:/var/www/biletsatis/b/uploads/posters/
```

### SCP ile tek seferde

```bash
scp -r b/uploads/posters/* KULLANICI@SUNUCU:/path/to/biletsatis/b/uploads/posters/
```

## 3) Veritabanı ile uyum

- DB’deki `poster_url` değerleri `/uploads/posters/UUID.webp` formatındadır.
- Sunucuda bu dosya adlarının gerçekten `b/uploads/posters/` içinde olması gerekir.
- Yedekten DB restore ettiyseniz, aynı yedekteki veya yereldeki `posters` klasörünü yukarıdaki gibi sunucuya kopyalayın.

## 4) Deploy sonrası

- `deploy.sh` her çalıştığında `b/uploads/posters` dizini yoksa oluşturulur; **içindeki dosyalar silinmez** (uploads artık `dist` dışında, `b/uploads` altında).
