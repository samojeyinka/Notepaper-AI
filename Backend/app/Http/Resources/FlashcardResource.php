<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FlashcardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'title'           => $this->title,
            'template'        => $this->template,
            'cards'           => $this->cards ?? [],
            'font_family'     => $this->font_family,
            'font_size'       => $this->font_size,
            'bg_color'        => $this->bg_color,
            'text_color'      => $this->text_color,
            'is_bold'         => $this->is_bold,
            'is_italic'       => $this->is_italic,
            'style_overrides' => $this->style_overrides,
            'folder'          => $this->whenLoaded('folder', fn () => [
                'id'    => $this->folder->id,
                'name'  => $this->folder->name,
                'color' => $this->folder->color,
            ]),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
