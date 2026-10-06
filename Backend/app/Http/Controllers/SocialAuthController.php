<?php

namespace App\Http\Controllers;

use App\Enums\RolesEnum;
use App\Mail\ActivatedMail;
use App\Models\User;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Redirect the user to the provider authentication page.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function redirectToProvider(string $provider)
    {
        abort_unless(in_array($provider, ['google', 'github']), 404);

        return Socialite::driver($provider)->stateless()->redirect();
    }

    /**
     * Obtain the user information from the provider and log them in.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function handleProviderCallback(string $provider)
    {
        abort_unless(in_array($provider, ['google', 'github']), 404);

        // Retrieve user from provider
        $driver = Socialite::driver($provider)->stateless();

        if (app()->environment('local')) {
            $driver->setHttpClient(new Client(['verify' => false]));
        }

        $socialUser = $driver->user();

        // Find existing user or create new one
        $user = User::withTrashed()
            ->where($provider . '_id', $socialUser->getId())
            ->orWhere('email', $socialUser->getEmail())
            ->first();

        // Handle trashed users
        if ($user && $user->trashed()) {
            return redirect(config('app.frontend_url') . '/restore-account?email=' . urlencode($socialUser->getEmail()));
        }

        if (! $user) {
            $user = User::create([
                'full_name'         => $socialUser->getName() ?? $socialUser->getNickname(),
                'email'             => $socialUser->getEmail(),
                'password'          => Hash::make(Str::random(24)),
                'profile_picture'   => $socialUser->getAvatar(),
                $provider . '_id'   => $socialUser->getId(),
                'email_verified_at' => now(),
            ]);
            $user->assignRole(RolesEnum::USER->value);
            Mail::to($user->email)->send(new ActivatedMail($user));
        } else {
            $user->update([
                $provider . '_id'   => $socialUser->getId(),
                'profile_picture'   => $user->profile_picture ?? $socialUser->getAvatar(),
                'email_verified_at' => $user->email_verified_at ?? now(),
            ]);
        }

        // Standard Login Logic: Issue JWT and Set Cookie
        $token = auth()->login($user);
        $duration = config('jwt.ttl');

        $response = redirect(config('app.frontend_url') . '/lockedin');

        return $response->withCookie(cookie(
            'np_token',
            $token,
            $duration,
            '/',
            null,
            true, // secure
            true, // httpOnly
            false,
            'None' // sameSite
        ));
    }
}
