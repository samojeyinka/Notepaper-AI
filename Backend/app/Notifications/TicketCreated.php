<?php

namespace App\Notifications;

use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Queue\SerializesModels;

class TicketCreated extends Notification implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Create a new notification instance.
     */
    protected $url;

    public function __construct(public Ticket $ticket)
    {
        $this->url = url(config('app.frontend_url') . '/lockedin/support-tickets/show/' . $this->ticket->id);
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
            ->subject('New Ticket ' . $this->ticket->subject . '  was created')
            ->view('emails.ticket.created', [
                'ticket'    => $this->ticket,
                'full_name' => $notifiable->full_name,
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
            'ticket_id'   => $this->ticket->id,
            'url'         => $this->url,
            'placeholder' => 'Chat',
            'title'       => 'New ticket created has been ' . $this->ticket->subject,
            'description' => 'Your new ticket has been created and you will receive feedback soon',

        ];
    }
}
