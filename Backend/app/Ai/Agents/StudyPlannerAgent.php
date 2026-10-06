<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Promptable;
use Stringable;

class StudyPlannerAgent implements Agent, Conversational, HasStructuredOutput
{
    use Promptable;

    public function __construct(
        public readonly string $name,
        public readonly string $examDate,
        public readonly string $startDate,
        public readonly string $studyFrom,
        public readonly string $studyTo,
        public readonly array $activeDays,
        public readonly array $enabledActivities,
        public readonly array $materialSummaries,
    ) {}

    public function instructions(): Stringable|string
    {
        $days = implode(', ', $this->activeDays);
        $acts = implode(', ', $this->enabledActivities);

        return <<<PROMPT
You are Schola — an expert study planner inside Notepaper-ai.
Generate a realistic, day-by-day study schedule between {$this->startDate} and {$this->examDate}.

Rules you MUST follow:
- Only schedule sessions on these days of the week: {$days}
- Study window each day: {$this->studyFrom} to {$this->studyTo}
- Only use these activity types: {$acts}
- Each task must have a duration_min between 20 and 60
- Distribute topics evenly across the available days — do NOT front-load or back-load
- Derive task titles and materials directly from the provided content
- If no materials are provided, create sensible generic study tasks for the exam topic
- The final 2 days before the exam should focus on review and practice quizzes
- Return ONLY valid JSON matching the schema — no extra text, no markdown fences
PROMPT;
    }

    public function messages(): iterable
    {
        $materialsText = empty($this->materialSummaries)
            ? 'No specific materials provided — generate based on exam topic: ' . $this->name
            : "Reference materials:\n\n" . implode("\n\n---\n\n", $this->materialSummaries);

        return [
            new Message(
                'user',
                "Exam: {$this->name}\nExam date: {$this->examDate}\nStart date: {$this->startDate}\n\n{$materialsText}\n\nGenerate the full day-by-day study schedule now."
            ),
        ];
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'schedule' => $schema->array(
                $schema->object([
                    'date'  => $schema->string()->required(),
                    'tasks' => $schema->array(
                        $schema->object([
                            'id'           => $schema->string()->required(),
                            'type'         => $schema->string()->required(),
                            'title'        => $schema->string()->required(),
                            'material'     => $schema->string()->required(),
                            'duration_min' => $schema->integer()->required(),
                            'done'         => $schema->boolean()->required(),
                        ])
                    )->required(),
                ])
            )->required(),
        ];
    }
}
