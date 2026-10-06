<?php

namespace App\Jobs;

use App\Ai\Agents\StudyPlannerAgent;
use App\Contracts\Actions\ActivatesStudyPlan;
use App\Enums\StudyPlanActivity;
use App\Enums\StudyPlanStatus;
use App\Enums\WeekDay;
use App\Events\StudyPlanGenerationProgress;
use App\Models\StudyPlan;
use App\Notifications\StudyPlanFailed;
use App\Services\AiKeyService;
use App\Services\MaterialExtractorService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class GenerateStudyPlanJob implements ShouldQueue
{
    use Queueable;

    private const CHAR_LIMIT_PER_PAGE = 2500;

    private const MAX_PAGES = 20;

    private const MAX_MATERIALS = 15;

    public int $tries = 2;

    public int $timeout = 180;

    public function __construct(public readonly StudyPlan $studyPlan) {}

    public function handle(ActivatesStudyPlan $activate): void
    {
        try {
            if (app(AiKeyService::class)->applyFor($this->studyPlan->user) === null) {
                $this->markFailed();

                return;
            }

            $this->broadcast('Collecting your study materials…', 10);

            $summaries = $this->collectMaterialSummaries();

            $this->broadcast('Planning your study schedule…', 35);

            $plan = $this->studyPlan;

            $result = (new StudyPlannerAgent(
                name: $plan->name,
                examDate: $plan->exam_date->toDateString(),
                startDate: $plan->start_date->toDateString(),
                studyFrom: $plan->study_from,
                studyTo: $plan->study_to,
                activeDays: $plan->active_days?->map(fn (WeekDay $day) => $day->value)->all() ?? [],
                enabledActivities: $plan->enabled_activities?->map(fn (StudyPlanActivity $activity) => $activity->value)->all() ?? [],
                materialSummaries: $summaries,
            ))->prompt('');

            $data = json_decode((string) $result, true);

            if (empty($data['schedule'])) {
                $this->markFailed();

                return;
            }

            $this->broadcast('Finalising your plan…', 85);

            ($activate)($plan, $data['schedule']);

            $this->broadcast('Your study plan is ready!', 100, $data['schedule']);
        } catch (\Throwable $e) {
            Log::error('GenerateStudyPlanJob failed', [
                'plan_id' => $this->studyPlan->id,
                'error'   => $e->getMessage(),
            ]);

            $this->markFailed();
        }
    }

    private function collectMaterialSummaries(): array
    {
        $materialIds = $this->studyPlan->material_ids ?? [];

        $summaries = [];

        foreach (array_slice($materialIds, 0, self::MAX_MATERIALS) as $material) {
            $text = MaterialExtractorService::extract(
                $material['type'] ?? '',
                $material['id'] ?? '',
                self::CHAR_LIMIT_PER_PAGE,
                self::MAX_PAGES
            );

            if ($text) {
                $summaries[] = $text;
            }
        }

        return $summaries;
    }

    private function broadcast(string $message, int $progress, ?array $schedule = null): void
    {
        try {
            StudyPlanGenerationProgress::dispatch($this->studyPlan->id, $message, $progress, $schedule);
        } catch (\Throwable) {
            // Reverb unavailable — non-critical
        }
    }

    private function markFailed(): void
    {
        $this->studyPlan->update(['status' => StudyPlanStatus::Failed]);

        try {
            StudyPlanGenerationProgress::dispatch($this->studyPlan->id, 'Generation failed. Please try again.', -1);
        } catch (\Throwable) {
            // Reverb unavailable
        }

        try {
            $this->studyPlan->user->notify(new StudyPlanFailed($this->studyPlan));
        } catch (\Throwable) {
            // Non-critical — plan status is already saved
        }
    }
}
