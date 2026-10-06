<?php

namespace App\Http\Requests;

use App\Enums\NotesLength;
use App\Enums\NotesTone;
use Illuminate\Validation\Rule;

class GenerateNotesRequest extends GenerateFromContentRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return array_merge($this->baseRules(), [
            'tone'   => ['required', Rule::enum(NotesTone::class)],
            'length' => ['required', Rule::enum(NotesLength::class)],
            'topic'  => ['nullable', 'string', 'max:200'],
        ]);
    }
}
