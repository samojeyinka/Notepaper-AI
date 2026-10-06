<?php

namespace App\Http\Requests;

use App\Enums\PresentationTheme;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PresentationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'paper_id'    => ['nullable', 'ulid', 'exists:papers,id'],
            'title'       => ['sometimes', 'string', 'max:255'],
            'slides'      => ['nullable', 'string'],
            'theme'       => ['sometimes', 'string', Rule::enum(PresentationTheme::class)],
            'slide_count' => ['sometimes', 'integer', 'min:1', 'max:50'],
        ];
    }
}
