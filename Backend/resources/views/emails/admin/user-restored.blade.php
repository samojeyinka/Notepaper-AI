@extends('emails.layouts.base')

@section('title', 'Account Restored')
@section('label', 'Account Restored')
@section('header-bg', 'linear-gradient(135deg, #065f46 0%, #059669 100%)')
@section('greeting-label', 'Welcome back')
@section('heading')Hi,<br><span class="name">{{ $user->full_name }}</span>@endsection

@section('content')
    <p class="message">Your Notepaper AI account has been <strong>restored</strong> by an administrator. You now have full access to your account and all your previous data.</p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
    <div class="info-box">
        Sign in at any time to pick up right where you left off. Everything is exactly as you left it.
    </div>
    <div class="cta-wrap">
        <a href="{{ config('app.frontend_url') }}/sign-in" class="cta-btn">Sign In</a>
    </div>
@endsection

@section('footer-note', "Questions? We're always here to help.")
@section('badge', 'Admin Action')
