<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AdminCreationController;
use App\Http\Controllers\LegalDocumentController;
use App\Http\Controllers\UserModerationController;
use Illuminate\Support\Facades\Route;

Route::middleware(['inject_cookie', 'jwt', 'auth:api'])->group(function () {

    Route::middleware('role:admin|super_admin')->controller(AdminController::class)->group(function () {
        Route::get('/users', 'users');
        Route::get('/export', 'export');
        Route::get('/users/trash', 'trashed');
        Route::patch('/users/restore', 'restore');
        Route::delete('/users/delete', 'destroy');
        Route::delete('/users/permanent', 'forceDestroy');
        Route::post('/users/report', [UserModerationController::class, 'report']);
        Route::get('users/reported-by-me', [UserModerationController::class, 'reportedByMe']);
    });

    Route::middleware('role:super_admin')->group(function () {
        Route::post('/invite', [AdminCreationController::class, 'invite']);
        Route::patch('/legal-documents', [LegalDocumentController::class, 'update']);
        Route::get('users/reported', [UserModerationController::class, 'reported']);
        Route::patch('users/action', [UserModerationController::class, 'action']);
    });

});

Route::get('/legal-documents', [LegalDocumentController::class, 'fetch']);
Route::post('/invitations/accept-or-decline', [AdminCreationController::class, 'acceptOrDecline']);
