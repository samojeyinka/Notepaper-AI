@extends('emails.layouts.base')

@section('title', 'Account Suspended')
@section('label', 'Account Suspended')
@section('header-bg', 'linear-gradient(135deg, #1C1917 0%, #44403C 100%)')
@section('greeting-label', 'Account notice')
@section('heading')Hey there,<br><span class="name">{{ $user->full_name }}</span>@endsection

@section('content')
    <p class="message">Your Notepaper AI account has been temporarily suspended following a review. Access to your account and its data has been restricted. Please review the reason below.</p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
    <div class="info-box"><strong>Reason for suspension:</strong><br>{{ $reason }}</div>
@endsection

@section('footer-note', 'Believe this was a mistake? Contact our support team to appeal.')
