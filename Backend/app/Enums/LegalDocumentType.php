<?php

namespace App\Enums;

enum LegalDocumentType: string
{
    case TERMS_OF_SERVICE = 'terms-of-service';
    case PRIVACY_POLICY = 'privacy-policy';
    case COOKIE_POLICY = 'cookie-policy';
}
