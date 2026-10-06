<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaperResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'title'         => $this->title,
            'content'       => $this->content,
            'font_style'    => $this->font_style,
            'text_color'    => $this->text_color,
            'is_pinned'     => $this->is_pinned,
            'ai_generating' => (bool) $this->ai_generating,
            'folder_id'     => $this->folder_id,
            'folder'        => $this->whenLoaded('folder', fn () => [
                'id'    => $this->folder->id,
                'name'  => $this->folder->name,
                'color' => $this->folder->color,
            ]),
            'versions' => PaperVersionResource::collection(
                $this->whenLoaded('paperVersions')
            ),
            'presentations_count' => $this->whenCounted('presentations'),
            'created_at'          => $this->created_at->toDateTimeString(),
            'updated_at'          => $this->updated_at->toDateTimeString(),
        ];
    }
}
