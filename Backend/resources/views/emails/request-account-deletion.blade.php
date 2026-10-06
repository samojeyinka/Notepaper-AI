@extends('emails.layouts.base')

@section('title', 'Confirm Account Deletion')
@section('label', 'Account Deletion')
@section('header-bg', 'linear-gradient(135deg, #78350f 0%, #b45309 100%)')
@section('greeting-label', 'Deletion request')
@section('heading')Hey there,<br><span class="name">{{ $user->full_name }}</span>@endsection

@section('content')
    <p class="message">We received a request to delete your Notepaper AI account. If you'd like to proceed, click the button below. Please note that your data will be retained for 30 days before being permanently removed, giving you the option to restore your account within that period.</p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
    <div class="cta-wrap">
        <a href="{{ $verificationUrl }}" class="cta-btn">Confirm Account Deletion</a>
        <p class="cta-note">This action can be undone within 30 days.</p>
    </div>
@endsection

@section('footer-note', "Didn't request this? You can safely ignore this email — your account will remain active.")
