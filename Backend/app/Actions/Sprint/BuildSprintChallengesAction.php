<?php

namespace App\Actions\Sprint;

use App\Contracts\Actions\BuildsSprintChallenges;
use App\Enums\SprintChallengeStatus;
use App\Enums\SprintStatus;
use App\Models\Sprint;
use App\Models\SprintChallenge;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class BuildSprintChallengesAction implements BuildsSprintChallenges
{
    public function __invoke(Sprint $sprint, array $challenges): void
    {
        DB::transaction(function () use ($sprint, $challenges): void {
            $sprint->update(['challenges_count' => count($challenges)]);

            foreach ($challenges as $outline) {
                $scheduledAt = Carbon::parse($sprint->start_date)
                    ->addDays((int) ($outline['days_offset'] ?? 0))
                    ->setTime(17, 0);

                SprintChallenge::create([
                    'sprint_id'       => $sprint->id,
                    'title'           => $outline['title'],
                    'description'     => $outline['description'] ?? null,
                    'type'            => $outline['type'],
                    'status'          => SprintChallengeStatus::Locked,
                    'challenge_order' => (int) ($outline['challenge_order'] ?? 0),
                    'scheduled_at'    => $scheduledAt,
                ]);
            }

            $sprint->update(['status' => SprintStatus::Active]);
        });
    }
}
