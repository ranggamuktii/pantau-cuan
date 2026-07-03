import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 py-8 relative overflow-hidden transition-colors duration-300">
            {/* Background Ornaments */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-gojek-500/20 dark:bg-gojek-500/10 rounded-full blur-3xl opacity-50 mix-blend-multiply dark:mix-blend-lighten animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/20 dark:bg-emerald-500/10 rounded-full blur-3xl opacity-50 mix-blend-multiply dark:mix-blend-lighten animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-20 w-72 h-72 bg-teal-500/20 dark:bg-teal-500/10 rounded-full blur-3xl opacity-50 mix-blend-multiply dark:mix-blend-lighten animate-blob animation-delay-4000"></div>
            </div>

            <div className="z-10 text-center mb-6 sm:mb-8">
                <Link href="/" className="inline-block group">
                    <div className="w-20 h-20 bg-gradient-to-tr from-gojek-600 to-gojek-400 rounded-3xl flex items-center justify-center rotate-3 shadow-xl shadow-gojek-500/40 mx-auto transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
                        <svg className="w-12 h-12 text-white -rotate-3 transition-transform duration-300 group-hover:rotate-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                </Link>
            </div>

            <div className="z-10 w-full overflow-hidden bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl px-6 py-8 sm:px-8 sm:py-10 shadow-2xl shadow-zinc-200/50 dark:shadow-black/50 max-w-md rounded-3xl border border-white/20 dark:border-zinc-800/50">
                {children}
            </div>
            
            <div className="z-10 mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                &copy; {new Date().getFullYear()} Pantau Cuan. All rights reserved.
            </div>
        </div>
    );
}
