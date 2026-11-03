<?php

use App\Http\Middleware\EnsureCanonicalUrl;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\PreventIndexing;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(prepend: [
            EnsureCanonicalUrl::class,
        ]);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            PreventIndexing::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->respond(function (Response $response, Throwable $exception, Request $request): Response {
            if (PreventIndexing::shouldPreventIndexing($request)) {
                $response->headers->set('X-Robots-Tag', 'noindex, nofollow');
            }

            return $response;
        });

        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $renderNotFound = function (Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json(['message' => 'Not Found'], 404);
            }

            return Inertia::render('errors/404')
                ->toResponse($request)
                ->setStatusCode(404);
        };

        $exceptions->render(function (NotFoundHttpException $exception, Request $request) use ($renderNotFound) {
            return $renderNotFound($request);
        });

        $exceptions->render(function (ModelNotFoundException $exception, Request $request) use ($renderNotFound) {
            return $renderNotFound($request);
        });
    })->create();
