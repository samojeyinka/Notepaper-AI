@extends('emails.layouts.base')

@section('title', 'Reset Your Password')
@section('label', 'Password Reset')
@section('header-bg', 'linear-gradient(135deg, #78350f 0%, #b45309 100%)')
@section('greeting-label', 'Security request')
@section('heading')Reset your<br><span class="name">Password</span>@endsection

@section('content')
    <p class="message">We received a request to reset the password for your Notepaper AI account. Click the button below to choose a new password. This link is valid for a limited time.</p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
    <div class="cta-wrap">
        <a href="{{ $verificationUrl }}" class="cta-btn">Reset My Password</a>
        <p class="cta-note">This link expires in 1 hour.</p>
    </div>
@endsection

@section('footer-note', "Didn't request a password reset? You can safely ignore this email — your password has not changed.")
