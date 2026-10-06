<?php

namespace App\Jobs;

use App\Ai\Agents\NoteGeneratorAgent;
use App\Events\ExpandTopicReady;
use App\Models\Note;
use App\Models\Paper;
use App\Models\User;
use App\Notifications\ExpandTopicDone;
use App\Services\AiKeyService;
use App\Services\MaterialExtractorService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class ExpandTopicJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public int $tries = 2;

    public int $timeout = 180;

    public function __construct(
        public readonly string $type,
        public readonly string $newId,
        public readonly string $sourceType,
        public readonly string $sourceId,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $user = $this->resolveUser();

            if ($user === null || app(AiKeyService::class)->applyFor($user) === null) {
                $this->markFailed();

                return;
            }

            $content = MaterialExtractorService::extract($this->sourceType, $this->sourceId, 99999, 999);

            if (! $content) {
                $this->markFailed();

                return;
            }

            $result = (new NoteGeneratorAgent(
                content: $content,
                tone: 'academic',
                length: 'detailed',
            ))->prompt('');

            $data = json_decode((string) $result, true);
            $rawContent = $data['content'] ?? '';

            if (! $rawContent) {
                $this->markFailed();

                return;
            }

            $html = $this->mdToHtml($rawContent);
            $title = $this->generateTitle($rawContent);

            if ($this->type === 'note') {
                $record = Note::find($this->newId);

                if (! $record) {
                    return;
                }

                $record->update([
                    'title'   => $title,
                    'content' => json_encode([
                        'pages'       => [$html],
                        'fontSize'    => 18,
                        'lineSpacing' => 32,
                        'drawingData' => [''],
                    ]),
                    'ai_generating' => false,
                ]);
            } else {
                $record = Paper::find($this->newId);

                if (! $record) {
                    return;
                }

                $record->update([
                    'title'   => $title,
                    'content' => json_encode([
                        'pages'       => [$html],
                        'fontSize'    => 16,
                        'lineSpacing' => 28,
                        'drawingData' => [''],
                        'paddingX'    => 96,
                        'paddingY'    => 80,
                    ]),
                    'ai_generating' => false,
                ]);
            }

            ExpandTopicReady::dispatch($this->type, $this->newId, $title);

            $record->user->notify(new ExpandTopicDone($this->type, $this->newId, $title));
        } catch (\Throwable $e) {
            Log::error('ExpandTopicJob failed', [
                'type'   => $this->type,
                'new_id' => $this->newId,
                'error'  => $e->getMessage(),
            ]);

            $this->markFailed();
        }
    }

    private function generateTitle(string $markdownContent): string
    {
        // Extract first heading or first line as title
        foreach (explode("\n", $markdownContent) as $line) {
            $line = trim($line);

            if (str_starts_with($line, '# ')) {
                return trim(substr($line, 2));
            }

            if (str_starts_with($line, '## ')) {
                return trim(substr($line, 3));
            }

            if ($line !== '') {
                return mb_substr($line, 0, 80);
            }
        }

        return 'Expanded Topic';
    }

    private function mdToHtml(string $md): string
    {
        $lines = explode("\n", $md);
        $out = [];
        $inUl = false;
        $inOl = false;

        $close = function () use (&$out, &$inUl, &$inOl) {
            if ($inUl) {
                $out[] = '</ul>';
                $inUl = false;
            }

            if ($inOl) {
                $out[] = '</ol>';
                $inOl = false;
            }
        };

        $esc = function (string $t): string {
            $safe = str_replace(['&', '<', '>'], ['&amp;', '&lt;', '&gt;'], $t);

            return (string) preg_replace(
                ['/\*\*(.+?)\*\*/', '/\*(.+?)\*/'],
                ['<strong>$1</strong>', '<em>$1</em>'],
                $safe
            );
        };

        foreach ($lines as $raw) {
            $line = rtrim($raw);

            if (str_starts_with($line, '### ')) {
                $close();
                $out[] = '<h3>' . $esc(substr($line, 4)) . '</h3>';
            } elseif (str_starts_with($line, '## ')) {
                $close();
                $out[] = '<h2>' . $esc(substr($line, 3)) . '</h2>';
            } elseif (str_starts_with($line, '# ')) {
                $close();
                $out[] = '<h1>' . $esc(substr($line, 2)) . '</h1>';
            } elseif (preg_match('/^[-*] /', $line)) {
                if (! $inUl) {
                    $close();
                    $out[] = '<ul>';
                    $inUl = true;
                }
                $out[] = '<li>' . $esc(substr($line, 2)) . '</li>';
            } elseif (preg_match('/^\d+\. /', $line)) {
                if (! $inOl) {
                    $close();
                    $out[] = '<ol>';
                    $inOl = true;
                }
                $out[] = '<li>' . $esc(preg_replace('/^\d+\. /', '', $line)) . '</li>';
            } elseif (trim($line) === '') {
                $close();
                $out[] = '<br>';
            } else {
                $close();
                $out[] = '<div>' . $esc($line) . '</div>';
            }
        }

        $close();

        return implode('', $out);
    }

    private function resolveUser(): ?User
    {
        if ($this->type === 'note') {
            return Note::find($this->newId)?->user;
        }

        return Paper::find($this->newId)?->user;
    }

    private function markFailed(): void
    {
        if ($this->type === 'note') {
            Note::where('id', $this->newId)->update(['ai_generating' => false]);
        } else {
            Paper::where('id', $this->newId)->update(['ai_generating' => false]);
        }
    }
}
