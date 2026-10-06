<?php

namespace Tests\Feature;

use App\Enums\AiProvider;
use App\Models\User;
use App\Models\UserAiCredential;
use App\Notifications\AiKeyAdded;
use App\Notifications\AiKeyRemoved;
use App\Services\AiKeyService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Mockery\MockInterface;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class AiKeyNotificationTest extends TestCase
{
    use RefreshDatabase;

    private const TEST_KEY = 'sk-notification-test-key-1234567890';

    private function bearerFor(User $user): string
    {
        return 'Bearer ' . JWTAuth::fromUser($user);
    }

    public function test_adding_a_first_key_notifies_over_mail_database_and_broadcast(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $response = $this->withHeader('Authorization', $this->bearerFor($user))
            ->postJson('/api/v1/ai/key', [
                'provider' => 'gemini',
                'key'      => self::TEST_KEY,
                'model'    => 'gemini-2.5-flash-lite',
            ]);

        $response->assertOk();

        Notification::assertSentTo(
            $user,
            AiKeyAdded::class,
            function (AiKeyAdded $notification, array $channels, User $notifiable) use ($user): bool {
                $this->assertSame($user->id, $notifiable->id);
                $this->assertSame(AiProvider::GEMINI, $notification->provider);
                $this->assertSame('gemini-2.5-flash-lite', $notification->model);
                $this->assertSame(['mail', 'database', 'broadcast'], $channels);
                $this->assertSame('ai_key_added', $notification->toArray($notifiable)['type']);

                return true;
            }
        );
    }

    public function test_replacing_an_existing_key_does_not_notify_again(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        UserAiCredential::create([
            'user_id'    => $user->id,
            'provider'   => AiProvider::DEEPSEEK->value,
            'key'        => self::TEST_KEY,
            'is_default' => true,
        ]);

        $this->withHeader('Authorization', $this->bearerFor($user))
            ->postJson('/api/v1/ai/key', [
                'provider' => 'deepseek',
                'key'      => 'sk-a-different-key-1234567890',
            ])
            ->assertOk();

        Notification::assertNothingSent();
    }

    public function test_removing_a_key_notifies_and_names_the_promoted_default(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        UserAiCredential::create([
            'user_id'    => $user->id,
            'provider'   => AiProvider::DEEPSEEK->value,
            'key'        => self::TEST_KEY,
            'is_default' => true,
        ]);

        UserAiCredential::create([
            'user_id'    => $user->id,
            'provider'   => AiProvider::OPENAI->value,
            'key'        => self::TEST_KEY,
            'is_default' => false,
        ]);

        $this->withHeader('Authorization', $this->bearerFor($user))
            ->deleteJson('/api/v1/ai/key/' . AiProvider::DEEPSEEK->value)
            ->assertOk();

        Notification::assertSentTo(
            $user,
            AiKeyRemoved::class,
            function (AiKeyRemoved $notification, array $channels, User $notifiable) use ($user): bool {
                $this->assertSame($user->id, $notifiable->id);
                $this->assertSame(AiProvider::DEEPSEEK, $notification->provider);
                $this->assertSame(AiProvider::OPENAI, $notification->promotedProvider);
                $this->assertSame(['mail', 'database', 'broadcast'], $channels);

                $payload = $notification->toArray($notifiable);

                $this->assertSame('ai_key_removed', $payload['type']);
                $this->assertStringContainsString('OpenAI is now your default provider.', $payload['description']);

                return true;
            }
        );
    }

    public function test_removing_the_last_key_warns_that_ai_features_are_locked(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        UserAiCredential::create([
            'user_id'    => $user->id,
            'provider'   => AiProvider::GEMINI->value,
            'key'        => self::TEST_KEY,
            'is_default' => true,
        ]);

        $this->withHeader('Authorization', $this->bearerFor($user))
            ->deleteJson('/api/v1/ai/key/' . AiProvider::GEMINI->value)
            ->assertOk();

        Notification::assertSentTo(
            $user,
            AiKeyRemoved::class,
            function (AiKeyRemoved $notification): bool {
                $this->assertNull($notification->promotedProvider);
                $this->assertStringContainsString(
                    'unavailable until you connect a new key',
                    $notification->toArray(auth()->user())['description']
                );

                return true;
            }
        );
    }

    public function test_the_mail_views_render_without_leaking_the_key(): void
    {
        $user = User::factory()->create(['full_name' => 'Ada Lovelace']);

        $added = new AiKeyAdded(AiProvider::GEMINI, 'gemini-2.5-flash-lite');
        $removed = new AiKeyRemoved(AiProvider::GEMINI);

        $addedHtml = $added->toMail($user)->render();
        $removedHtml = $removed->toMail($user)->render();

        $this->assertStringContainsString('Gemini', $addedHtml);
        $this->assertStringContainsString('Ada Lovelace', $addedHtml);
        $this->assertStringNotContainsString(self::TEST_KEY, $addedHtml);

        $this->assertStringContainsString('removed', strtolower($removedHtml));
        $this->assertStringNotContainsString(self::TEST_KEY, $removedHtml);
    }

    public function test_key_operations_do_not_break_when_notifications_are_dispatched_live(): void
    {
        $user = User::factory()->create();

        $this->mock(AiKeyService::class, function (MockInterface $mock): void {
            $mock->shouldReceive('setDefault');
        });

        // Queue is not drained in tests, so this exercises the notify() call path.
        $this->withHeader('Authorization', $this->bearerFor($user))
            ->postJson('/api/v1/ai/key', ['provider' => 'gemini', 'key' => self::TEST_KEY])
            ->assertOk();

        $this->assertDatabaseHas('user_ai_credentials', [
            'user_id'  => $user->id,
            'provider' => 'gemini',
        ]);
    }
}
