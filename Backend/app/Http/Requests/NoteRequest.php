<?php

namespace App\Http\Requests;

use App\Enums\FontStyle;
use App\Enums\PaperType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class NoteRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [

            'folder_id'              => ['nullable', 'ulid', 'exists:folders,id'],
            'title'                  => ['sometimes', 'string', 'max:255'],
            'content'                => ['nullable', 'string'],
            'paper_type'             => ['sometimes', 'string', Rule::enum(PaperType::class)],
            'paper_line_color'       => ['sometimes', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'paper_background_color' => ['sometimes', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'font_style'             => ['sometimes', 'string', Rule::enum(FontStyle::class)],
            'text_color'             => ['sometimes', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'is_pinned'              => ['sometimes', 'boolean'],

        ];
    }
}
