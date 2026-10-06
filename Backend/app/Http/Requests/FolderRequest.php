<?php

namespace App\Http\Requests;

use App\Enums\ShapeEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FolderRequest extends FormRequest
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
            'name'        => 'required|string',
            'description' => 'nullable|string',
            'color'       => 'nullable|string',
            'icon'        => 'nullable|string',
            'shape'       => ['nullable', 'string', Rule::enum(ShapeEnum::class)],
        ];
    }
}
