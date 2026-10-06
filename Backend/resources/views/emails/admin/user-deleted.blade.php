@extends('emails.layouts.base')

@section('title', 'Account Notice')
@section('label', 'Account Notice')
@section('header-bg', 'linear-gradient(135deg, #1C1917 0%, #44403C 100%)')
@section('greeting-label', 'Account notice')
@section('heading')Hi,<br><span class="name">{{ $user->full_name }}</span>@endsection

@section('content')
    @if($isPermanent)
        <p class="message">Your Notepaper AI account has been <strong>permanently removed</strong> by an administrator. All associated data has been deleted and cannot be recovered.</p>
        <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
        <div class="info-box">
            If you believe this was done in error, please contact our support team as soon as possible.
        </div>
    @else
        <p class="message">Your Notepaper AI account has been <strong>deactivated</strong> by an administrator. Your data is preserved and you may request restoration within <strong>30 days</strong>.</p>
        <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
        <div class="info-box">
            If you believe this was done in error or wish to restore your account, please reach out to support before the 30-day window closes.
        </div>
    @endif
@endsection

@section('footer-note', 'Questions? Contact our support team.')
@section('badge', 'Admin Action')
