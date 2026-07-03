<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <script>
        if (localStorage.theme !== 'light') {
            document.documentElement.classList.add('dark');
        }
    </script>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    
    <!-- Basic SEO -->
    <meta name="description" content="Pantau Cuan - Aplikasi Tracker Portofolio Saham & Koleksi IPO Anda. Pantau profit, status emiten, dan jadikan cuan lebih rapi!">
    <meta name="keywords" content="saham, ipo, tracker saham, cuan, profit, bursa efek, investasi, portofolio">
    <meta name="author" content="Pantau Cuan Team">
    <meta name="theme-color" content="#10b981">
    
    <!-- Open Graph / Social Media -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ url('/') }}">
    <meta property="og:title" content="Pantau Cuan - Tracker Saham & IPO">
    <meta property="og:description" content="Pantau Cuan - Aplikasi Tracker Portofolio Saham & Koleksi IPO Anda. Cek shiny koleksi lu sekarang!">
    <meta property="og:image" content="{{ asset('pantau-cuan-logo.svg') }}">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="{{ url('/') }}">
    <meta property="twitter:title" content="Pantau Cuan - Tracker Saham & IPO">
    <meta property="twitter:description" content="Pantau Cuan - Aplikasi Tracker Portofolio Saham & Koleksi IPO Anda. Cek shiny koleksi lu sekarang!">
    <meta property="twitter:image" content="{{ asset('pantau-cuan-logo.svg') }}">

    <title inertia>{{ config('app.name', 'Pantau Cuan') }}</title>
    
    <!-- Icons -->
    <link rel="icon" type="image/svg+xml" href="/pantau-cuan-logo.svg" />
    <link rel="apple-touch-icon" href="/pantau-cuan-logo.svg" />
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    <!-- Scripts -->
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
    @inertiaHead
</head>

<body class="font-sans antialiased bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white">
    @inertia
</body>

</html>