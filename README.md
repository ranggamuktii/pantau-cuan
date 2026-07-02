# 📈 Pantau Cuan (IPO Tracker)

**Pantau Cuan** adalah aplikasi web modern berbasis *Fullstack* (Laravel + React) yang dirancang khusus untuk membantu investor ritel memantau portofolio saham IPO (Initial Public Offering) di Bursa Efek Indonesia (BEI) secara *real-time*.

Dengan antarmuka yang intuitif dan elegan, Pantau Cuan mengintegrasikan data IPO terbaru, manajemen alokasi aset per-SID, hingga kalkulator pintar untuk membantu pengambilan keputusan investasi Anda.

---

## ✨ Fitur Unggulan

- **Manajemen Multi-SID**: Catat dan pisahkan alokasi saham IPO Anda berdasarkan sekuritas (Ajaib, Stockbit, Mandiri, dll) dengan mudah.
- **Visualisasi Portofolio Real-Time**: Pantau *Total Modal*, *Nilai Saat Ini*, dan *Potensi Cuan/Rugi* (Floating & Net Profit) secara langsung di dalam dashboard interaktif.
- **Simulasi Average Down / Up**: Punya saham nyangkut atau ingin tambah muatan? Gunakan *Average Calculator* bawaan untuk mensimulasikan harga rata-rata baru sebelum membeli.
- **Simulasi ARA & ARB Berjilid**: Ubah harga pasar secara manual dan klik tombol ARA/ARB untuk melihat potensi keuntungan atau kerugian jika saham menyentuh batas Auto Rejection.
- **Kalender IPO & Penawaran Aktif**: Jangan sampai ketinggalan! Pantau jadwal *Book Building*, *Offering*, dan *Listing* saham baru, lengkap dengan status terkini yang ditarik langsung dari sistem e-IPO.
- **UI/UX Modern & Responsif**: Dibangun dengan Tailwind CSS, aplikasi ini menawarkan desain ala aplikasi *native* dengan dukungan **Dark Mode** dan navigasi *mobile-friendly* (Bottom Tab Navigation).

---

## 🛠️ Teknologi yang Digunakan

Aplikasi ini dibangun menggunakan arsitektur *monolith* modern (TALL/VILT stack custom):

* **Backend**: Laravel 11 (PHP 8+)
* **Frontend**: React 18, Inertia.js
* **Styling**: Tailwind CSS, Headless UI
* **Database**: MySQL / PostgreSQL
* **Iconografi & Aset**: Heroicons, Google Fonts, SVG dinamis

---

## 🚀 Cara Instalasi & Menjalankan di Lokal

Ikuti langkah-langkah di bawah ini untuk menjalankan project ini di komputer Anda:

### 1. Prasyarat Sistem
Pastikan Anda sudah menginstal:
- PHP >= 8.2
- Composer
- Node.js & NPM
- Database Server (MySQL/MariaDB/PostgreSQL)

### 2. Clone Repository
```bash
git clone https://github.com/username-anda/ipo-tracker.git
cd ipo-tracker
```

### 3. Install Dependencies
```bash
# Install package PHP
composer install

# Install package Node.js
npm install
```

### 4. Konfigurasi Environment
Duplikat file `.env.example` menjadi `.env` dan sesuaikan konfigurasi database Anda.
```bash
cp .env.example .env
```
Generate application key:
```bash
php artisan key:generate
```

### 5. Migrasi Database
Jalankan migrasi untuk membuat tabel yang dibutuhkan:
```bash
php artisan migrate
```

### 6. Jalankan Server
Buka dua terminal terpisah untuk menjalankan backend (Laravel) dan frontend (Vite):

**Terminal 1 (Backend):**
```bash
php artisan serve
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

Aplikasi sekarang dapat diakses melalui `http://localhost:8000`.

---

## 🤝 Kontribusi
Kami sangat terbuka untuk kontribusi! Jika Anda menemukan *bug* atau punya ide fitur baru, silakan buat *Pull Request* atau *Issue* di repositori ini.

---

<p align="center">Dibuat dengan ❤️ untuk kemajuan investor ritel Indonesia.</p>
