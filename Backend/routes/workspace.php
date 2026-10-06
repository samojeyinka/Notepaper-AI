<?php

use App\Http\Controllers\FlashcardController;
use App\Http\Controllers\PaperController;
use App\Http\Controllers\PresentationController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\WorkSpaceController;

Route::middleware('jwt')->controller(WorkSpaceController::class)->group(function () {
    Route::get('/', 'feed');
    Route::get('/folders', 'folders');
    Route::post('/folders', 'create');
    Route::get('/folders/{id}', 'folder');
    Route::patch('/folders/{id}', 'updateFolder');
    Route::delete('/folders/{id}', 'destroyFolder');
    Route::get('/notes', 'notes');
    Route::post('/notes', 'store');
    Route::patch('/notes/{note}', 'update');
    Route::get('/notes/{note}', 'note');
    Route::get('/notes/{note}/versions', 'versions');
    Route::patch('/notes/{note}/revert/{versionId}', 'revert');
    Route::post('/notes/duplicate/{note}', 'duplicate');
    Route::delete('/notes/{note}', 'destroyNote');

});

Route::middleware('jwt')->controller(PaperController::class)->prefix('papers')->group(function () {
    Route::get('/', 'index');
    Route::post('/', 'store');
    Route::get('/{paper}', 'show');
    Route::patch('/{paper}', 'update');
    Route::get('/{paper}/versions', 'versions');
    Route::patch('/{paper}/revert/{versionId}', 'revert');
    Route::post('/duplicate/{paper}', 'duplicate');
    Route::get('/{paper}/presentations', 'presentations');
    Route::delete('/{paper}', 'destroy');
});

Route::middleware('jwt')->controller(PresentationController::class)->prefix('presentations')->group(function () {
    Route::get('/', 'index');
    Route::post('/', 'store');
    Route::get('/{presentation}', 'show');
    Route::patch('/{presentation}', 'update');
    Route::delete('/{presentation}', 'destroy');
});

Route::middleware('jwt')->controller(FlashcardController::class)->prefix('flashcards')->group(function () {
    Route::get('/', 'index');
    Route::post('/', 'store');
    Route::get('/{flashcard}', 'show');
    Route::patch('/{flashcard}', 'update');
    Route::delete('/{flashcard}', 'destroy');
    Route::post('/duplicate/{flashcard}', 'duplicate');
});

Route::middleware('jwt')->controller(QuizController::class)->prefix('quizzes')->group(function () {
    Route::get('/', 'index');
    Route::post('/', 'store');
    Route::get('/{id}', 'show');
    Route::delete('/{quiz}', 'destroy');
});
