<?php

namespace App\Http\Controllers;

use App\Http\Requests\ContactUsRequest;
use App\Mail\ContactUsMail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;

class ContactUsController extends Controller
{
    public function contact(ContactUsRequest $request): JsonResponse
    {
        $message = $request->validated();

        $admins = User::role(['admin', 'super_admin'])->get();
        Mail::to($admins)->send(new ContactUsMail($message));

        return $this->successResponse('Thanks for reaching out. We\'ll get back to you shortly.');
    }
}
