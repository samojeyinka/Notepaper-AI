@extends('emails.layouts.base')

@section('title', 'Account Activated')
@section('label', 'Account Activated')
@section('header-bg', 'linear-gradient(135deg, #065f46 0%, #059669 100%)')
@section('greeting-label', "You're verified")
@section('heading')Hey there,<br><span class="name">{{ $user->full_name }}</span>@endsection

@section('content')
    <p class="message">Your email address has been successfully verified. Your Notepaper AI account is now fully active. Head to the app and start capturing your ideas, building folders, and making the most of everything we offer.</p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
@endsection

@section('footer-note', "If you didn't verify this account, please contact us immediately.")
