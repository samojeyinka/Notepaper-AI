<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FeedResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'title'      => $this->title,
            'snippet'    => $this->snippet,
            'updated_at' => $this->updated_at,
            'color'      => $this->color,
            'type'       => $this->type,
            'icon'       => $this->icon,
        ];
    }
}
