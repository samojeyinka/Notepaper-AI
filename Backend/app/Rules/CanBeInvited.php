<?php

namespace App\Rules;

use App\Models\User;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class CanBeInvited implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $user = User::with('roles')->where('email', $value)->first();

        if ($user) {
            $role = $user->getRoleNames()->first() ?? 'no role';
            $status = $user->email_verified_at ? 'active' : 'pending';
            $fail("This email is already registered as a {$status} user with the role {$role}.");
        }
    }
}
