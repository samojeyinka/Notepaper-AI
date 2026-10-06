<?php

namespace App\Http\Controllers;

use App\Http\Requests\GenerateFlashcardsRequest;
use App\Http\Requests\GenerateNotesRequest;
use App\Http\Requests\GeneratePresentationRequest;
use App\Http\Requests\GenerateQuizRequest;
use App\Http\Requests\SourceRequest;
use App\Jobs\ExpandTopicJob;
use App\Jobs\SimplifyTopicJob;
use App\Models\Note;
use App\Models\Paper;
use App\Services\AiKeyService;
use App\Services\GenerateFromContentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GenerateFromContentController extends Controller
{
    private const KEY_REQUIRED_MESSAGE = 'Add your AI API key in Settings to use this feature.';

    public function __construct(
        protected GenerateFromContentService $service,
        protected AiKeyService $aiKeys,
    ) {}

    /**
     * POST /ai/generate/flashcards
     */
    public function flashcards(GenerateFlashcardsRequest $request): JsonResponse
    {
        if ($this->aiKeys->applyFor($request->user()) === null) {
            return $this->errorResponse(self::KEY_REQUIRED_MESSAGE, 428);
        }

        $data = $request->validated();

        try {
            $content = $this->service->extractContent(
                $request->user(),
                $data['material_ids'] ?? [],
                $request->file('uploads') ?? []
            );

            $cards = $this->service->generateFlashcards(
                $content,
                (int) $data['count'],
                $data['topic'] ?? null
            );

            return $this->successResponse('Flashcards generated', ['cards' => $cards]);
        } catch (\Throwable $e) {
            Log::error('GenerateFromContent flashcards failed', ['error' => $e->getMessage()]);

            return $this->errorResponse('Generation failed. Please try again.', 422);
        }
    }

    /**
     * POST /ai/generate/quiz
     */
    public function quiz(GenerateQuizRequest $request): JsonResponse
    {
        if ($this->aiKeys->applyFor($request->user()) === null) {
            return $this->errorResponse(self::KEY_REQUIRED_MESSAGE, 428);
        }

        $data = $request->validated();

        try {
            $content = $this->service->extractContent(
                $request->user(),
                $data['material_ids'] ?? [],
                $request->file('uploads') ?? []
            );

            $questions = $this->service->generateQuiz(
                $content,
                (int) $data['count'],
                $data['difficulty'],
                $data['question_type'],
                $data['topic'] ?? null
            );

            return $this->successResponse('Quiz generated', ['questions' => $questions]);
        } catch (\Throwable $e) {
            Log::error('GenerateFromContent quiz failed', ['error' => $e->getMessage()]);

            return $this->errorResponse('Generation failed. Please try again.', 422);
        }
    }

    /**
     * POST /ai/generate/presentation
     */
    public function presentation(GeneratePresentationRequest $request): JsonResponse
    {
        if ($this->aiKeys->applyFor($request->user()) === null) {
            return $this->errorResponse(self::KEY_REQUIRED_MESSAGE, 428);
        }

        $data = $request->validated();

        try {
            $content = $this->service->extractContent(
                $request->user(),
                $data['material_ids'] ?? [],
                $request->file('uploads') ?? []
            );

            $slides = $this->service->generatePresentation(
                $content,
                (int) $data['slide_count'],
                $data['topic'] ?? null
            );

            return $this->successResponse('Presentation generated', ['slides' => $slides]);
        } catch (\Throwable $e) {
            Log::error('GenerateFromContent presentation failed', ['error' => $e->getMessage()]);

            return $this->errorResponse('Generation failed. Please try again.', 422);
        }
    }

    /**
     * POST /ai/generate/notes
     */
    public function notes(GenerateNotesRequest $request): JsonResponse
    {
        if ($this->aiKeys->applyFor($request->user()) === null) {
            return $this->errorResponse(self::KEY_REQUIRED_MESSAGE, 428);
        }

        $data = $request->validated();

        try {
            $content = $this->service->extractContent(
                $request->user(),
                $data['material_ids'] ?? [],
                $request->file('uploads') ?? []
            );

            $notes = $this->service->generateNotes(
                $content,
                $data['tone'],
                $data['length'],
                $data['topic'] ?? null
            );

            return $this->successResponse('Notes generated', ['content' => $notes]);
        } catch (\Throwable $e) {
            Log::error('GenerateFromContent notes failed', ['error' => $e->getMessage()]);

            return $this->errorResponse('Generation failed. Please try again.', 422);
        }
    }

    /**
     * POST /ai/expand
     */
    public function expand(SourceRequest $request): JsonResponse
    {
        if ($this->aiKeys->applyFor($request->user()) === null) {
            return $this->errorResponse(self::KEY_REQUIRED_MESSAGE, 428);
        }

        $user = $request->user();
        $data = $request->validated();

        [$new, $type] = DB::transaction(function () use ($user, $data): array {
            if ($data['source_type'] === 'note') {
                $source = Note::where('id', $data['source_id'])->where('user_id', $user->id)->firstOrFail();
                $new = Note::create([
                    'user_id'       => $user->id,
                    'title'         => 'Expanding: ' . $source->title,
                    'content'       => null,
                    'ai_generating' => true,
                ]);
                $type = 'note';
            } else {
                $source = Paper::where('id', $data['source_id'])->where('user_id', $user->id)->firstOrFail();
                $new = Paper::create([
                    'user_id'       => $user->id,
                    'title'         => 'Expanding: ' . $source->title,
                    'content'       => null,
                    'ai_generating' => true,
                ]);
                $type = 'paper';
            }

            return [$new, $type];
        });

        DB::afterCommit(fn () => ExpandTopicJob::dispatch($type, $new->id, $data['source_type'], $data['source_id'])
            ->onQueue('ai'));

        return $this->successResponse(
            'Expansion queued', [
                'type' => $type,
                'id'   => $new->id,
            ], 201
        );
    }

    /**
     * POST /ai/simplify
     */
    public function simplify(SourceRequest $request): JsonResponse
    {
        if ($this->aiKeys->applyFor($request->user()) === null) {
            return $this->errorResponse(self::KEY_REQUIRED_MESSAGE, 428);
        }

        $user = $request->user();
        $data = $request->validated();

        [$new, $type] = DB::transaction(function () use ($user, $data): array {
            if ($data['source_type'] === 'note') {
                $source = Note::where('id', $data['source_id'])->where('user_id', $user->id)->firstOrFail();
                $new = Note::create([
                    'user_id'       => $user->id,
                    'title'         => 'Simplified: ' . $source->title,
                    'content'       => null,
                    'ai_generating' => true,
                ]);
                $type = 'note';
            } else {
                $source = Paper::where('id', $data['source_id'])->where('user_id', $user->id)->firstOrFail();
                $new = Paper::create([
                    'user_id'       => $user->id,
                    'title'         => 'Simplified: ' . $source->title,
                    'content'       => null,
                    'ai_generating' => true,
                ]);
                $type = 'paper';
            }

            return [$new, $type];
        });

        DB::afterCommit(fn () => SimplifyTopicJob::dispatch($type, $new->id, $data['source_type'], $data['source_id'])
            ->onQueue('ai'));

        return $this->successResponse(
            'Simplification  queued', [
                'type' => $type,
                'id'   => $new->id,
            ], 201
        );
    }
}
