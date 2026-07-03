<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WrappedController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Ensure user has a share token
        if (!$user->share_token) {
            $user->update(['share_token' => (string) \Illuminate\Support\Str::uuid()]);
        }
        
        return $this->renderWrapped($user, true);
    }

    public function showPublic($token)
    {
        $user = User::where('share_token', $token)->firstOrFail();
        
        return $this->renderWrapped($user, false);
    }
    
    private function renderWrapped(User $user, $isOwner)
    {
        $sids = $user->accountSids()->with(['transactions.stock'])->get();
        
        // Collect all transactions
        $allTransactions = collect();
        foreach ($sids as $sid) {
            $allTransactions = $allTransactions->merge($sid->transactions);
        }
        
        // Only closed transactions for realized profit stats
        $closedTransactions = $allTransactions->where('status', 'closed');
        
        $totalNetProfit = $closedTransactions->sum('net_profit');
        
        // Best Trade
        $bestTrade = $closedTransactions->sortByDesc('net_profit')->first();
        
        // Worst Trade
        $worstTrade = $closedTransactions->sortBy('net_profit')->first();
        if ($worstTrade && $worstTrade->net_profit >= 0) {
            $worstTrade = null; // No loss
        }
        
        // Most used broker
        $brokers = $sids->pluck('broker_name')->filter()->countBy();
        $topBroker = $brokers->sortDesc()->keys()->first();
        
        // Total IPOs participated (unique stocks)
        $totalIpos = $allTransactions->pluck('stock_id')->unique()->count();
        
        $wrappedData = [
            'owner_name' => $user->name,
            'is_owner' => $isOwner,
            'share_link' => route('wrapped.public', ['token' => $user->share_token]),
            'total_ipos' => $totalIpos,
            'total_net_profit' => $totalNetProfit,
            'top_broker' => $topBroker,
            'best_trade' => $bestTrade ? [
                'stock' => $bestTrade->stock->stock_code,
                'profit' => $bestTrade->net_profit,
                'percent' => $bestTrade->buy_price > 0 ? ($bestTrade->sell_price - $bestTrade->buy_price) / $bestTrade->buy_price * 100 : 0
            ] : null,
            'worst_trade' => $worstTrade ? [
                'stock' => $worstTrade->stock->stock_code,
                'loss' => $worstTrade->net_profit,
                'percent' => $worstTrade->buy_price > 0 ? ($worstTrade->sell_price - $worstTrade->buy_price) / $worstTrade->buy_price * 100 : 0
            ] : null,
        ];
        
        return Inertia::render('Wrapped/Index', [
            'wrapped' => $wrappedData
        ]);
    }
}
