<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\AiKeyService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery\MockInterface;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class AiProxyKeyRequirementTest extends TestCase
{
    use RefreshDatabase;

    private function bearerFor(User $user): string
    {
        return 'Bearer ' . JWTAuth::fromUser($user);
    }

    public function test_text_proxy_requires_a_configured_key(): void
    {
        $user = User::factory()->create();

        $this->mock(AiKeyService::class, function (MockInterface $mock): void {
            $mock->shouldReceive('applyFor')->once()->andReturnNull();
        });

        $this->withHeader('Authorization', $this->bearerFor($user))
            ->postJson('/api/v1/ai/proxy/text', ['prompt' => 'Hello'])
            ->assertStatus(428)
            ->assertJsonPath('status', 'error');
    }

    public function test_text_proxy_validates_prompt_length(): void
    {
        $user = User::factory()->create();

        $this->withHeader('Authorization', $this->bearerFor($user))
            ->postJson('/api/v1/ai/proxy/text', ['prompt' => str_repeat('a', 20001)])
            ->assertStatus(422)
            ->assertJsonValidationErrors('prompt');
    }

    public function test_image_proxy_requires_a_gemini_key(): void
    {
        $user = User::factory()->create();

        $this->mock(AiKeyService::class, function (MockInterface $mock): void {
            $mock->shouldReceive('keyFor')->once()->andReturnNull();
        });

        $this->withHeader('Authorization', $this->bearerFor($user))
            ->postJson('/api/v1/ai/proxy/image', ['prompt' => 'A cat'])
            ->assertStatus(428);
    }

    public function test_proxy_endpoints_reject_unauthenticated_callers(): void
    {
        $this->postJson('/api/v1/ai/proxy/text', ['prompt' => 'Hello'])->assertUnauthorized();
        $this->postJson('/api/v1/ai/proxy/image', ['prompt' => 'A cat'])->assertUnauthorized();
        $this->postJson('/api/v1/ai/proxy/stream', ['prompt' => 'Hello'])->assertUnauthorized();
    }
}
