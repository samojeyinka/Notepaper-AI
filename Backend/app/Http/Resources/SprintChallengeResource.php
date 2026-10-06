<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SprintChallengeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'title'           => $this->title,
            'description'     => $this->description,
            'type'            => $this->type,
            'status'          => $this->status,
            'challenge_order' => $this->challenge_order,
            'scheduled_at'    => $this->scheduled_at?->toDateTimeString(),
            'completed_at'    => $this->completed_at?->toDateTimeString(),
            'content'         => $this->when(
                $this->status->value !== 'locked',
                fn () => $this->content
            ),
        ];
    }
}
