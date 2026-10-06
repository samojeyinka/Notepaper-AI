<?php

namespace App\Ai\Agents;

use App\Models\Sprint;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Messages\UserMessage;
use Laravel\Ai\Promptable;
use Stringable;

class SprintPlannerAgent implements Agent, Conversational, HasStructuredOutput
{
    use Promptable;

    public function __construct(
        public readonly Sprint $sprint,
        public readonly array $materialSummaries,
    ) {}

    public function instructions(): Stringable|string
    {
        $duration = $this->sprint->start_date->diffInDays($this->sprint->end_date) + 1;
        $lastOffset = $duration - 1;
        $goal = $this->sprint->goal ?? 'general study and mastery';
        $materialCount = count($this->materialSummaries);
        $challengeCount = $this->challengeCount();
        $perMaterial = $materialCount > 1 ? (int) ceil($challengeCount / $materialCount) : $challengeCount;

        $materialRule = $materialCount <= 1
            ? 'Each challenge must teach SPECIFIC content extracted from the provided material — not generic tasks.'
            : "There are {$materialCount} separate materials. Distribute challenges proportionally — approximately {$perMaterial} challenge(s) per material. Schedule Material 1 challenges across the first portion of the sprint days, Material 2 in the next portion, and so on in order. NEVER mix content from two different materials in a single challenge.";

        return <<<PROMPT
You are an expert study planner. Your job is to plan learning challenges that TEACH the content from the provided materials.

Sprint: "{$this->sprint->title}"
Goal: {$goal}
Duration: {$duration} days (starts day 0)
Materials: {$materialCount}

CRITICAL RULES — read carefully:
1. Generate exactly {$challengeCount} challenges spread across the {$duration} days
2. {$materialRule}
3. Challenge titles must name the actual concept being taught (e.g. "Stack Push and Pop Operations", "Big-O Time Complexity"). Never reference the source material, never say "Read", "Study", "Find", or "Look at"
4. Challenge descriptions must state in one sentence exactly what the learner will understand or be tested on
5. Mix types within each material's section: quiz (multiple-choice), concept (explains a core idea), quickpoints (bullet summary), reading (explanatory passage)
6. Difficulty increases gradually within each material's section: foundational concepts first, complex applications last
7. challenge_order starts at 1, increments by 1
8. days_offset is 0-indexed: 0 = first day, {$lastOffset} = last day
9. type must be exactly one of: quiz, concept, quickpoints, reading
10. Base EVERY challenge strictly on the material content provided. Do not invent topics not present in the material.

Return only valid JSON matching the schema.
PROMPT;
    }

    public function messages(): iterable
    {
        if (empty($this->materialSummaries)) {
            $content = 'No materials provided — generate challenges based on the sprint title and goal only.';
        } elseif (count($this->materialSummaries) === 1) {
            $content = "Content to teach from:\n\n" . $this->materialSummaries[0];
        } else {
            $total = count($this->materialSummaries);
            $labeled = [];

            foreach ($this->materialSummaries as $i => $summary) {
                $labeled[] = '=== MATERIAL ' . ($i + 1) . " OF {$total} ===\n{$summary}";
            }

            $content = "The following are {$total} separate materials. Generate challenges proportionally from each, covering them in order (all Material 1 challenges first, then Material 2, etc.):\n\n" . implode("\n\n", $labeled);
        }

        return [
            new UserMessage($content),
        ];
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'challenges' => $schema->array()->items(
                $schema->object([
                    'title'           => $schema->string()->required(),
                    'description'     => $schema->string()->required(),
                    'type'            => $schema->string()->required(),
                    'challenge_order' => $schema->integer()->required(),
                    'days_offset'     => $schema->integer()->required(),
                ])
            )->required(),
        ];
    }

    private function challengeCount(): int
    {
        $duration = $this->sprint->start_date->diffInDays($this->sprint->end_date) + 1;

        return min(max($duration * 2, 5), 30);
    }
}
