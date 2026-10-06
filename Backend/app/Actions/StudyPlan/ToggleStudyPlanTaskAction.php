<?php

namespace App\Actions\StudyPlan;

use App\Contracts\Actions\TogglesStudyPlanTask;
use App\Models\StudyPlan;
use Illuminate\Support\Facades\DB;

class ToggleStudyPlanTaskAction implements TogglesStudyPlanTask
{
    public function __invoke(StudyPlan $plan, array $data): StudyPlan
    {
        return DB::transaction(function () use ($plan, $data): StudyPlan {
            $schedule = $plan->schedule ?? [];

            $updated = array_map(function ($day) use ($data) {
                if ($day['date'] !== $data['date']) {
                    return $day;
                }

                $day['tasks'] = array_map(function ($task) use ($data) {
                    if ($task['id'] === $data['task_id']) {
                        $task['done'] = ! $task['done'];
                    }

                    return $task;
                }, $day['tasks'] ?? []);

                return $day;
            }, $schedule);

            $plan->update(['schedule' => $updated]);

            return $plan->refresh();
        });
    }
}
