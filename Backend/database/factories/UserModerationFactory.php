<?php

namespace Database\Factories;

use App\Enums\UserModerationsStatus;
use App\Models\User;
use App\Models\UserModeration;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UserModeration>
 */
class UserModerationFactory extends Factory
{
    protected $model = UserModeration::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id'      => User::factory(),
            'requested_by' => User::factory(),
            'reviewed_by'  => null,
            'reason'       => $this->faker->sentence(),
            'status'       => UserModerationsStatus::PENDING,
        ];
    }

    public function approved(): static
    {
        return $this->state(fn (): array => [
            'status'      => UserModerationsStatus::APPROVED,
            'reviewed_by' => User::factory(),
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (): array => [
            'status'      => UserModerationsStatus::REJECTED,
            'reviewed_by' => User::factory(),
        ]);
    }
}
