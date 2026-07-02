<?php

namespace App\Http\Controllers;

use App\Models\IpoSubscription;
use Illuminate\Http\Request;

class IpoSubscriptionController extends Controller
{
    public function toggle(Request $request)
    {
        $request->validate([
            'ticker' => 'required|string',
        ]);

        $subscription = IpoSubscription::where('user_id', auth()->id())
            ->where('ticker', $request->ticker)
            ->first();

        if ($subscription) {
            $subscription->delete();
            return response()->json(['status' => 'unsubscribed', 'message' => 'Notifikasi untuk ' . $request->ticker . ' dimatikan.']);
        } else {
            IpoSubscription::create([
                'user_id' => auth()->id(),
                'ticker' => $request->ticker,
                'status' => 'active',
            ]);
            return response()->json(['status' => 'subscribed', 'message' => 'Anda akan menerima notifikasi untuk IPO ' . $request->ticker . '.']);
        }
    }
}
