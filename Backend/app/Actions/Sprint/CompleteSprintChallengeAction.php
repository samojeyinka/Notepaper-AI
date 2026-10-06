<?php

namespace App\Actions\Sprint;

use App\Contracts\Actions\CompletesSprintChallenge;
use App\Enums\SprintChallengeStatus;
use App\Enums\SprintStatus;
use App\Jobs\FillChallengeJob;
use App\Models\Sprint;
use App\Models\SprintChallenge;
use App\Models\User;
use App\Notifications\SprintCompleted;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class CompleteSprintChallengeAction implements CompletesSprintChallenge
{
    public function __invoke(SprintChallenge $challenge, User $user): SprintChallenge
    {
        Gate::forUser($user)->authorize('complete', $challenge);

        return DB::transaction(function () use ($challenge): SprintChallenge {
            $challenge->update([
                'status'       => SprintChallengeStatus::Completed,
                'completed_at' => now(),
            ]);

            $this->unlockAndFillNext($challenge);
            $this->checkSprintCompletion($challenge->sprint);

            return $challenge->refresh();
        });
    }

    private function unlockAndFillNext(SprintChallenge $completed): void
    {
        $sprint = $completed->sprint;

        $next = SprintChallenge::where('sprint_id', $sprint->id)
            ->where('challenge_order', '>', $completed->challenge_order)
            ->where('status', SprintChallengeStatus::Locked)
            ->orderBy('challenge_order')
            ->first();

        if (! $next) {
            return;
        }

        if ($next->content) {
            $next->update(['status' => SprintChallengeStatus::Ready]);
        } else {
            DB::afterCommit(fn () => FillChallengeJob::dispatch($next)->onQueue('ai'));
        }
    }

    private function checkSprintCompletion(Sprint $sprint): void
    {
        $remaining = SprintChallenge::where('sprint_id', $sprint->id)
            ->whereNotIn('status', [SprintChallengeStatus::Completed->value])
            ->count();

        if ($remaining === 0) {
            $sprint->update(['status' => SprintStatus::Completed]);
            DB::afterCommit(fn () => $sprint->user->notify(new SprintCompleted($sprint)));
        }
    }
}
