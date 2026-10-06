<?php

namespace App\Http\Requests;

use App\Enums\StudyPlanActivity;
use App\Enums\WeekDay;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StudyPlanRequest extends FormRequest
{
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
            'name'                 => ['required', 'string', 'max:200'],
            'exam_date'            => ['required', 'date', 'after:today'],
            'start_date'           => ['required', 'date', 'before_or_equal:exam_date'],
            'study_from'           => ['required', 'string', 'regex:/^\d{2}:\d{2}$/'],
            'study_to'             => ['required', 'string', 'regex:/^\d{2}:\d{2}$/'],
            'active_days'          => ['required', 'array', 'min:1'],
            'active_days.*'        => ['string', Rule::enum(WeekDay::class)],
            'enabled_activities'   => ['required', 'array', 'min:1'],
            'enabled_activities.*' => ['string', Rule::enum(StudyPlanActivity::class)],
            'material_ids'         => ['nullable', 'array'],
            'material_ids.*.type'  => ['required_with:material_ids', 'string'],
            'material_ids.*.id'    => ['required_with:material_ids', 'string'],
        ];
    }
}
