<?php

namespace Database\Factories;

use App\Enums\TokenActionType;
use App\Models\SecureToken;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SecureToken>
 */
class SecureTokenFactory extends Factory
{
    protected $model = SecureToken::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $user = User::factory();

        return [
            'user_id'    => $user,
            'email'      => $this->faker->unique()->safeEmail(),
            'token'      => Str::random(64),
            'type'       => TokenActionType::PASSWORD_CHANGE,
            'expires_at' => now()->addDay(),
            'created_at' => now(),
        ];
    }
}
