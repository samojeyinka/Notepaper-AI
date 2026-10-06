@extends('emails.layouts.base')

@section('title', 'Plan Expiring Soon')
@section('label', 'Plan Expiring')
@section('header-bg', 'linear-gradient(135deg, #78350f 0%, #b45309 100%)')
@section('greeting-label', 'Action required')
@section('heading')Hey,<br><span class="name">{{ $full_name }}</span>@endsection

@section('content')
    <p class="message">Just a heads-up — your <strong>{{ $plan }}</strong> subscription expires on <strong>{{ $expires }}</strong> ({{ $dayLabel }}).</p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
    <div class="info-box">
        After expiry, your account will revert to the Free plan and some premium features may no longer be available.
    </div>
    <div class="cta-wrap">
        <a href="{{ $url }}" class="cta-btn">Manage Subscription</a>
    </div>
@endsection

@section('footer-note', 'Thanks for being a Notepaper AI subscriber!')
@section('badge', 'Account Status')
