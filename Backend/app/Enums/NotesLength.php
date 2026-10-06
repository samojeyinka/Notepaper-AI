<?php

namespace App\Enums;

enum NotesLength: string
{
    case Short = 'short';
    case Medium = 'medium';
    case Long = 'long';
    case Detailed = 'detailed';
}
