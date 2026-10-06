<?php

namespace App\Http\Requests;

use App\Enums\MaterialType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SprintRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'               => ['required', 'string', 'max:100'],
            'goal'                => ['nullable', 'string', 'max:500'],
            'start_date'          => ['required', 'date', 'after_or_equal:today'],
            'end_date'            => ['required', 'date', 'after:start_date'],
            'material_ids'        => ['nullable', 'array', 'max:20'],
            'material_ids.*.type' => ['required', 'string', Rule::enum(MaterialType::class)],
            'material_ids.*.id'   => ['required', 'string'],
            'uploads'             => ['nullable', 'array', 'max:10'],
            'uploads.*'           => ['file', 'mimes:pdf,docx,xlsx,xls,csv', 'max:20480'],
        ];
    }
}
