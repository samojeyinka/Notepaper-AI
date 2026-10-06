<?php

namespace App\Contracts\Actions;

use App\Models\StudyPlan;

interface ActivatesStudyPlan
{
    /**
     * @param  array<mixed>  $schedule
     */
    public function __invoke(StudyPlan $plan, array $schedule): void;
}
