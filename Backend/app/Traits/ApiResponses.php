<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponses
{
    protected function successResponse(?string $message = null, mixed $data = [], int $status = 200): JsonResponse
    {
        return response()->json([
            'status'  => 'success',
            'message' => $message,
            'data'    => $data,
        ], $status);
    }

    protected function errorResponse(?string $message = null, int $status = 400, mixed $errors = []): JsonResponse
    {
        return response()->json([
            'status'  => 'error',
            'message' => $message,
            'errors'  => $errors,
        ], $status);
    }
}
