<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Curated AI provider/model presets shown to users
    |--------------------------------------------------------------------------
    | The model IDs must be valid identifiers for each provider's API.
    | Served to the frontend via GET /ai/key so the modal + guide page can
    | render the same options.
    */
    'providers' => [
        'gemini' => [
            'label'         => 'Gemini',
            'tagline'       => 'Great all-rounder (strong free tier via Google AI Studio).',
            'default_model' => 'gemini-3-flash-preview',
            'models'        => [
                ['id' => 'gemini-2.5-flash-lite', 'label' => 'Gemini 2.5 Flash Lite', 'desc' => 'Cheapest option (best for bulk generation and simple tasks).', 'kind' => 'fast'],
                ['id' => 'gemini-2.0-flash', 'label' => 'Gemini 2.0 Flash', 'desc' => 'Very low cost, quick drafts and short summaries.', 'kind' => 'fast'],
                ['id' => 'gemini-2.5-flash', 'label' => 'Gemini 2.5 Flash', 'desc' => 'Best balance of speed and quality for study material.', 'kind' => 'balanced'],
                ['id' => 'gemini-3-flash-preview', 'label' => 'Gemini 3 Flash', 'desc' => 'Fast, cheap, great for everyday note generation.', 'kind' => 'balanced'],
                ['id' => 'gemini-3.1-pro-preview', 'label' => 'Gemini 3.1 Pro', 'desc' => 'Deepest reasoning for long, complex study material.', 'kind' => 'smart'],
            ],
        ],
        'deepseek' => [
            'label'         => 'DeepSeek',
            'tagline'       => 'Top value for money (very low cost, strong reasoning).',
            'default_model' => 'deepseek-chat',
            'models'        => [
                ['id' => 'deepseek-chat', 'label' => 'DeepSeek Chat', 'desc' => 'Fast and inexpensive (perfect for bulk generation).', 'kind' => 'balanced'],
                ['id' => 'deepseek-reasoner', 'label' => 'DeepSeek Reasoner', 'desc' => 'Advanced chain-of-thought reasoning for hard problems.', 'kind' => 'smart'],
            ],
        ],
        'openai' => [
            'label'         => 'OpenAI',
            'tagline'       => 'Reliable and widely available (broad model choice).',
            'default_model' => 'gpt-5.4',
            'models'        => [
                ['id' => 'gpt-5.4-nano', 'label' => 'GPT-5.4 Nano', 'desc' => 'Cheapest tier for short, simple tasks.', 'kind' => 'fast'],
                ['id' => 'gpt-5.4', 'label' => 'GPT-5.4', 'desc' => 'The everyday workhorse for notes and summaries.', 'kind' => 'balanced'],
                ['id' => 'gpt-5.4-pro', 'label' => 'GPT-5.4 Pro', 'desc' => 'Most capable OpenAI model for complex reasoning.', 'kind' => 'smart'],
            ],
        ],
        'claude' => [
            'label'         => 'Claude',
            'tagline'       => 'Excellent prose and long-context understanding.',
            'default_model' => 'claude-sonnet-4-6',
            'models'        => [
                ['id' => 'claude-haiku-4-5-20251001', 'label' => 'Claude Haiku 4.5', 'desc' => 'Fast and affordable for high-volume tasks.', 'kind' => 'fast'],
                ['id' => 'claude-sonnet-4-6', 'label' => 'Claude Sonnet 4.6', 'desc' => 'Smart balance (great for study plans and essays).', 'kind' => 'balanced'],
                ['id' => 'claude-opus-4-6', 'label' => 'Claude Opus 4.6', 'desc' => 'Top-tier reasoning and writing quality.', 'kind' => 'smart'],
            ],
        ],
    ],
];
