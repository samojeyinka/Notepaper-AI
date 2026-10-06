@extends('emails.layouts.base')

@section('title', 'Change Your Password')
@section('label', 'Password Change')
@section('header-bg', 'linear-gradient(135deg, #78350f 0%, #b45309 100%)')
@section('greeting-label', 'Security request')
@section('heading')Hey there,<br><span class="name">{{ $user->full_name }}</span>@endsection

@section('content')
    <p class="message">You requested to change your Notepaper AI account password. Click the button below to proceed. If you did not initiate this request, please ignore this email — your current password remains unchanged.</p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
    <div class="cta-wrap">
        <a href="{{ $verificationUrl }}" class="cta-btn">Change My Password</a>
        <p class="cta-note">This link expires in 1 hour.</p>
    </div>
@endsection

@section('footer-note', "Didn't request a password change? Your account is safe — simply ignore this email.")
