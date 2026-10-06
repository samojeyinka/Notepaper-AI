<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PresentationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'paper_id'    => $this->paper_id,
            'title'       => $this->title,
            'slides'      => is_string($this->slides) ? json_decode($this->slides, true) : $this->slides,
            'theme'       => $this->theme,
            'slide_count' => $this->slide_count,
            'paper'       => $this->whenLoaded('paper', fn () => $this->paper ? [
                'id'    => $this->paper->id,
                'title' => $this->paper->title,
            ] : null),
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }
}
