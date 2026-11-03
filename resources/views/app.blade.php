<!DOCTYPE html>
<html lang="id" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
        @if (request()->routeIs('home'))
            @php
                $canonicalOrigin = rtrim(config('seo.canonical_url'), '/');
                $canonicalUrl = $canonicalOrigin.'/';
                $personId = $canonicalUrl.'#person';
                $structuredData = [
                    '@context' => 'https://schema.org',
                    '@graph' => [
                        [
                            '@type' => 'Person',
                            '@id' => $personId,
                            'name' => config('seo.person.name'),
                            'jobTitle' => config('seo.person.job_title'),
                            'url' => $canonicalUrl,
                            'image' => $canonicalOrigin.config('seo.person.image_path'),
                        ],
                        [
                            '@type' => 'WebSite',
                            '@id' => $canonicalUrl.'#website',
                            'url' => $canonicalUrl,
                            'name' => config('seo.home.title'),
                            'description' => config('seo.home.description'),
                            'inLanguage' => 'id-ID',
                            'publisher' => ['@id' => $personId],
                        ],
                    ],
                ];
            @endphp
            <meta name="description" content="{{ config('seo.home.description') }}" data-inertia="description">
            <link rel="canonical" href="{{ rtrim(config('seo.canonical_url'), '/') }}/" data-inertia="canonical">
            <meta property="og:title" content="{{ config('seo.home.title') }}" data-inertia="og:title">
            <meta property="og:description" content="{{ config('seo.home.description') }}" data-inertia="og:description">
            <meta property="og:type" content="website" data-inertia="og:type">
            <meta property="og:url" content="{{ rtrim(config('seo.canonical_url'), '/') }}/" data-inertia="og:url">
            <meta property="og:image" content="{{ rtrim(config('seo.canonical_url'), '/') }}{{ config('seo.home.social_image_path') }}" data-inertia="og:image">
            <meta property="og:image:alt" content="Logo portofolio Firman Maulana Syabani" data-inertia="og:image:alt">
            <meta name="twitter:card" content="summary_large_image" data-inertia="twitter:card">
            <meta name="twitter:title" content="{{ config('seo.home.title') }}" data-inertia="twitter:title">
            <meta name="twitter:description" content="{{ config('seo.home.description') }}" data-inertia="twitter:description">
            <meta name="twitter:image" content="{{ rtrim(config('seo.canonical_url'), '/') }}{{ config('seo.home.social_image_path') }}" data-inertia="twitter:image">
            <meta name="twitter:image:alt" content="Logo portofolio Firman Maulana Syabani" data-inertia="twitter:image:alt">
            <script type="application/ld+json">@json($structuredData, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT)</script>
        @endif
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
            <title>Firman Maulana Syabani | IT Developer</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
