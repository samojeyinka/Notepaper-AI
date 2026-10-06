<?php

namespace App\Enums;

enum QuizQuestionType: string
{
    case MultipleChoice = 'multiple_choice';
    case ShortAnswer = 'short_answer';
    case Mixed = 'mixed';

    // Editor vocabulary — stored on the shared question_type column.
    case Multiple = 'multiple';
    case Input = 'input';
    case Both = 'both';
}
