<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use App\Services\YahooFinanceService;
use Illuminate\Http\Request;

class StockSyncController extends Controller
{
    public function sync(YahooFinanceService $financeService)
    {
        // Get all unique stocks currently in the database
        $stocks = Stock::all();
        $updatedCount = 0;

        foreach ($stocks as $stock) {
            $livePrice = $financeService->getCurrentPrice($stock->stock_code);
            
            if ($livePrice !== null) {
                $stock->update(['current_price' => $livePrice]);
                $updatedCount++;
            }
        }

        return redirect()->back()->with('success', "Sip, {$updatedCount} harga saham udah sinkron sama pasar!");
    }

    public function updatePrice(Request $request, Stock $stock)
    {
        $request->validate([
            'current_price' => 'required|numeric|min:0'
        ]);

        $stock->update([
            'current_price' => $request->current_price
        ]);

        return redirect()->back()->with('success', 'Mantap, harga saham berhasil di-update manual!');
    }
    public function getLivePrice(Request $request, $ticker, YahooFinanceService $financeService)
    {
        $livePrice = $financeService->getCurrentPrice($ticker);
        
        return response()->json([
            'ticker' => $ticker,
            'price' => $livePrice
        ]);
    }
}
