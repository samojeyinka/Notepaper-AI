<?php

namespace Tests\Unit;

use Tests\TestCase;

class CorsConfigTest extends TestCase
{
    private function resolve(?string $origins, ?string $origin = null, ?string $url = null): array
    {
        // Mirrors the resolution chain in config/cors.php.
        $resolved = $origins ?? $origin ?? $url ?? 'http://localhost:5173';

        return array_values(array_filter(array_map('trim', explode(',', $resolved))));
    }

    public function test_a_comma_separated_list_becomes_every_allowed_origin(): void
    {
        $origins = $this->resolve('https://synchrome.co,https://www.synchrome.co');

        $this->assertSame(['https://synchrome.co', 'https://www.synchrome.co'], $origins);
    }

    public function test_whitespace_and_trailing_commas_are_tolerated(): void
    {
        $origins = $this->resolve(' https://a.co , https://b.co ,, ');

        $this->assertSame(['https://a.co', 'https://b.co'], $origins);
    }

    public function test_single_value_fallbacks_still_resolve(): void
    {
        $this->assertSame(['https://from-origin.co'], $this->resolve(null, 'https://from-origin.co'));
        $this->assertSame(['https://from-url.co'], $this->resolve(null, null, 'https://from-url.co'));
        $this->assertSame(['http://localhost:5173'], $this->resolve(null, null, null));
    }

    public function test_no_production_domain_is_hardcoded_in_the_config_file(): void
    {
        $config = file_get_contents(config_path('cors.php'));

        $this->assertIsString($config);
        $this->assertStringNotContainsString('synchrome.co', $config, 'A production origin is still hardcoded in config/cors.php.');
        $this->assertStringNotContainsString('http://127.0.0.1', $config, 'A dev origin is still hardcoded in config/cors.php.');
        $this->assertStringContainsString('FRONTEND_ORIGINS', $config);
    }

    public function test_the_shipped_config_resolves_to_the_configured_origins(): void
    {
        $origins = config('cors.allowed_origins');

        $this->assertIsArray($origins);
        $this->assertNotSame([], $origins, 'CORS would reject every browser origin.');

        foreach ($origins as $origin) {
            $this->assertNotSame('', $origin);
            $this->assertSame($origin, trim($origin), "Origin '{$origin}' has stray whitespace.");
        }
    }
}
