<?php

namespace App\Http\Requests;

use App\Enums\QuizDifficulty;
use App\Enums\QuizItemType;
use App\Enums\QuizQuestionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class QuizRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'         => ['required', 'string', 'max:255'],
            'subject'       => ['nullable', 'string', 'max:100'],
            'difficulty'    => ['nullable', Rule::enum(QuizDifficulty::class)],
            'question_type' => ['nullable', Rule::in([
                QuizQuestionType::Multiple->value,
                QuizQuestionType::Input->value,
                QuizQuestionType::Both->value,
            ])],
            'question_count'          => ['nullable', 'integer', 'min:1', 'max:50'],
            'questions'               => ['required', 'array', 'min:1', 'max:50'],
            'questions.*.type'        => ['required', Rule::enum(QuizItemType::class)],
            'questions.*.question'    => ['required', 'string'],
            'questions.*.options'     => ['required_if:questions.*.type,multiple', 'array'],
            'questions.*.correct'     => ['required'],
            'questions.*.explanation' => ['nullable', 'string'],
        ];
    }
}
