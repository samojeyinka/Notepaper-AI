<?php

namespace Database\Factories;

use App\Enums\QuizDifficulty;
use App\Enums\QuizQuestionType;
use App\Models\Quiz;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Quiz>
 */
class QuizFactory extends Factory
{
    protected $model = Quiz::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $questionType = $this->faker->randomElement(QuizQuestionType::cases());
        $questions = $this->questions($questionType);

        return [
            'user_id'        => User::factory(),
            'title'          => ucfirst($this->faker->unique()->words(4, true)),
            'subject'        => $this->faker->randomElement(['Biology', 'Chemistry', 'Physics', 'Economics', 'Mathematics', 'History', 'Geography']),
            'difficulty'     => $this->faker->randomElement(QuizDifficulty::cases()),
            'question_type'  => $questionType,
            'question_count' => count($questions),
            'questions'      => $questions,
        ];
    }

    /**
     * Build questions using the `type`/`correct` keys the quiz player reads.
     *
     * @return array<int, array<string, mixed>>
     */
    private function questions(QuizQuestionType $questionType): array
    {
        $count = $this->faker->numberBetween(5, 10);

        return array_map(function () use ($questionType): array {
            $type = match ($questionType) {
                QuizQuestionType::Input, QuizQuestionType::ShortAnswer => 'input',
                QuizQuestionType::Multiple, QuizQuestionType::MultipleChoice => 'multiple',
                default => $this->faker->randomElement(['multiple', 'input']),
            };

            $question = [
                'type'        => $type,
                'question'    => ucfirst($this->faker->sentence()),
                'explanation' => $this->faker->sentence(),
                'category'    => $this->faker->word(),
            ];

            if ($type === 'multiple') {
                $question['options'] = array_map(fn (): string => ucfirst($this->faker->words(4, true)), range(1, 4));
                $question['correct'] = $this->faker->numberBetween(0, 3);
            } else {
                $question['correct'] = ucfirst($this->faker->word());
            }

            return $question;
        }, range(1, $count));
    }
}
