<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GenerateTextRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'prompt' => ['required', 'string', 'max:20000'],
            'system' => ['nullable', 'string', 'max:20000'],
            'model'  => ['nullable', 'string', 'max:120'],
        ];
    }
}
