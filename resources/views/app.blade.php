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


        <style>
            .eye-loader{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;overflow:hidden;background:#fff}
            .eye-loader.is-done{display:none}
            .eye-stage{width:min(94vw,1200px);aspect-ratio:2172/724;opacity:0;transition:opacity .7s ease}
            .is-show .eye-stage,.is-zoom .eye-stage{opacity:1}
            .eye-zoom{--px:74.63;--py:44.7;--s:85;
              --tx:calc((50 - var(--px)) * 1% * var(--s));
              --ty:calc((50 - var(--py)) * 1% * var(--s));
              width:100%;height:100%;will-change:transform;transform:translate3d(0,0,0) scale(1)}
            .is-zoom .eye-zoom{animation:eye-dive 3.8s cubic-bezier(.5,0,.3,1) forwards}
            .is-zoom{animation:eye-reveal 3.8s ease-in-out forwards}
            @keyframes eye-dive{to{transform:translate3d(var(--tx),var(--ty),0) scale(var(--s))}}
            @keyframes eye-reveal{0%,76%{opacity:1}100%{opacity:0}}
            #eyes{display:block;width:100%;height:100%;user-select:none;pointer-events:none}
            @media (prefers-reduced-motion:reduce){.eye-loader{display:none}}
        </style>

        <link rel="icon" href="/favicon.ico" sizes="48x48">
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=2">
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=2">
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png?v=2">
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon_v2.png">
        <link rel="manifest" href="/site.webmanifest">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>Firman Maulana Syabani | IT Developer</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <div class="eye-loader" id="loader" aria-hidden="true">
            <div class="eye-stage"><div class="eye-zoom" id="zoom"><canvas id="eyes" width="2172" height="724"></canvas></div></div>
        </div>
        <x-inertia::app />
    </body>
</html>
