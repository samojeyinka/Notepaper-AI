<?php

namespace App\Contracts\Actions;

use App\Models\Sprint;
use App\Models\User;

interface CreatesSprint
{
    public function __invoke(User $user, array $data): Sprint;
}
