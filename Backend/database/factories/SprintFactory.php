<?php

namespace Database\Factories;

use App\Enums\SprintStatus;
use App\Models\Sprint;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Sprint>
 */
class SprintFactory extends Factory
{
    protected $model = Sprint::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $start = Carbon::parse($this->faker->dateTimeBetween('-21 days', '+7 days'));

        return [
            'user_id'           => User::factory(),
            'title'             => ucfirst($this->faker->unique()->words(3, true)),
            'goal'              => $this->faker->sentence(),
            'start_date'        => $start,
            'end_date'          => $start->copy()->addDays(14),
            'material_ids'      => [],
            'material_uploads'  => null,
            'status'            => SprintStatus::Active,
            'challenges_count'  => 0,
            'challenges_filled' => 0,
        ];
    }

    public function generating(): static
    {
        return $this->state(fn (): array => ['status' => SprintStatus::Generating]);
    }

    public function completed(): static
    {
        return $this->state(fn (): array => ['status' => SprintStatus::Completed]);
    }
}
