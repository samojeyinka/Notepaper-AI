<?php

namespace App\Http\Controllers;

use App\Enums\AiProvider;
use App\Http\Requests\GenerateImageRequest;
use App\Http\Requests\GenerateTextRequest;
use App\Services\AiErrorTranslator;
use App\Services\AiKeyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Laravel\Ai\AnonymousAgent;
use Laravel\Ai\Messages\Message;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Proxies AI calls through the backend so the user's provider key is decrypted
 * server-side only and is never serialised to the browser.
 */
class AiProxyController extends Controller
{
    /**
     * Gemini endpoint that returns image bytes inline.
     */
    private const GEMINI_IMAGE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent';

    public function __construct(
        protected AiKeyService $aiKeys,
        protected AiErrorTranslator $errors,
    ) {}

    /**
     * POST /ai/proxy/text
     * Run a single text completion using the caller's default provider.
     */
    public function text(GenerateTextRequest $request): JsonResponse
    {
        $data = $request->validated();

        $provider = $this->aiKeys->applyFor($request->user());

        if ($provider === null) {
            return $this->errorResponse('Add your AI API key in Settings to use this feature.', 428);
        }

        $agent = new AnonymousAgent(
            $data['system'] ?? 'You are a helpful assistant.',
            [new Message('user', $data['prompt'])],
            [],
        );

        try {
            $text = $agent->prompt(
                '',
                provider: $provider->configProvider(),
                model: $data['model'] ?? null,
                timeout: 120,
            );
        } catch (\Throwable $e) {
            report($e);

            return $this->errorResponse($this->errors->friendly($e, $provider), 502);
        }

        return $this->successResponse('Generated', [
            'text'     => (string) $text,
            'provider' => $provider->value,
        ]);
    }

    /**
     * POST /ai/proxy/stream
     * Server-sent events so the UI can render tokens as they arrive.
     */
    public function stream(GenerateTextRequest $request): StreamedResponse|JsonResponse
    {
        $data = $request->validated();

        $provider = $this->aiKeys->applyFor($request->user());

        if ($provider === null) {
            return $this->errorResponse('Add your AI API key in Settings to use this feature.', 428);
        }

        $agent = new AnonymousAgent(
            $data['system'] ?? 'You are a helpful assistant.',
            [new Message('user', $data['prompt'])],
            [],
        );

        $configName = $provider->configProvider();

        return response()->stream(function () use ($agent, $configName, $provider, $data): void {
            try {
                $stream = $agent->stream(
                    '',
                    provider: $configName,
                    model: $data['model'] ?? null,
                    timeout: 120,
                );

                foreach ($stream as $chunk) {
                    echo 'data: ' . json_encode(['delta' => (string) $chunk]) . "\n\n";
                    flush();
                }
            } catch (\Throwable $e) {
                report($e);

                echo 'data: ' . json_encode(['error' => $this->errors->friendly($e, $provider)]) . "\n\n";
                flush();
            }

            echo "data: [DONE]\n\n";
            flush();
        }, 200, [
            'Content-Type'      => 'text/event-stream',
            'Cache-Control'     => 'no-cache',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    /**
     * POST /ai/proxy/image
     * Image generation requires a Gemini key specifically.
     */
    public function image(GenerateImageRequest $request): JsonResponse
    {
        $geminiKey = $this->aiKeys->keyFor($request->user(), AiProvider::GEMINI);

        if ($geminiKey === null) {
            return $this->errorResponse('Add a Google Gemini API key in Settings to generate images.', 428);
        }

        try {
            $response = Http::withQueryParameters(['key' => $geminiKey])
                ->timeout(120)
                ->post(self::GEMINI_IMAGE_URL, [
                    'contents' => [
                        ['parts' => [['text' => $request->validated()['prompt']]]],
                    ],
                    'generationConfig' => ['responseModalities' => ['IMAGE', 'TEXT']],
                ]);
        } catch (\Throwable $e) {
            report($e);

            return $this->errorResponse('Could not reach the image provider.', 502);
        }

        if ($response->failed()) {
            $message = $this->errors->friendly(
                new \RuntimeException((string) ($response->json('error.message') ?? 'Image generation failed.')),
                AiProvider::GEMINI,
            );

            return $this->errorResponse($message, 502);
        }

        $part = collect($response->json('candidates.0.content.parts', []))
            ->first(fn ($part) => isset($part['inlineData']));

        if (! $part) {
            return $this->errorResponse('No image was returned. Try rephrasing your prompt.', 502);
        }

        return $this->successResponse('Image generated', [
            'mime_type' => $part['inlineData']['mimeType'] ?? 'image/png',
            'data'      => $part['inlineData']['data'] ?? null,
        ]);
    }
}
