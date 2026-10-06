@extends('emails.layouts.base')

@section('title', 'Plan Expired')
@section('label', 'Plan Expired')
@section('header-bg', 'linear-gradient(135deg, #1C1917 0%, #44403C 100%)')
@section('greeting-label', 'System notice')
@section('heading')Hey,<br><span class="name">{{ $full_name }}</span>@endsection

@section('content')
    <p class="message">Your <strong>{{ $plan }}</strong> subscription has expired and your account has been moved to the Free plan.</p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
    <div class="info-box">
        Upgrade again anytime to restore your full access to premium features and expanded limits.
    </div>
    <div class="cta-wrap">
        <a href="{{ $url }}" class="cta-btn">Upgrade Now</a>
    </div>
@endsection

@section('footer-note', 'We hope to see you back on a paid plan soon!')
@section('badge', 'Account Status')
