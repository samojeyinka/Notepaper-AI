<?php

use App\Http\Controllers\AiKeyController;
use App\Http\Controllers\AiProxyController;
use App\Http\Controllers\GenerateFromContentController;
use App\Http\Controllers\ImageSearchController;
use App\Http\Controllers\ShakespeareController;
use App\Http\Controllers\SprintController;
use App\Http\Controllers\StudyPlanController;

Route::middleware('jwt')->controller(AiKeyController::class)->prefix('key')->group(function () {
    Route::get('/', 'index');
    Route::post('/', 'store');
    Route::post('/verify', 'verify');
    Route::post('/{provider}/default', 'makeDefault');
    Route::delete('/{provider}', 'destroy');
});

Route::middleware('jwt')->post('shakespeare/ask', [ShakespeareController::class, 'ask']);

Route::middleware('jwt')->controller(AiProxyController::class)->prefix('proxy')->group(function () {
    Route::post('/text', 'text');
    Route::post('/stream', 'stream');
    Route::post('/image', 'image');
});

Route::middleware('jwt')->controller(SprintController::class)->prefix('sprints')->group(function () {
    Route::get('/', 'index');
    Route::post('/', 'store');
    Route::get('/{id}', 'show');
    Route::delete('/{id}', 'destroySprint');
    Route::get('/{sprintId}/challenges/{challenge}', 'showChallenge');
    Route::post('/{sprintId}/challenges/{challenge}/complete', 'completeChallenge');
});

Route::middleware('jwt')->controller(GenerateFromContentController::class)->prefix('generate')->group(function () {
    Route::post('/flashcards', 'flashcards');
    Route::post('/quiz', 'quiz');
    Route::post('/presentation', 'presentation');
    Route::post('/notes', 'notes');
});

Route::middleware('jwt')->post('/expand', [GenerateFromContentController::class, 'expand']);
Route::middleware('jwt')->post('/simplify', [GenerateFromContentController::class, 'simplify']);

Route::middleware('jwt')->controller(StudyPlanController::class)->prefix('study-plans')->group(function () {
    Route::get('/', 'index');
    Route::post('/', 'store');
    Route::get('/{id}', 'show');
    Route::delete('/{id}', 'destroy');
    Route::patch('/{id}/tasks', 'toggleTask');
});

Route::middleware('jwt')->get('/images/search', [ImageSearchController::class, 'search']);
