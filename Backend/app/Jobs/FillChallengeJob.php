<?php

namespace App\Jobs;

use App\Ai\Agents\ChallengeFillAgent;
use App\Contracts\Actions\FillsSprintChallenge;
use App\Models\Sprint;
use App\Models\SprintChallenge;
use App\Services\AiKeyService;
use App\Services\MaterialExtractorService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class FillChallengeJob implements ShouldQueue
{
    use Queueable;

    private const CHAR_LIMIT_PER_PAGE = 2500;

    private const MAX_PAGES = 20;

    private const MAX_MATERIALS = 15;

    public int $tries = 4;

    public int $timeout = 90;

    public int $backoff = 30;

    public function __construct(public readonly SprintChallenge $challenge) {}

    public function handle(FillsSprintChallenge $fill): void
    {
        try {
            $sprint = $this->challenge->sprint()->with('user')->first();

            if (! $sprint) {
                return;
            }

            /** @var Sprint $sprint */
            if (app(AiKeyService::class)->applyFor($sprint->user) === null) {
                return;
            }

            $materialContext = $this->buildMaterialContext($sprint);

            $agent = new ChallengeFillAgent(
                challenge: $this->challenge,
                materialContext: $materialContext,
                sprintTitle: $sprint->title,
            );

            $result = $agent->prompt('');
            $content = json_decode((string) $result, true);

            if (! empty($content)) {
                ($fill)($this->challenge, $content);
            }
        } catch (\Throwable $e) {
            Log::warning('FillChallengeJob attempt failed', [
                'challenge_id' => $this->challenge->id,
                'attempt'      => $this->attempts(),
                'error'        => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    private function buildMaterialContext(Sprint $sprint): string
    {
        $materialIds = $sprint->material_ids ?? [];

        $excerpts = [];
        $count = 0;

        foreach ($materialIds as $material) {
            if ($count >= self::MAX_MATERIALS) {
                break;
            }

            $type = $material['type'] ?? '';
            $text = MaterialExtractorService::extract($type, $material['id'] ?? '', self::CHAR_LIMIT_PER_PAGE, self::MAX_PAGES);

            if ($text) {
                $excerpts[] = $text;
                $count++;
            }
        }

        return implode("\n\n---\n\n", $excerpts);
    }
}
