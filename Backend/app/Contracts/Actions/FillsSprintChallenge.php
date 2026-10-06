<?php

namespace App\Contracts\Actions;

use App\Models\SprintChallenge;

interface FillsSprintChallenge
{
    /**
     * @param  array<mixed>  $content
     */
    public function __invoke(SprintChallenge $challenge, array $content): void;
}
