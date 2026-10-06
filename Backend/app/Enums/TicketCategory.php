<?php

namespace App\Enums;

enum TicketCategory: string
{
    case TECHNICAL_ISSUE = 'technical_issue';
    case AI_PROVIDER = 'ai_provider';
    case FEATURE_REQUEST = 'feature_request';
    case AI_PERFORMANCE = 'ai_performance';
    case OTHER = 'other';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
