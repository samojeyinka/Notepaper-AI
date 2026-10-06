<?php

namespace App\Services;

use App\Enums\AiProvider;

/**
 * Turns raw provider exceptions into messages a user can act on.
 *
 * Providers report failures as HTTP dumps ("HTTP request returned status code
 * 400: { "error": { "message": "API key not valid..." } }"). Those are useless
 * in the UI, so every user-facing failure path routes through here. The full
 * exception is still passed to report() for the logs.
 */
class AiErrorTranslator
{
    private const INVALID_KEY = '/invalid[\s_-]*(x[\s_-]*)?api[\s_-]*key|api key not valid|incorrect_api_key|incorrect api key|authentication_error|authentication failed|unauthenticated|permission[\s_-]*denied|unauthorized|401/i';

    private const QUOTA = '/quota|rate[\s_-]*limit|too many requests|resource_exhausted|insufficient[\s_-]*(quota|credit|fund)|billing|402|429/i';

    private const MODEL = '/model [\w.\-]* ?not found|is not found for api version|model_not_found|unsupported model|invalid model|404/i';

    private const CONTENT = '/safety|blocked|prohibited[\s_-]*content|recitation/i';

    private const OVERLOAD = '/overloaded|unavailable|high demand|internal[\s_-]*error|bad gateway|500|502|503|504/i';

    private const CONNECTIVITY = '/timed?[\s_-]*out|timeout|connection|network|resolve|dns|failed to open|curl/i';

    /**
     * A short, human-readable explanation of $e, safe to show in the UI.
     */
    public function friendly(\Throwable $e, AiProvider $provider): string
    {
        $label = $provider->label();
        $flat = $this->normalise($e->getMessage());

        // Providers bury the useful part in "message" while the failure type
        // lives in a sibling field, so match against the payload and the
        // extracted sentence together.
        $detail = $this->extractDetail($flat) ?? $flat;

        return match (true) {
            $this->matchesAny(self::INVALID_KEY, $flat, $detail)  => "That {$label} API key was rejected. Copy the whole key from your {$label} dashboard and make sure it is still active.",
            $this->matchesAny(self::QUOTA, $flat, $detail)        => "Your {$label} usage limit or balance ran out. Check your {$label} plan and try again.",
            $this->matchesAny(self::MODEL, $flat, $detail)        => "That model is not available for this {$label} key. Pick a different model and try again.",
            $this->matchesAny(self::CONTENT, $flat, $detail)      => "{$label} declined this request. Try rephrasing it without sensitive or restricted content.",
            $this->matchesAny(self::OVERLOAD, $flat, $detail)     => "{$label} is temporarily unavailable. Wait a moment and try again.",
            $this->matchesAny(self::CONNECTIVITY, $flat, $detail) => "Could not reach {$label}. Check your internet connection and try again.",
            default                                               => $this->fallback($detail, $label),
        };
    }

    /**
     * Collapse a multi-line HTTP dump into a single readable clause.
     */
    private function normalise(string $message): string
    {
        return trim(preg_replace('/\s+/', ' ', $message) ?? $message);
    }

    /**
     * Pull the provider's own explanation out of a JSON payload, if present.
     */
    private function extractDetail(string $flat): ?string
    {
        if (preg_match('/"message"\s*:\s*"([^"]+)"/', $flat, $matches) !== 1) {
            return null;
        }

        return trim($matches[1]);
    }

    private function matchesAny(string $pattern, string ...$subjects): bool
    {
        foreach ($subjects as $subject) {
            if ($subject !== '' && preg_match($pattern, $subject) === 1) {
                return true;
            }
        }

        return false;
    }

    private function fallback(string $raw, string $label): string
    {
        if ($raw === '') {
            return "Something went wrong talking to {$label}. Please try again.";
        }

        if (str_ends_with($raw, '(truncated...)') || preg_match('/truncated/i', $raw) === 1) {
            $raw = preg_replace('/\s*\(truncated\.*\)?\s*$/i', '', $raw) ?? $raw;
        }

        return "{$label} could not complete the request: " . $this->truncate($raw);
    }

    private function truncate(string $value, int $limit = 140): string
    {
        return mb_strlen($value) > $limit
            ? rtrim(mb_substr($value, 0, $limit)) . '…'
            : $value;
    }
}
