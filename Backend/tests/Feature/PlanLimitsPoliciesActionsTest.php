<?php

namespace Tests\Feature;

use App\Actions\Sprint\CompleteSprintChallengeAction;
use App\Contracts\Actions\CompletesSprintChallenge;
use App\Enums\SprintChallengeStatus;
use App\Enums\SprintChallengeType;
use App\Enums\SprintStatus;
use App\Models\Note;
use App\Models\Sprint;
use App\Models\SprintChallenge;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class PlanLimitsPoliciesActionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_owned_resource_policies_enforce_ownership(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();

        $sprint = Sprint::create([
            'user_id'    => $owner->id,
            'title'      => 'Physics sprint',
            'start_date' => now(),
            'end_date'   => now()->addWeek(),
            'status'     => SprintStatus::Active->value,
        ]);

        $challenge = SprintChallenge::create([
            'sprint_id'       => $sprint->id,
            'title'           => 'Concept 1',
            'type'            => SprintChallengeType::Concept->value,
            'status'          => SprintChallengeStatus::Locked->value,
            'challenge_order' => 1,
        ]);

        $note = Note::create([
            'user_id' => $owner->id,
            'title'   => 'My note',
        ]);

        $this->assertTrue(Gate::forUser($owner)->check('view', $sprint));
        $this->assertFalse(Gate::forUser($other)->check('view', $sprint));
        $this->assertFalse(Gate::forUser($other)->check('delete', $sprint));

        $this->assertTrue(Gate::forUser($owner)->check('show', $challenge));
        $this->assertFalse(Gate::forUser($other)->check('show', $challenge));
        $this->assertFalse(Gate::forUser($other)->check('complete', $challenge));

        $this->assertTrue(Gate::forUser($owner)->check('view', $note));
        $this->assertFalse(Gate::forUser($other)->check('view', $note));
        $this->assertFalse(Gate::forUser($other)->check('delete', $note));
        $this->assertFalse(Gate::forUser($other)->check('update', $note));
    }

    public function test_complete_sprint_challenge_action_requires_ownership(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();

        $sprint = Sprint::create([
            'user_id'          => $owner->id,
            'title'            => 'Physics sprint',
            'start_date'       => now(),
            'end_date'         => now()->addWeek(),
            'status'           => SprintStatus::Active->value,
            'challenges_count' => 2,
        ]);

        $challenge = SprintChallenge::create([
            'sprint_id'       => $sprint->id,
            'title'           => 'Concept 1',
            'type'            => SprintChallengeType::Concept->value,
            'status'          => SprintChallengeStatus::Locked->value,
            'challenge_order' => 1,
        ]);

        $action = app(CompletesSprintChallenge::class);

        $this->expectException(AuthorizationException::class);

        $action($challenge, $other);
    }

    public function test_complete_sprint_challenge_action_marks_challenge_completed(): void
    {
        $owner = User::factory()->create();

        $sprint = Sprint::create([
            'user_id'          => $owner->id,
            'title'            => 'Physics sprint',
            'start_date'       => now(),
            'end_date'         => now()->addWeek(),
            'status'           => SprintStatus::Active->value,
            'challenges_count' => 2,
        ]);

        $first = SprintChallenge::create([
            'sprint_id'       => $sprint->id,
            'title'           => 'Concept 1',
            'type'            => SprintChallengeType::Concept->value,
            'status'          => SprintChallengeStatus::Locked->value,
            'challenge_order' => 1,
        ]);

        $second = SprintChallenge::create([
            'sprint_id'       => $sprint->id,
            'title'           => 'Concept 2',
            'type'            => SprintChallengeType::Concept->value,
            'status'          => SprintChallengeStatus::Locked->value,
            'content'         => ['summary' => 'filled'],
            'challenge_order' => 2,
        ]);

        $action = new CompleteSprintChallengeAction;
        $completed = $action($first, $owner);

        $this->assertSame(SprintChallengeStatus::Completed, $completed->status);
        $this->assertNotNull($completed->completed_at);

        $this->assertSame(
            SprintChallengeStatus::Ready,
            $second->refresh()->status
        );
    }
}
