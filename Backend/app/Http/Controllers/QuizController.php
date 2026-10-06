<?php

namespace App\Http\Controllers;

use App\Http\Requests\QuizRequest;
use App\Http\Resources\QuizResource;
use App\Models\Quiz;
use App\Services\QuizService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class QuizController extends Controller
{
    public function __construct(private readonly QuizService $quizService) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $raw = $request->query('sort', 'created_at:desc');
        [$col, $dir] = array_pad(explode(':', $raw), 2, 'desc');
        $sortBy = in_array($col, ['created_at', 'updated_at', 'title']) ? $col : 'created_at';
        $sortDir = $dir === 'asc' ? 'asc' : 'desc';

        $paginator = $this->quizService->list(
            auth()->user(),
            $sortBy,
            $sortDir,
            $request->query('searching') ?: null,
        );

        return QuizResource::collection($paginator);
    }

    public function store(QuizRequest $request): QuizResource
    {
        $quiz = $this->quizService->create(auth()->user(), $request->validated());

        return new QuizResource($quiz);
    }

    public function show(string $id): QuizResource
    {
        $quiz = $this->quizService->show($id, auth()->user());
        $this->authorize('view', $quiz);

        return new QuizResource($quiz);
    }

    public function showPublic(string $id): QuizResource
    {
        return new QuizResource($this->quizService->findPublic($id));
    }

    public function destroy(Quiz $quiz): JsonResponse
    {
        $this->authorize('delete', $quiz);

        $this->quizService->delete($quiz);

        return $this->successResponse('Quiz deleted.');
    }
}
