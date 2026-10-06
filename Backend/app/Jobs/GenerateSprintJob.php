<?php

namespace App\Jobs;

use App\Ai\Agents\SprintPlannerAgent;
use App\Contracts\Actions\BuildsSprintChallenges;
use App\Enums\SprintStatus;
use App\Events\SprintGenerationProgress;
use App\Models\Sprint;
use App\Notifications\SprintFailed;
use App\Notifications\SprintReady;
use App\Services\AiKeyService;
use App\Services\MaterialExtractorService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class GenerateSprintJob implements ShouldQueue
{
    use Queueable;

    private const CHAR_LIMIT_PER_PAGE = 2500;

    private const MAX_PAGES = 20;

    private const MAX_MATERIALS = 15;

    public int $tries = 2;

    public int $timeout = 120;

    public function __construct(public readonly Sprint $sprint) {}

    public function handle(BuildsSprintChallenges $buildChallenges): void
    {
        try {
            if (app(AiKeyService::class)->applyFor($this->sprint->user) === null) {
                $this->markFailed();

                return;
            }

            $this->broadcast('Collecting your study materials…', 10);

            $summaries = $this->collectMaterialSummaries();

            $this->broadcast('Planning your challenge roadmap…', 30);

            $result = (new SprintPlannerAgent($this->sprint, $summaries))->prompt('');
            $data = json_decode((string) $result, true);

            if (empty($data['challenges'])) {
                $this->markFailed();

                return;
            }

            $this->broadcast('Building challenge schedule…', 60);

            ($buildChallenges)($this->sprint, $data['challenges']);

            $this->broadcast('Generating challenge content…', 75);

            $this->fillFirstChallenges();

            $this->sprint->user->notify(new SprintReady($this->sprint));

            $this->broadcast('Your sprint is ready!', 100);
        } catch (\Throwable $e) {
            Log::error('GenerateSprintJob failed', [
                'sprint_id' => $this->sprint->id,
                'error'     => $e->getMessage(),
                'trace'     => $e->getTraceAsString(),
            ]);

            $this->markFailed();
        }
    }

    private function collectMaterialSummaries(): array
    {
        $materialIds = $this->sprint->material_ids ?? [];

        $summaries = [];
        $count = 0;

        foreach ($materialIds as $material) {
            if ($count >= self::MAX_MATERIALS) {
                break;
            }

            $type = $material['type'] ?? '';
            $text = MaterialExtractorService::extract($type, $material['id'] ?? '', self::CHAR_LIMIT_PER_PAGE, self::MAX_PAGES);

            if ($text) {
                $summaries[] = $text;
                $count++;
            }
        }

        foreach ($this->sprint->material_uploads ?? [] as $upload) {
            $text = $upload['extracted'] ?? '';

            if ($text !== '') {
                $summaries[] = mb_substr($text, 0, self::CHAR_LIMIT_PER_PAGE * self::MAX_PAGES);
            }
        }

        return $summaries;
    }

    private function fillFirstChallenges(): void
    {
        $first5 = $this->sprint->challenges()
            ->orderBy('challenge_order')
            ->limit(5)
            ->get();

        foreach ($first5 as $challenge) {
            FillChallengeJob::dispatch($challenge)->onQueue('ai');
        }
    }

    private function broadcast(string $message, int $progress): void
    {
        try {
            SprintGenerationProgress::dispatch($this->sprint->id, $message, $progress);
        } catch (\Throwable) {
            // Reverb unavailable — progress update is non-critical
        }
    }

    private function markFailed(): void
    {
        $this->sprint->update(['status' => SprintStatus::Failed]);

        try {
            SprintGenerationProgress::dispatch($this->sprint->id, 'Generation failed. Please try again.', -1);
        } catch (\Throwable) {
            // Reverb unavailable — status is already saved in DB
        }

        try {
            $this->sprint->user->notify(new SprintFailed($this->sprint));
        } catch (\Throwable) {
            // Non-critical — sprint status is already saved
        }
    }
}
