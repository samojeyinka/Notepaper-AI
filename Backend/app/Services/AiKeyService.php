<?php

namespace App\Services;

use App\Enums\AiProvider;
use App\Models\User;
use App\Models\UserAiCredential;
use Illuminate\Support\Facades\Config;
use Laravel\Ai\Ai;
use Laravel\Ai\AnonymousAgent;
use Laravel\Ai\Messages\Message;
use RuntimeException;

class AiKeyService
{
    public function __construct(protected AiErrorTranslator $errors) {}

    /**
     * Point the AI layer at the user's credentials so subsequent agent prompts
     * use their chosen provider, API key, and model.
     *
     * Returns the applied provider, or null when the user has no credential.
     *
     * @throws RuntimeException when the provider uses a different config name
     */
    public function applyFor(?User $user, ?AiProvider $forceProvider = null): ?AiProvider
    {
        $credential = $this->credentialFor($user, $forceProvider);

        if (! $credential) {
            return null;
        }

        $configName = $credential->provider->configProvider();

        Config::set("ai.providers.{$configName}.key", $credential->key);

        if ($credential->model) {
            foreach (['default', 'cheapest', 'smartest'] as $tier) {
                Config::set("ai.providers.{$configName}.models.text.{$tier}", $credential->model);
            }
        }

        Config::set('ai.default', $configName);
        Ai::setDefaultInstance($configName);
        Ai::purge($configName);

        return $credential->provider;
    }

    /**
     * Confirm a key is accepted by its provider with a tiny zero-cost-ish prompt.
     *
     * @throws RuntimeException when the provider rejects the key
     */
    public function verify(AiProvider $provider, string $key, ?string $model = null): bool
    {
        $configName = $provider->configProvider();

        Config::set("ai.providers.{$configName}.key", $key);

        if ($model) {
            Config::set("ai.providers.{$configName}.models.text.default", $model);
        }

        Config::set('ai.default', $configName);
        Ai::setDefaultInstance($configName);
        Ai::purge($configName);

        $model ??= config("ai_models.providers.{$provider->value}.default_model");

        $agent = new AnonymousAgent(
            'Reply with the single word OK.',
            [new Message('user', 'Say OK')],
            [],
        );

        try {
            $response = $agent->prompt('', provider: $configName, model: $model, timeout: 30);

            return str_contains(strtolower((string) $response), 'ok');
        } catch (\Throwable $e) {
            report($e);

            throw new RuntimeException($this->errors->friendly($e, $provider), previous: $e);
        }
    }

    /**
     * Decrypted key for a specific provider, for server-side use only.
     *
     * Callers must never serialise the return value into an HTTP response.
     */
    public function keyFor(?User $user, AiProvider $provider): ?string
    {
        $credential = $user?->aiCredentials()
            ->where('provider', $provider->value)
            ->first();

        return $credential?->key;
    }

    /**
     * Mark a single credential as the user's default, clearing the rest.
     */
    public function setDefault(User $user, AiProvider $provider): void
    {
        $user->aiCredentials()->update(['is_default' => false]);

        UserAiCredential::query()
            ->where('user_id', $user->id)
            ->where('provider', $provider->value)
            ->update(['is_default' => true]);
    }

    /**
     * Remove a credential and promote another to default when needed.
     */
    public function forget(User $user, AiProvider $provider): void
    {
        $deletedDefault = UserAiCredential::query()
            ->where('user_id', $user->id)
            ->where('provider', $provider->value)
            ->where('is_default', true)
            ->exists();

        UserAiCredential::query()
            ->where('user_id', $user->id)
            ->where('provider', $provider->value)
            ->delete();

        if ($deletedDefault) {
            $next = $user->aiCredentials()->orderBy('updated_at')->first();

            if ($next) {
                $user->aiCredentials()->update(['is_default' => false]);
                $next->update(['is_default' => true]);
            }
        }
    }

    private function credentialFor(?User $user, ?AiProvider $forceProvider): ?UserAiCredential
    {
        if (! $user) {
            return null;
        }

        $query = $user->aiCredentials();

        if ($forceProvider) {
            return $query->where('provider', $forceProvider->value)->first();
        }

        return $user->defaultAiCredential;
    }
}
