<?php

namespace App\Http\Requests;

use App\Enums\SourceType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SourceRequest extends FormRequest
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
            'source_type' => ['required', Rule::enum(SourceType::class)],
            'source_id'   => ['required', 'string'],
        ];
    }
}
