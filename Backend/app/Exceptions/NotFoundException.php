<?php

namespace App\Exceptions;

use Symfony\Component\HttpKernel\Exception\HttpException;

class NotFoundException extends HttpException
{
    public function __construct(string $message = 'Record not found.')
    {
        parent::__construct(404, $message);
    }
}
