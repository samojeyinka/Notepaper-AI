<?php

namespace App\Http\Controllers;

use App\Contracts\Actions\CreatesStudyPlan;
use App\Contracts\Actions\TogglesStudyPlanTask;
use App\Http\Requests\StudyPlanRequest;
use App\Http\Requests\ToggleStudyPlanTaskRequest;
use App\Http\Resources\StudyPlanResource;
use App\Models\StudyPlan;
use App\Services\AiKeyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudyPlanController extends Controller
{
    public function __construct(
        private readonly AiKeyService $aiKeys,
        private readonly CreatesStudyPlan $createStudyPlan,
        private readonly TogglesStudyPlanTask $toggleStudyPlanTask,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $plans = StudyPlan::where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return $this->successResponse('Study plans', StudyPlanResource::collection($plans), 200);
    }

    public function store(StudyPlanRequest $request): JsonResponse
    {
        if ($this->aiKeys->applyFor($request->user()) === null) {
            return $this->errorResponse('Add your AI API key in Settings to use this feature.', 428);
        }

        $data = $request->validated();

        $plan = ($this->createStudyPlan)($request->user(), $data);

        return $this->successResponse('Study plan queued', new StudyPlanResource($plan), 201);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $plan = $this->findPlan($id);
        $this->authorize('view', $plan);

        return $this->successResponse($plan->name, new StudyPlanResource($plan), 200);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $plan = $this->findPlan($id);
        $this->authorize('delete', $plan);

        $plan->delete();

        return $this->successResponse('Study plan deleted.', [], 200);
    }

    public function toggleTask(ToggleStudyPlanTaskRequest $request, string $id): JsonResponse
    {
        $plan = $this->findPlan($id);
        $this->authorize('update', $plan);

        $data = $request->validated();

        $plan = ($this->toggleStudyPlanTask)($plan, $data);

        return $this->successResponse('Task updated', new StudyPlanResource($plan), 200);
    }

    private function findPlan(string $id): StudyPlan
    {
        return StudyPlan::where('id', $id)
            ->where('user_id', auth()->id())
            ->firstOrFail();
    }
}
