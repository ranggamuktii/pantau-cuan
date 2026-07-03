<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function verifyRecaptcha(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
        ]);

        $secretKey = config('services.recaptcha.secret_key');
        $expectedAction = config('services.recaptcha.action', 'google_login');
        $minScore = (float) config('services.recaptcha.min_score', 0.5);

        if (blank($secretKey)) {
            return response()->json([
                'message' => 'reCAPTCHA secret key is not configured.',
            ], 500);
        }

        $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
            'secret' => $secretKey,
            'response' => $validated['token'],
            'remoteip' => $request->ip(),
        ]);

        if (! $response->ok() || ! $response->json('success')) {
            return response()->json([
                'message' => 'reCAPTCHA verification failed.',
            ], 422);
        }

        if ($response->json('action') !== $expectedAction) {
            return response()->json([
                'message' => 'reCAPTCHA action mismatch.',
            ], 422);
        }

        if ((float) $response->json('score', 0) < $minScore) {
            return response()->json([
                'message' => 'reCAPTCHA score too low.',
            ], 422);
        }

        $request->session()->put('google_login_captcha_verified', now()->timestamp);

        return response()->json([
            'message' => 'reCAPTCHA verified successfully.',
        ]);
    }

    public function redirect(Request $request)
    {
        if (! $request->session()->pull('google_login_captcha_verified')) {
            return redirect('/login')->with('error', 'Silakan verifikasi reCAPTCHA dulu sebelum login dengan Google.');
        }

        return Socialite::driver('google')->stateless()->redirect();
    }

    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            $user = User::updateOrCreate(
                ['email' => $googleUser->getEmail()],
                [
                    'name' => $googleUser->getName(),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                ]
            );

            Auth::login($user);

            return redirect()->intended(route('dashboard', absolute: false))
                ->with('success', 'Berhasil masuk pake Google! Gas cari cuan bos!');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Google Login Error: ' . $e->getMessage());
            return redirect('/login')->with('error', 'Waduh, ada yang salah pas login pake Google nih. Coba lagi ya!');
        }
    }
}
