<?php

namespace App\Policies;

use App\Models\SprintChallenge;
use App\Models\User;

class SprintChallengePolicy
{
    public function show(User $user, SprintChallenge $challenge): bool
    {
        return $user->id === $challenge->sprint->user_id;
    }

    public function complete(User $user, SprintChallenge $challenge): bool
    {
        return $user->id === $challenge->sprint->user_id;
    }
}
