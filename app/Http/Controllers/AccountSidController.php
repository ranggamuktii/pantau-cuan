<?php

namespace App\Http\Controllers;

use App\Models\AccountSid;
use Illuminate\Http\Request;

class AccountSidController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'sid_name' => 'required|string|max:255',
            'broker_name' => 'nullable|string|max:255',
            'buy_fee_percent' => 'nullable|numeric|min:0|max:100',
            'sell_fee_percent' => 'nullable|numeric|min:0|max:100',
        ]);

        $request->user()->accountSids()->create([
            'sid_name' => $validated['sid_name'],
            'broker_name' => $validated['broker_name'] ?? null,
            'buy_fee_percent' => $validated['buy_fee_percent'] ?? 0.15,
            'sell_fee_percent' => $validated['sell_fee_percent'] ?? 0.25,
        ]);

        return redirect()->back()->with('success', 'Sip, akun SID lu berhasil dibikin!');
    }

    public function update(Request $request, AccountSid $sid)
    {
        if ($sid->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'sid_name' => 'required|string|max:255',
            'broker_name' => 'nullable|string|max:255',
        ]);

        $sid->update($validated);

        return redirect()->back()->with('success', 'Mantap, akun SID lu udah di-update!');
    }

    public function destroy(Request $request, AccountSid $sid)
    {
        if ($sid->user_id !== $request->user()->id) {
            abort(403);
        }

        $sid->delete(); // This will cascade delete transactions if set up, or we can manually delete them
        // To be safe, let's delete transactions first
        $sid->transactions()->delete();

        return redirect()->back()->with('success', 'Oke, akun SID lu udah dihapus ya.');
    }
}
