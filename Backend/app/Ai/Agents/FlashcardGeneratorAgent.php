<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Promptable;
use Stringable;

class FlashcardGeneratorAgent implements Agent, Conversational, HasStructuredOutput
{
    use Promptable;

    public function __construct(
        public readonly string $content,
        public readonly int $count,
        public readonly ?string $topic = null,
    ) {}

    public function instructions(): Stringable|string
    {
        return <<<PROMPT
You are a flashcard generator. Your ONLY job is to generate exactly {$this->count} flashcards
from the study material provided by the user.

Rules you MUST follow:
- Generate EXACTLY {$this->count} flashcards — no more, no less
- Every card must be grounded in the provided material
- front: a concise question or term (max 15 words)
- back: a clear answer or explanation (max 50 words)
- Cover distinct aspects; vary from basic to advanced
- Never repeat the same card
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
                "Generate exactly {$this->count} flashcards from this content now."
            ),
        ];
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'cards' => $schema->array()->items(
                $schema->object([
                    'front' => $schema->string()->required(),
                    'back'  => $schema->string()->required(),
                ])
            )->required(),
        ];
    }
}
