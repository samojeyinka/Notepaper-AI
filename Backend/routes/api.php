<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\SocialAuthController;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->controller(AuthController::class)->group(function () {
    Route::middleware('throttle:10,1')->group(function () {
        Route::post('/signup', 'store');
        Route::post('/signin', 'login');
        Route::post('/2fa', 'verifyLogin');
        Route::post('/verify', 'verify');
        Route::post('/resend-verification', [AuthController::class, 'resend']);
        Route::post('/request-password-reset-token', 'requestPasswordReset');
        Route::post('/reset-password', 'resetPassword');
        Route::post('/request-restore-account', 'requestRestore');
        Route::patch('/restore-account', 'restore');
    });

    // Social Auth
    Route::get('/{provider}/redirect', [SocialAuthController::class, 'redirectToProvider']);
    Route::get('/{provider}/callback', [SocialAuthController::class, 'handleProviderCallback']);

    Route::middleware(['inject_cookie', 'jwt'])->group(function () {
        Route::get('/refresh', 'refreshToken');
        Route::post('/signout', 'logout');
    });

});

Route::middleware(['inject_cookie', 'jwt'])->post('/broadcasting/auth', function () {
    return Broadcast::auth(request());
});

Route::fallback(function () {
    return response()->json([
        'status'  => 'error',
        'message' => 'Not Found',
        'errors'  => [],
    ], 404);
});
