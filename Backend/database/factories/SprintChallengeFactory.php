<?php

namespace Database\Factories;

use App\Enums\SprintChallengeStatus;
use App\Enums\SprintChallengeType;
use App\Models\Sprint;
use App\Models\SprintChallenge;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SprintChallenge>
 */
class SprintChallengeFactory extends Factory
{
    protected $model = SprintChallenge::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = $this->faker->randomElement(SprintChallengeType::cases());

        return [
            'sprint_id'       => Sprint::factory(),
            'title'           => ucfirst($this->faker->words(4, true)),
            'description'     => $this->faker->sentence(),
            'type'            => $type,
            'content'         => $this->contentFor($type),
            'status'          => SprintChallengeStatus::Ready,
            'challenge_order' => 1,
            'scheduled_at'    => Carbon::parse($this->faker->dateTimeBetween('+1 day', '+14 days'))->setTime(17, 0),
        ];
    }

    public function ofType(SprintChallengeType $type): static
    {
        return $this->state(fn (): array => [
            'type'    => $type,
            'content' => $this->contentFor($type),
        ]);
    }

    public function locked(): static
    {
        return $this->state(fn (): array => [
            'status'  => SprintChallengeStatus::Locked,
            'content' => null,
        ]);
    }

    public function active(): static
    {
        return $this->state(fn (): array => ['status' => SprintChallengeStatus::Active]);
    }

    public function completed(): static
    {
        return $this->state(fn (): array => [
            'status'       => SprintChallengeStatus::Completed,
            'completed_at' => Carbon::parse($this->faker->dateTimeBetween('-5 days', 'now')),
        ]);
    }

    /**
     * Build content matching the shape each challenge view expects in the frontend.
     *
     * @return array<string, mixed>
     */
    private function contentFor(SprintChallengeType $type): array
    {
        return match ($type) {
            SprintChallengeType::Quiz => [
                'questions' => array_map(fn (): array => [
                    'question'      => ucfirst($this->faker->sentence()),
                    'options'       => array_map(fn (): string => ucfirst($this->faker->words(4, true)), range(1, 4)),
                    'correct_index' => $this->faker->numberBetween(0, 3),
                    'explanation'   => $this->faker->sentence(),
                ], range(1, 5)),
            ],
            SprintChallengeType::Concept => [
                'explanation' => $this->faker->paragraph(),
                'key_points'  => array_map(fn (): string => ucfirst($this->faker->sentence()), range(1, 4)),
            ],
            SprintChallengeType::Quickpoints => [
                'points' => array_map(fn (): string => ucfirst($this->faker->sentence()), range(1, 6)),
            ],
            SprintChallengeType::Reading => [
                'passage' => $this->faker->paragraphs(3, true),
                'summary' => $this->faker->sentence(),
            ],
        };
    }
}
