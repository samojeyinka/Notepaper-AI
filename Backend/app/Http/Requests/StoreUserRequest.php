<?php

namespace App\Http\Requests;

use App\Enums\UserTypeEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
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
            'full_name' => 'required|string|max:255',
            'email'     => [
                'required',
                'string',
                'email:rfc,dns',
                'unique:users,email',
            ],
            // 'email' => [
            //     'required',
            //     'string',
            //     'regex:/(.*)@(example|test)\\.com/i',
            //     'unique:users,email',
            // ],
            'type'         => 'required|in:' . implode(',', UserTypeEnum::values()),
            'password'     => ['required', 'string', Password::defaults()],
            'agreeToTerms' => 'required|boolean|accepted',
        ];
    }

    public function messages(): array
    {
        return [
            'email.email' => 'Please provide a valid email address',
        ];
    }
}
