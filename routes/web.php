<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::get('/pantau-cuan-logo', function () {
    return response()->file('C:\Users\Rangga Mukti\Downloads\ChatGPT Image 2 Jul 2026, 23.09.19.png');
});

use App\Http\Controllers\DashboardController;

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

use App\Http\Controllers\AccountSidController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\StockSyncController;

Route::middleware('auth')->group(function () {
    Route::post('/sids', [AccountSidController::class, 'store'])->name('sids.store');
    Route::put('/sids/{sid}', [AccountSidController::class, 'update'])->name('sids.update');
    Route::delete('/sids/{sid}', [AccountSidController::class, 'destroy'])->name('sids.destroy');

    Route::post('/transactions', [TransactionController::class, 'store'])->name('transactions.store');
    Route::put('/transactions/{transaction}', [TransactionController::class, 'update'])->name('transactions.update');
    Route::delete('/transactions/{transaction}', [TransactionController::class, 'destroy'])->name('transactions.destroy');

    Route::post('/sync-prices', [StockSyncController::class, 'sync'])->name('stocks.sync');
    Route::post('/stocks/{stock}/update-price', [StockSyncController::class, 'updatePrice'])->name('stocks.updatePrice');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

use App\Http\Controllers\Auth\GoogleAuthController;

Route::post('/auth/google/verify-recaptcha', [GoogleAuthController::class, 'verifyRecaptcha'])->name('google.captcha.verify');
Route::get('/auth/google', [GoogleAuthController::class, 'redirect'])->name('google.login');
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->name('google.callback');

require __DIR__ . '/auth.php';
