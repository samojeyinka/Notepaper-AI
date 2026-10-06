<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudyPlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'name'               => $this->name,
            'exam_date'          => $this->exam_date->toDateString(),
            'start_date'         => $this->start_date->toDateString(),
            'study_from'         => $this->study_from,
            'study_to'           => $this->study_to,
            'active_days'        => $this->active_days,
            'enabled_activities' => $this->enabled_activities,
            'material_ids'       => $this->material_ids,
            'status'             => $this->status,
            'schedule'           => $this->schedule,
            'generated_at'       => $this->generated_at?->toDateTimeString(),
            'created_at'         => $this->created_at->toDateTimeString(),
            'updated_at'         => $this->updated_at->toDateTimeString(),
        ];
    }
}
