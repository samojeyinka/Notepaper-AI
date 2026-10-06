<?php

namespace Database\Factories;

use App\Enums\TokenActionType;
use App\Models\PublicToken;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PublicToken>
 */
class PublicTokenFactory extends Factory
{
    protected $model = PublicToken::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'email'      => $this->faker->unique()->safeEmail(),
            'token'      => Str::random(64),
            'type'       => TokenActionType::PASSWORD_RESET,
            'created_at' => now(),
            'expires_at' => now()->addHour(),
        ];
    }
}
