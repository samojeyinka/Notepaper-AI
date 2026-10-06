<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Promptable;
use Stringable;

class NoteGeneratorAgent implements Agent, Conversational, HasStructuredOutput
{
    use Promptable;

    public function __construct(
        public readonly string $content,
        public readonly string $tone,
        public readonly string $length,
        public readonly ?string $topic = null,
    ) {}

    public function instructions(): Stringable|string
    {
        $lengthGuide = match ($this->length) {
            'short'    => '~200 words',
            'medium'   => '~500 words',
            'long'     => '~1000 words',
            'detailed' => '~2000+ words',
            default    => $this->length,
        };

        $toneGuide = match ($this->tone) {
            'academic'     => 'formal and academic with technical depth',
            'simple'       => 'plain and conversational, easy to understand',
            'bullet'       => 'structured bullet points and numbered lists with minimal prose',
            'storytelling' => 'narrative storytelling style, engaging and vivid',
            default        => 'clear and informative',
        };

        return <<<PROMPT
You are Schola — an expert study-note generator inside a note-taking app called Notepaper-ai.
Your job is to produce thorough, well-structured notes from the provided reference materials.

Rules you MUST follow:
- Ground ALL content in the provided materials — do not invent facts beyond them
- Tone: {$toneGuide}
- Target length: {$lengthGuide}
- Use clear headings, bullet points, and numbered lists where appropriate
- Provide real depth: explanations, examples, key facts, and important nuances
- Write in Markdown format
- NEVER add preamble like "Here is your content:" or "Sure!" — start immediately with the content
- If a topic focus is given, use the materials to specifically address that topic
- Return ONLY valid JSON matching the schema — no extra text
PROMPT;
    }

    public function messages(): iterable
    {
        $topicLine = $this->topic ? "Topic focus: {$this->topic}\n\n" : '';

        return [
            new Message(
                'user',
                "{$topicLine}Reference materials:\n\n{$this->content}\n\n" .
                'Generate well-structured notes from these materials now.'
            ),
        ];
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'content' => $schema->string()->required(),
        ];
    }
}
