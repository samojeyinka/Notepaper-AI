<?php

namespace App\Http\Controllers;

use App\Http\Requests\FolderRequest;
use App\Http\Requests\NoteRequest;
use App\Http\Resources\FeedResource;
use App\Http\Resources\FolderResource;
use App\Http\Resources\NoteResource;
use App\Models\Folder;
use App\Models\Note;
use App\QueryFilters\FeedFilter;
use App\QueryFilters\FolderFilter;
use App\QueryFilters\NoteFilter;
use App\QueryFilters\NoteVersionFilter;
use App\Services\WorkSpaceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkSpaceController extends Controller
{
    public function __construct(protected WorkSpaceService $workSpaceService) {}

    public function feed(FeedFilter $filter): JsonResponse
    {

        $feed = $this->workSpaceService->feed($filter)->through(fn ($item) => new FeedResource($item));

        return $this->successResponse(
            'Your folders and notes',
            $feed,
            201
        );

    }

    public function folders(FolderFilter $filter): JsonResponse
    {
        $folders = $this->workSpaceService->folders($filter)->through(fn ($item) => new FolderResource($item));

        return $this->successResponse(
            'Your folders',
            $folders,
            200
        );
    }

    public function create(FolderRequest $request): JsonResponse
    {
        $folder = $this->workSpaceService->create($request->validated());

        return $this->successResponse(
            $folder['name'] . ' has been created successfuly',
            new FolderResource($folder),
            201
        );
    }

    public function folder(Request $request): JsonResponse
    {

        $folder = $this->workSpaceService->folder($request->id);

        return $this->successResponse(
            $folder['name'],
            $folder,
            200
        );
    }

    public function updateFolder(FolderRequest $request): JsonResponse
    {
        $folder = Folder::findOrFail($request->id);
        $this->authorize('update', $folder);

        $folder = $this->workSpaceService->updateFolder($request->validated(), $folder->id);

        return $this->successResponse(
            $folder['name'] . ' has been updated successfuly',
            new FolderResource($folder),
            201
        );
    }

    public function notes(NoteFilter $filter): JsonResponse
    {
        $notes = $this->workSpaceService->notes($filter);

        return $this->successResponse(
            'Your notes',
            $notes,
            200
        );
    }

    public function store(NoteRequest $request)
    {
        $note = $this->workSpaceService->save(null, $request->validated());

        return $this->successResponse(
            'Note created successfully',
            new NoteResource($note),
            201
        );
    }

    public function update(NoteRequest $request, Note $note)
    {
        $this->authorize('update', $note);

        $note = $this->workSpaceService->save($note, $request->validated());

        return $this->successResponse(
            'Note has been updated.',
            new NoteResource($note),
            201
        );
    }

    public function revert(Note $note, string $versionId)
    {
        $this->authorize('revert', $note);

        $note = $this->workSpaceService->revertNote($note, $versionId);

        return $this->successResponse(
            'Note reverted.',
            new NoteResource($note),
            201
        );
    }

    public function note(string $id): JsonResponse
    {
        $note = $this->workSpaceService->note($id);
        $this->authorize('view', $note);

        return $this->successResponse(
            $note['title'],
            new NoteResource($note),
            200
        );
    }

    public function showPublic(string $id): JsonResponse
    {
        $note = $this->workSpaceService->findPublic($id);

        return $this->successResponse(
            $note->title,
            new NoteResource($note),
            200
        );
    }

    public function versions(NoteVersionFilter $filter, $note): JsonResponse
    {
        $versions = $this->workSpaceService->versions($filter, $note);

        return $this->successResponse(
            'Saved Versions',
            $versions,
            200
        );

    }

    public function duplicate(Note $note): JsonResponse
    {
        $this->authorize('duplicate', $note);

        $note = $this->workSpaceService->duplicate($note);

        return $this->successResponse(
            'Note duplicated.',
            new NoteResource($note),
            201
        );

    }

    public function destroyNote(Note $note): JsonResponse
    {
        $this->authorize('delete', $note);

        $this->workSpaceService->deleteNote($note);

        return $this->successResponse('Note deleted.', null, 200);
    }

    public function destroyFolder(Request $request): JsonResponse
    {
        $folder = Folder::findOrFail($request->id);
        $this->authorize('delete', $folder);

        $this->workSpaceService->deleteFolder($folder->id);

        return $this->successResponse('Folder deleted.', null, 200);
    }
}
