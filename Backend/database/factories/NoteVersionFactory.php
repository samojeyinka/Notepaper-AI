<?php

namespace Database\Factories;

use App\Models\Note;
use App\Models\NoteVersion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\NoteVersion>
 */
class NoteVersionFactory extends Factory
{
    protected $model = NoteVersion::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'note_id'    => Note::factory(),
            'content'    => $this->faker->paragraphs(3, true),
            'created_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
        ];
    }
}
