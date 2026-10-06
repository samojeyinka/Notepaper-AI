<?php

namespace Tests\Feature;

use App\Enums\AiProvider;
use App\Models\Sprint;
use App\Services\AiKeyService;
use App\Services\SprintService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery\MockInterface;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class SprintAiKeyRequirementTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array<string, mixed>
     */
    private function validPayload(): array
    {
        return [
            'title'        => 'Physics sprint',
            'start_date'   => now()->toDateString(),
            'end_date'     => now()->addWeek()->toDateString(),
            'material_ids' => [],
        ];
    }

    private function bearerFor($user): string
    {
        return 'Bearer ' . JWTAuth::fromUser($user);
    }

    public function test_creating_a_sprint_is_rejected_when_no_ai_key_is_configured(): void
    {
        $user = \App\Models\User::factory()->create();

        $this->mock(AiKeyService::class, function (MockInterface $mock): void {
            $mock->shouldReceive('applyFor')->andReturnNull();
        });

        $this->mock(SprintService::class, function (MockInterface $mock): void {
            $mock->shouldNotReceive('create');
        });

        $response = $this->withHeader('Authorization', $this->bearerFor($user))
            ->postJson('/api/v1/ai/sprints', $this->validPayload());

        $response->assertStatus(428)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'Add your AI API key in Settings to use this feature.');

        $this->assertSame(0, Sprint::count());
    }

    public function test_creating_a_sprint_proceeds_when_an_ai_key_is_configured(): void
    {
        $user = \App\Models\User::factory()->create();

        $sprint = Sprint::create([
            'user_id'    => $user->id,
            'title'      => 'Physics sprint',
            'start_date' => now(),
            'end_date'   => now()->addWeek(),
        ]);

        $this->mock(AiKeyService::class, function (MockInterface $mock): void {
            $mock->shouldReceive('applyFor')->once()->andReturn(AiProvider::DEEPSEEK);
        });

        $this->mock(SprintService::class, function (MockInterface $mock) use ($sprint): void {
            $mock->shouldReceive('create')->once()->andReturn($sprint);
        });

        $response = $this->withHeader('Authorization', $this->bearerFor($user))
            ->postJson('/api/v1/ai/sprints', $this->validPayload());

        $response->assertCreated()
            ->assertJsonPath('data.id', $sprint->id);
    }
}
