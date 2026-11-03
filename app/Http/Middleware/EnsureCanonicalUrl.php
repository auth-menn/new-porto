<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCanonicalUrl
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (app()->environment('production')) {
            $canonicalUrl = rtrim((string) config('seo.canonical_url'), '/');
            $canonicalHost = (string) parse_url($canonicalUrl, PHP_URL_HOST);

            if (! $request->isSecure() || $request->getHost() !== $canonicalHost) {
                return redirect()->to($canonicalUrl.$request->getRequestUri(), 301);
            }
        }

        return $next($request);
    }
}
