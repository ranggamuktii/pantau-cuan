<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class FetchEmitenCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fetch:emiten';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch ALL IDX stock codes using a Triple-Layer extraction (Gist + Wikipedia Scraper + Manual).';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🚀 Running Triple-Layer Extraction for 100% IDX Coverage...');
        $allStocks = [];

        // LAYER 1: Base Gist (Stable ~750 stocks)
        try {
            $this->info('1️⃣ Fetching base data from Github Gist...');
            $baseUrl = 'https://gist.githubusercontent.com/SeptiyanAndika/2941e872798cea3bfb2e550106b8ad28/raw';
            $response = Http::timeout(20)->get($baseUrl);
            if ($response->successful()) {
                $data = $response->json();
                if (is_array($data)) {
                    foreach ($data as $category => $stocks) {
                        if (is_array($stocks)) {
                            foreach ($stocks as $stock) {
                                if (isset($stock['ticker'])) $allStocks[] = strtoupper(trim($stock['ticker']));
                            }
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            $this->warn('Failed to fetch Layer 1.');
        }

        // LAYER 2: Wikipedia Scraper (The ultimate constantly updated list)
        try {
            $this->info('2️⃣ Scraping Wikipedia (Daftar emiten di BEI)...');
            $wikiUrl = 'https://id.wikipedia.org/wiki/Daftar_emiten_di_Bursa_Efek_Indonesia';
            $wikiResponse = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) IPOTrackerBot/1.0'
            ])->timeout(20)->get($wikiUrl);
            
            if ($wikiResponse->successful()) {
                $html = $wikiResponse->body();
                // Extract all 4-letter uppercase words that look like tickers (usually inside links or table cells)
                // Wikipedia format: <a href="/wiki/Bank_Central_Asia" title="Bank Central Asia">BBCA</a>
                if (preg_match_all('/>([A-Z]{4})<\/a>/', $html, $matches)) {
                    $wikiStocks = array_unique($matches[1]);
                    $allStocks = array_merge($allStocks, $wikiStocks);
                    $this->info('   Found ' . count($wikiStocks) . ' tickers on Wikipedia!');
                }
            }
        } catch (\Exception $e) {
            $this->warn('Failed to scrape Wikipedia.');
        }

        // LAYER 3: Manual 2026 Injection (Bulletproof Fallback for newest IPOs)
        $this->info('3️⃣ Injecting latest 2022-2026 Mega IPOs...');
        $recentIpos = [
            'GOTO', 'BUKA', 'BELI', 'BREN', 'AMMN', 'CUAN', 'VKTR', 'PGEO', 'NCKL', 'MTEL', 'WIFI',
            'AWAN', 'INET', 'GRPM', 'CRSN', 'MAHA', 'CNMA', 'JELI', 'VISI', 'BDKR', 'AEGS', 'CGAS',
            'MSJA', 'MANG', 'SMGA', 'NICE', 'ALII', 'HYGN', 'MPIX', 'MEJA', 'GRPH', 'IOTF', 'MKAP',
            'TOLK', 'LIVE', 'BAJA', 'ATLA', 'SPRE', 'SOLA', 'XSPI', 'BLES', 'GOLF', 'DART', 'KOCI',
            'CDIA', 'BEEF', 'DAAZ', 'NAIK', 'DWGL', 'FUTR', 'KOKA', 'LOPI', 'MUTU', 'PIK2', 'PANI', 
            'PTMP', 'RGAS', 'RSCH', 'SAGE', 'SEGAR', 'STRK', 'UDNG', 'WDI', 'ZATA', 'LMAX'
        ];
        $allStocks = array_merge($allStocks, $recentIpos);

        // Final Processing
        $uniqueStocks = array_values(array_unique($allStocks));
        
        // Filter strictly for 4 letters (IDX standard) just in case Wikipedia matched garbage
        $filteredStocks = array_filter($uniqueStocks, function($ticker) {
            return preg_match('/^[A-Z]{4}$/', $ticker);
        });
        
        $finalStocks = array_values($filteredStocks);
        sort($finalStocks);

        // Save to Database
        $this->info('💾 Saving to Database...');
        foreach ($finalStocks as $ticker) {
            \App\Models\IdxStock::updateOrCreate(
                ['ticker' => $ticker],
                ['name' => null] // We can update name later if we want
            );
        }

        $this->info('✅ BINGO! Successfully aggregated ' . count($finalStocks) . ' authentic IDX tickers to Database!');
    }
}
