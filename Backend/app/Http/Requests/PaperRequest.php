<?php

namespace App\Http\Requests;

use App\Enums\FontStyle;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PaperRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'folder_id'  => ['nullable', 'ulid', 'exists:folders,id'],
            'title'      => ['sometimes', 'string', 'max:255'],
            'content'    => ['nullable', 'string'],
            'font_style' => ['sometimes', 'string', Rule::enum(FontStyle::class)],
            'text_color' => ['sometimes', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'is_pinned'  => ['sometimes', 'boolean'],
        ];
    }
}
