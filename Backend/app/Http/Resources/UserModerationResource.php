<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserModerationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'requested_by' => [
                $this->requestedBy?->id,
                $this->requestedBy?->email,
                $this->requestedBy?->full_name,

            ],
            'reviewed_by' => [
                $this->reviewedBy?->id,
                $this->reviewedBy?->email,
                $this->reviewedBy?->full_name,
            ],
            'reason' => $this->reason,
            'status' => $this->status,
            'user'   => [
                $this->user?->id,
                $this->user?->email,
                $this->user?->full_name,
            ],
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

        ];
    }
}
