<?php

namespace App\Http\Controllers;

use App\DTOs\ResetPasswordData;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\ResendVerificationTokenRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\VerifyEmailRequest;
use App\Http\Requests\VerifyLogin2FARequest;
use App\Http\Requests\VerifyUserTokenRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;

class AuthController extends Controller
{
    public function __construct(protected AuthService $authService) {}

    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = $this->authService->store($request->validated());

        return $this->successResponse(
            'A verification link has been sent to your email. Please check your inbox to complete your signup.',
            new UserResource($user),
            201
        );

    }

    public function verify(VerifyUserTokenRequest $request): JsonResponse
    {
        $this->authService->verify($request->validated());

        return $this->successResponse(
            'Your account has been verified'
        );

    }

    public function resend(ResendVerificationTokenRequest $request): JsonResponse
    {

        $this->authService->resend($request->email);

        return $this->successResponse(
            'The new verification link has been sent to you'
        );

    }

    // reset password
    public function requestPasswordReset(ResendVerificationTokenRequest $request): JsonResponse
    {

        $email = $request->email;
        $this->authService->requestPasswordReset($email);

        return $this->successResponse(
            'Password reset token has been sent to' . $email . '. It expires in 10 minutes',
            null,
            201
        );

    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $dto = new ResetPasswordData(
            token: $request->token,
            password: $request->new_password
        );

        $this->authService->resetPassword($dto);

        return $this->successResponse(
            'Password reset successfully',
            null,
            201
        );

    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login(
            $request->only(['email', 'password']),
            $request->boolean('remember_me')
        );

        if ($result['requires_2fa'] ?? false) {
            return $this->successResponse('2FA required', $result);
        }

        return $this->respondWithToken($result['token'], $result['user'], $result['duration']);
    }

    public function verifyLogin(VerifyLogin2FARequest $request): JsonResponse
    {

        $result = $this->authService->verifyLogin(
            $request->temp_token,
            $request->otp
        );

        return $this->respondWithToken($result['token'], $result['user'], $result['duration']);
    }

    public function refreshToken(): JsonResponse
    {
        $result = $this->authService->refreshToken();

        return $this->respondWithToken($result['token'], $result['user'], $result['duration']);
    }

    public function logout(): JsonResponse
    {
        auth()->logout();

        return $this->successResponse(
            'Logged out successfully'
        )->withCookie(Cookie::forget('np_token'));
    }

    // request account restore

    public function requestRestore(VerifyEmailRequest $request): JsonResponse
    {
        $this->authService->requestRestore($request->email);

        return $this->successResponse(
            'Account restore instructions have been sent to your email'
        );
    }

    // restore account
    public function restore(VerifyUserTokenRequest $request)
    {
        $this->authService->restore($request->validated());

        return $this->successResponse(
            'Your account has been restored, you can continue to signin',
            null,
            201
        );

    }

    protected function respondWithToken(string $token, $user, int $duration): JsonResponse
    {
        $response = $this->successResponse(null, [
            'user'          => new UserResource($user),
            'authorisation' => [
                'expires_in' => $duration * 60,
                'type'       => 'bearer',
            ],
        ]);

        // Attach token as HttpOnly secure cookie
        return $response->withCookie(cookie(
            'np_token',
            $token,
            $duration,
            '/',
            null,
            true, // secure (required for SameSite: None, works on localhost:8000)
            true, // httpOnly
            false,
            'None' // sameSite: None is best for cross-port localhost
        ));
    }
}
