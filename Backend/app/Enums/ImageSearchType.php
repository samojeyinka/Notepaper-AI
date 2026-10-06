<?php

namespace App\Enums;

enum ImageSearchType: string
{
    case All = 'all';
    case Photo = 'photo';
    case Illustration = 'illustration';
    case Vector = 'vector';
}
