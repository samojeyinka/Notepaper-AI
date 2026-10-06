<?php

namespace App\Http\Resources;

use App\Services\MaterialExtractorService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SprintResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                         => $this->id,
            'title'                      => $this->title,
            'goal'                       => $this->goal,
            'status'                     => $this->status,
            'start_date'                 => $this->start_date->toDateString(),
            'end_date'                   => $this->end_date->toDateString(),
            'challenges_count'           => $this->challenges_count,
            'challenges_filled'          => $this->challenges_filled,
            'completed_challenges_count' => $this->completed_challenges_count ?? 0,
            'material_ids'               => $this->material_ids,
            'material_extracts'          => $this->extractMaterials(),
            'challenges'                 => SprintChallengeResource::collection(
                $this->whenLoaded('challenges')
            ),
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }

    private function extractMaterials(): array
    {
        $results = [];

        foreach ($this->material_ids ?? [] as $material) {
            $type = $material['type'] ?? '';
            $id = $material['id'] ?? '';

            $results[] = [
                'type'      => $type,
                'id'        => $id,
                'extracted' => MaterialExtractorService::extract($type, $id, 2000, 20),
            ];
        }

        foreach ($this->material_uploads ?? [] as $upload) {
            $results[] = [
                'type'      => 'upload',
                'name'      => $upload['name'] ?? null,
                'extracted' => $upload['extracted'] ?? null,
            ];
        }

        return $results;
    }
}
