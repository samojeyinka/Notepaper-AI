<?php

namespace App\Enums;

enum AdminInvitationEnum: string
{
    case ACCEPT = 'accept';
    case DECLINE = 'decline';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
