<?php

namespace App\Policies;

use App\Models\Paper;
use App\Models\User;

class PaperPolicy
{
    public function view(User $user, Paper $paper): bool
    {
        return $user->id === $paper->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Paper $paper): bool
    {
        return $user->id === $paper->user_id;
    }

    public function revert(User $user, Paper $paper): bool
    {
        return $user->id === $paper->user_id;
    }

    public function duplicate(User $user, Paper $paper): bool
    {
        return $user->id === $paper->user_id;
    }

    public function delete(User $user, Paper $paper): bool
    {
        return $user->id === $paper->user_id;
    }
}
