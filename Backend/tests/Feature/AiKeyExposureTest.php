<?php

namespace Tests\Feature;

use App\Enums\AiProvider;
use App\Models\User;
use App\Models\UserAiCredential;
use App\Services\AiKeyService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Mockery\MockInterface;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class AiKeyExposureTest extends TestCase
{
    use RefreshDatabase;

    private const PLAINTEXT_KEY = 'sk-super-secret-value-1234567890';

    private function bearerFor(User $user): string
    {
        return 'Bearer ' . JWTAuth::fromUser($user);
    }

    public function test_index_never_returns_the_decrypted_api_key(): void
    {
        $user = User::factory()->create();

        UserAiCredential::create([
            'user_id'    => $user->id,
            'provider'   => AiProvider::DEEPSEEK->value,
            'key'        => self::PLAINTEXT_KEY,
            'is_default' => true,
        ]);

        $response = $this->withHeader('Authorization', $this->bearerFor($user))
            ->getJson('/api/v1/ai/key');

        $response->assertOk()
            ->assertJsonPath('data.providers.deepseek.has_key', true)
            ->assertJsonPath('data.providers.deepseek.is_default', true);

        $body = $response->getContent();

        $this->assertStringNotContainsString(self::PLAINTEXT_KEY, $body, 'Raw API key leaked in the index response.');
        $this->assertStringNotContainsString('"key"', $body, 'A plaintext key field is still present in the payload.');

        // The masked hint is still expected so the UI can show which key is saved.
        $this->assertNotNull($response->json('data.providers.deepseek.masked_key'));
    }

    public function test_store_response_does_not_echo_the_key(): void
    {
        $user = User::factory()->create();

        $this->mock(AiKeyService::class, function (MockInterface $mock): void {
            $mock->shouldReceive('setDefault');
        });

        $response = $this->withHeader('Authorization', $this->bearerFor($user))
            ->postJson('/api/v1/ai/key', [
                'provider' => 'deepseek',
                'key'      => self::PLAINTEXT_KEY,
            ]);

        $response->assertOk();

        $this->assertStringNotContainsString(self::PLAINTEXT_KEY, $response->getContent());

        $this->assertDatabaseHas('user_ai_credentials', [
            'user_id'  => $user->id,
            'provider' => 'deepseek',
        ]);
    }

    public function test_key_is_encrypted_at_rest(): void
    {
        $user = User::factory()->create();

        UserAiCredential::create([
            'user_id'    => $user->id,
            'provider'   => AiProvider::DEEPSEEK->value,
            'key'        => self::PLAINTEXT_KEY,
            'is_default' => true,
        ]);

        $stored = DB::table('user_ai_credentials')
            ->where('user_id', $user->id)
            ->value('key');

        $this->assertNotSame(self::PLAINTEXT_KEY, $stored, 'Key is stored in plaintext.');
        $this->assertStringNotContainsString(self::PLAINTEXT_KEY, $stored);

        // ...but the cast still returns the real key for server-side use.
        $credential = UserAiCredential::query()->where('user_id', $user->id)->first();
        $this->assertSame(self::PLAINTEXT_KEY, $credential->key);
    }

    public function test_key_for_returns_the_decrypted_key_for_server_side_use(): void
    {
        $user = User::factory()->create();

        UserAiCredential::create([
            'user_id'    => $user->id,
            'provider'   => AiProvider::GEMINI->value,
            'key'        => self::PLAINTEXT_KEY,
            'is_default' => true,
        ]);

        $service = app(AiKeyService::class);

        $this->assertSame(self::PLAINTEXT_KEY, $service->keyFor($user, AiProvider::GEMINI));
        $this->assertNull($service->keyFor($user, AiProvider::CLAUDE));
    }

    public function test_index_exposes_the_model_presets_without_any_key_material(): void
    {
        $user = User::factory()->create();

        $response = $this->withHeader('Authorization', $this->bearerFor($user))
            ->getJson('/api/v1/ai/key');

        $response->assertOk()
            ->assertJsonPath('data.presets.gemini.default_model', 'gemini-3-flash-preview');

        $geminiIds = array_column($response->json('data.presets.gemini.models', []), 'id');

        $this->assertContains('gemini-2.5-flash-lite', $geminiIds, 'The cheapest Gemini tier must stay selectable.');
        $this->assertContains('gemini-2.5-flash', $geminiIds);
        $this->assertContains('gemini-2.0-flash', $geminiIds);

        // Every advertised model must carry the metadata the selector renders.
        foreach ($response->json('data.presets.gemini.models', []) as $model) {
            $this->assertNotEmpty($model['id']);
            $this->assertNotEmpty($model['label']);
            $this->assertContains($model['kind'], ['fast', 'balanced', 'smart']);
        }

        $this->assertStringNotContainsString('"key"', $response->getContent());
    }
}
