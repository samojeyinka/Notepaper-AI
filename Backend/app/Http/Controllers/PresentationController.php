<?php

namespace App\Http\Controllers;

use App\Http\Requests\PresentationRequest;
use App\Http\Resources\PresentationResource;
use App\Models\Presentation;
use App\Services\PaperService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PresentationController extends Controller
{
    public function __construct(protected PaperService $paperService) {}

    public function index(Request $request): JsonResponse
    {
        [$sortBy, $sortDir] = $this->parseSort(
            $request->query('sort', 'updated_at:desc'),
            ['updated_at', 'title', 'created_at']
        );

        $presentations = $this->paperService->allPresentations($sortBy, $sortDir, $request->query('searching') ?: null);

        return $this->successResponse('Your presentations', $presentations, 200);
    }

    public function store(PresentationRequest $request): JsonResponse
    {
        $presentation = $this->paperService->savePresentations(null, array_merge(
            $request->validated(),
            ['user_id' => auth()->id()]
        ));

        return $this->successResponse(
            'Presentation saved.',
            new PresentationResource($presentation->load('paper')),
            201
        );
    }

    public function show(Presentation $presentation): JsonResponse
    {
        $this->authorize('view', $presentation);

        return $this->successResponse(
            $presentation->title,
            new PresentationResource($presentation->load('paper')),
            200
        );
    }

    public function update(PresentationRequest $request, Presentation $presentation): JsonResponse
    {
        $this->authorize('update', $presentation);

        $presentation = $this->paperService->savePresentations($presentation, $request->validated());

        return $this->successResponse(
            'Presentation updated.',
            new PresentationResource($presentation->load('paper')),
            201
        );
    }

    public function destroy(Presentation $presentation): JsonResponse
    {
        $this->authorize('delete', $presentation);

        $presentation->delete();

        return $this->successResponse('Presentation deleted.', null, 200);
    }

    private function parseSort(string $raw, array $allowed): array
    {
        [$col, $dir] = array_pad(explode(':', $raw), 2, 'desc');

        return [
            in_array($col, $allowed) ? $col : 'updated_at',
            $dir === 'asc' ? 'asc' : 'desc',
        ];
    }
}
