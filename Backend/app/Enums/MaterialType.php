<?php

namespace App\Enums;

enum MaterialType: string
{
    case Note = 'note';
    case Paper = 'paper';
    case Flashcard = 'flashcard';
    case Presentation = 'presentation';
}
