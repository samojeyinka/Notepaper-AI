<?php

namespace App\Enums;

enum ShapeEnum: string
{
    case BLOB = 'blob';      // organic, asymmetric blob
    case SQUIRCLE = 'squircle';  // super-rounded square
    case PEBBLE = 'pebble';    // smooth symmetrical oval/pebble
    case ARCH = 'arch';      // tall arch / teardrop
    case WAVE = 'wave';      // wavy / fluid outline
    case GEM = 'gem';       // geometric faceted diamond

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
