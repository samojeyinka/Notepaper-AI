<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Promptable;
use Stringable;

class QuizGeneratorAgent implements Agent, Conversational, HasStructuredOutput
{
    use Promptable;

    public function __construct(
        public readonly string $content,
        public readonly int $count,
        public readonly string $difficulty = 'medium',
        public readonly string $questionType = 'multiple_choice',
        public readonly ?string $topic = null,
    ) {}

    public function instructions(): Stringable|string
    {
        $difficultyLine = "Difficulty level: {$this->difficulty}";
        $typeMap = [
            'multiple_choice' => 'multiple-choice (4 options each)',
            'short_answer'    => 'short-answer (no options)',
            'mixed'           => 'mixed (a combination of multiple-choice and short-answer)',
        ];
        $typeLine = 'Question type: ' . ($typeMap[$this->questionType] ?? 'multiple-choice');

        return <<<PROMPT
You are a quiz generator. Your ONLY job is to generate exactly {$this->count} quiz questions
from the study material provided by the user.

{$difficultyLine}
{$typeLine}

Rules you MUST follow:
- Generate EXACTLY {$this->count} questions — no more, no less
- Every question must be grounded in the provided material
- For multiple-choice: provide exactly 4 options, one correct answer, and an explanation
- For short-answer: leave options as an empty array, set correct_index to -1
- Return only valid JSON matching the schema — no extra text
PROMPT;
    }

    public function messages(): iterable
    {
        $topicLine = $this->topic ? "Topic focus: {$this->topic}\n\n" : '';

        return [
            new Message(
                'user',
                "{$topicLine}Study material:\n\n{$this->content}\n\n" .
                "Generate exactly {$this->count} quiz questions from this content now."
            ),
        ];
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'questions' => $schema->array()->items(
                $schema->object([
                    'question'      => $schema->string()->required(),
                    'options'       => $schema->array()->items($schema->string())->required(),
                    'correct_index' => $schema->integer()->required(),
                    'explanation'   => $schema->string()->required(),
                ])
            )->required(),
        ];
    }
}
