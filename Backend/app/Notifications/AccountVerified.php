<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class AccountVerified extends Notification implements ShouldQueue
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'        => 'account_verified',
            'title'       => 'Account verified!',
            'description' => 'Your email has been confirmed. Welcome to Notepaper AI — you\'re all set.',
            'url'         => config('app.frontend_url') . '/lockedin',
            'placeholder' => 'Get Started',
        ];
    }
}
