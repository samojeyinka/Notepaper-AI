<?php

$frontendOrigins = (string) env(
    'FRONTEND_ORIGINS',
    env('FRONTEND_ORIGIN', env('FRONTEND_URL', 'http://localhost:5173'))
);

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    /*
    | Every allowed origin comes from the environment. Set FRONTEND_ORIGINS to a
    | comma-separated list, e.g.
    |   FRONTEND_ORIGINS=https://app.example.com,https://www.example.com
    | FRONTEND_ORIGIN and FRONTEND_URL are still honoured as single-value
    | fallbacks so existing environments keep working.
    */
    'allowed_origins' => array_values(array_filter(array_map('trim', explode(',', $frontendOrigins)))),

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
