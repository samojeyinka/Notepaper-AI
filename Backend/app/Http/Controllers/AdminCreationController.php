<?php

namespace App\Http\Controllers;

use App\Http\Requests\acceptOrDeclineRequest;
use App\Http\Requests\InviteUserRequest;
use App\Models\User;
use App\Services\AdminCreationService;
use Illuminate\Http\JsonResponse;

class AdminCreationController extends Controller
{
    protected $userModel;

    public function __construct(protected AdminCreationService $adminCreationService, User $user)
    {
        $this->userModel = $user;
    }

    public function invite(InviteUserRequest $request): JsonResponse
    {
        $this->adminCreationService->invite($request->validated());

        return $this->successResponse('Invitation sent successfully!', null, 201);
    }

    public function acceptOrDecline(acceptOrDeclineRequest $request): JsonResponse
    {
        $result = $this->adminCreationService->acceptOrDecline($request->validated());

        return $this->successResponse($result['message']);

    }
}
