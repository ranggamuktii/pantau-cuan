@echo off
echo ====================================================
echo COMMIT PERUBAHAN BARU (Hapus Notif & Update Auth)
echo ====================================================
echo.

git rm app/Models/IpoSubscription.php
git rm app/Http/Controllers/IpoSubscriptionController.php
git rm database/migrations/2026_07_02_160000_create_ipo_subscriptions_table.php

git add .
git commit -m "chore: remove email notification feature and update docs for production"
git push

echo.
echo Selesai bosku! Perubahan udah di-push ke GitHub.
pause
