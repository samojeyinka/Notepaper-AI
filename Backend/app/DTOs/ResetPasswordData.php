<?php

namespace App\DTOs;

readonly class ResetPasswordData
{
    public function __construct(
        public string $token,
        public string $password
    ) {}
}
