<?php

namespace App\Http\Requests;

use App\Enums\LegalDocumentType;
use App\Enums\RolesEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class LegalDocumentRequest extends FormRequest
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
            'type'    => ['required', 'string', new Enum(LegalDocumentType::class)],
            'for'     => ['required', 'string', new Enum(RolesEnum::class)],
            'content' => 'required|string',
            'version' => 'required|string',
        ];
    }
}
