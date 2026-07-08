<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AccountSidController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\StockSyncController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\WrappedController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [DashboardController::class, 'index'])->name('home');

// Public wrapped route
Route::get('/wrapped/{token}', [WrappedController::class, 'showPublic'])->name('wrapped.public');

// Dashboard accessible without login (public view)
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

// Proxy route for external logos to prevent CORS issues with html-to-image
Route::get('/proxy-logo', function (\Illuminate\Http\Request $request) {
    $url = $request->query('url');
    if (!$url) return abort(400);
    
    // Simple validation to only allow e-ipo.co.id
    if (!str_contains($url, 'e-ipo.co.id')) return abort(403);
    
    $response = \Illuminate\Support\Facades\Http::withHeaders([
        'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept' => 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Referer' => 'https://e-ipo.co.id/'
    ])->get($url);

    if ($response->successful()) {
        return response($response->body(), 200)
            ->header('Content-Type', $response->header('Content-Type', 'image/jpeg'))
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Cache-Control', 'public, max-age=86400');
    }
    
    // Fallback if e-ipo fails (e.g. 403, 404)
    // We generate a simple SVG directly so it NEVER fails and requires no external HTTP request!
    parse_str(parse_url($url, PHP_URL_QUERY), $query);
    $ticker = $request->query('ticker') ?? 'IP';
    $name = strtoupper(substr($ticker, 0, 2) ?: 'IP');
    
    $svg = '<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#18181b"/><text x="50" y="50" font-family="sans-serif" font-size="40" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="central">' . $name . '</text></svg>';

    return response($svg, 200)
        ->header('Content-Type', 'image/svg+xml')
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Cache-Control', 'public, max-age=86400');
})->name('proxy.logo');

Route::middleware('auth')->group(function () {
    
    // Album Koleksi
    Route::get('/collection', [\App\Http\Controllers\CollectionController::class, 'index'])->name('collection.index');
    
    // Internal Wrapped
    Route::get('/wrapped', [WrappedController::class, 'index'])->name('wrapped.index');

    Route::post('/sids', [AccountSidController::class, 'store'])->name('sids.store');
    Route::put('/sids/{sid}', [AccountSidController::class, 'update'])->name('sids.update');
    Route::delete('/sids/{sid}', [AccountSidController::class, 'destroy'])->name('sids.destroy');

    Route::post('/transactions', [TransactionController::class, 'store'])->name('transactions.store');
    Route::put('/transactions/{transaction}', [TransactionController::class, 'update'])->name('transactions.update');
    Route::delete('/transactions/{transaction}', [TransactionController::class, 'destroy'])->name('transactions.destroy');
    Route::post('/transactions/{transaction}/sell', [TransactionController::class, 'sell'])->name('transactions.sell');

    Route::post('/sync-prices', [StockSyncController::class, 'sync'])->name('stocks.sync');
    Route::post('/stocks/{stock}/update-price', [StockSyncController::class, 'updatePrice'])->name('stocks.updatePrice');
    Route::get('/api/stocks/{ticker}/live-price', [StockSyncController::class, 'getLivePrice'])->name('stocks.livePrice');

    Route::post('/push-subscriptions', [\App\Http\Controllers\PushSubscriptionController::class, 'subscribe'])->name('push.subscribe');
    Route::post('/push-subscriptions/delete', [\App\Http\Controllers\PushSubscriptionController::class, 'unsubscribe'])->name('push.unsubscribe');

    Route::post('/feedbacks', [\App\Http\Controllers\FeedbackController::class, 'store'])->name('feedbacks.store');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

use App\Http\Controllers\Auth\GoogleAuthController;

Route::post('/auth/google/verify-recaptcha', [GoogleAuthController::class, 'verifyRecaptcha'])->name('google.captcha.verify');
Route::get('/auth/google', [GoogleAuthController::class, 'redirect'])->name('google.login');
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->name('google.callback');

require __DIR__ . '/auth.php';
