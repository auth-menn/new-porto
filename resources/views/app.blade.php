<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="Portfolio of Firman Maulana Syabani, an IT developer.">
        <meta property="og:title" content="Firman Maulana Syabani | IT Developer">
        <meta property="og:description" content="Portfolio of Firman Maulana Syabani, an IT developer.">
        <meta property="og:type" content="website">
        <meta name="robots" content="index, follow">
        <link
            rel="preload"
            href="/fonts/michroma-latin-400-normal.woff2"
            as="font"
            type="font/woff2"
            crossorigin
        >

        <script>
            (function () {
                document.documentElement.classList.add('js');

                try {
                    const language = localStorage.getItem('language');
                    document.documentElement.lang = language === 'en' ? 'en' : 'id';
                } catch {
                    document.documentElement.lang = 'id';
                }
            })();
        </script>

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            @font-face {
                font-family: 'Michroma';
                font-style: normal;
                font-weight: 400;
                font-display: swap;
                src: url('{{ asset('fonts/michroma-latin-400-normal.woff2') }}') format('woff2');
            }

            html {
                background-color: #ffffff;
            }

            html.dark {
                background-color: #000000;
            }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Firman Maulana Syabani | IT Developer') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
