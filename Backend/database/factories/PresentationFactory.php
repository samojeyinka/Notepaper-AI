<?php

namespace Database\Factories;

use App\Enums\PresentationTheme;
use App\Models\Presentation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Presentation>
 */
class PresentationFactory extends Factory
{
    protected $model = Presentation::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $slides = $this->slides();

        return [
            'user_id'     => User::factory(),
            'paper_id'    => null,
            'title'       => ucfirst($this->faker->unique()->words(3, true)),
            'slides'      => json_encode($slides),
            'theme'       => $this->faker->randomElement(PresentationTheme::cases()),
            'slide_count' => count($slides),
        ];
    }

    /**
     * Build a slide deck the presentation player expects.
     *
     * @return array<int, array<string, mixed>>
     */
    private function slides(): array
    {
        $count = $this->faker->numberBetween(5, 9);
        $slides = [];

        for ($i = 1; $i <= $count; $i++) {
            $slides[] = [
                'slide'  => $i,
                'layout' => match ($i) {
                    1       => 'title',
                    $count  => 'closing',
                    default => 'content',
                },
                'title'   => ucfirst($this->faker->words(3, true)),
                'bullets' => $i === 1
                    ? [$this->faker->sentence()]
                    : array_map(fn (): string => ucfirst($this->faker->sentence()), range(1, $this->faker->numberBetween(2, 4))),
                'speaker_notes' => $this->faker->sentence(),
                'listStyle'     => 'bullet',
                'lineHeight'    => 1.6,
                'titleColor'    => null,
                'bodyColor'     => null,
                'bgColor'       => null,
                'image'         => null,
            ];
        }

        return $slides;
    }
}
