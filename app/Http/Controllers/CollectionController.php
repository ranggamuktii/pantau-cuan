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

        return Inertia::render('Collection/Index', [
            'accountSids' => $accountSids
        ]);
    }
}
