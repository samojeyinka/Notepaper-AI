<?php

namespace App\Events;

use App\Models\SprintChallenge;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChallengeContentReady implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public readonly SprintChallenge $challenge) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('sprints.' . $this->challenge->sprint_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'challenge_id' => $this->challenge->id,
            'content'      => $this->challenge->content,
            'status'       => $this->challenge->status,
        ];
    }
}
