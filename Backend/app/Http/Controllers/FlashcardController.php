<?php

namespace App\Http\Controllers;

use App\Http\Requests\FlashcardRequest;
use App\Http\Resources\FlashcardResource;
use App\Models\Flashcard;
use App\Services\FlashcardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class FlashcardController extends Controller
{
    public function __construct(private readonly FlashcardService $flashcardService) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $raw = $request->query('sort', 'updated_at:desc');
        [$col, $dir] = array_pad(explode(':', $raw), 2, 'desc');
        $allowed = ['updated_at', 'title', 'created_at'];
        $sortBy = in_array($col, $allowed) ? $col : 'updated_at';
        $sortDir = $dir === 'asc' ? 'asc' : 'desc';

        $paginator = $this->flashcardService->list(
            auth()->user(),
            $request->query('folder_id'),
            $sortBy,
            $sortDir,
            $request->query('searching') ?: null
        );

        return FlashcardResource::collection($paginator);
    }

    public function store(FlashcardRequest $request): FlashcardResource
    {
        $flashcard = $this->flashcardService->create(auth()->user(), $request->validated());

        return new FlashcardResource($flashcard);
    }

    public function show(string $id): FlashcardResource
    {
        $flashcard = $this->flashcardService->show($id, auth()->user());

        return new FlashcardResource($flashcard);
    }

    public function update(FlashcardRequest $request, Flashcard $flashcard): FlashcardResource
    {
        $this->authorize('update', $flashcard);

        $flashcard = $this->flashcardService->update($flashcard, $request->validated());

        return new FlashcardResource($flashcard);
    }

    public function destroy(Flashcard $flashcard): JsonResponse
    {
        $this->authorize('delete', $flashcard);

        $this->flashcardService->delete($flashcard);

        return $this->successResponse('Flashcard deleted.');
    }

    public function duplicate(Flashcard $flashcard): FlashcardResource
    {
        $this->authorize('duplicate', $flashcard);

        $copy = $this->flashcardService->duplicate($flashcard);

        return new FlashcardResource($copy);
    }

    public function showPublic(string $id): FlashcardResource
    {
        $flashcard = $this->flashcardService->showPublic($id);

        return new FlashcardResource($flashcard);
    }
}
