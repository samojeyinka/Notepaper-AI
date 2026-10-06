<?php

namespace Tests\Unit;

use App\Enums\AiProvider;
use App\Services\AiErrorTranslator;
use PHPUnit\Framework\TestCase;
use RuntimeException;

class AiErrorTranslatorTest extends TestCase
{
    private AiErrorTranslator $translator;

    protected function setUp(): void
    {
        parent::setUp();

        $this->translator = new AiErrorTranslator;
    }

    /**
     * The exact message surfaced by a bad Gemini key.
     */
    private const GEMINI_BAD_KEY = 'HTTP request returned status code 400: { "error": { "code": 400, "message": "API key not valid. Please pass a valid API key.", "status": "INVALID (truncated...) } }';

    public function test_a_raw_http_dump_becomes_an_actionable_key_message(): void
    {
        $message = $this->translator->friendly(
            new RuntimeException(self::GEMINI_BAD_KEY),
            AiProvider::GEMINI
        );

        $this->assertStringContainsString('Gemini API key was rejected', $message);
        $this->assertStringNotContainsString('HTTP request returned status code', $message);
        $this->assertStringNotContainsString('INVALID (truncated', $message);
        $this->assertStringNotContainsString('{ "error"', $message);
    }

    public function test_no_message_ever_leaks_a_json_payload_or_status_dump(): void
    {
        $raws = [
            self::GEMINI_BAD_KEY,
            'HTTP request returned status code 401: {"error":{"message":"Incorrect API key provided"}}',
            'HTTP request returned status code 429: {"error":{"message":"RESOURCE_EXHAUSTED: Quota exceeded"}}',
            'HTTP request returned status code 500: {"error":{"message":"Internal error"}}',
            'HTTP request returned status code 503: Service Unavailable',
            'cURL error 28: Operation timed out after 120000 milliseconds',
            'model gemini-9-ultra is not found for api version v1beta',
            '',
        ];

        foreach ($raws as $raw) {
            $message = $this->translator->friendly(new RuntimeException($raw), AiProvider::GEMINI);

            $this->assertStringNotContainsString('HTTP request returned', $message, "Raw dump leaked for: {$raw}");
            $this->assertStringNotContainsString('"error"', $message, "JSON leaked for: {$raw}");
            $this->assertStringNotContainsString('(truncated', $message, "Truncation marker leaked for: {$raw}");
            $this->assertNotSame('', trim($message));
        }
    }

    public function test_provider_specific_messages_name_the_right_provider(): void
    {
        $openai = $this->translator->friendly(
            new RuntimeException('{"error":{"message":"Incorrect API key provided: sk-abc"}}'),
            AiProvider::OPENAI
        );

        $this->assertStringContainsString('OpenAI API key was rejected', $openai);
        $this->assertStringNotContainsString('sk-abc', $openai, 'The rejected key must never be echoed back.');

        $claude = $this->translator->friendly(
            new RuntimeException('{"type":"authentication_error","message":"invalid x-api-key"}'),
            AiProvider::CLAUDE
        );

        $this->assertStringContainsString('Claude API key was rejected', $claude);
    }

    public function test_quota_and_rate_limits_are_reported_as_such(): void
    {
        $message = $this->translator->friendly(
            new RuntimeException('{"error":{"code":429,"message":"You exceeded your current quota"}}'),
            AiProvider::DEEPSEEK
        );

        $this->assertStringContainsString('DeepSeek usage limit or balance ran out', $message);
    }

    public function test_unknown_model_is_guided_towards_picking_another(): void
    {
        $message = $this->translator->friendly(
            new RuntimeException('{"error":{"message":"models/gemini-9-pro is not found for API version v1beta"}}'),
            AiProvider::GEMINI
        );

        $this->assertStringContainsString('not available for this Gemini key', $message);
        $this->assertStringContainsString('different model', $message);
    }

    public function test_outages_and_timeouts_read_as_temporary_problems(): void
    {
        $overloaded = $this->translator->friendly(
            new RuntimeException('{"error":{"code":503,"message":"The model is overloaded"}}'),
            AiProvider::GEMINI
        );
        $this->assertStringContainsString('temporarily unavailable', $overloaded);

        $timeout = $this->translator->friendly(
            new RuntimeException('cURL error 28: Operation timed out'),
            AiProvider::GEMINI
        );
        $this->assertStringContainsString('Could not reach Gemini', $timeout);
    }

    public function test_an_unrecognised_error_is_still_shortened_to_one_readable_clause(): void
    {
        $raw = str_repeat('Something unusual happened. ', 40);

        $message = $this->translator->friendly(new RuntimeException($raw), AiProvider::CLAUDE);

        $this->assertStringContainsString('Claude could not complete the request', $message);
        $this->assertStringEndsWith('…', $message);
        $this->assertLessThan(mb_strlen($raw), mb_strlen($message));
    }

    public function test_an_empty_error_still_produces_a_usable_message(): void
    {
        $message = $this->translator->friendly(new RuntimeException(''), AiProvider::OPENAI);

        $this->assertStringContainsString('OpenAI', $message);
    }
}
