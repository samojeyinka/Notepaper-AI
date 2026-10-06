<?php

namespace App\Http\Controllers;

use App\Http\Requests\SprintRequest;
use App\Http\Resources\SprintChallengeResource;
use App\Http\Resources\SprintResource;
use App\Models\SprintChallenge;
use App\Services\AiKeyService;
use App\Services\SprintService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SprintController extends Controller
{
    public function __construct(
        private readonly SprintService $sprintService,
        protected AiKeyService $aiKeys,
    ) {}

    public function index(): AnonymousResourceCollection
    {
        return SprintResource::collection(
            $this->sprintService->list(auth()->user())
        );
    }

    public function store(SprintRequest $request): SprintResource|JsonResponse
    {
        if ($this->aiKeys->applyFor($request->user()) === null) {
            return $this->errorResponse('Add your AI API key in Settings to use this feature.', 428);
        }

        $sprint = $this->sprintService->create(auth()->user(), $request->validated());

        return new SprintResource($sprint);
    }

    public function show(string $id): SprintResource
    {
        $sprint = $this->sprintService->show($id, auth()->user());
        $this->authorize('view', $sprint);

        return new SprintResource($sprint);
    }

    public function showChallenge(string $sprintId, SprintChallenge $challenge): SprintChallengeResource
    {
        $challenge->loadMissing('sprint');

        abort_unless($challenge->sprint_id === $sprintId, 404);

        $this->authorize('show', $challenge);

        return new SprintChallengeResource($challenge);
    }

    public function completeChallenge(string $sprintId, SprintChallenge $challenge): SprintChallengeResource
    {
        $challenge->loadMissing('sprint');

        abort_unless($challenge->sprint_id === $sprintId, 404);

        $updated = $this->sprintService->completeChallenge($challenge, auth()->user());

        return new SprintChallengeResource($updated);
    }

    public function destroySprint(string $id): JsonResponse
    {
        $sprint = $this->sprintService->show($id, auth()->user());

        $this->authorize('delete', $sprint);

        $sprint->delete();

        return $this->successResponse('Sprint deleted.');
    }
}
