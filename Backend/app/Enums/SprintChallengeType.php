<?php

namespace App\Enums;

enum SprintChallengeType: string
{
    case Quiz = 'quiz';
    case Concept = 'concept';
    case Quickpoints = 'quickpoints';
    case Reading = 'reading';
}
