<?php

namespace App\Http\Requests;

use App\Enums\QuizDifficulty;
use App\Enums\QuizQuestionType;
use Illuminate\Validation\Rule;

class GenerateQuizRequest extends GenerateFromContentRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return array_merge($this->baseRules(), [
            'count'         => ['required', 'integer', 'min:1', 'max:1000'],
            'difficulty'    => ['required', Rule::enum(QuizDifficulty::class)],
            'question_type' => ['required', Rule::enum(QuizQuestionType::class)],
            'topic'         => ['nullable', 'string', 'max:200'],
        ]);
    }
}
