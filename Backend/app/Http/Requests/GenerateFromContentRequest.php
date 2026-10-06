<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

abstract class GenerateFromContentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Shared rules for the source material and upload inputs.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    protected function baseRules(): array
    {
        return [
            'material_ids'        => ['array'],
            'material_ids.*.type' => ['required_with:material_ids', 'string'],
            'material_ids.*.id'   => ['required_with:material_ids', 'string'],
            'uploads'             => ['array'],
            'uploads.*'           => ['file', 'mimes:pdf,docx,doc,xlsx,xls,csv', 'max:20480'],
        ];
    }
}
