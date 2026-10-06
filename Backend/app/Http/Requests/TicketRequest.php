<?php

namespace App\Http\Requests;

use App\Enums\TicketCategory;
use App\Enums\TicketPriority;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TicketRequest extends FormRequest
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
            'subject'  => 'required|string|max:255',
            'details'  => 'required|string',
            'priority' => ['nullable', Rule::enum(TicketPriority::class)],
            'category' => ['nullable', Rule::enum(TicketCategory::class)],
        ];
    }
}
