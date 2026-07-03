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
                
                // Calculate lots to shares (1 lot = 100 shares in IDX)
                $shares = $transaction->lots * 100;
                $buyValue = $shares * $transaction->buy_price;
                $currentValue = $shares * ($stock->current_price ?? $stock->ipo_price);
                
                $floatingProfit = $currentValue - $buyValue;
                
                $totalCapital += $buyValue;
                $totalCurrentValue += $currentValue;
                $totalFloatingProfit += $floatingProfit;
                $totalNetProfit += $transaction->net_profit ?? 0;
                
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

        return Inertia::render('Dashboard', [
            'summary' => $summary,
            'charts' => $charts,
            'accountSids' => $accountSids,
            'emitenList' => $emitenList,
            'activeIpos' => $activeIpos,
            'ipoCalendar' => $ipoCalendar,
            'ipoDetails' => $ipoDetails,
        ]);
    }
}
