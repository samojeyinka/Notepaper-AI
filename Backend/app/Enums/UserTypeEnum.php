<?php

namespace App\Enums;

enum UserTypeEnum: string
{
    case STUDENT = 'student';
    case TEACHER = 'teacher';
    case LECTURER = 'lecturer';

    // Content & Media
    case CREATOR = 'creator';
    case BLOGGER = 'blogger';
    case JOURNALIST = 'journalist';
    case PODCASTER = 'podcaster';
    case VLOGGER = 'vlogger';
    case INFLUENCER = 'influencer';
    case EDITOR = 'editor';
    case REVIEWER = 'reviewer';

    // Tech Roles
    case SOFTWARE_DEVELOPER = 'software_developer';
    case FRONTEND_DEVELOPER = 'frontend_developer';
    case BACKEND_DEVELOPER = 'backend_developer';
    case FULLSTACK_DEVELOPER = 'fullstack_developer';
    case MOBILE_DEVELOPER = 'mobile_developer';
    case GAME_DEVELOPER = 'game_developer';
    case DEVOPS_ENGINEER = 'devops_engineer';
    case QA_ENGINEER = 'qa_engineer';
    case SECURITY_ENGINEER = 'security_engineer';
    case CLOUD_ENGINEER = 'cloud_engineer';
    case BLOCKCHAIN_DEVELOPER = 'blockchain_developer';

    // Data & AI
    case DATA_SCIENTIST = 'data_scientist';
    case DATA_ANALYST = 'data_analyst';
    case DATA_ENGINEER = 'data_engineer';
    case AI_ENGINEER = 'ai_engineer';
    case MACHINE_LEARNING_ENGINEER = 'machine_learning_engineer';
    case RESEARCHER = 'researcher';

    // Design & Product
    case UX_DESIGNER = 'ux_designer';
    case UI_DESIGNER = 'ui_designer';
    case PRODUCT_MANAGER = 'product_manager';
    case PROJECT_MANAGER = 'project_manager';
    case BUSINESS_ANALYST = 'business_analyst';

    case OTHER = 'other';

    // Get all underlying values

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
