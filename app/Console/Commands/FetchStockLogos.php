<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use App\Models\Stock; // Assuming Stock model exists

class FetchStockLogos extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fetch:logos';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch stock logos from Stockbit/E-IPO and save them locally to bypass CORS';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting to fetch logos...');
        
        $logoDir = public_path('logos');
        if (!file_exists($logoDir)) {
            mkdir($logoDir, 0755, true);
        }

        // We can either fetch all stocks from the DB or just the ones users own.
        // For now, let's get all stocks from the database.
        if (class_exists(Stock::class)) {
            $stocks = Stock::select('stock_code', 'id')->get();
        } else {
            $this->error('Stock model not found.');
            return;
        }

        $bar = $this->output->createProgressBar(count($stocks));
        $bar->start();

        $successCount = 0;
        $failCount = 0;

        foreach ($stocks as $stock) {
            $ticker = strtoupper(trim($stock->stock_code));
            $path = $logoDir . '/' . $ticker . '.png';

            // If it already exists, skip to save time (or optionally overwrite)
            if (file_exists($path) && filesize($path) > 1000) {
                // assume valid if > 1kb
                $bar->advance();
                $successCount++; // Count skipped as success
                continue;
            }

            // Try Stockbit first
            $url = "https://assets.stockbit.com/logos/companies/{$ticker}.png";
            $response = Http::withOptions(['verify' => false])
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept' => 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                    'Referer' => 'https://stockbit.com/',
                ])->get($url);

            if ($response->successful() && strlen($response->body()) > 1000) {
                file_put_contents($path, $response->body());
                $successCount++;
            } else {
                // Try E-IPO as fallback
                $fallbackUrl = "https://e-ipo.co.id/id/pipeline/get-logo?id={$stock->id}";
                $fallbackResponse = Http::withOptions(['verify' => false])
                    ->withHeaders([
                        'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    ])->get($fallbackUrl);
                    
                if ($fallbackResponse->successful() && strlen($fallbackResponse->body()) > 1000) {
                    file_put_contents($path, $fallbackResponse->body());
                    $successCount++;
                } else {
                    $failCount++;
                }
            }

            $bar->advance();
            // sleep a bit to avoid rate limiting
            usleep(100000); // 100ms
        }

        $bar->finish();
        $this->newLine();
        $this->info("Completed. Successfully fetched: {$successCount}, Failed: {$failCount}");
    }
}
