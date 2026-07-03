# Production Deployment Guide for Hostinger

Panduan ini menjelaskan cara menyiapkan aplikasi Laravel + React ini untuk production di Hostinger via SSH, termasuk Google Auth, reCAPTCHA, database, build asset, dan checklist security.

## 1. Gambaran Stack

Aplikasi ini menggunakan:

- Laravel 12
- Inertia.js + React
- Vite untuk frontend build
- Laravel Socialite untuk Google Login
- reCAPTCHA di halaman login

Titik penting yang harus diperhatikan sebelum production:

- Google Auth dikonfigurasi di [config/services.php](../config/services.php)
- Route login Google ada di [routes/web.php](../routes/web.php)
- UI login dengan reCAPTCHA ada di [resources/js/Pages/Auth/Login.jsx](../resources/js/Pages/Auth/Login.jsx)
- File environment contoh ada di [\.env.example](../.env.example)

## 2. Checklist Sebelum Deploy

Pastikan hal ini sudah siap:

- Domain/subdomain sudah mengarah ke hosting Hostinger
- SSH aktif di Hostinger
- Database MySQL sudah dibuat
- Akses Google Cloud Console tersedia
- reCAPTCHA site key dan secret key sudah dibuat
- Repo Git sudah ada di GitHub dan branch yang akan di-deploy jelas
- File bypass login untuk testing sudah dimatikan untuk production

## 3. Security Yang Wajib Dicek

Sebelum produksi, pastikan hal berikut tidak ikut kebuka ke publik:

- Route bypass login di [routes/web.php](../routes/web.php) harus dihapus atau dibungkus kondisi environment `local`
- `APP_DEBUG` harus `false`
- `APP_ENV` harus `production`
- `APP_URL` harus pakai domain final dengan HTTPS
- Credential Google dan reCAPTCHA jangan hardcode di source code

Kalau route bypass login masih aktif, itu backdoor. Jangan deploy ke server publik kalau masih ada.

## 4. Setup Google Auth

Google Auth di project ini memakai Laravel Socialite. Alurnya:

1. User klik tombol login Google.
2. App redirect ke Google OAuth.
3. Google callback ke `/auth/google/callback`.
4. App membuat atau update user berdasarkan email Google.
5. User login ke dashboard.

### 4.1 Buat OAuth Client di Google Cloud

Masuk ke Google Cloud Console, lalu:

1. Pilih atau buat project baru.
2. Aktifkan OAuth consent screen.
3. Tambahkan scope yang diperlukan.
4. Buat OAuth Client ID type Web application.
5. Isi Authorized JavaScript origins jika diperlukan.
6. Isi Authorized redirect URI dengan URL production.

Contoh redirect URI:

```text
https://pantaucuan.site/auth/google/callback
```

Kalau masih testing lokal, callback lokal biasanya seperti:

```text
http://127.0.0.1:8000/auth/google/callback
```

### 4.2 Isi Environment Variable

Tambahkan nilai berikut ke `.env` production:

```env
GOOGLE_CLIENT_ID=isi_dari_google_cloud
GOOGLE_CLIENT_SECRET=isi_dari_google_cloud
GOOGLE_REDIRECT_URI=https://pantaucuan.site/auth/google/callback
```

Di project ini, Socialite membaca config dari [config/services.php](../config/services.php), jadi pastikan key di atas tidak kosong.

### 4.3 Verifikasi Route Google

Route yang harus aktif:

```php
Route::get('/auth/google', [GoogleAuthController::class, 'redirect'])->name('google.login');
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->name('google.callback');
```

Kalau URL callback tidak sama persis dengan yang didaftarkan di Google Cloud, login Google akan gagal.

## 5. Setup reCAPTCHA

Frontend login memakai reCAPTCHA v3 yang dieksekusi saat klik login Google.

### 5.1 Buat Key reCAPTCHA

