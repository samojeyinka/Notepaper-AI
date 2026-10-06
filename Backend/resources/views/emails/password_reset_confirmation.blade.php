@extends('emails.layouts.base')

@section('title', 'Password Updated')
@section('label', 'Password Updated')
@section('header-bg', 'linear-gradient(135deg, #065f46 0%, #059669 100%)')
@section('greeting-label', 'Security update')
@section('heading')Hey there,<br><span class="name">{{ $user->full_name }}</span>@endsection

@section('content')
    <p class="message">Your Notepaper AI password has been successfully reset. You can now sign in with your new credentials. If you did not make this change, please contact our support team immediately.</p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
@endsection

@section('footer-note', "Didn't reset your password? Please secure your account by contacting support right away.")
