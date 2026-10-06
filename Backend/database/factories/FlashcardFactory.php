<?php

namespace Database\Factories;

use App\Enums\FlashcardTemplate;
use App\Models\Flashcard;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Flashcard>
 */
class FlashcardFactory extends Factory
{
    protected $model = Flashcard::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id'   => User::factory(),
            'folder_id' => null,
            'title'     => ucfirst($this->faker->unique()->words(3, true)),
            'template'  => $this->faker->randomElement(FlashcardTemplate::cases()),
            'cards'     => array_map(fn (): array => [
                'front' => ucfirst($this->faker->sentence()),
                'back'  => ucfirst($this->faker->sentence()),
            ], range(1, $this->faker->numberBetween(6, 12))),
            'font_family'     => 'sans',
            'font_size'       => 18,
            'bg_color'        => '#ffffff',
            'text_color'      => '#1e293b',
            'is_bold'         => false,
            'is_italic'       => false,
            'style_overrides' => null,
        ];
    }
}
