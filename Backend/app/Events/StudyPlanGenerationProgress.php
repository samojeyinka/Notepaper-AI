<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class StudyPlanGenerationProgress implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly string $planId,
        public readonly string $message,
        public readonly int $progress,
        public readonly ?array $schedule = null,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('study-plans.' . $this->planId),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'plan_id'  => $this->planId,
            'message'  => $this->message,
            'progress' => $this->progress,
            'schedule' => $this->schedule,
        ];
    }
}
