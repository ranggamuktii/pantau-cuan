<?php

namespace App\Console\Commands;

use App\Models\Stock;
use App\Services\YahooFinanceService;
use Illuminate\Console\Command;

class SyncYahooPrices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sync:yahoo-prices';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch real-time stock prices from Yahoo Finance and update DB';

    /**
     * Execute the console command.
     */
    public function handle(YahooFinanceService $financeService)
    {
        $this->info('Starting Yahoo Finance Sync...');

        $stocks = Stock::all();
        $updatedCount = 0;

        foreach ($stocks as $stock) {
            $this->info("Fetching price for {$stock->stock_code}...");
            $livePrice = $financeService->getCurrentPrice($stock->stock_code);
            
            if ($livePrice !== null) {
                $stock->update(['current_price' => $livePrice]);
                $this->info("Successfully updated {$stock->stock_code} to Rp " . number_format($livePrice, 0, ',', '.'));
                $updatedCount++;
            } else {
                $this->error("Failed to fetch price for {$stock->stock_code}.");
            }
            
            // Sleep for a tiny bit to avoid hammering the API if there are many stocks
            usleep(200000); // 200ms
        }

        $this->info("Sync Complete! Updated {$updatedCount} stocks.");
        return 0;
    }
}
