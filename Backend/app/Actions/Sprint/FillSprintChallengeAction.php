<?php

namespace App\Actions\Sprint;

use App\Contracts\Actions\FillsSprintChallenge;
use App\Enums\SprintChallengeStatus;
use App\Models\SprintChallenge;
use Illuminate\Support\Facades\DB;

class FillSprintChallengeAction implements FillsSprintChallenge
{
    public function __invoke(SprintChallenge $challenge, array $content): void
    {
        DB::transaction(function () use ($challenge, $content): void {
            $challenge->update([
                'content' => $content,
                'status'  => SprintChallengeStatus::Ready,
            ]);

            $challenge->sprint()->increment('challenges_filled');
        });
    }
}
