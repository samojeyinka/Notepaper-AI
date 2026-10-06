<?php

namespace App\Enums;

enum TicketPriority: string
{
    case LOW = 'low';
    case NORMAL = 'normal';
    case HIGH = 'high';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
