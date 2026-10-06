<?php

namespace App\Http\Controllers;

use App\Enums\AiProvider;
use App\Http\Requests\SaveAiKeyRequest;
use App\Models\UserAiCredential;
use App\Notifications\AiKeyAdded;
use App\Notifications\AiKeyRemoved;
use App\Services\AiKeyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AiKeyController extends Controller
{
    public function __construct(protected AiKeyService $keys) {}

    /**
     * GET /ai/key
     * The current user's saved credentials. Decrypted keys are intentionally
     * never returned; AI calls are proxied server-side instead.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $credentials = $user->aiCredentials()->get()->keyBy(fn ($c) => $c->provider->value);

        $providers = [];

        foreach (AiProvider::cases() as $provider) {
            $credential = $credentials->get($provider->value);

            $providers[$provider->value] = [
                'provider'   => $provider->value,
                'label'      => $provider->label(),
                'has_key'    => (bool) $credential,
                'model'      => $credential?->model,
                'is_default' => (bool) ($credential?->is_default ?? false),
                'masked_key' => $credential ? $this->maskKey($credential->key) : null,
            ];
        }

        return $this->successResponse('AI keys', [
            'default_provider' => $user->defaultAiCredential?->provider->value,
            'providers'        => $providers,
            'presets'          => config('ai_models.providers'),
        ], 200);
    }

    /**
     * POST /ai/key
     * Save (or replace) a provider key for the current user.
     */
    public function store(SaveAiKeyRequest $request): JsonResponse
    {
        $data = $request->validated();
        $provider = AiProvider::from($data['provider']);
        $user = $request->user();

        $credential = UserAiCredential::updateOrCreate(
            ['user_id' => $user->id, 'provider' => $provider->value],
            [
                'key'   => $data['key'],
                'model' => $data['model'] ?? null,
            ],
        );

        $makeDefault = ($data['is_default'] ?? true) || ! $user->aiCredentials()->exists();

        if ($makeDefault) {
            $this->keys->setDefault($user, $provider);
        }

        // Only confirm a genuinely new key — editing an existing one must not spam.
        if ($credential->wasRecentlyCreated) {
            $user->notify(new AiKeyAdded($provider, $credential->model));
        }

        return $this->successResponse("{$provider->label()} key saved", [
            'provider'   => $provider->value,
            'model'      => $credential->model,
            'is_default' => (bool) $credential->is_default,
        ], 200);
    }

    /**
     * POST /ai/key/verify
     * Test a key against its provider without saving it.
     */
    public function verify(Request $request): JsonResponse
    {
        $data = $request->validate([
            'provider' => ['required', Rule::in(['gemini', 'deepseek', 'openai', 'claude'])],
            'key'      => ['required', 'string', 'min:8'],
            'model'    => ['nullable', 'string', 'max:120'],
        ]);

        $provider = AiProvider::from($data['provider']);

        try {
            $this->keys->verify($provider, $data['key'], $data['model'] ?? null);
        } catch (\Throwable $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->successResponse("{$provider->label()} key looks good", ['provider' => $provider->value], 200);
    }

    /**
     * POST /ai/key/{provider}/default
     * Mark an existing credential as the user's default provider.
     */
    public function makeDefault(Request $request, string $provider): JsonResponse
    {
        $provider = AiProvider::tryFrom($provider);

        if (! $provider) {
            return $this->errorResponse('Unknown AI provider.', 422);
        }

        if (! $request->user()->aiCredentials()->where('provider', $provider->value)->exists()) {
            return $this->errorResponse("No saved key for {$provider->label()}.", 422);
        }

        $this->keys->setDefault($request->user(), $provider);

        return $this->successResponse("{$provider->label()} set as default", [
            'default_provider' => $provider->value,
        ], 200);
    }

    /**
     * DELETE /ai/key/{provider}
     */
    public function destroy(Request $request, string $provider): JsonResponse
    {
        $provider = AiProvider::tryFrom($provider);

        if (! $provider) {
            return $this->errorResponse('Unknown AI provider.', 422);
        }

        $this->keys->forget($request->user(), $provider);

        // forget() promotes another credential when it removed the last default.
        $promoted = $request->user()
            ->aiCredentials()
            ->where('is_default', true)
            ->first()?->provider;

        $request->user()->notify(new AiKeyRemoved($provider, $promoted));

        return $this->successResponse("{$provider->label()} key removed", [], 200);
    }

    private function maskKey(string $key): string
    {
        if (strlen($key) <= 8) {
            return str_repeat('•', strlen($key));
        }

        return substr($key, 0, 4) . str_repeat('•', 8) . substr($key, -4);
    }
}
