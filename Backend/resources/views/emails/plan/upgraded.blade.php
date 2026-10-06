@extends('emails.layouts.base')

@section('title', 'Plan Upgraded')
@section('label', 'Plan Upgrade')
@section('header-bg', 'linear-gradient(135deg, #065f46 0%, #059669 100%)')
@section('greeting-label', 'New horizons')
@section('heading')Congratulations,<br><span class="name">{{ $full_name }}</span>@endsection

@section('content')
    <p class="message">Welcome to <strong>{{ $plan }}</strong>! Your new plan is now active, giving you full access to premium AI features and expanded limits.</p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
    <div class="cta-wrap">
        <a href="{{ $url }}" class="cta-btn">Go to Dashboard</a>
    </div>
@endsection

@section('footer-note', 'Thank you for supporting Notepaper AI.')
@section('badge', 'Premium Plan')
