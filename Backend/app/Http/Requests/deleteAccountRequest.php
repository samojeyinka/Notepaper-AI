<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class deleteAccountRequest extends FormRequest
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
            'token'     => 'required|string',
            'permanent' => 'required|boolean',
            'reason'    => 'nullable|string|max:1000',
        ];
    }
}
