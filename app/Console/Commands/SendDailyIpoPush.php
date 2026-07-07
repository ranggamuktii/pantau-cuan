<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Notifications\IpoNotification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class SendDailyIpoPush extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ipo:send-daily-push';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send daily web push notifications for IPO distributions and listings.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking IPO schedules for push notifications...');

        $activeIposPath = storage_path('app/active_ipos.json');
        if (!file_exists($activeIposPath)) {
            $this->error('active_ipos.json not found. Run sync first.');
            return;
        }

        $activeIpos = json_decode(file_get_contents($activeIposPath), true) ?? [];
        if (empty($activeIpos)) {
            $this->info('No active IPOs found.');
            return;
        }

        $today = Carbon::today()->format('Y-m-d');
        $tomorrow = Carbon::tomorrow()->format('Y-m-d');

        $users = User::whereHas('pushSubscriptions')->with('accountSids.transactions.stock')->get();
        if ($users->isEmpty()) {
            $this->info('No users subscribed to push notifications.');
            return;
        }

        $notificationsSent = 0;

        foreach ($users as $user) {
            $userStockCodes = $user->accountSids->flatMap(function ($sid) {
                return $sid->transactions->pluck('stock.stock_code');
            })->unique()->toArray();

            foreach ($activeIpos as $ipo) {
                $ticker = $ipo['ticker'] ?? null;
                if (!$ticker) continue;

                $schedule = $ipo['schedule'] ?? [];
                
                $parseDate = function($dateStr) {
                    if (empty($dateStr) || $dateStr === 'N/A' || $dateStr === '-') return null;
                    try {
                        return Carbon::parse(trim(explode('-', $dateStr)[0]))->format('Y-m-d');
                    } catch (\Exception $e) {
                        return null;
                    }
                };

                $distDate = !empty($schedule['distribution']) ? $parseDate($schedule['distribution']) : null;
                $listingDate = !empty($schedule['listing_date']) ? $parseDate($schedule['listing_date']) : null;

                $isPersonal = in_array($ticker, $userStockCodes);

                // Notifications for Distribution
                if ($distDate === $today) {
                    $title = 'Distribusi Saham Hari Ini!';
                    $body = $isPersonal
                        ? "Selamat! Saham {$ticker} kamu sudah didistribusikan ke RDN. Cek saldo sekuritasmu sekarang!"
                        : "Distribusi saham {$ticker} hari ini! Saham masuk ke rekening investor.";
                    
                    $user->notify(new IpoNotification($title, $body, '/dashboard'));
                    $notificationsSent++;
                } elseif ($distDate === $tomorrow) {
                    $title = 'Distribusi Besok!';
                    $body = "Distribusi saham {$ticker} besok! Pastikan kamu sudah siap.";
                    $user->notify(new IpoNotification($title, $body, '/dashboard'));
                    $notificationsSent++;
                }

                // Notifications for Listing
                if ($listingDate === $today) {
                    $title = "{$ticker} Listing Hari Ini!";
                    $body = $isPersonal
                        ? "Selamat! Saham {$ticker} kamu listing hari ini! Pantau pergerakan harganya dan siap-siap cuan!"
                        : "Saham {$ticker} listing di BEI hari ini! Pantau pergerakan ARA/ARB-nya.";
                    
                    $user->notify(new IpoNotification($title, $body, '/dashboard'));
                    $notificationsSent++;
                } elseif ($listingDate === $tomorrow) {
                    $title = "{$ticker} Listing Besok!";
                    $body = "Saham {$ticker} listing besok! Siap-siap pantau harganya ya.";
                    $user->notify(new IpoNotification($title, $body, '/dashboard'));
                    $notificationsSent++;
                }
            }
        }

        $this->info("Successfully sent {$notificationsSent} push notifications.");
        Log::info("Daily IPO Push Command executed. Sent {$notificationsSent} notifications.");
    }
}
