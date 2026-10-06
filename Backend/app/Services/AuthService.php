<?php

namespace App\Services;

use App\DTOs\ResetPasswordData;
use App\Enums\RolesEnum;
use App\Enums\TokenActionType;
use App\Mail\AccountRestoreConfirmation;
use App\Mail\ActivatedMail;
use App\Mail\PasswordResetConfirmation;
use App\Mail\RequestAccountRestore;
use App\Mail\RequestPasswordResetMail;
use App\Mail\ResendVerification;
use App\Mail\WelcomeMail;
use App\Models\PublicToken;
use App\Models\SecureToken;
use App\Models\User;
use App\Notifications\AccountVerified;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use PragmaRX\Google2FA\Google2FA;

class AuthService
{
    protected $userModel;

    protected $tokenModel;

    protected $secureTokenModel;

    protected Google2FA $google2fa;

    public function __construct(User $user, PublicToken $token, SecureToken $secureToken)
    {

        $this->userModel = $user;
        $this->tokenModel = $token;
        $this->secureTokenModel = $secureToken;
        $this->google2fa = new Google2FA;

    }

    // register
    public function store(array $data)
    {
        $token = Str::random(64);
        $user = $this->userModel->create([
            'full_name'                     => $data['full_name'],
            'email'                         => $data['email'],
            'password'                      => $data['password'],
            'type'                          => $data['type'],
            'agreeToTerms'                  => $data['agreeToTerms'],
            'verification_token'            => $token,
            'verification_token_expires_at' => now()->addHours(24),
        ]);

        $user->assignRole(RolesEnum::USER->value);
        $verificationUrl = config('app.frontend_url') . "/verify/email/{$token}?email=" . urlencode($user->email);
        Mail::to($user->email)->send(new WelcomeMail($user, $verificationUrl));

        return $user;

    }

    // verify

    public function verify(array $data)
    {

        $user = $this->userModel->where('email', $data['email'])->firstOrFail();

        if (! Hash::check($data['token'], $user->verification_token)) {
            abort(403, 'Token not valid');
        }

        if (now()->isAfter($user->verification_token_expires_at)) {
            abort(400, 'Verification token has expired, you can request for new one');
        }

        $user->update([
            'email_verified_at'             => now(),
            'verification_token'            => null,
            'verification_token_expires_at' => null,
        ]);

        Mail::to($user->email)->send(new ActivatedMail($user));
        $user->notify(new AccountVerified);

        return $user;
    }

    public function requestPasswordReset(string $email)
    {
        $user = $this->userModel->where('email', $email)->firstOrNotFoundException();

        $this->tokenModel->where('email', $email)->where('type', TokenActionType::PASSWORD_RESET)->delete();
        $token = Str::random(64);
        $verificationUrl = config('app.frontend_url') . "/forgot-password/token?token={$token}";
        Mail::to($email)->send(new RequestPasswordResetMail($user, $verificationUrl));

        return $this->tokenModel->create([
            'email'      => $email,
            'token'      => hash('sha256', $token),
            'type'       => TokenActionType::PASSWORD_RESET,
            'created_at' => now(),
            'expires_at' => now()->addMinutes(10),
        ]);
    }

    // password reset

    public function resetPassword(ResetPasswordData $data)
    {
        $tokenEntry = $this->tokenModel->where('token', hash('sha256', $data->token))->where('type', TokenActionType::PASSWORD_RESET)->firstOrNotFoundException('Invalid token');

        if (now()->isAfter($tokenEntry->expires_at)) {
            abort(400, 'Token Expired');
        }

        DB::transaction(function () use ($data, $tokenEntry) {
            $user = $this->userModel->where('email', $tokenEntry->email)->firstOrFail();
            $user->update([
                'password' => Hash::make($data->password),
            ]);

            Mail::to($user->email)->send(new PasswordResetConfirmation($user));

            $this->tokenModel->where('token', hash('sha256', $data->token))->delete();

        });
    }

    public function resend(string $email)
    {
        $user = $this->userModel->where('email', $email)->firstOrNotFoundException();
        $token = Str::random(64);

        if (($user->email_verified_at != null)) {
            abort(409, 'You\'re already verified');
        }

        $user->update(
            [
                'verification_token'            => $token,
                'verification_token_expires_at' => now()->addHours(24),
            ]
        );

        $verificationUrl = config('app.frontend_url') . "/verify/email/{$token}?email=" . urlencode($user->email);
        Mail::to($user->email)->send(new ResendVerification($user, $verificationUrl));

        return $user;

    }

