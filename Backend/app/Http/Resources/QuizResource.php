<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuizResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'title'          => $this->title,
            'subject'        => $this->subject,
            'difficulty'     => $this->difficulty,
            'question_type'  => $this->question_type,
            'question_count' => $this->question_count,
            // questions are included — play page needs them; frontend controls visibility
            'questions'  => $this->questions ?? [],
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
