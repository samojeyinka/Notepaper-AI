<?php

namespace Database\Factories;

use App\Models\Paper;
use App\Models\PaperVersion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PaperVersion>
 */
class PaperVersionFactory extends Factory
{
    protected $model = PaperVersion::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'paper_id'   => Paper::factory(),
            'content'    => $this->faker->paragraphs(3, true),
            'created_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
        ];
    }
}
