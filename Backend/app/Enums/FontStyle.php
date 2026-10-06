<?php

namespace App\Enums;

enum FontStyle: string
{
    case INTER = 'Inter';
    case CAVEAT = 'Caveat';
    case INDIE_FLOWER = 'Indie Flower';
    case KALAM = 'Kalam';
    case SHADOWS_INTO_LIGHT = 'Shadows Into Light';
    case DANCING_SCRIPT = 'Dancing Script';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
