<?php

namespace App\Http\Requests;

use App\Enums\RolesEnum;
use App\Rules\CanBeInvited;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InviteUserRequest extends FormRequest
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
            'email'     => ['bail', 'required', 'string', 'email', new CanBeInvited],
            'full_name' => 'required|string',
            'role'      => ['required',  Rule::enum(RolesEnum::class)],
        ];
    }
}
