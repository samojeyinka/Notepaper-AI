<?php

namespace App\Notifications;

use App\Models\Paper;
use App\Models\PaperVersion;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Queue\SerializesModels;

class PaperReverted extends Notification implements ShouldQueue
{
    use Queueable, SerializesModels;

    protected string $url;

    public function __construct(public Paper $paper, public PaperVersion $version)
    {
        $this->afterCommit = true;
        $this->url = url(config('app.frontend_url') . '/lockedin/papers/' . $this->paper->id);
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Paper reverted: ' . $this->paper->title)
            ->view('emails.paper.reverted', [
                'title'     => $this->paper->title,
                'full_name' => $notifiable->full_name,
                'url'       => $this->url,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'        => 'paper_reverted',
            'paper_id'    => $this->paper->id,
            'paper_title' => $this->paper->title,
            'version_id'  => $this->version->id,
            'url'         => $this->url,
            'placeholder' => 'See paper',
            'title'       => 'Paper reverted: ' . $this->paper->title,
            'description' => 'Your paper was restored to a previous version.',
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
