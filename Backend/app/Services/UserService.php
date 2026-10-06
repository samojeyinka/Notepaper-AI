<?php

namespace App\Services;

use App\Enums\TokenActionType;
use App\Mail\AccountDeletionConfirmation;
use App\Mail\PasswordChangeConfirmation;
use App\Mail\ProfileUpdated;
use App\Mail\RequestAccountDeletionMail;
use App\Mail\requestPasswordChangeMail;
use App\Models\SecureToken;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class UserService
{
    protected $userModel;

    protected $secureTokenModel;

    public function __construct(User $user, SecureToken $secureToken)
    {

        $this->userModel = $user;
        $this->secureTokenModel = $secureToken;

    }

    public function requestPasswordChange()
    {
        $user = auth()->user();
        $token = Str::random(64);
        $this->secureTokenModel->where('user_id', $user->id)->where('type', TokenActionType::PASSWORD_CHANGE)->delete();
        $verificationUrl = config('app.frontend_url') . "/lockedin/change-password?token={$token}";
        Mail::to($user->email)->send(new requestPasswordChangeMail($user, $verificationUrl));

        return $this->secureTokenModel->create([
            'email'      => $user->email,
            'user_id'    => $user->id,
            'token'      => $token,
            'type'       => TokenActionType::PASSWORD_CHANGE,
            'expires_at' => now()->addMinutes(5),
            'created_at' => now(),
        ]);

    }

    public function changePassword(array $data)
    {
        $user = auth()->user();
        $passwordChange = $this->secureTokenModel
            ->where('user_id', $user->id)
            ->where('type', TokenActionType::PASSWORD_CHANGE)
            ->first();

        abort_if(! $passwordChange || ! Hash::check($data['token'], $passwordChange->token), 404, 'Token not valid');

        if (now()->isAfter($passwordChange->expires_at)) {
            abort(400, 'Token has expired');
        }

        $user = $passwordChange->user;
        abort_if(! $user, 409, 'User does not exist!');

        if (! Hash::check($data['current_password'], $user->password)) {
            abort(400, 'Current password is wrong');
        }

        if (Hash::check($data['new_password'], $user->password)) {
            abort(400, 'New password cannot be thesame as old password');
        }

        DB::transaction(function () use ($user, $data) {
            $user->update([
                'password' => Hash::make($data['new_password']),
            ]);

            $this->secureTokenModel->where('user_id', $user->id)
                ->where('type', TokenActionType::PASSWORD_CHANGE)
                ->delete();

        });

        Mail::to($user->email)->send(new PasswordChangeConfirmation($user));
        auth()->logout();

    }

    public function updatePersonalInfo(array $data): array
    {
        $user = auth()->user();
        $user->update($data);

        try {
            Mail::to($user->email)->send(new ProfileUpdated($user));
        } catch (\Throwable) {
            // Non-critical — profile is already saved
        }

        return ['user' => $user];
    }

    public function requestAccountDeletion()
    {
        $user = auth()->user();
        $token = Str::random(64);
        $this->secureTokenModel->where('user_id', $user->id)->where('type', TokenActionType::ACCOUNT_DELETION)->delete();
        $verificationUrl = config('app.frontend_url') . "/lockedin/delete-account?token={$token}";
        Mail::to($user->email)->send(new RequestAccountDeletionMail($user, $verificationUrl));

        return $this->secureTokenModel->create([
            'email'      => $user->email,
            'user_id'    => $user->id,
            'token'      => $token,
            'type'       => TokenActionType::ACCOUNT_DELETION,
            'expires_at' => now()->addMinutes(10),
            'created_at' => now(),
        ]);
    }

    public function destroy(array $data)
    {
        $user = auth()->user();
        $email = $user->email;
        $isPermanent = $data['permanent'] ?? false;

        $accountDeletion = $this->secureTokenModel->where('user_id', $user->id)
            ->where('type', TokenActionType::ACCOUNT_DELETION)
            ->first();

        abort_if(! $accountDeletion || ! Hash::check($data['token'], $accountDeletion->token), 404, 'Token not valid');

        if (now()->isAfter($accountDeletion->expires_at)) {
            abort(400, 'Token has expired');
        }

        abort_if(! $user, 404, 'User does not exist!');

        DB::transaction(function () use ($user, $isPermanent, $data) {

            $this->secureTokenModel->where('user_id', $user->id)->delete();
            Mail::to($user->email)->send(new AccountDeletionConfirmation($user->email, $isPermanent));

            // Save reasoning if provided
            if (isset($data['reason'])) {
                $user->update(['deletion_reason' => $data['reason']]);
            }

            if ($isPermanent) {
                $user->forceDelete();
            } else {
                $user->delete();
            }
        });

        auth()->logout();
    }
}
