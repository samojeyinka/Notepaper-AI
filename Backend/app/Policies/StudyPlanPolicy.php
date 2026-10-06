<?php

namespace App\Policies;

use App\Models\StudyPlan;
use App\Models\User;

class StudyPlanPolicy
{
    public function view(User $user, StudyPlan $plan): bool
    {
        return $user->id === $plan->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, StudyPlan $plan): bool
    {
        return $user->id === $plan->user_id;
    }

    public function delete(User $user, StudyPlan $plan): bool
    {
        return $user->id === $plan->user_id;
    }
}
