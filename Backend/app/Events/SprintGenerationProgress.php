<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SprintGenerationProgress implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly string $sprintId,
        public readonly string $message,
        public readonly int $progress,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('sprints.' . $this->sprintId),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'sprint_id' => $this->sprintId,
            'message'   => $this->message,
            'progress'  => $this->progress,
        ];
    }
}
