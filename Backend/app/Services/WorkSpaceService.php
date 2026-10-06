<?php

namespace App\Services;

use App\Models\Folder;
use App\Models\Note;
use App\Models\NoteVersion;
use App\Notifications\NoteReverted;
use App\QueryFilters\FeedFilter;
use App\QueryFilters\FolderFilter;
use App\QueryFilters\NoteFilter;
use App\QueryFilters\NoteVersionFilter;
use Illuminate\Support\Facades\DB;

class WorkSpaceService
{
    protected $folderModel;

    protected $noteModel;

    protected $noteVersionModel;

    public function __construct(Folder $folder, Note $note, NoteVersion $noteVersion)
    {
        $this->folderModel = $folder;
        $this->noteModel = $note;
        $this->noteVersionModel = $noteVersion;
    }

    public function feed(FeedFilter $filter)
    {
        $folders = $this->folderModel->query()
            ->select('id', 'name as title', DB::raw("LEFT(COALESCE(description, ''), 30) as snippet"), 'updated_at', 'color', DB::raw("'folder' as type"), 'icon');

        $notes = $this->noteModel->query()
            ->select('id', 'title', DB::raw("LEFT(COALESCE(content, ''), 30) as snippet"), 'updated_at', 'paper_background_color as color', DB::raw("'note' as type"), DB::raw("'file' as icon"));

        $query = $notes->union($folders);
        $feed = $this->noteModel->query()
            ->withoutGlobalScopes()
            ->fromSub($query, 'combined_feed');

        $filteredFeed = $filter->apply($feed);

        // Apply default sort ONLY if no sort was provided by the filter
        if (empty($filteredFeed->getQuery()->orders)) {
            $filteredFeed->orderBy('updated_at', 'desc');
        }

        return $filteredFeed->paginate(15);
    }

    public function folders(FolderFilter $filter)
    {
        $query = $this->folderModel->query()
            ->select('id', 'name', 'icon', 'color', 'shape', 'description', 'updated_at');

        $filteredQuery = $filter->apply($query);

        // Apply default sort ONLY if no sort was provided by the filter
        if (empty($filteredQuery->getQuery()->orders)) {
            $filteredQuery->orderBy('updated_at', 'desc');
        }

        return $filteredQuery->paginate(6);
    }

    public function create(array $validated)
    {

        $folder = $this->folderModel->create(array_filter([
            'name'        => $validated['name'],
            'description' => $validated['description'] ?? null,
            'color'       => $validated['color'] ?? null,
            'icon'        => $validated['icon'] ?? null,
            'shape'       => $validated['shape'] ?? null,
        ], fn ($value) => ! is_null($value)));

        return $folder;

    }

    public function folder(string $id)
    {
        $folder = $this->folderModel->with('notes')->findOrFail($id);

        return $folder;
    }

    public function updateFolder(array $validated, string $id)
    {

        $folder = $this->folderModel->findOrFail($id);

        $folder->update(array_filter([
            'name'        => $validated['name'],
            'description' => $validated['description'] ?? null,
            'color'       => $validated['color'] ?? null,
            'shape'       => $validated['shape'] ?? null,
        ], fn ($value) => ! is_null($value)));

        return $folder;

    }

    public function notes(NoteFilter $filter)
    {
        $query = $this->noteModel->query()
            ->select('id', 'folder_id', 'title', 'is_pinned', 'updated_at', DB::raw('LEFT(content, 500) as snippet'))
            ->with('folder:id,name,color,icon,shape');

        $filteredQuery = $filter->apply($query);

        if (empty($filteredQuery->getQuery()->orders)) {
            $filteredQuery->orderBy('updated_at', 'desc');
        }

        return $filteredQuery->paginate(6);
    }

    public function save(?Note $note, array $data): Note
    {
        return DB::transaction(function () use ($note, $data) {

            if ($note) {
                $note->update($data);
                $this->snapshotIfNeeded($note, $data);
            } else {

                $note = $this->noteModel->create($data);
            }

            return $note->fresh('noteVersions');
        });
    }

    private function snapshotIfNeeded(Note $note, array $data): void
    {

        if (! array_key_exists('content', $data)) {
            return;
        }

        $lastVersion = $note->noteVersions()->latest()->first();

        $shouldSnapshot = is_null($lastVersion)
            || $lastVersion->created_at->diffInMinutes(now()) >= 5;

        if ($shouldSnapshot) {
            $note->noteVersions()->create(['content' => $data['content'] ?? '']);
        }
    }

    public function revertNote(Note $note, string $versionId): Note
    {
        $version = $note->noteVersions()->findOrFail($versionId);

        $note = DB::transaction(function () use ($note, $version): Note {
            $note->noteVersions()->create([
                'content' => $note->content ?? '',
            ]);

            $note->update([
                'content' => $version->content,
            ]);

            return $note->fresh('noteVersions');
        });

        auth()->user()->notify(new NoteReverted($note, $version));

        return $note;
    }

    public function note(string $id)
    {
        $note = $this->noteModel->with('folder:id,name,color,icon,shape')->findOrFail($id);

        return $note;
    }

    public function findPublic(string $id): Note
    {
        return $this->noteModel->findOrFail($id);
    }

    public function versions(NoteVersionFilter $filter, string $note)
    {
        // Triggers BelongsToUser global scope — 404 if the note doesn't belong to the auth user.
        $this->noteModel->findOrFail($note);

        $query = $this->noteVersionModel->query()
            ->select('id', 'note_id', 'content', 'created_at')
            ->where('note_id', $note);

        $filteredQuery = $filter->apply($query);

        if (empty($filteredQuery->getQuery()->orders)) {
            $filteredQuery->orderBy('created_at', 'desc');
        }

        return $filteredQuery->paginate(15);
    }

    public function duplicate(Note $note)
    {
        $newNote = $note->replicate();
        $newNote->title = 'Copy of ' . $note->title;
        $newNote->save();

        return $newNote;
    }

    public function deleteNote(Note $note): void
    {
        $note->delete();
    }

    public function deleteFolder(string $id): void
    {
        DB::transaction(function () use ($id) {
            $folder = $this->folderModel->findOrFail($id);

            $folder->notes()->delete();
            $folder->papers()->delete();
            $folder->flashcards()->delete();
            $folder->delete();
        });
    }
}
