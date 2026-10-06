<?php

namespace App\Notifications;

use App\Models\Sprint;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SprintFailed extends Notification implements ShouldQueue
{
    use Queueable;

    protected string $url;

    public function __construct(public readonly Sprint $sprint)
    {
        $this->url = config('app.frontend_url') . '/lockedin/sprints';
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Sprint generation failed — \"{$this->sprint->title}\"")
            ->view('emails.sprint.failed', [
                'full_name' => $notifiable->full_name,
                'title'     => $this->sprint->title,
                'url'       => $this->url,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'        => 'sprint_failed',
            'sprint_id'   => $this->sprint->id,
            'title'       => 'Sprint generation failed',
            'description' => "We couldn't generate your sprint \"{$this->sprint->title}\". Please try creating it again.",
            'url'         => $this->url,
            'placeholder' => 'Try Again',
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
