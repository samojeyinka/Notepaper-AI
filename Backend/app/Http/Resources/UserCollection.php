<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public $collects = UserResource::class;

    public function toArray(Request $request): array
    {
        return [
            'status' => 'success',
            'data'   => $this->collection,
        ];
    }
}
