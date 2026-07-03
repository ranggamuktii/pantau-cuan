<?php

namespace App\Http\Controllers;

use App\Models\AccountSid;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CollectionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $accountSids = AccountSid::with(['transactions.stock'])
            ->where('user_id', $user->id)
            ->get();

        $secureAccountSids = $accountSids->map(function ($sid) {
            return [
                'id' => $sid->id,
                'transactions' => $sid->transactions->map(function ($trx) {
                    return [
                        'id' => $trx->id,
                        'status' => $trx->status,
                        'net_profit' => $trx->net_profit,
                        'stock' => $trx->stock ? [
                            'stock_code' => $trx->stock->stock_code,
                        ] : null,
                    ];
                })
            ];
        });

        return Inertia::render('Collection/Index', [
            'accountSids' => $secureAccountSids
        ]);
    }
}
