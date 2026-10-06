<?php

namespace App\Http\Middleware;

use Closure;
use Exception;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Tymon\JWTAuth\Facades\JWTAuth;

class JwtMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();

            if (! $user) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'User not found',
                    'errors'  => null,
                ], 401);
            }

        } catch (TokenExpiredException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Token expired',
                'errors'  => null,
            ], 401);
        } catch (TokenInvalidException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Token Invalid',
                'errors'  => null,
            ], 401);
        } catch (Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Authorization Token not found',
                'errors'  => null,
            ], 401);
        }

        return $next($request);
    }
}
