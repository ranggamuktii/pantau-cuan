<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title') - Pantau Cuan</title>
    <link rel="icon" type="image/svg+xml" href="/pantau-cuan-logo.svg" />
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        gojek: {
                            50: '#f0fdf4',
                            100: '#dcfce7',
                            200: '#bbf7d0',
                            300: '#86efac',
                            400: '#4ade80',
                            500: '#22c55e',
                            600: '#16a34a',
                            700: '#15803d',
                            800: '#166534',
                            900: '#14532d',
                        }
                    }
                }
            }
        }
    </script>
    <script>
        if (localStorage.theme !== 'light') {
            document.documentElement.classList.add('dark');
        }
    </script>
</head>
<body class="antialiased bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex items-center justify-center min-h-screen p-6">
    <div class="max-w-md w-full text-center">
        <!-- Logo -->
        <div class="mb-8 flex justify-center">
            <div class="w-16 h-16 bg-gojek-600 rounded-2xl flex items-center justify-center rotate-3 shadow-lg shadow-gojek-500/30">
                <svg class="w-10 h-10 text-white -rotate-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            </div>
        </div>

        <h1 class="text-6xl font-extrabold text-zinc-900 dark:text-white mb-4 tracking-tighter">@yield('code')</h1>
        <h2 class="text-2xl font-bold mb-4 text-gojek-600 dark:text-gojek-400">@yield('title')</h2>
        <p class="text-zinc-500 dark:text-zinc-400 mb-8 font-medium">@yield('message')</p>

        <a href="/" class="inline-flex items-center px-6 py-3 bg-gojek-600 hover:bg-gojek-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-gojek-500/30 hover:scale-105 active:scale-95">
            <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Dashboard
        </a>
    </div>
</body>
</html>
