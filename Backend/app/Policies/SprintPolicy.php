<?php

namespace App\Policies;

use App\Models\Sprint;
use App\Models\User;

class SprintPolicy
{
    public function view(User $user, Sprint $sprint): bool
    {
        return $user->id === $sprint->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function delete(User $user, Sprint $sprint): bool
    {
        return $user->id === $sprint->user_id;
    }
}
