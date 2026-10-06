<?php

namespace App\Notifications;

use App\Enums\AiProvider;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Queue\SerializesModels;

class AiKeyAdded extends Notification implements ShouldQueue
{
    use Queueable, SerializesModels;

    protected string $url;

    public function __construct(
        public readonly AiProvider $provider,
        public readonly ?string $model = null,
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
            ->subject("Your {$this->provider->label()} key is connected")
            ->view('emails.ai.key-added', [
                'full_name' => $notifiable->full_name,
                'provider'  => $this->provider->label(),
                'model'     => $this->model,
                'url'       => $this->url,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'        => 'ai_key_added',
            'provider'    => $this->provider->value,
            'model'       => $this->model,
            'title'       => "{$this->provider->label()} connected",
            'description' => "Your {$this->provider->label()} API key is saved and encrypted. AI features are ready to use.",
            'url'         => $this->url,
            'placeholder' => 'Manage Keys',
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
