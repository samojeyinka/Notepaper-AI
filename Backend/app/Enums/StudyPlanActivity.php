<?php

namespace App\Enums;

enum StudyPlanActivity: string
{
    case Review = 'review';
    case Quiz = 'quiz';
    case Summary = 'summary';
    case Flashcard = 'flashcard';
}
