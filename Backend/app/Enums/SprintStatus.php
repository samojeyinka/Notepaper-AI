<?php

namespace App\Enums;

enum SprintStatus: string
{
    case Generating = 'generating';
    case Active = 'active';
    case Completed = 'completed';
    case Failed = 'failed';
}
