<?php

namespace App\Http\Requests;

use App\Enums\ImageSearchType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ImageSearchRequest extends FormRequest
{
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
            'q'          => ['required', 'string', 'min:2', 'max:200'],
            'page'       => ['nullable', 'integer', 'min:1'],
            'image_type' => ['nullable', 'string', Rule::enum(ImageSearchType::class)],
        ];
    }
}