    public function login(array $credentials, bool $remember): array
    {

        $user = User::withTrashed()->where('email', $credentials['email'])->first();

        if ($user && $user->trashed()) {
            abort(400, 'Please restore your account, it is already trashed.');
        }

        $duration = $remember
            ? (int) config('jwt.refresh_ttl')
            : (int) config('jwt.ttl');
        $token = auth()->setTTL($duration)->attempt($credentials);
        abort_if(! $token, 401, 'Wrong credentials');
        $user = auth()->user();
        abort_if(! $user->email_verified_at, 409, 'Please verify your email');
        $user->update(['remember_me' => $remember]);

        // check for 2FA

        if ($user->google2fa_enabled) {
            $tempToken = Str::random(32);

            Cache::put("2fa_pending:{$tempToken}", $user->id, now()->addMinutes(5));

            return [
                'requires_2fa' => true,
                'temp_token'   => $tempToken,
            ];
        }

        return ['token' => $token, 'user' => $user, 'duration' => $duration];
    }

    public function verifyLogin(string $tempToken, string $otp): array
    {
        $userId = Cache::pull("2fa_pending:{$tempToken}");

        abort_if(! $userId, 422, 'Session expired, please login again');

        $user = $this->userModel->findOrFail($userId);

        $google2fa = new Google2FA;
        $valid = $google2fa->verifyKey($user->google2fa_secret, $otp, 1);

        abort_if(! $valid, 422, 'Invalid OTP');

        $duration = $user->remember_me
            ? (int) config('jwt.refresh_ttl')
            : (int) config('jwt.ttl');

        $token = auth()->setTTL($duration)->login($user);

        return ['token' => $token, 'user' => $user, 'duration' => $duration];
    }

    public function requestRestore(string $email)
    {
        $user = $this->userModel->onlyTrashed()->where('email', $email)->firstOrNotFoundException();
        abort_if(! $user->trashed(), 409, 'Account is already active');
        abort_if(now()->isAfter($user->deleted_at->addDays(30)), 410, 'Recovery window expired.');
        $this->tokenModel->where('email', $email)->where('type', TokenActionType::ACCOUNT_RESTORE)->delete();
        $token = Str::random(64);
        $verificationUrl = config('app.frontend_url') . "/account-restore/token?token={$token}&email=" . urlencode($user->email);
        Mail::to($email)->send(new RequestAccountRestore($user, $verificationUrl));

        return $this->tokenModel->create([
            'email'      => $email,
            'token'      => hash('sha256', $token),
            'type'       => TokenActionType::ACCOUNT_RESTORE,
            'created_at' => now(),
            'expires_at' => now()->addMinutes(10),
        ]);

    }

    public function restore(array $data)
    {
        $user = $this->userModel->withTrashed()->where('email', $data['email'])->firstOrNotFoundException();
        abort_if(! $user->trashed(), 409, 'Account is already active');
        abort_if(now()->isAfter($user->deleted_at->addDays(30)), 410, 'Recovery window expired.');
        $tokenEntry = $this->tokenModel->where('token', hash('sha256', $data['token']))->where('type', TokenActionType::ACCOUNT_RESTORE)->firstOrNotFoundException('Invalid Token');

        // check for expiry
        if (now()->isAfter($tokenEntry->expires_at)) {
            abort(400, 'Token Expired');
        }

        DB::transaction(function () use ($user, $data) {
            $user->restore();
            Mail::to($user->email)->send(new AccountRestoreConfirmation($user));
            $this->tokenModel->where('token', hash('sha256', $data['token']))->delete();
        });

    }

    public function refreshToken(): array
    {
        $user = auth()->user();

        if (! $user->remember_me) {
            auth()->logout();

            abort(403, 'Refresh forbidden for this session');
        }

        $duration = config('jwt.ttl');
        $newToken = auth()->setTTL($duration)->refresh();

        return ['token' => $newToken,  'user' => $user, 'duration' => $duration];
    }
}
