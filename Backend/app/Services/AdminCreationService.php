<?php

namespace App\Services;

use App\Enums\AdminInvitationEnum;
use App\Mail\AdminInvitationAccepted;
use App\Mail\AdminInvitationDeclined;
use App\Mail\InviteAdmin;
use App\Mail\NewAdittionalAdmin;
use App\Models\SecureToken;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AdminCreationService
{
    protected $userModel;

    protected $secureTokenModel;

    public function __construct(User $user, SecureToken $secureToken)
    {
        $this->userModel = $user;
        $this->secureTokenModel = $secureToken;
    }

    public function invite(array $validated)
    {

        $data = DB::transaction(function () use ($validated) {
            $token = Str::random(64);
            $password = Str::password(16);

            $user = $this->userModel->create([
                'email'                         => $validated['email'],
                'full_name'                     => $validated['full_name'],
                'password'                      => $password,
                'verification_token'            => $token,
                'verification_token_expires_at' => now()->addDays(7),
            ]);

            $user->assignRole($validated['role']);

            return ['user' => $user, 'password' => $password, 'token' => $token];
        });

        $additions = [
            'role'            => $validated['role'],
            'password'        => $data['password'],
            'verificationUrl' => config('app.frontend_url') . "/activate-admin/token?token={$data['token']}",
        ];

        Mail::to($data['user'])->send(new InviteAdmin($data['user'], $additions));

    }

    public function acceptOrDecline(array $validated)
    {

        $user = $this->userModel->with('roles')->where('email', $validated['email'])->firstOrFail();

        if (! Hash::check($validated['token'], $user->verification_token)) {
            abort(403, 'Token not valid');
        }

        if (now()->isAfter($user->verification_token_expires_at)) {
            abort(400, 'Token expired, please reqesut for a new invitation link');
        }

        $roleName = $user->roles->first()?->name;

        $isAccepted = $validated['action'] === AdminInvitationEnum::ACCEPT->value;
        $emails = $this->userModel->role('super_admin')->whereNotNull('email_verified_at')->pluck('email');

        if (! $isAccepted) {
            if ($emails->isNotEmpty()) {
                Mail::bcc($emails)->send(new AdminInvitationDeclined($user, $roleName));
            }

            $user->delete();

            return ['message' => 'You declined to be ' . $roleName];

        }

        $user->update([
            'email_verified_at'             => now(),
            'agreeToTerms'                  => $validated['agreeToTerms'],
            'verification_token'            => null,
            'verification_token_expires_at' => null,
        ]);

        Mail::to($user->email)->send(new AdminInvitationAccepted($user, $roleName));
        Mail::bcc($emails)->send(new NewAdittionalAdmin($user, $roleName));

        return [
            'message' => 'You are now an ' . $roleName . '. Please kindly change your password for more security',
        ];

    }
}
