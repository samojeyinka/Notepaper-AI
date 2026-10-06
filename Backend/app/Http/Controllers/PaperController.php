<?php

namespace App\Http\Controllers;

use App\Http\Requests\PaperRequest;
use App\Http\Resources\PaperResource;
use App\Models\Paper;
use App\QueryFilters\PaperFilter;
use App\QueryFilters\PaperVersionFilter;
use App\Services\PaperService;
use Illuminate\Http\JsonResponse;

class PaperController extends Controller
{
    public function __construct(protected PaperService $paperService) {}

    public function index(PaperFilter $filter): JsonResponse
    {
        $papers = $this->paperService->papers($filter);

        return $this->successResponse('Your papers', $papers, 200);
    }

    public function store(PaperRequest $request): JsonResponse
    {
        $paper = $this->paperService->save(null, $request->validated());

        return $this->successResponse('Paper created successfully', new PaperResource($paper), 201);
    }

    public function show(string $id): JsonResponse
    {
        $paper = $this->paperService->paper($id);
        $this->authorize('view', $paper);

        return $this->successResponse($paper->title, new PaperResource($paper), 200);
    }

    public function update(PaperRequest $request, Paper $paper): JsonResponse
    {
        $this->authorize('update', $paper);

        $paper = $this->paperService->save($paper, $request->validated());

        return $this->successResponse('Paper updated.', new PaperResource($paper), 201);
    }

    public function showPublic(string $id): JsonResponse
    {
        $paper = $this->paperService->findPublic($id);

        return $this->successResponse($paper->title, new PaperResource($paper), 200);
    }

    public function versions(PaperVersionFilter $filter, string $paperId): JsonResponse
    {
        $versions = $this->paperService->versions($filter, $paperId);

        return $this->successResponse('Saved versions', $versions, 200);
    }

    public function revert(Paper $paper, string $versionId): JsonResponse
    {
        $this->authorize('revert', $paper);

        $paper = $this->paperService->revertPaper($paper, $versionId);

        return $this->successResponse('Paper reverted.', new PaperResource($paper), 201);
    }

    public function duplicate(Paper $paper): JsonResponse
    {
        $this->authorize('duplicate', $paper);

        $paper = $this->paperService->duplicate($paper);

        return $this->successResponse('Paper duplicated.', new PaperResource($paper), 201);
    }

    public function destroy(Paper $paper): JsonResponse
    {
        $this->authorize('delete', $paper);

        $this->paperService->delete($paper);

        return $this->successResponse('Paper deleted.', null, 200);
    }

    public function presentations(string $paperId): JsonResponse
    {
        $presentations = $this->paperService->presentations($paperId);

        return $this->successResponse('Presentations', $presentations, 200);
    }
}
