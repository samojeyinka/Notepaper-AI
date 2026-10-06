<?php

namespace App\Http\Controllers;

use App\Enums\UserTypeEnum;
use App\Http\Requests\changePasswordRequest;
use App\Http\Requests\deleteAccountRequest;
use App\Http\Requests\updatePersonalInfoRequest;
use App\Http\Resources\UserResource;
use App\Services\UserService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use PragmaRX\Google2FA\Google2FA;

class UserController extends Controller
{
    public function __construct(protected UserService $userService) {}

    public function me(): JsonResponse
    {
        return $this->successResponse(
            'User retrieved successfully.',
            new UserResource(auth()->user()),
            200
        );
    }

    public function requestPasswordChange(): JsonResponse
    {
        $this->userService->requestPasswordChange();

        return $this->successResponse(
            'A password reset token has been sent to your email. It expires in 5 minutes.',
            null,
            201
        );
    }

    public function changePassword(changePasswordRequest $request): JsonResponse
    {
        $this->userService->changePassword($request->validated());

        return $this->successResponse(
            'Password changed successfully. Please log in again with your new credentials.',
            null,
            200
        );
    }

    public function exportMyData()
    {
        $user = auth()->user();
        $pdf = Pdf::loadView('pdf.user_report', compact('user'));

        return $this->successResponse(
            'Your profile details',
            $pdf->download('my_profile.pdf'),
            200
        );

    }

    public function getUserTypes(): JsonResponse
    {
        return $this->successResponse(
            'User types retrieved successfully.',
            UserTypeEnum::values(),
            200
        );

    }

    public function updatePersonalInfo(updatePersonalInfoRequest $request): JsonResponse
    {

        $result = $this->userService->updatePersonalInfo($request->validated());

        return $this->successResponse(
            'Personal info updated successfully',
            new UserResource($result['user']),
            201
        );
    }

    public function googleTwoFactor(): JsonResponse
    {
        $google2fa = new Google2FA;
        $secretKey = $google2fa->generateSecretKey();

        return $this->successResponse(
            'Google 2FA secret key generated.',
            ['secretKey' => $secretKey]
        );
    }

    public function requestAccountDeletion()
    {
        $this->userService->requestAccountDeletion();

        return $this->successResponse(
            'Account deletion token has been sent. It expires in 10 minutes',
            null,
            201
        );

    }

    public function destroy(deleteAccountRequest $request)
    {
        $this->userService->destroy($request->validated());
        $message = $request->permanent ? 'Your account and associated data has been deleted' : 'Your account has been moved to trash, it will be fully deleted in 30 days';

        return $this->successResponse($message, null, 201);

    }
}
