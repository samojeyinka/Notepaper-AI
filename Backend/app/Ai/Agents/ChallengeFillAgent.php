<?php

namespace App\Ai\Agents;

use App\Enums\SprintChallengeType;
use App\Models\SprintChallenge;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Promptable;
use Stringable;

class ChallengeFillAgent implements Agent, Conversational, HasStructuredOutput
{
    use Promptable;

    public function __construct(
        public readonly SprintChallenge $challenge,
        public readonly string $materialContext,
        public readonly string $sprintTitle,
    ) {}

    public function instructions(): Stringable|string
    {
        $topic = $this->challenge->title . ': ' . $this->challenge->description;

        return match ($this->challenge->type) {
            SprintChallengeType::Quiz => <<<PROMPT
You are a quiz generator. Your ONLY job is to generate quiz questions about this exact topic:

TOPIC: {$topic}

Rules you MUST follow without exception:
- Write EXACTLY 5 multiple-choice questions
- EVERY question must be about the topic above and nothing else
- Each question must have exactly 4 answer options
- Respond in English only
- Return only valid JSON matching the schema — no extra text
PROMPT,
            SprintChallengeType::Concept => <<<PROMPT
You are a concept explainer. Your ONLY job is to explain this exact topic:

TOPIC: {$topic}

Rules you MUST follow without exception:
- Write a clear explanation (max 150 words) about the topic above and nothing else
- List 3-5 key points about this topic only
- Respond in English only
- Return only valid JSON matching the schema — no extra text
PROMPT,
            SprintChallengeType::Quickpoints => <<<PROMPT
You are a study summarizer. Your ONLY job is to create bullet points about this exact topic:

TOPIC: {$topic}

Rules you MUST follow without exception:
- Generate 5-8 bullet points about the topic above and nothing else
- Each bullet must be one clear, memorable sentence directly about this topic
- Respond in English only
- Return only valid JSON matching the schema — no extra text
PROMPT,
            SprintChallengeType::Reading => <<<PROMPT
You are a study material writer. Your ONLY job is to write a reading passage about this exact topic:

TOPIC: {$topic}

Rules you MUST follow without exception:
- Write a focused passage (max 200 words) about the topic above and nothing else
- Provide a 2-sentence summary of the passage
- Respond in English only
- Return only valid JSON matching the schema — no extra text
PROMPT,
        };
    }

    public function messages(): iterable
    {
        $context = $this->materialContext
            ? "Reference material (use only if relevant to the topic):\n{$this->materialContext}\n\n"
            : '';

        return [
            new Message(
                'user',
                "Sprint title: \"{$this->sprintTitle}\"\n\n" .
                "YOU MUST GENERATE CONTENT ABOUT THIS SPECIFIC TOPIC ONLY:\n" .
                "Title: {$this->challenge->title}\n" .
                "Description: {$this->challenge->description}\n\n" .
                "{$context}" .
                'Generate the content now. Stay strictly on topic. Use English only.'
            ),
        ];
    }

    public function schema(JsonSchema $schema): array
    {
        return match ($this->challenge->type) {
            SprintChallengeType::Quiz => [
                'questions' => $schema->array()->items(
                    $schema->object([
                        'question'      => $schema->string()->required(),
                        'options'       => $schema->array()->items($schema->string())->required(),
                        'correct_index' => $schema->integer()->required(),
                        'explanation'   => $schema->string()->required(),
                    ])
                )->required(),
            ],
            SprintChallengeType::Concept => [
                'explanation' => $schema->string()->required(),
                'key_points'  => $schema->array()->items($schema->string())->required(),
            ],
            SprintChallengeType::Quickpoints => [
                'points' => $schema->array()->items($schema->string())->required(),
            ],
            SprintChallengeType::Reading => [
                'passage' => $schema->string()->required(),
                'summary' => $schema->string()->required(),
            ],
        };
    }
}
