<?php

namespace App\Notifications;

use App\Models\Sprint;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SprintCompleted extends Notification implements ShouldQueue
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
            ->subject("You completed your sprint \"{$this->sprint->title}\"!")
            ->view('emails.sprint.completed', [
                'full_name' => $notifiable->full_name,
                'title'     => $this->sprint->title,
                'url'       => $this->url,
            ]);

    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'        => 'sprint_completed',
            'sprint_id'   => $this->sprint->id,
            'title'       => 'Sprint completed!',
            'description' => "You've finished all challenges in \"{$this->sprint->title}\". Great work!",
            'url'         => $this->url,
            'placeholder' => 'View Sprint',
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
