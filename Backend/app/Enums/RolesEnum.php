<?php

namespace App\Enums;

enum RolesEnum: string
{
    case USER = 'user';
    case ADMIN = 'admin';
    case SUPER_ADMIN = 'super_admin';

    public function id(): int
    {
        return match ($this) {
            self::SUPER_ADMIN => 3,
            self::ADMIN       => 2,
            self::USER        => 1
        };
    }
}
