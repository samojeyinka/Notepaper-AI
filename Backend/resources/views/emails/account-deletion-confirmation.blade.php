@extends('emails.layouts.base')

@section('title', 'Account Deleted')
@section('label', 'Account Deleted')
@section('header-bg', 'linear-gradient(135deg, #1C1917 0%, #44403C 100%)')
@section('greeting-label', 'Account closed')
@section('heading')Goodbye,<br><span class="name">{{ $email }}</span>@endsection

@section('content')
    @if($isPermanent)
        <p class="message">Your Notepaper AI account has been permanently deleted. All associated data has been removed and cannot be recovered. We're sorry to see you go.</p>
    @else
        <p class="message">Your Notepaper AI account has been deactivated and is scheduled for deletion. Your data will be retained for 30 days — if you change your mind, you can restore your account within that window.</p>
    @endif
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
    @if(!$isPermanent)
        <div class="info-box">You have <strong>30 days</strong> to restore your account before it is permanently removed.</div>
    @endif
@endsection

@section('footer-note', 'Changed your mind? Restore your account within 30 days.')
