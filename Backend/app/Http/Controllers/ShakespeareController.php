<?php

namespace App\Http\Controllers;

use App\Ai\Agents\SalesCoach;
use App\Http\Requests\ShakespeareAskRequest;
use App\Services\AiKeyService;
use Illuminate\Http\JsonResponse;

class ShakespeareController extends Controller
{
    public function __construct(protected AiKeyService $aiKeys) {}

    public function ask(ShakespeareAskRequest $request): JsonResponse
    {
        if ($this->aiKeys->applyFor($request->user()) === null) {
            return $this->errorResponse('Add your AI API key in Settings to use this feature.', 428);
        }

        $question = $request->validated()['question'];
        $response = (new SalesCoach)->prompt($question);

        return $this->successResponse('Shakespeare rewrite', ['analysis' => (string) $response]);
    }
}
