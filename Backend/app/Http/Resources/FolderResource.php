<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FolderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'description' => $this->description,
            'color'       => $this->color,
            'icon'        => $this->icon,
            'shape'       => $this->shape,
            'created_at'  => $this->when($this->created_at !== null, fn () => $this->created_at),
            'updated_at'  => $this->updated_at,
        ];
    }
}
