<?php

namespace App\Services;

use App\Contracts\Actions\CompletesSprintChallenge;
use App\Contracts\Actions\CreatesSprint;
use App\Enums\SprintChallengeStatus;
use App\Models\Sprint;
use App\Models\SprintChallenge;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class SprintService
{
    public function __construct(
        private readonly CreatesSprint $createSprint,
        private readonly CompletesSprintChallenge $completeSprintChallenge,
    ) {}

    public function list(User $user): LengthAwarePaginator
    {
        return Sprint::where('user_id', $user->id)
            ->withCount(['challenges as completed_challenges_count' => fn ($q) => $q->where('status', SprintChallengeStatus::Completed->value),
            ])
            ->orderByDesc('created_at')
            ->paginate(20);
    }

    public function create(User $user, array $data): Sprint
    {
        return ($this->createSprint)($user, $data);
    }

    public function show(string $id, User $user): Sprint
    {
        return Sprint::where('id', $id)
            ->where('user_id', $user->id)
            ->with('challenges')
            ->withCount(['challenges as completed_challenges_count' => fn ($q) => $q->where('status', SprintChallengeStatus::Completed->value),
            ])
            ->firstOrFail();
    }

    public function completeChallenge(SprintChallenge $challenge, User $user): SprintChallenge
    {
        return ($this->completeSprintChallenge)($challenge, $user);
    }
}
