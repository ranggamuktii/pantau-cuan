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
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <div className="flex flex-col items-center justify-center space-y-6 py-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                        IPO Investment Tracker
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Sign in to manage your multi-account stock portfolio.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isVerifying}
                    aria-disabled={isVerifying}
                    className={`w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ${isVerifying ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    {isVerifying
                        ? "Verifying reCAPTCHA..."
                        : "Continue with Google"}
                </button>
            </div>
        </GuestLayout>
    );
}
