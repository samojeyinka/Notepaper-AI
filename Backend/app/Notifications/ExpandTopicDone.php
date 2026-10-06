<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Queue\SerializesModels;

class ExpandTopicDone extends Notification implements ShouldQueue
{
    use Queueable, SerializesModels;

    protected string $url;

    public function __construct(
        public readonly string $resourceType,
        public readonly string $resourceId,
        public readonly string $title,
    ) {
        $path = $resourceType === 'note' ? 'notes' : 'papers';
        $this->url = config('app.frontend_url') . "/lockedin/{$path}/{$resourceId}";
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $typeLabel = $this->resourceType === 'note' ? 'note' : 'paper';

        return (new MailMessage)
            ->subject("Your expanded {$typeLabel} is ready!")
            ->view('emails.note.expand', [
                'full_name' => $notifiable->full_name,
                'typeLabel' => $typeLabel,
                'title'     => $this->title,
                'url'       => $this->url,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $typeLabel = $this->resourceType === 'note' ? 'note' : 'paper';

        return [
            'type'          => 'expand_topic_done',
            'resource_type' => $this->resourceType,
            'resource_id'   => $this->resourceId,
            'title'         => 'Expanded ' . ucfirst($typeLabel) . ' ready!',
            'description'   => "Schola finished expanding \"{$this->title}\".",
            'url'           => $this->url,
            'placeholder'   => 'Open ' . ucfirst($typeLabel),
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
