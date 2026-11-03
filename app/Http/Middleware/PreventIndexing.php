<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PreventIndexing
{
    public static function shouldPreventIndexing(Request $request): bool
    {
        return $request->routeIs(
            'login',
            'login.store',
            'logout',
            'dashboard',
            'projects.*',
            'journeys.*',
            'menu-images.*',
        ) || $request->is(
            'secret-cms-login',
            'logout',
            'dashboard',
            'dashboard/*',
            'projects',
            'projects/*',
            'journeys',
            'journeys/*',
            'menu-images',
            'menu-images/*',
        );
    }

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (self::shouldPreventIndexing($request)) {
            $response->headers->set('X-Robots-Tag', 'noindex, nofollow');
        }

        return $response;
    }
}
