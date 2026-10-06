<?php

namespace App\Enums;

enum PaperType: string
{
    case RULED = 'ruled';
    case GRID = 'grid';
    case BLANK = 'blank';
    case DOTTED = 'dotted';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
