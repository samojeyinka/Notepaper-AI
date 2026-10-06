<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Promptable;
use Stringable;

class PresentationGeneratorAgent implements Agent, Conversational, HasStructuredOutput
{
    use Promptable;

    public function __construct(
        public readonly string $content,
        public readonly int $slideCount,
        public readonly ?string $topic = null,
    ) {}

    public function instructions(): Stringable|string
    {
        return <<<PROMPT
You are a presentation generator. Your ONLY job is to generate a {$this->slideCount}-slide
presentation from the study material provided by the user.

Slide structure rules:
- Slide 1: title slide — type "title", a compelling title, subtitle as first bullet
- Slides 2 to N-1: content slides — type "content", clear title, 3-5 bullet points each, speaker notes
- Last slide: closing slide — type "closing", summary title, 2-3 key takeaway bullets
- Total must be EXACTLY {$this->slideCount} slides
- All content must come from the provided material
- Return only valid JSON matching the schema — no extra text
PROMPT;
    }

    public function messages(): iterable
    {
        $topicLine = $this->topic ? "Presentation topic: {$this->topic}\n\n" : '';

        return [
            new Message(
                'user',
                "{$topicLine}Study material:\n\n{$this->content}\n\n" .
                "Generate a {$this->slideCount}-slide presentation from this content now."
            ),
        ];
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'slides' => $schema->array()->items(
                $schema->object([
                    'slide'         => $schema->integer()->required(),
                    'type'          => $schema->string()->required(),
                    'title'         => $schema->string()->required(),
                    'bullets'       => $schema->array()->items($schema->string())->required(),
                    'speaker_notes' => $schema->string()->required(),
                ])
            )->required(),
        ];
    }
}
