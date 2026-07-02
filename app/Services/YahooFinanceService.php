<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class YahooFinanceService
{
    /**
     * Get real-time quote for an IDX stock using Yahoo Finance.
     * Yahoo uses .JK suffix for Jakarta stocks.
     */
    public function getCurrentPrice(string $stockCode): ?float
    {
        $symbol = strtoupper($stockCode) . '.JK';
        
        try {
            // Using Yahoo Finance API v8 for charts, which is highly reliable for free tiers
            $url = "https://query1.finance.yahoo.com/v8/finance/chart/{$symbol}";
            
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            ])->get($url);

            if ($response->successful()) {
                $data = $response->json();
                $result = $data['chart']['result'][0] ?? null;
                
                if ($result && isset($result['meta']['regularMarketPrice'])) {
                    return (float) $result['meta']['regularMarketPrice'];
                }
            } else {
                Log::error("Yahoo Finance API Error for {$symbol}: HTTP " . $response->status());
            }

        } catch (\Exception $e) {
            Log::error("Exception in YahooFinanceService for {$stockCode}: " . $e->getMessage());
        }

        return null;
    }
}
