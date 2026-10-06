<?php

namespace App\Notifications;

use App\Enums\AiProvider;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Queue\SerializesModels;

class AiKeyRemoved extends Notification implements ShouldQueue
{
    use Queueable, SerializesModels;

    protected string $url;

    public function __construct(
        public readonly AiProvider $provider,
        public readonly ?AiProvider $promotedProvider = null,
    ) {
        $this->url = config('app.frontend_url') . '/lockedin/profile-settings';
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Your {$this->provider->label()} key was removed")
            ->view('emails.ai.key-removed', [
                'full_name' => $notifiable->full_name,
                'provider'  => $this->provider->label(),
                'promoted'  => $this->promotedProvider?->label(),
                'url'       => $this->url,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $description = "Your {$this->provider->label()} API key has been deleted and is no longer stored.";

        if ($this->promotedProvider) {
            $description .= " {$this->promotedProvider->label()} is now your default provider.";
        } else {
            $description .= ' AI features are unavailable until you connect a new key.';
        }

        return [
            'type'        => 'ai_key_removed',
            'provider'    => $this->provider->value,
            'title'       => "{$this->provider->label()} disconnected",
            'description' => $description,
            'url'         => $this->url,
            'placeholder' => 'Manage Keys',
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
