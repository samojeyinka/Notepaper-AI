<?php

namespace App\Exceptions;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;

class ExceptionRegistrar
{
    public static function register(Exceptions $exceptions): void
    {
        // abort() calls and framework-converted exceptions (e.g. ModelNotFoundException → 404)
        $exceptions->render(function (HttpException $e, Request $request) {
            $message = $e->getMessage();

            if ($e->getStatusCode() === 404 && (empty($message) || str_contains($message, 'App\\Models\\'))) {
                // Extract short model name from "No query results for model [App\Models\User]."
                preg_match('/\[App\\\\Models\\\\(\w+)\]/', $message, $matches);
                $modelName = $matches[1] ?? 'Resource';
                $message = "{$modelName} not found.";
            }

            return response()->json([
                'status'  => 'error',
                'message' => $message,
                'errors'  => null,
            ], $e->getStatusCode());
        });

        // form request validation - 422
        $exceptions->render(function (ValidationException $e, Request $request) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);
        });

        // unauthenticated - 401
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Unauthenticated',
                'errors'  => null,
            ], 401);
        });

        // unauthorized - 403
        $exceptions->render(function (AuthorizationException $e, Request $request) {
            return response()->json([
                'status'  => 'error',
                'message' => 'You do not have permission to do this.',
                'errors'  => null,
            ], 403);
        });

        // 404
        $exceptions->render(function (ModelNotFoundException $e, Request $request) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Record not found.',
                'errors'  => null,
            ], 404);
        });

        // catch-all — hide details in production or if debug is false
        $exceptions->render(function (\Throwable $e, Request $request) {
            return response()->json([
                'status'  => 'error',
                'message' => config('app.debug') ? $e->getMessage() : 'Something went wrong',
                'errors'  => null,
            ], 500);
        });
    }
}
