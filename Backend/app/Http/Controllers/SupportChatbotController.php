<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Support chatbot. This is the only AI surface that runs on a platform-owned key
 * rather than the caller's own BYOK credential, so the key never leaves the server.
 */
class SupportChatbotController extends Controller
{
    private const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

    /**
     * POST /support/chatbot
     */
    public function ask(Request $request): JsonResponse
    {
        $data = $request->validate([
            'message'         => ['required', 'string', 'max:2000'],
            'history'         => ['nullable', 'array', 'max:20'],
            'history.*.role'  => ['required', 'string', 'in:user,model'],
            'history.*.parts' => ['required', 'array'],
            'system'          => ['nullable', 'string', 'max:8000'],
        ]);

        $key = config('ai.providers.gemini.key');

        if (! $key) {
            Log::warning('Support chatbot requested but no platform Gemini key is configured.');

            return $this->errorResponse('The support assistant is temporarily unavailable.', 503);
        }

        $contents = $data['history'] ?? [];
        $contents[] = [
            'role'  => 'user',
            'parts' => [['text' => $data['message']]],
        ];

        try {
            $response = Http::withQueryParameters(['key' => $key])
                ->timeout(30)
                ->post(self::GEMINI_URL, [
                    'systemInstruction' => ['parts' => [['text' => $data['system'] ?? 'You are a helpful support assistant.']]],
                    'contents'          => $contents,
                    'generationConfig'  => ['maxOutputTokens' => 300, 'temperature' => 0.7],
                ]);
        } catch (\Throwable $e) {
            report($e);

            return $this->errorResponse('The support assistant is temporarily unavailable.', 502);
        }

        if ($response->failed()) {
            $message = $response->json('error.message') ?? 'The support assistant is temporarily unavailable.';

            return $this->errorResponse($message, 502);
        }

        $text = $response->json('candidates.0.content.parts.0.text');

        if (! $text) {
            return $this->errorResponse("Sorry, I couldn't generate a response.", 502);
        }

        return $this->successResponse('Reply', ['reply' => $text]);
    }
}
