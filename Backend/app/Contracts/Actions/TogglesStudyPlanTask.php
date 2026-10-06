<?php

namespace App\Contracts\Actions;

use App\Models\StudyPlan;

interface TogglesStudyPlanTask
{
    public function __invoke(StudyPlan $plan, array $data): StudyPlan;
}
