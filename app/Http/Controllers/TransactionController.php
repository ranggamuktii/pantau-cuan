<?php

namespace App\Http\Controllers;

use App\Models\AccountSid;
use App\Models\Stock;
use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'account_sid_id' => 'required|exists:account_sids,id',
            'stock_code' => 'required|string|max:10',
            'ipo_price' => 'required|numeric|min:0',
            'lots' => 'required|integer|min:1',
        ]);



        // Ensure user owns the SID
        $sid = AccountSid::where('id', $validated['account_sid_id'])
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        // Create or update Stock
        $stock = Stock::firstOrCreate(
            ['stock_code' => strtoupper($validated['stock_code'])],
            ['ipo_price' => $validated['ipo_price'], 'current_price' => $validated['ipo_price']]
        );

        // Add Transaction
        Transaction::create([
            'account_sid_id' => $sid->id,
            'stock_id' => $stock->id,
            'lots' => $validated['lots'],
            'buy_price' => $validated['ipo_price'], // Assuming bought at IPO
            'status' => 'open',
        ]);

        return redirect()->back()->with('success', 'Sip, transaksi saham lu berhasil dicatat!');
    }

    public function update(Request $request, Transaction $transaction)
    {
        // Ensure user owns the transaction through SID
        if ($transaction->accountSid->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'ipo_price' => 'required|numeric|min:0',
            'lots' => 'required|integer|min:1',
        ]);

        $transaction->update([
            'buy_price' => $validated['ipo_price'],
            'lots' => $validated['lots']
        ]);

        // Also update stock IPO price if necessary, though it might affect other SIDs.
        // Usually, IPO price is fixed, but let's update it for simplicity.
        $transaction->stock->update([
            'ipo_price' => $validated['ipo_price']
        ]);

        return redirect()->back()->with('success', 'Mantap, transaksi saham lu udah di-update!');
    }

    public function destroy(Request $request, Transaction $transaction)
    {
        if ($transaction->accountSid->user_id !== $request->user()->id) {
            abort(403);
        }

        $transaction->delete();

        return redirect()->back()->with('success', 'Oke, transaksi saham lu udah dihapus.');
    }
}
