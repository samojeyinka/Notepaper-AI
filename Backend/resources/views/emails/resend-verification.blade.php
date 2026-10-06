@extends('emails.layouts.base')

@section('title', 'Verify Your Email')
@section('label', 'Email Verification')
@section('greeting-label', 'New verification link')
@section('heading')Hey there,<br><span class="name">{{ $user->full_name }}</span>@endsection

@section('content')
    <p class="message">You requested a new email verification link. No worries — here it is. Click the button below to verify your address and get full access to your account.</p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
    <div class="cta-wrap">
        <a href="{{ $verificationUrl }}" class="cta-btn">Verify Email Address</a>
        <p class="cta-note">This link expires in 24 hours. If you didn't request this, you can safely ignore it.</p>
    </div>
@endsection

@section('footer-note', "Didn't request a new link? Your previous link may still be valid.")
