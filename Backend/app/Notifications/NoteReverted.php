<?php

namespace App\Notifications;

use App\Models\Note;
use App\Models\NoteVersion;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Queue\SerializesModels;

class NoteReverted extends Notification implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Create a new notification instance.
     */
    protected $url;

    public function __construct(public Note $note, public NoteVersion $version)
    {
        $this->afterCommit = true;
        $this->url = url(config('app.frontend_url') . '/lockedin/notes/' . $this->note->id);
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {

        return (new MailMessage)
            ->subject('Note reverted ' . $this->note->title)
            ->view('emails.note.reverted', [
                'full_name' => $notifiable->full_name,
                'note'      => $this->note,
                'url'       => $this->url,
                'version'   => $this->version,
            ]);
    }

    /**
     * Get the array representation of the notification.
     *n
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'note_id'     => $this->note->id,
            'note_title'  => $this->note->title,
            'version_id'  => $this->version->id,
            'url'         => $this->url,
            'placeholder' => 'See note',
            'title'       => 'Note reverted: ' . $this->note->title,
            'description' => 'Your note was restored to a previous version.',
        ];
    }
}
