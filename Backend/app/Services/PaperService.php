<?php

namespace App\Services;

use App\Models\Paper;
use App\Models\PaperVersion;
use App\Models\Presentation;
use App\Notifications\PaperReverted;
use App\QueryFilters\PaperFilter;
use App\QueryFilters\PaperVersionFilter;
use Illuminate\Support\Facades\DB;

class PaperService
{
    public function __construct(
        protected Paper $paperModel,
        protected PaperVersion $paperVersionModel,
        protected Presentation $presentationModel
    ) {}

    public function papers(PaperFilter $filter)
    {
        $query = $this->paperModel->query()
            ->select('id', 'folder_id', 'title', 'is_pinned', 'updated_at', DB::raw('LEFT(content, 500) as snippet'))
            ->with('folder:id,name,color,icon,shape');

        $filteredQuery = $filter->apply($query);

        if (empty($filteredQuery->getQuery()->orders)) {
            $filteredQuery->orderBy('updated_at', 'desc');
        }

        return $filteredQuery->paginate(6);
    }

    public function save(?Paper $paper, array $data): Paper
    {
        return DB::transaction(function () use ($paper, $data) {
            if ($paper) {
                $paper->update($data);
                $this->snapshotIfNeeded($paper, $data);
            } else {
                $paper = $this->paperModel->create($data);
            }

            return $paper->fresh('paperVersions');
        });
    }

    private function snapshotIfNeeded(Paper $paper, array $data): void
    {
        if (! array_key_exists('content', $data)) {
            return;
        }

        $lastVersion = $paper->paperVersions()->latest()->first();

        $shouldSnapshot = is_null($lastVersion)
            || $lastVersion->created_at->diffInMinutes(now()) >= 5;

        if ($shouldSnapshot) {
            $paper->paperVersions()->create(['content' => $data['content'] ?? '']);
        }
    }

    public function revertPaper(Paper $paper, string $versionId): Paper
    {
        $version = $paper->paperVersions()->findOrFail($versionId);

        $paper = DB::transaction(function () use ($paper, $version): Paper {
            $paper->paperVersions()->create([
                'content' => $paper->content ?? '',
            ]);

            $paper->update([
                'content' => $version->content,
            ]);

            return $paper->fresh('paperVersions');
        });

        auth()->user()->notify(new PaperReverted($paper, $version));

        return $paper;
    }

    public function paper(string $id): Paper
    {
        return $this->paperModel->with('folder:id,name,color,icon,shape')->findOrFail($id);
    }

    public function findPublic(string $id): Paper
    {
        return $this->paperModel->findOrFail($id);
    }

    public function versions(PaperVersionFilter $filter, string $paperId)
    {
        $query = $this->paperVersionModel->query()
            ->select('id', 'paper_id', 'content', 'created_at')
            ->where('paper_id', $paperId);

        $filteredQuery = $filter->apply($query);

        if (empty($filteredQuery->getQuery()->orders)) {
            $filteredQuery->orderBy('created_at', 'desc');
        }

        return $filteredQuery->paginate(15);
    }

    public function delete(Paper $paper): void
    {
        $paper->delete();
    }

    public function duplicate(Paper $paper): Paper
    {
        $newPaper = $paper->replicate();
        $newPaper->title = 'Copy of ' . $paper->title;
        $newPaper->save();

        return $newPaper;
    }

    public function presentations(string $paperId)
    {
        return $this->presentationModel->query()
            ->where('paper_id', $paperId)
            ->orderBy('updated_at', 'desc')
            ->get();
    }

    public function savePresentations(?Presentation $presentation, array $data): Presentation
    {
        if ($presentation) {
            $presentation->update($data);

            return $presentation->fresh();
        }

        return $this->presentationModel->create($data);
    }

    public function allPresentations(string $sortBy = 'updated_at', string $sortDir = 'desc', ?string $searching = null)
    {
        return $this->presentationModel->query()
            ->with('paper:id,title')
            ->when($searching, fn ($q) => $q->where('title', 'like', "%{$searching}%"))
            ->orderBy($sortBy, $sortDir)
            ->paginate(12);
    }
}
