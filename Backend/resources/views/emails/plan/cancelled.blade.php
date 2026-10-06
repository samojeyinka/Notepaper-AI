@extends('emails.layouts.base')

@section('title', 'Plan Cancelled')
@section('label', 'Plan Cancelled')
@section('header-bg', 'linear-gradient(135deg, #1C1917 0%, #44403C 100%)')
@section('greeting-label', 'Subscription update')
@section('heading')Hey,<br><span class="name">{{ $full_name }}</span>@endsection

@section('content')
    <p class="message">Your <strong>{{ $plan }}</strong> subscription has been cancelled.</p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
    <div class="info-box">
        @if($endsAt)
            You'll continue to have access to your premium features until <strong>{{ $endsAt }}</strong>.
        @else
            Your access has been updated to the Free plan.
        @endif
        <br><br>
        You can resubscribe anytime to restore full access.
    </div>
    <div class="cta-wrap">
        <a href="{{ $url }}" class="cta-btn">Resubscribe</a>
    </div>
@endsection

@section('footer-note', 'We hope to see you back on Notepaper AI!')
@section('badge', 'Account Status')
