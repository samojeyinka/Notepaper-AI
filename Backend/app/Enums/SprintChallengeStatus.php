<?php

namespace App\Enums;

enum SprintChallengeStatus: string
{
    case Locked = 'locked';
    case Ready = 'ready';
    case Active = 'active';
    case Completed = 'completed';
}
