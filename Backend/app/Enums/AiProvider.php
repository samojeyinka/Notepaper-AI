<?php

namespace App\Enums;

enum AiProvider: string
{
    case GEMINI = 'gemini';
    case DEEPSEEK = 'deepseek';
    case OPENAI = 'openai';
    case CLAUDE = 'claude';

    /**
     * Map a user-facing provider to the provider name registered in config/ai.php.
     */
    public function configProvider(): string
    {
        return match ($this) {
            self::CLAUDE => 'anthropic',
            default      => $this->value,
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::GEMINI   => 'Gemini',
            self::DEEPSEEK => 'DeepSeek',
            self::OPENAI   => 'OpenAI',
            self::CLAUDE   => 'Claude',
        };
    }

    public static function fromConfigName(string $configName): self
    {
        return $configName === 'anthropic' ? self::CLAUDE : self::from($configName);
    }
}
