<?php

namespace App\Contracts\Actions;

use App\Models\StudyPlan;
use App\Models\User;

interface CreatesStudyPlan
{
    public function __invoke(User $user, array $data): StudyPlan;
}
