@extends('emails.layouts.base')

@section('title', 'Profile Updated')
@section('label', 'Profile Updated')
@section('header-bg', 'linear-gradient(135deg, #78350f 0%, #b45309 100%)')
@section('greeting-label', 'Account security')
@section('heading')Hi,<br><span class="name">{{ $user->full_name }}</span>@endsection

@section('content')
    <p class="message">Your Notepaper AI profile information was just updated. If you made this change, no action is needed.</p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
    <div class="info-box">
        If you did not make this change, please secure your account immediately by changing your password or contacting support.
    </div>
    <p class="meta">Updated on {{ now()->format('F j, Y \a\t g:i A') }} UTC</p>
@endsection

@section('footer-note', 'This is an automated security notification.')
@section('badge', 'Security Notice')
