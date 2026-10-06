<?php

namespace App\Http\Requests;

use App\Enums\FlashcardTemplate;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FlashcardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'folder_id'                    => ['nullable', 'ulid', 'exists:folders,id'],
            'title'                        => ['sometimes', 'string', 'max:255'],
            'template'                     => ['sometimes', 'string', Rule::enum(FlashcardTemplate::class)],
            'cards'                        => ['sometimes', 'array'],
            'cards.*.front'                => ['sometimes', 'nullable', 'string'],
            'cards.*.back'                 => ['sometimes', 'nullable', 'string'],
            'font_family'                  => ['sometimes', 'string', 'max:100'],
            'font_size'                    => ['sometimes', 'integer', 'min:10', 'max:72'],
            'bg_color'                     => ['sometimes', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'text_color'                   => ['sometimes', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'is_bold'                      => ['sometimes', 'boolean'],
            'is_italic'                    => ['sometimes', 'boolean'],
            'style_overrides'              => ['sometimes', 'nullable', 'array'],
            'style_overrides.bold_front'   => ['sometimes', 'boolean'],
            'style_overrides.bold_back'    => ['sometimes', 'boolean'],
            'style_overrides.italic_front' => ['sometimes', 'boolean'],
            'style_overrides.italic_back'  => ['sometimes', 'boolean'],
        ];
    }
}
