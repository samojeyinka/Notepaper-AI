<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketMessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'ticket_id'  => $this->ticket_id,
            'body'       => $this->body,
            'image'      => $this->image,
            'user'       => new TicketUserResource($this->whenLoaded('user')),
            'created_at' => $this->created_at,
        ];
    }
}
