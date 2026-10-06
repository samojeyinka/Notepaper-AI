<?php

namespace App\Services;

use App\Mail\DisableTwoFa;
use App\Mail\EnableTwoFa;
use Illuminate\Support\Facades\Mail;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorService
{
    protected Google2FA $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA;
    }

    public function setUp()
    {
        $user = auth()->user();

        // Only generate a new secret if the user doesn't have one
        // OR if they haven't enabled 2FA yet and want to reset.
        if (! $user->google2fa_secret || ! $user->google2fa_enabled) {
            $user->update([
                'google2fa_secret' => $this->google2fa->generateSecretKey(),
            ]);
        }

        $secret = $user->google2fa_secret;

        $qrUrl = $this->google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret
        );

        return ['secret' => $secret, 'qrUrl' => $qrUrl];
    }

    public function enable(array $data)
    {

        $user = auth()->user();
        abort_if($user->google2fa_enabled, 401, '2FA already enabled');

        $valid = $this->google2fa->verifyKey($user->google2fa_secret, $data['otp'], 1);

        if (! $valid) {
            abort(422, 'Invalid OTP');
        }
        Mail::to($user->email)->send(new EnableTwoFa($user));
        $user->update(['google2fa_enabled' => true]);

    }

    public function disable(array $data)
    {

        $user = auth()->user();
        abort_if(! $user->google2fa_enabled, 401, '2FA already disabled');
        $valid = $this->google2fa->verifyKey($user->google2fa_secret, $data['otp']);

        if (! $valid) {
            abort(422, 'Invalid OTP');
        }

        $user->update(
            [
                'google2fa_secret'  => null,
                'google2fa_enabled' => false,

            ]);

        Mail::to($user->email)->send(new DisableTwoFa($user));

    }
}
