<?php

namespace App\Notifications;

use App\Models\TicketMessage;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Queue\SerializesModels;

class TicketNewMessage extends Notification implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Create a new notification instance.
     */
    protected $url;

    public function __construct(public TicketMessage $message, public User $sender)
    {
        $this->url = url(config('app.frontend_url') . '/lockedin/support-tickets/show/' . $this->message->ticket_id);

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
            ->subject('New message on ticket: ' . $this->message->ticket->subject)
            ->view('emails.ticket.new-message', [
                'message' => $this->message->loadMissing(['ticket', 'user']),
            ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'message_id'  => $this->message->id,
            'url'         => $this->url,
            'placeholder' => 'Read',
            'title'       => 'New message has been sent',
            'description' => $this->sender->full_name . ' sent a new message',
        ];
    }
}