Masuk ke halaman admin reCAPTCHA Google di [https://www.google.com/recaptcha/admin/create](https://www.google.com/recaptcha/admin/create), lalu buat site baru.

Langkah yang disarankan:

1. Login dengan akun Google yang akan dipakai untuk project ini.
2. Pilih nama label yang jelas, misalnya `pantau-cuan-production`.
3. Pilih tipe reCAPTCHA yang sesuai.
4. Untuk flow login seperti project ini, pakai reCAPTCHA v3.
5. Tambahkan domain production yang akan dipakai, yaitu `pantaucuan.site` dan `www.pantaucuan.site`.
6. Kalau masih testing, tambahkan `localhost` atau `127.0.0.1`.
7. Setelah submit, simpan `Site Key` dan `Secret Key`.

Simpan:

- Site key untuk frontend
- Secret key untuk backend jika nanti ingin validasi server-side

### 5.2 Isi Environment Variable

Di file `.env`, tambahkan:

```env
VITE_RECAPTCHA_SITE_KEY=isi_site_key_asli
```

Saat ini login form membaca site key dari env Vite di [resources/js/Pages/Auth/Login.jsx](../resources/js/Pages/Auth/Login.jsx).

Kalau kamu sedang testing lokal, pakai key reCAPTCHA v3 yang valid. Jangan pakai key checkbox atau invisible, karena script v3 di browser akan nolak kalau tipenya salah.

### 5.3 Catatan Penting Soal Validasi

Token reCAPTCHA sekarang diverifikasi di backend dengan cek `success`, `action`, dan `score`.

Kalau validasi backend belum ada, artinya proteksi utamanya masih di sisi UI. Untuk production serius, ini sebaiknya ditingkatkan.

## 6. Contoh `.env` Production

Berikut contoh isi env yang umum untuk Hostinger production:

```env
APP_NAME="Pantau Cuan"
APP_ENV=production
APP_KEY=isi_setelah_key_generate
APP_DEBUG=false
APP_URL=https://pantaucuan.site

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

LOG_CHANNEL=stack
LOG_STACK=single
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nama_database
DB_USERNAME=nama_user
DB_PASSWORD=password_database

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=.pantaucuan.site

CACHE_STORE=database
QUEUE_CONNECTION=database

FILESYSTEM_DISK=public

MAIL_MAILER=log
MAIL_FROM_ADDRESS="no-reply@pantaucuan.site"
MAIL_FROM_NAME="Pantau Cuan"

GOOGLE_CLIENT_ID=isi_dari_google_cloud
GOOGLE_CLIENT_SECRET=isi_dari_google_cloud
GOOGLE_REDIRECT_URI=https://pantaucuan.site/auth/google/callback

VITE_RECAPTCHA_SITE_KEY=isi_site_key_asli
VITE_APP_NAME="Pantau Cuan"
```

Catatan:

- Kalau Hostinger kamu masih pakai subdomain atau domain utama berbeda, sesuaikan `APP_URL` dan `SESSION_DOMAIN`.
- Kalau belum butuh queue, tetap boleh pakai `database`, tapi jangan lupa migrate tabel jobs jika memang dipakai.

## 7. Langkah Deploy ke Hostinger via SSH

Di bawah ini urutan yang paling aman untuk production.

### 7.1 Siapkan Folder Aplikasi

Masuk ke server via SSH, lalu arahkan ke folder aplikasi.

Contoh:

```bash
cd ~/domains/pantaucuan.site/public_html
```

Kalau struktur hosting berbeda, sesuaikan dengan folder web root Hostinger kamu.

### 7.2 Clone Repository

```bash
git clone https://github.com/ranggamuktii/pantau-cuan.git .
```

Kalau folder sudah ada isi sebelumnya, pastikan tidak menimpa file penting.

### 7.3 Buat File `.env`

```bash
cp .env.example .env
```

Lalu edit `.env` dan isi semua nilai production.

### 7.4 Install Dependency PHP

```bash
composer install --no-dev --optimize-autoloader
```

### 7.5 Generate App Key

Kalau belum ada `APP_KEY`, jalankan:

```bash
php artisan key:generate
```

### 7.6 Jalankan Migrasi Database

```bash
php artisan migrate --force
```

Kalau kamu punya data awal atau seeder, jalankan juga seeder yang diperlukan.

### 7.7 Storage Link

```bash
php artisan storage:link
```

> **Catatan Hostinger:** Jika perintah di atas gagal dengan error `Call to undefined function Illuminate\Filesystem\exec()`, itu karena fungsi `exec()` didisable oleh Hostinger demi keamanan.
> Sebagai gantinya, buat symlink secara manual menggunakan command linux ini:
> ```bash
> ln -s $(pwd)/storage/app/public $(pwd)/public/storage
> ```

### 7.8 Build Frontend

Ada dua opsi:

#### Opsi A: Build di server

Kalau Hostinger punya Node.js dan npm tersedia:

```bash
npm install
npm run build
```

#### Opsi B: Build di lokal lalu upload hasilnya

Kalau server tidak nyaman untuk build Node:

```bash
npm install
npm run build
```

Lalu upload folder `public/build` ke server.

Opsi ini biasanya lebih cocok untuk shared hosting yang resource-nya terbatas.

### 7.9 Clear dan Cache Ulang Konfigurasi

Setelah `.env` final dan build selesai, jalankan:

```bash
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Kalau ada perubahan route atau config, urutan ini membantu aplikasi jalan lebih stabil di production.

## 8. Setup Document Root

Pastikan web root domain mengarah ke folder `public`.

Contoh struktur yang benar:

```text
/home/user/domains/pantaucuan.site/
  app/
  bootstrap/
  config/
  public/
  resources/
  routes/
```

Domain harus membaca:

```text
/home/user/domains/pantaucuan.site/public
```

Kalau Hostinger tidak mengizinkan perubahan document root, biasanya perlu pakai folder publik terpisah atau konfigurasi proxy yang sesuai dengan panel hosting.

## 9. Permission Folder

Pastikan folder berikut writable:

```bash
chmod -R 775 storage bootstrap/cache
```

Kalau user web server berbeda, sesuaikan owner dan permission dengan konfigurasi Hostinger kamu.

## 10. Queue dan Scheduler

Project ini memakai `database` untuk queue dan cache di `.env.example`.

Kalau kamu benar-benar pakai queue di production, jalankan worker:

```bash
php artisan queue:work --tries=1
```

Kalau Hostinger kamu VPS, worker bisa dijaga hidup dengan Supervisor atau systemd.

Kalau shared hosting, biasanya queue worker tidak bisa hidup terus. Alternatifnya:

- Pakai cron untuk task berkala
- Hindari job yang harus real-time
- Pindahkan proses berat ke service eksternal jika perlu

### Cron Scheduler

Kalau aplikasi butuh scheduler Laravel, tambahkan cron seperti ini:

```bash
* * * * * cd /path/to/app && php artisan schedule:run >> /dev/null 2>&1
```

## 11. Checklist Setelah Deploy

Setelah live, cek hal berikut:

- Halaman utama bisa dibuka via HTTPS
- Login biasa berjalan
- Login Google redirect ke callback dengan benar
- reCAPTCHA tampil di halaman login
- Dashboard bisa diakses setelah auth
- Migrate database sukses
- Tidak ada error di log Laravel
- Asset frontend termuat dari `public/build`

## 12. Troubleshooting

### Google Auth Error: Missing Configuration

Kalau muncul error seperti missing `client_id`, `client_secret`, atau `redirect`, berarti env Google belum benar atau config cache belum di-refresh.

Solusi:

```bash
php artisan optimize:clear
php artisan config:cache
```

Lalu pastikan isi `.env` cocok dengan [config/services.php](../config/services.php).

### Google Callback Gagal

Biasanya penyebabnya:

- `APP_URL` belum pakai domain final
- Redirect URI di Google Console beda sedikit
- HTTPS belum aktif
- Cache config masih lama

### Asset Tidak Muncul

Kalau CSS/JS tidak termuat:

- Pastikan `npm run build` sudah dijalankan
- Pastikan folder `public/build` ada di server
- Cek `manifest.json` di dalam `public/build`

### Login Terblokir reCAPTCHA

Kalau tombol Google login tidak jalan:

- Pastikan site key reCAPTCHA benar
- Pastikan domain reCAPTCHA sudah di-whitelist
- Pastikan tidak ada error JS di browser console

## 13. Rekomendasi Flow Deploy Paling Aman

Urutan yang gue sarankan:

1. Setup domain dan SSL dulu
2. Clone repo ke server
3. Isi `.env`
4. Install dependency PHP
5. Generate key
6. Migrasi database
7. Build frontend
8. Clear dan cache config
9. Matikan bypass route testing
10. Test login Google dan login biasa

## 14. Catatan Akhir

Untuk production yang rapi, sebaiknya kamu juga:

- Simpan secret di `.env`, bukan di source code
- Matikan semua route testing seperti bypass login
- Gunakan HTTPS wajib
- Cek log error setelah deploy
- Pastikan redirect Google sesuai domain final

Kalau kamu mau, langkah berikutnya bisa dibuat versi yang lebih praktis berupa:

- template `.env` production siap isi
- checklist command SSH satu blok copy-paste
- panduan Hostinger shared hosting vs VPS
