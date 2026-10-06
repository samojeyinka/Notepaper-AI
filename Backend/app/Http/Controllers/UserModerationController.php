<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReportRequest;
use App\Http\Requests\SuperAdminActionRequest;
use App\Http\Resources\UserModerationResource;
use App\Models\UserModeration;
use App\Services\UserModerationService;
use Illuminate\Http\JsonResponse;

class UserModerationController extends Controller
{
    public function __construct(protected UserModerationService $userModerationService) {}

    public function report(ReportRequest $request): JsonResponse
    {

        $selected = $this->userModerationService->report($request->validated());

        return $this->successResponse(
            'The selected user(s) have been flagged for suspension and super admin(s) have been notified.',
            $selected,
            201
        );

    }

    public function reportedByMe(): JsonResponse
    {
        $users = UserModeration::with(['user:id,full_name', 'requestedBy:id,full_name', 'reviewedBy:id,full_name'])->where('requested_by', auth()->id())->get();

        return $this->successResponse(
            'Here are the users you have reported.',
            UserModerationResource::collection($users),
            200
        );
    }

    public function reported(): JsonResponse
    {

        $users = UserModeration::with(['user:id,email,full_name', 'requestedBy:id,email,full_name', 'reviewedBy:id,email,full_name'])->get();

        return $this->successResponse(
            'Reported users retrieved successfully.',
            UserModerationResource::collection($users),
            200
        );
    }

    public function action(SuperAdminActionRequest $request): JsonResponse
    {
        $result = $this->userModerationService->action($request->validated());

        return $this->successResponse(
            "User status updated to {$result['status']} successfully.",
            UserModerationResource::collection($result['moderations']),
            200
        );
    }
}
