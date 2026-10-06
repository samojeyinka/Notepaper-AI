<?php

namespace Database\Factories;

use App\Enums\RolesEnum;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'full_name'         => fake()->name(),
            'email'             => fake()->unique()->safeEmail(),
            'email_verified_at' => null, // now();
            'password'          => static::$password ??= Hash::make('password'),
            'agreeToTerms'      => true,
            'remember_me'       => false,
            'type'              => 'student',
        ];
    }

    /**
     * State for Admin role.
     */
    public function admin(): static
    {
        return $this->afterCreating(function ($user) {
            $user->assignRole(RolesEnum::ADMIN);
        });
    }

    /**
     * State for Super Admin role.
     */
    public function superAdmin(): static
    {
        return $this->afterCreating(function ($user) {
            $user->assignRole(RolesEnum::SUPER_ADMIN);
        });
    }

    /**
     * State for User role.
     */
    public function user(): static
    {
        return $this->afterCreating(function ($user) {
            $user->assignRole(RolesEnum::USER);
        });
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
