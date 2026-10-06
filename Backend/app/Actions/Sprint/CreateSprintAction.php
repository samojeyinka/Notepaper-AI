<?php

namespace App\Actions\Sprint;

use App\Contracts\Actions\CreatesSprint;
use App\Enums\SprintStatus;
use App\Jobs\GenerateSprintJob;
use App\Models\Sprint;
use App\Models\User;
use App\Services\MaterialExtractorService;
use Illuminate\Support\Facades\DB;

class CreateSprintAction implements CreatesSprint
{
    public function __invoke(User $user, array $data): Sprint
    {
        $uploads = $data['uploads'] ?? [];
        $materialUploads = $this->extractUploadedFiles($uploads);

        $sprint = DB::transaction(function () use ($user, $data, $materialUploads): Sprint {
            return Sprint::create([
                'user_id'          => $user->id,
                'title'            => $data['title'],
                'goal'             => $data['goal'] ?? null,
                'start_date'       => $data['start_date'],
                'end_date'         => $data['end_date'],
                'material_ids'     => $data['material_ids'] ?? [],
                'material_uploads' => $materialUploads ?: null,
                'status'           => SprintStatus::Generating,
            ]);
        });

        DB::afterCommit(fn () => GenerateSprintJob::dispatch($sprint)->onQueue('ai'));

        return $sprint;
    }

    /** @return array<int, array{name: string, extracted: string}> */
    private function extractUploadedFiles(array $files): array
    {
        $results = [];

        foreach ($files as $file) {
            $text = MaterialExtractorService::extractFromUploadedFile($file);

            if ($text) {
                $results[] = [
                    'name'      => $file->getClientOriginalName(),
                    'extracted' => $text,
                ];
            }
        }

        return $results;
    }
}
