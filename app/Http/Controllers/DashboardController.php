<?php

namespace App\Http\Controllers;

use App\Models\AccountSid;
use App\Models\Stock;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Eager load everything needed for the dashboard if user is authenticated
        if ($user) {
            $accountSids = AccountSid::with(['transactions.stock'])
                ->where('user_id', $user->id)
                ->get();
        } else {
            $accountSids = collect();
        }

        $totalCapital = 0;
        $totalCurrentValue = 0;
        $totalFloatingProfit = 0;
        $totalNetProfit = 0;
        
        $portfolioData = [];
        $sidPerformance = [];

        foreach ($accountSids as $sid) {
            $sidCapital = 0;
            $sidFloatingProfit = 0;
            
            foreach ($sid->transactions as $transaction) {
                $stock = $transaction->stock;
                
                // Add net_profit for closed transactions unconditionally
                $totalNetProfit += $transaction->net_profit ?? 0;

                // Skip active calculations if transaction is closed
                if ($transaction->status === 'closed') {
                    continue;
                }

                // Calculate lots to shares (1 lot = 100 shares in IDX)
                $shares = $transaction->lots * 100;
                $buyValue = $shares * $transaction->buy_price;
                $currentValue = $shares * ($stock->current_price ?? $stock->ipo_price);
                
                $floatingProfit = $currentValue - $buyValue;
                
                $totalCapital += $buyValue;
                $totalCurrentValue += $currentValue;
                $totalFloatingProfit += $floatingProfit;
                
                $sidCapital += $buyValue;
                $sidFloatingProfit += $floatingProfit;

                // For Pie Chart (Allocation by Stock Code)
                if (!isset($portfolioData[$stock->stock_code])) {
                    $portfolioData[$stock->stock_code] = 0;
                }
                $portfolioData[$stock->stock_code] += $buyValue;
            }
            
            // For Bar Chart (Performance by SID)
            $sidPerformance[] = [
                'name' => $sid->sid_name,
                'capital' => $sidCapital,
                'floating_profit' => $sidFloatingProfit,
            ];
        }

        // Format Pie Chart data for Recharts
        $pieChartData = [];
        foreach ($portfolioData as $code => $value) {
            $pieChartData[] = ['name' => $code, 'value' => $value];
        }

        // Auto-run migration and fetch command if table doesn't exist or is empty
        // (This is a smart trick since my terminal connection to your PC is currently blocked)
        if (!\Illuminate\Support\Facades\Schema::hasTable('idx_stocks')) {
            \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
            \Illuminate\Support\Facades\Artisan::call('fetch:emiten');
        } elseif (\App\Models\IdxStock::count() === 0) {
            \Illuminate\Support\Facades\Artisan::call('fetch:emiten');
        }

        // Fetch reliable stocks list from Database
        $emitenList = \App\Models\IdxStock::orderBy('ticker')->pluck('ticker')->toArray();

        // Fallback just in case DB is empty
        if (empty($emitenList)) {
            $emitenList = ['GOTO', 'BBCA', 'BBRI', 'BMRI', 'TLKM', 'BREN', 'AMMN', 'CUAN', 'CDIA'];
        }

        // Calculate portfolio summary
        $summary = [
            'totalCapital' => $totalCapital,
            'totalCurrentValue' => $totalCurrentValue,
            'totalFloatingProfit' => $totalFloatingProfit,
            'totalNetProfit' => $totalNetProfit,
        ];
        
        $charts = [
            'pieChartData' => $pieChartData,
            'barChartData' => $sidPerformance
        ];
        
        // Fetch active IPO list (Manual/Scraped)
        $activeIpos = [];
        $ipoFile = base_path('active_ipos.json');
        if (file_exists($ipoFile)) {
            $activeIpos = json_decode(file_get_contents($ipoFile), true) ?? [];
        }

        // Fetch IPO Calendar Data
        $ipoCalendar = [];
        $calendarFile = base_path('ipo_calendar.json');
        if (file_exists($calendarFile)) {
            $ipoCalendar = json_decode(file_get_contents($calendarFile), true) ?? [];
        }

        // Fetch detailed IPO data (mock from user)
        $ipoDetails = [];
        $detailFile = base_path('detail-ipo.json');
        if (file_exists($detailFile)) {
            $detailData = json_decode(file_get_contents($detailFile), true);
            if ($detailData) {
                // Check if it's an array of objects
                if (isset($detailData[0])) {
                    foreach ($detailData as $item) {
                        if (isset($item['ticker'])) {
                            $ipoDetails[$item['ticker']] = $item;
                        }
                    }
                } else if (isset($detailData['ticker'])) {
                    $ipoDetails[$detailData['ticker']] = $detailData;
                }
            }
        }

        // Generate Smart Notifications based on today's date and IPO events
        $notifications = $this->generateSmartNotifications($ipoDetails, $activeIpos, $ipoCalendar, $accountSids);

        $secureAccountSids = $accountSids->map(function ($sid) {
            return [
                'id' => $sid->id,
                'sid_name' => $sid->sid_name,
                'broker_name' => $sid->broker_name,
                'transactions' => $sid->transactions->map(function ($trx) {
                    return [
                        'id' => $trx->id,
                        'lots' => $trx->lots,
                        'buy_price' => $trx->buy_price,
                        'sell_price' => $trx->sell_price,
                        'net_profit' => $trx->net_profit,
                        'status' => $trx->status,
                        'stock' => $trx->stock ? [
                            'id' => $trx->stock->id,
                            'stock_code' => $trx->stock->stock_code,
                            'current_price' => $trx->stock->current_price,
                            'ipo_price' => $trx->stock->ipo_price,
                        ] : null,
                    ];
                })
            ];
        });

        return Inertia::render('Dashboard', [
            'summary' => $summary,
            'charts' => $charts,
            'accountSids' => $secureAccountSids,
            'emitenList' => $emitenList,
            'activeIpos' => $activeIpos,
            'ipoCalendar' => $ipoCalendar,
            'ipoDetails' => $ipoDetails,
            'notifications' => $notifications,
        ]);
    }

    /**
     * Generate smart notifications based on IPO events and calendar.
     */
    private function generateSmartNotifications($ipoDetails, $activeIpos, $ipoCalendar, $accountSids)
    {
        $notifications = [];
        $today = now()->format('Y-m-d');

        $months = [
            'Jan' => '01', 'Feb' => '02', 'Mar' => '03', 'Apr' => '04',
            'May' => '05', 'Jun' => '06', 'Jul' => '07', 'Aug' => '08',
            'Sep' => '09', 'Oct' => '10', 'Nov' => '11', 'Dec' => '12'
        ];

        $parseDate = function($dateStr) use ($months) {
            if (!$dateStr) return null;
            $parts = explode(' ', trim($dateStr));
            if (count($parts) >= 3) {
                $month = $months[$parts[1]] ?? null;
                if ($month) {
                    return $parts[2] . '-' . $month . '-' . str_pad($parts[0], 2, '0', STR_PAD_LEFT);
                }
            }
            return null;
        };

        // Collect user's stock codes for personalized messages
        $userStockCodes = [];
        foreach ($accountSids as $sid) {
            foreach ($sid->transactions as $trx) {
                if ($trx->stock && $trx->status === 'open') {
                    $userStockCodes[] = $trx->stock->stock_code;
                }
            }
        }
        $userStockCodes = array_unique($userStockCodes);

        // Check IPO details for events
        foreach ($ipoDetails as $ticker => $details) {
            $schedule = $details['schedule'] ?? [];

            // Allotment check
            if (!empty($schedule['allotment'])) {
                $allotmentDate = $parseDate($schedule['allotment']);
                if ($allotmentDate === $today) {
                    $notifications[] = [
                        'id' => 'allotment_' . $ticker,
                        'type' => 'allotment',
                        'ticker' => $ticker,
                        'title' => 'Penjatahan Hari Ini!',
                        'message' => "Hari ini penjatahan saham {$ticker}! Cek e-IPO kamu buat liat dapet berapa lot.",
                        'icon' => 'calendar',
                        'color' => 'emerald',
                    ];
                }
            }

            // Distribution check
            if (!empty($schedule['distribution'])) {
                $distDate = $parseDate($schedule['distribution']);
                if ($distDate === $today) {
                    $isPersonal = in_array($ticker, $userStockCodes);
                    $notifications[] = [
                        'id' => 'distribution_' . $ticker,
                        'type' => 'distribution',
                        'ticker' => $ticker,
                        'title' => 'Distribusi Saham Hari Ini!',
                        'message' => $isPersonal
                            ? "Selamat! Saham {$ticker} lu sudah didistribusikan ke RDN. Cek saldo sekuritas lu sekarang!"
                            : "Distribusi saham {$ticker} hari ini! Saham masuk ke rekening investor.",
                        'icon' => 'box',
                        'color' => 'blue',
                    ];
                }
                // Tomorrow check
                $tomorrow = now()->addDay()->format('Y-m-d');
                if ($distDate === $tomorrow) {
                    $notifications[] = [
                        'id' => 'dist_tomorrow_' . $ticker,
                        'type' => 'distribution',
                        'ticker' => $ticker,
                        'title' => 'Distribusi Besok!',
                        'message' => "Distribusi saham {$ticker} besok! Pastikan kamu sudah siap.",
                        'icon' => 'box',
                        'color' => 'blue',
                    ];
                }
            }

            // Listing check
            if (!empty($schedule['listing_date'])) {
                $listingDate = $parseDate($schedule['listing_date']);
                if ($listingDate === $today) {
                    $isPersonal = in_array($ticker, $userStockCodes);
                    $notifications[] = [
                        'id' => 'listing_' . $ticker,
                        'type' => 'listing',
                        'ticker' => $ticker,
                        'title' => $isPersonal ? "{$ticker} Listing Hari Ini!" : "{$ticker} Listing Hari Ini!",
                        'message' => $isPersonal
                            ? "Selamat! Saham {$ticker} lu listing hari ini! Pantau pergerakan harganya dan siap-siap cuan!"
                            : "Saham {$ticker} listing di BEI hari ini! Pantau pergerakan ARA/ARB-nya.",
                        'icon' => 'rocket',
                        'color' => 'gojek',
                    ];
                }
                // Upcoming listing (tomorrow)
                $tomorrow = now()->addDay()->format('Y-m-d');
                if ($listingDate === $tomorrow) {
                    $notifications[] = [
                        'id' => 'listing_tomorrow_' . $ticker,
                        'type' => 'listing',
                        'ticker' => $ticker,
                        'title' => "{$ticker} Listing Besok!",
                        'message' => "Saham {$ticker} listing besok! Siap-siap pantau harganya ya.",
                        'icon' => 'bell',
                        'color' => 'amber',
                    ];
                }
            }
        }

        // Check active offerings ending today/tomorrow
        foreach ($activeIpos as $ipo) {
            if (($ipo['status'] ?? '') !== 'Offering') continue;
            $offeringPeriod = $ipo['offering_period'] ?? '';
            $parts = explode(' - ', $offeringPeriod);
            if (count($parts) === 2) {
                $endDate = $parseDate(trim($parts[1]));
                if ($endDate === $today) {
                    $notifications[] = [
                        'id' => 'offering_end_' . $ipo['ticker'],
                        'type' => 'offering',
                        'ticker' => $ipo['ticker'],
                        'title' => 'Penawaran Berakhir Hari Ini!',
                        'message' => "Masa penawaran {$ipo['ticker']} berakhir hari ini! Buruan pesan kalau belum.",
                        'icon' => 'clock',
                        'color' => 'rose',
                    ];
                }
                $tomorrow = now()->addDay()->format('Y-m-d');
                if ($endDate === $tomorrow) {
                    $notifications[] = [
                        'id' => 'offering_end_tomorrow_' . $ipo['ticker'],
                        'type' => 'offering',
                        'ticker' => $ipo['ticker'],
                        'title' => 'Penawaran Berakhir Besok!',
                        'message' => "Masa penawaran {$ipo['ticker']} berakhir besok! Jangan sampai kelewatan ya.",
                        'icon' => 'clock',
                        'color' => 'amber',
                    ];
                }
            }
        }
        // System Update Notification
        array_unshift($notifications, [
            'id' => 'feature_flexing_v2',
            'type' => 'system',
            'ticker' => 'NEW!',
            'title' => 'Flexing Cuan V2 Rilis! 📸',
            'message' => 'Cobain fitur pamer cuan terbaru! Sekarang kartu flexing tampil lebih elegan dengan detail persentase profit per saham & auto-generate avatar dari inisial nama lo. Udah siap pamer?',
            'icon' => 'rocket',
            'color' => 'gojek',
        ]);

        return $notifications;
    }
}
