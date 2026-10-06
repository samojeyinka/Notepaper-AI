<?php

namespace App\Enums;

enum StudyPlanStatus: string
{
    case Pending = 'pending';
    case Active = 'active';
    case Failed = 'failed';
}
