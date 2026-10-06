<?php

namespace App\Http\Controllers;

use App\Http\Requests\VerifyOTPRequest;
use App\Services\TwoFactorService;

class TwoFactorController extends Controller
{
    public function __construct(protected TwoFactorService $twoFactorService) {}

    // generate secret key or qr code for user

    public function setUp()
    {
        $result = $this->twoFactorService->setUp();

        return $this->successResponse('2FA setup details', [
            'code_name'  => config('app.name'),
            'secret_key' => $result['secret'],
            'qr_url'     => $result['qrUrl'],
        ]);

    }

    // enable
    public function enable(VerifyOTPRequest $request)
    {
        $this->twoFactorService->enable($request->validated());

        return $this->successResponse('2FA enabled');
    }

    // disable

    public function disable(VerifyOTPRequest $request)
    {

        $this->twoFactorService->disable($request->validated());

        return $this->successResponse('2FA disabled');
    }
}
