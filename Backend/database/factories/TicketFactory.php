<?php

namespace Database\Factories;

use App\Enums\TicketCategory;
use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Ticket>
 */
class TicketFactory extends Factory
{
    protected $model = Ticket::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id'  => User::factory(),
            'subject'  => ucfirst($this->faker->sentence()),
            'details'  => $this->faker->paragraphs(2, true),
            'status'   => $this->faker->randomElement(TicketStatus::cases()),
            'priority' => $this->faker->randomElement(TicketPriority::cases()),
            'category' => $this->faker->randomElement(TicketCategory::cases()),
        ];
    }

    public function open(): static
    {
        return $this->state(fn (): array => ['status' => TicketStatus::OPEN]);
    }

    public function closed(): static
    {
        return $this->state(fn (): array => ['status' => TicketStatus::CLOSED]);
    }
}
