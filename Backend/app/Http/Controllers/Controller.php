<?php

namespace App\Http\Controllers;

use App\Traits\ApiResponses;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;

abstract class Controller
{
    use ApiResponses, AuthorizesRequests, ValidatesRequests;
}
