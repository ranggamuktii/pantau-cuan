@echo off
echo ====================================================
echo OTO-COMMIT PANTAU CUAN KE GITHUB
echo ====================================================
echo.

echo [1/5] Menginisialisasi Git...
git init
git remote remove origin 2>nul
git remote add origin https://github.com/ranggamuktii/pantau-cuan.git

echo.
echo [2/5] Commit Backend & Database Migrations...
git add app/Http/Controllers/
git add database/migrations/
git add routes/
git commit -m "feat(backend): add multi-SID management and e-IPO data synchronization"

echo.
echo [3/5] Commit Konfigurasi Environment & Vite...
git add .env.example
git add vite.config.js
git add tailwind.config.js
git commit -m "chore: setup tailwind theme colors and vite proxy configurations"

echo.
echo [4/5] Commit Dokumentasi Proyek...
git add README.md
git commit -m "docs: write comprehensive project documentation and setup instructions"

echo.
echo [5/5] Commit UI Dashboard, Mobile Nav, & Fitur Kalkulator...
:: Karena semua fitur UI (Kalender, ARA/ARB, Navigasi Mobile) ada di dalam satu file Dashboard.jsx 
:: yang saat ini sudah termodifikasi sekaligus, kita gabung menjadi satu mega-commit untuk frontend.
git add resources/
git add detail-ipo.json
git add .
git commit -m "feat(ui): implement multi-SID dashboard, ARA/ARB simulator, avg calc, and mobile bottom navigation"

echo.
echo ====================================================
echo Melakukan Push ke GitHub (Branch: main)...
echo ====================================================
git branch -M main
git push -u origin main

echo.
echo Selesai bosku! Semua perubahan berhasil di-commit dan di-push.
pause
