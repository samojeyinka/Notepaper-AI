<?php

namespace App\Contracts\Actions;

use App\Models\Sprint;

interface BuildsSprintChallenges
{
    /**
     * @param  array<int, array<string, mixed>>  $challenges
     */
    public function __invoke(Sprint $sprint, array $challenges): void;
}
