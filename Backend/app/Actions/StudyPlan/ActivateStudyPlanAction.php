<?php

namespace App\Actions\StudyPlan;

use App\Contracts\Actions\ActivatesStudyPlan;
use App\Enums\StudyPlanStatus;
use App\Models\StudyPlan;
use App\Notifications\StudyPlanReady;
use Illuminate\Support\Facades\DB;

class ActivateStudyPlanAction implements ActivatesStudyPlan
{
    public function __invoke(StudyPlan $plan, array $schedule): void
    {
        DB::transaction(function () use ($plan, $schedule): void {
            $plan->update([
                'status'       => StudyPlanStatus::Active,
                'schedule'     => $schedule,
                'generated_at' => now(),
            ]);
        });

        DB::afterCommit(fn () => $plan->user->notify(new StudyPlanReady($plan)));
    }
}
