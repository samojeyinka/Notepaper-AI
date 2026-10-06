<?php

namespace App\Notifications;

use App\Models\Sprint;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SprintReady extends Notification implements ShouldQueue
{
    use Queueable;

    protected string $url;

    public function __construct(public readonly Sprint $sprint)
    {
        $this->url = url(config('app.frontend_url') . '/lockedin/sprints/' . $this->sprint->id);
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Your sprint \"{$this->sprint->title}\" is ready!")
            ->view('emails.sprint.ready', [
                'full_name' => $notifiable->full_name,
                'title'     => $this->sprint->title,
                'url'       => $this->url,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'        => 'sprint_ready',
            'sprint_id'   => $this->sprint->id,
            'title'       => 'Your sprint is ready!',
            'description' => "\"{$this->sprint->title}\" has been generated. Your first challenges are waiting.",
            'url'         => $this->url,
            'placeholder' => 'Start Sprint',
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
