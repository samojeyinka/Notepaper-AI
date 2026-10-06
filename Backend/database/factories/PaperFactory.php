<?php

namespace Database\Factories;

use App\Enums\FontStyle;
use App\Models\Folder;
use App\Models\Paper;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Paper>
 */
class PaperFactory extends Factory
{
    protected $model = Paper::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id'       => User::factory(),
            'folder_id'     => null,
            'title'         => ucfirst($this->faker->unique()->words(3, true)),
            'content'       => $this->faker->paragraphs(5, true),
            'font_style'    => $this->faker->randomElement(FontStyle::cases()),
            'text_color'    => $this->faker->hexColor(),
            'is_pinned'     => false,
            'ai_generating' => false,
        ];
    }

    public function inFolder(): static
    {
        return $this->state(fn (): array => ['folder_id' => Folder::factory()]);
    }
}
