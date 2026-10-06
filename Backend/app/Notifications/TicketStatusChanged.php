<?php

namespace App\Notifications;

use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Queue\SerializesModels;

class TicketStatusChanged extends Notification implements ShouldQueue
{
    use Queueable, SerializesModels;

    protected string $url;

    public function __construct(public Ticket $ticket, public string $oldStatus)
    {
        $this->url = url(config('app.frontend_url') . '/lockedin/support-tickets/show/' . $this->ticket->id);
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $statusLabel = ucfirst(str_replace('_', ' ', $this->ticket->status));

        return (new MailMessage)
            ->subject("Ticket #{$this->ticket->id} status updated: {$statusLabel}")
            ->view('emails.ticket.status-changed', [
                'full_name'   => $notifiable->full_name,
                'ticket'      => $this->ticket,
                'statusLabel' => $statusLabel,
                'url'         => $this->url,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $statusLabel = ucfirst(str_replace('_', ' ', $this->ticket->status));

        return [
            'type'        => 'ticket_status_changed',
            'ticket_id'   => $this->ticket->id,
            'status'      => $this->ticket->status,
            'url'         => $this->url,
            'placeholder' => 'View Ticket',
            'title'       => "Ticket #{$this->ticket->id} is now {$statusLabel}",
            'description' => "Your ticket \"{$this->ticket->subject}\" status changed to {$statusLabel}.",
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
