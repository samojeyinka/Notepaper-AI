<?php

use App\Http\Controllers\NotificationController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\TicketMessageController;
use App\Http\Controllers\TwoFactorController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['inject_cookie', 'jwt'])->controller(UserController::class)->group(function () {
    Route::get('/profile', 'me');
    Route::post('/request-password-change', 'requestPasswordChange');
    Route::post('/change-password', 'changePassword');
    Route::get('/profile/export', 'exportMyData');
    Route::patch('/personal-info', 'updatePersonalInfo');
    Route::post('/request-account-deletion', 'requestAccountDeletion');
    Route::delete('/delete-account', 'destroy');

});

Route::get('/user-types', [UserController::class, 'getUserTypes']);
Route::middleware(['inject_cookie', 'jwt'])->controller(TwoFactorController::class)->group(function () {
    Route::post('/google-2fa', 'setUp');
    Route::post('/enable-google-2fa', 'enable');
    Route::post('/disable-google-2fa', 'disable');
});

Route::middleware(['inject_cookie', 'jwt'])->controller(NotificationController::class)->group(function () {
    Route::get('/notifications', 'index');
    Route::post('/notifications/read-all', 'markAllAsRead');
    Route::patch('/notifications/{notification}/read', 'markAsRead');
    Route::delete('/notifications/{notification}', 'destroy');
});

Route::middleware(['inject_cookie', 'jwt'])->group(function () {
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::get('/tickets/{ticket}', [TicketController::class, 'show']);
    Route::patch('/tickets/{ticket}/status', [TicketController::class, 'updateStatus']);
    Route::post('/tickets/{ticket}/messages', [TicketMessageController::class, 'store']);
});
