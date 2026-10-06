@extends('emails.layouts.base')

@section('title', 'Two-Factor Auth Disabled')
@section('label', 'Two-Factor Auth')
@section('header-bg', 'linear-gradient(135deg, #78350f 0%, #b45309 100%)')
@section('greeting-label', 'Security update')
@section('heading')Hey there,<br><span class="name">{{ $user->full_name }}</span>@endsection

@section('content')
    <p class="message">Two-factor authentication has been disabled on your Notepaper AI account. Your account will no longer require a verification code at sign-in. We recommend keeping 2FA enabled to protect your data.</p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
    <div class="info-box">If you did not disable 2FA, please re-enable it and contact our support team immediately.</div>
@endsection

@section('footer-note', "Didn't make this change? Secure your account by re-enabling 2FA.")
