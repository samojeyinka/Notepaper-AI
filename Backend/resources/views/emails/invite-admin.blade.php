@extends('emails.layouts.base')

@section('title', 'Admin Invitation')
@section('label', 'Admin Invitation')
@section('greeting-label', "You've been invited")
@section('heading')Hey there,<br><span class="name">{{ $user->full_name }}</span>@endsection

@section('content')
    <p class="message">You have been invited to join the Notepaper AI administrative team as <strong>{{ $additions['role'] }}</strong>. Below are your account credentials. Please verify your email to activate your access.</p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
    <div class="info-box">
        <strong>Email:</strong> {{ $user->email }}<br>
        <strong>Temporary Password:</strong> {{ $additions['password'] }}<br>
        <em>Please change your password after your first login.</em>
    </div>
    <div class="cta-wrap">
        <a href="{{ $additions['verificationUrl'] }}" class="cta-btn">Verify &amp; Get Started</a>
    </div>
@endsection

@section('footer-note', 'Not expecting this invitation? You can safely ignore this email.')
