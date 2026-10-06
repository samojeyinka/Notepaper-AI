<?php

use App\Exceptions\ExceptionRegistrar;
use App\Http\Middleware\InjectCookieToken;
use App\Http\Middleware\JwtMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__ . '/../routes/api.php',
        apiPrefix: 'api/v1',
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
        then: function () {
            Route::middleware('api')
                ->prefix('api/v1/users')->group(base_path('routes/user.php'));

            Route::middleware('api')
                ->prefix('api/v1/public')->group(base_path('routes/public.php'));

            Route::middleware('api')
                ->prefix('api/v1/admins')->group(base_path('routes/admin.php'));

            Route::middleware(['api', 'inject_cookie'])->prefix('api/v1/workspace')->group(base_path('routes/workspace.php'));

            Route::middleware(['api', 'inject_cookie'])
                ->prefix('api/v1/ai')->group(base_path('routes/ai.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies();
        $middleware->alias([
            'inject_cookie'      => InjectCookieToken::class,
            'jwt'                => JwtMiddleware::class,
            'role'               => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission'         => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
            '2fa'                => \PragmaRX\Google2FALaravel\Middleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        ExceptionRegistrar::register($exceptions);
    })->create();
