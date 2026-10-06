<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;

/**
 * Reads the JWT from the 'np_token' HttpOnly cookie and injects it
 * into the Authorization header so Tymon JWT Auth picks it up normally.
 *
 * This means the frontend never touches the token — the browser
 * sends the cookie automatically, and this middleware bridges it.
 */
class InjectCookieToken
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->cookie('np_token');

        if ($token) {
            $request->headers->set('Authorization', 'Bearer ' . $token);

            try {
                JWTAuth::setToken($token);
            } catch (\Exception $e) {
                // Ignore if facade is unavailable
            }
        }

        return $next($request);
    }
}
