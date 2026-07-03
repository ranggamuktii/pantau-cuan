@echo off
echo ====================================================
echo COMMIT HALAMAN ERROR CUSTOM
echo ====================================================
echo.

git add resources/views/errors/
git commit -m "feat: add custom error pages (404, 500, 403, 503) matching theme"
git push

echo.
echo Selesai bosku! Halaman error custom udah di-push ke GitHub.
pause
