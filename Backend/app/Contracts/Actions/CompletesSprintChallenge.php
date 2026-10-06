<?php

namespace App\Contracts\Actions;

use App\Models\SprintChallenge;
use App\Models\User;

interface CompletesSprintChallenge
{
    public function __invoke(SprintChallenge $challenge, User $user): SprintChallenge;
}
