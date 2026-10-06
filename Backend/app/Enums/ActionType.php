<?php

namespace App\Enums;

enum ActionType: string
{
    case ACCEPT = 'accept';
    case REJECT = 'reject';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
