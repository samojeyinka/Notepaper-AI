<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NoteResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                     => $this->id,
            'title'                  => $this->title,
            'content'                => $this->content,
            'paper_type'             => $this->paper_type,
            'paper_line_color'       => $this->paper_line_color,
            'paper_background_color' => $this->paper_background_color,
            'font_style'             => $this->font_style,
            'text_color'             => $this->text_color,
            'is_pinned'              => $this->is_pinned,
            'ai_generating'          => (bool) $this->ai_generating,
            'folder_id'              => $this->folder_id,
            'folder'                 => $this->whenLoaded('folder', fn () => [
                'id'    => $this->folder->id,
                'name'  => $this->folder->name,
                'color' => $this->folder->color,
                'icon'  => $this->folder->icon,
                'shape' => $this->folder->shape,
            ]),
            'versions' => NoteVersionResource::collection(
                $this->whenLoaded('noteVersions')
            ),
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }
}
