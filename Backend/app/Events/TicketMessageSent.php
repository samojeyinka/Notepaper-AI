<?php

namespace App\Events;

use App\Models\TicketMessage;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TicketMessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public TicketMessage $message)
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
            new PrivateChannel('tickets.' . $this->message->ticket_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'message' => [
                'id'        => $this->message->id,
                'body'      => $this->message->body,
                'image'     => $this->message->image,
                'ticket_id' => $this->message->ticket_id,
                'user'      => [
                    'id'              => $this->message->user->id,
                    'full_name'       => $this->message->user->full_name,
                    'profile_picture' => $this->message->user->profile_picture,
                ],
                'created_at' => $this->message->created_at,
            ],
        ];
    }
}
