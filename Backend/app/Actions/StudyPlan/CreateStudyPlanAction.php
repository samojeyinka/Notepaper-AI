<?php

namespace App\Actions\StudyPlan;

use App\Contracts\Actions\CreatesStudyPlan;
use App\Enums\StudyPlanStatus;
use App\Jobs\GenerateStudyPlanJob;
use App\Models\StudyPlan;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CreateStudyPlanAction implements CreatesStudyPlan
{
    public function __invoke(User $user, array $data): StudyPlan
    {
        $plan = DB::transaction(function () use ($user, $data): StudyPlan {
            $plan = StudyPlan::create([
                'user_id'            => $user->id,
                'name'               => $data['name'],
                'exam_date'          => $data['exam_date'],
                'start_date'         => $data['start_date'],
                'study_from'         => $data['study_from'],
                'study_to'           => $data['study_to'],
                'active_days'        => $data['active_days'],
                'enabled_activities' => $data['enabled_activities'],
                'material_ids'       => $data['material_ids'] ?? [],
                'status'             => StudyPlanStatus::Pending,
            ]);

            return $plan;
        });

        DB::afterCommit(fn () => GenerateStudyPlanJob::dispatch($plan)->onQueue('ai'));

        return $plan;
    }
}
