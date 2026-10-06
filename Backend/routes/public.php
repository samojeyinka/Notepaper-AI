<?php

use App\Http\Controllers\ContactUsController;
use App\Http\Controllers\FlashcardController;
use App\Http\Controllers\PaperController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\SupportChatbotController;
use App\Http\Controllers\WorkSpaceController;

Route::prefix('/support')->middleware('throttle:20,1')->controller(SupportChatbotController::class)->group(function () {
    Route::post('/chatbot', 'ask');
});

Route::prefix('/contact')->middleware('throttle:5,1')->controller(ContactUsController::class)->group(function () {
    Route::post('/', 'contact');
});

Route::prefix('/quizzes')->controller(QuizController::class)->group(function () {
    Route::get('/{id}', 'showPublic');
});

Route::prefix('/notes')->controller(WorkSpaceController::class)->group(function () {
    Route::get('/{id}', 'showPublic');
});

Route::prefix('/papers')->controller(PaperController::class)->group(function () {
    Route::get('/{id}', 'showPublic');
});

Route::prefix('/flashcards')->controller(FlashcardController::class)->group(function () {
    Route::get('/{id}', 'showPublic');
});
