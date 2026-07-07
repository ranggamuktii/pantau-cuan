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
