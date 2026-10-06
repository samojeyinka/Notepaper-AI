<?php

namespace Database\Factories;

use App\Enums\ShapeEnum;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Folder>
 */
class FolderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id'     => User::factory(),
            'name'        => $this->faker->word(),
            'description' => $this->faker->paragraph(),
            'color'       => $this->faker->hexColor(),
            'icon'        => $this->faker->randomElement(['folder', 'pen', 'book']),
            'shape'       => $this->faker->randomElement(ShapeEnum::values()),
        ];
    }
}
