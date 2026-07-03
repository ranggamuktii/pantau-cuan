<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use Illuminate\Http\Request;

class FeedbackController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string|in:Bug,Feature,Question',
            'message' => 'required|string|max:1000',
        ]);

        Feedback::create([
            'user_id' => $request->user()->id,
            'category' => $validated['category'],
            'message' => $validated['message'],
            'status' => 'open',
        ]);

        // If you want to integrate Telegram later, you can fire an event here
        // event(new \App\Events\FeedbackSubmitted($feedback));

        return redirect()->back()->with('success', 'Thank you! Laporan lo udah diterima. Kita bakal segera cek.');
    }
}
