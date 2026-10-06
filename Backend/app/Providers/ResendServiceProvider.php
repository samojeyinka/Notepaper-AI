<?php

namespace App\Providers;

class ResendServiceProvider extends \Resend\Laravel\ResendServiceProvider
{
    protected function registerRoutes(): void
    {
        // Intentionally empty — the parent uses the deprecated `namespace` route group
        // attribute which breaks Laravel 12's controller() group resolution.
        // Webhook support can be added manually if needed later.
    }
}
