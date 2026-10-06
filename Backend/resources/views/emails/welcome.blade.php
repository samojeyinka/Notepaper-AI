@extends('emails.layouts.base')

@section('title', 'Welcome to Notepaper AI')
@section('label', 'Account Verification')
@section('greeting-label', 'Welcome aboard')
@section('heading')Hey there,<br><span class="name">{{ $user->full_name }}</span>@endsection

@section('content')
    <p class="message">Thank you for joining Notepaper AI. We're glad to have you here. Before you get started, please verify your email address to keep your account secure and unlock everything the platform has to offer.</p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
    <div class="cta-wrap">
        <a href="{{ $verificationUrl }}" class="cta-btn">Verify Email Address</a>
        <p class="cta-note">This link expires in 24 hours.</p>
    </div>
@endsection

@section('footer-note', "Didn't create an account? You can safely ignore this email.")
