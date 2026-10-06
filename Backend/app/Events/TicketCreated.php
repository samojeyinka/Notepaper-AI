<?php

namespace App\Events;

use App\Models\Ticket;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TicketCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public Ticket $ticket)
    {
        //
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('admin.tickets'),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'ticket' => [
                'id'       => $this->ticket->id,
                'subject'  => $this->ticket->subject,
                'details'  => $this->ticket->details,
                'status'   => $this->ticket->status,
                'priority' => $this->ticket->priority,
                'category' => $this->ticket->category,
                'user'     => [
                    'id'              => $this->ticket->user->id,
                    'ful_name'        => $this->ticket->user->full_name,
                    'profile_picture' => $this->ticket->user->profile_picture,
                ],

                'created_at' => $this->ticket->created_at,
            ],
        ];
    }
}
