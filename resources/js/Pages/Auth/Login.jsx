import GuestLayout from "@/Layouts/GuestLayout";
import { Head } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function Login({ status }) {
    const [isVerifying, setIsVerifying] = useState(false);
    const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content");

    useEffect(() => {
        if (!recaptchaSiteKey) return;

        const existingScript = document.querySelector(
            'script[data-recaptcha-v3="true"]',
        );

        if (
            window.grecaptcha &&
            typeof window.grecaptcha.execute === "function"
        ) {
            return;
        }

        if (existingScript) {
            return;
        }

        const script = document.createElement("script");
        script.src = `https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`;
        script.async = true;
        script.defer = true;
        script.dataset.recaptchaV3 = "true";
        document.head.appendChild(script);
    }, [recaptchaSiteKey]);

    const handleGoogleLogin = async () => {
        if (!recaptchaSiteKey || !csrfToken) {
            alert("Sesi tidak valid. Refresh halaman dan coba lagi.");
            return;
        }

        if (
            !window.grecaptcha ||
            typeof window.grecaptcha.execute !== "function"
        ) {
            alert("Refresh halaman dan coba lagi.");
            return;
        }

        try {
            setIsVerifying(true);

            const action =
                import.meta.env.VITE_RECAPTCHA_ACTION || "google_login";
            const token = await window.grecaptcha.execute(recaptchaSiteKey, {
                action,
            });

            const response = await fetch(route("google.captcha.verify"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: JSON.stringify({ token }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                alert(data.message || "Verification failed.");
                return;
            }

            window.location.href = route("google.login");
        } catch (error) {
            alert("Gagal memverifikasi. Coba lagi ya.");
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 text-sm font-medium text-gojek-600 dark:text-gojek-400 bg-gojek-50 dark:bg-gojek-900/30 p-3 rounded-lg border border-gojek-200 dark:border-gojek-800">
                    {status}
                </div>
            )}

            <div className="flex flex-col items-center justify-center space-y-8 pb-4">
                <div className="text-center space-y-3">
                    <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                        Halo dari <span className="text-transparent bg-clip-text bg-gradient-to-r from-gojek-600 to-emerald-400">Pantau Cuan 👋</span>
                    </h2>
                    <p className="text-base text-zinc-500 dark:text-zinc-400 font-medium">
                        Masuk sekarang buat pantau portofolio saham multi-akun lo dan berburu IPO tanpa ribet.
                    </p>
                </div>

                <div className="w-full">
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isVerifying}
                        className={`w-full relative group overflow-hidden flex items-center justify-center px-6 py-4 rounded-2xl shadow-lg transition-all duration-300 bg-white dark:bg-zinc-800 text-base font-bold text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:border-gojek-300 dark:hover:border-gojek-700 hover:shadow-gojek-500/20 hover:-translate-y-1 ${isVerifying ? "opacity-70 cursor-not-allowed scale-95" : "active:scale-95"}`}
                    >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-zinc-100/40 dark:via-zinc-700/40 to-transparent group-hover:animate-shimmer"></div>

                        <div className="flex items-center space-x-4 relative z-10">
                            {isVerifying ? (
                                <svg className="animate-spin h-6 w-6 text-gojek-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="w-6 h-6 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                            )}
                            <span>{isVerifying ? "Bentar, ngecek bentar..." : "Lanjut pake Google"}</span>
                        </div>
                    </button>
                </div>

                <div className="w-full flex items-center justify-center space-x-4 opacity-60">
                    <div className="flex-1 h-px bg-zinc-300 dark:bg-zinc-700"></div>
                    <span className="text-xs uppercase tracking-widest font-bold">Login Aman</span>
                    <div className="flex-1 h-px bg-zinc-300 dark:bg-zinc-700"></div>
                </div>

                <div className="text-center text-xs text-zinc-400 dark:text-zinc-500">
                    Dengan masuk, lo setuju sama Syarat & Ketentuan kita. Aman kok, dijagain reCAPTCHA.
                </div>
            </div>
        </GuestLayout>
    );
}
