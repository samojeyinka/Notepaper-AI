<?php

namespace App\Enums;

enum TokenActionType: string
{
    // Public Actions (No login required)
    case PASSWORD_RESET = 'a';
    case EMAIL_VERIFICATION = 'email_verification';
    case ACCOUNT_RESTORE = 'account_restore';

    // Secure Actions (Login required)
    case ACCOUNT_DELETION = 'account_deletion';
    case PASSWORD_CHANGE = 'password_change';
    case SENSITIVE_SETTING_CHANGE = 'sensitive_setting_change';

    case INVITE_ADMIN = 'invite_admin';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
