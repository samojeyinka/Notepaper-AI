<?php

namespace App\Http\Requests;

class GenerateFlashcardsRequest extends GenerateFromContentRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return array_merge($this->baseRules(), [
            'count' => ['required', 'integer', 'min:1', 'max:1000'],
            'topic' => ['nullable', 'string', 'max:200'],
        ]);
    }
}
