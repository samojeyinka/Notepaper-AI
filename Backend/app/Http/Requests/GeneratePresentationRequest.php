<?php

namespace App\Http\Requests;

class GeneratePresentationRequest extends GenerateFromContentRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return array_merge($this->baseRules(), [
            'slide_count' => ['required', 'integer', 'min:3', 'max:150'],
            'topic'       => ['nullable', 'string', 'max:200'],
        ]);
    }
}
