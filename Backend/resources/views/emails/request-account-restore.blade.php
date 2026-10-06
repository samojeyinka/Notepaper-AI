@extends('emails.layouts.base')

@section('title', 'Restore Your Account')
@section('label', 'Account Restore')
@section('greeting-label', 'Restore request')
@section('heading')Hey there,<br><span class="name">{{ $user->full_name }}</span>@endsection

@section('content')
    <p class="message">We received a request to restore your Notepaper AI account. Click the button below to confirm. Your notes, folders, and settings will be fully reinstated once the process is complete.</p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
    <div class="cta-wrap">
        <a href="{{ $verificationUrl }}" class="cta-btn">Restore My Account</a>
    </div>
@endsection

@section('footer-note', "Didn't request this? Your account will remain in its current state — no action needed.")
