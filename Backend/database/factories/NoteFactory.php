<?php

namespace Database\Factories;

use App\Enums\FontStyle;
use App\Enums\PaperType;
use App\Models\Folder;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Note>
 */
class NoteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id'                => User::factory(),
            'folder_id'              => null,
            'title'                  => $this->faker->sentence(),
            'content'                => $this->faker->text(),
            'paper_type'             => $this->faker->randomElement(PaperType::values()),
            'paper_line_color'       => $this->faker->hexColor(),
            'paper_background_color' => $this->faker->hexColor(),
            'font_style'             => $this->faker->randomElement(FontStyle::values()),
            'text_color'             => $this->faker->hexColor(),
            'is_pinned'              => false,
        ];
    }

    public function inFolder(): static
    {
        return $this->state(fn (array $attributes) => [
            'folder_id' => Folder::factory(),
        ]);
    }
}
