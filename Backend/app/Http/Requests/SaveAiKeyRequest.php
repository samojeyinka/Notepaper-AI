<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveAiKeyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'provider'   => ['required', Rule::in(['gemini', 'deepseek', 'openai', 'claude'])],
            'key'        => ['required', 'string', 'min:8'],
            'model'      => ['nullable', 'string', 'max:120'],
            'is_default' => ['sometimes', 'boolean'],
        ];
    }
}
