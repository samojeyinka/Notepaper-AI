<?php

namespace Database\Factories;

use App\Enums\AiProvider;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UserAiCredential>
 */
class UserAiCredentialFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'    => User::factory(),
            'provider'   => AiProvider::GEMINI,
            'key'        => 'AIza' . $this->faker->bothify('?????????????????????????????'),
            'is_default' => true,
        ];
    }

    public function provider(AiProvider $provider): static
    {
        return $this->state(['provider' => $provider]);
    }
}
