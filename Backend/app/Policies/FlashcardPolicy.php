<?php

namespace App\Policies;

use App\Models\Flashcard;
use App\Models\User;

class FlashcardPolicy
{
    public function view(User $user, Flashcard $flashcard): bool
    {
        return $user->id === $flashcard->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Flashcard $flashcard): bool
    {
        return $user->id === $flashcard->user_id;
    }

    public function duplicate(User $user, Flashcard $flashcard): bool
    {
        return $user->id === $flashcard->user_id;
    }

    public function delete(User $user, Flashcard $flashcard): bool
    {
        return $user->id === $flashcard->user_id;
    }
}
