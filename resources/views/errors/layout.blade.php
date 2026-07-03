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
<body class="antialiased bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex items-center justify-center min-h-screen p-4">
    <div class="max-w-md w-full text-center space-y-6">
        <!-- Logo -->
        <div class="flex justify-center opacity-90">
            <div class="w-14 h-14 bg-@yield('color', 'gojek')-500 rounded-2xl flex items-center justify-center rotate-3 shadow-lg shadow-@yield('color', 'gojek')-500/20">
                <svg class="w-7 h-7 text-white -rotate-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
        </div>

        <div>
            <h1 class="text-7xl font-extrabold text-zinc-900 dark:text-white tracking-tighter">@yield('code')</h1>
            <h2 class="text-xl font-bold mt-2 text-@yield('color', 'gojek')-600 dark:text-@yield('color', 'gojek')-400">@yield('title')</h2>
        </div>
        
        <p class="text-zinc-500 dark:text-zinc-400 text-sm font-medium px-4">@yield('message')</p>

        <div class="pt-2">
            <a href="/" class="inline-flex items-center px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 font-bold rounded-xl transition-all shadow hover:-translate-y-0.5 active:scale-95 text-sm">
                Beranda
            </a>
        </div>
    </div>
</body>
</html>
