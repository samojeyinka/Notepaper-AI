@extends('emails.layouts.base')

@section('title', 'Password Changed')
@section('label', 'Password Changed')
@section('header-bg', 'linear-gradient(135deg, #065f46 0%, #059669 100%)')
@section('greeting-label', 'Security confirmation')
@section('heading')Hey there,<br><span class="name">{{ $user->full_name }}</span>@endsection

@section('content')
    <p class="message">Your Notepaper AI account password has been successfully changed. If you made this change, no further action is needed. If you didn't authorise this update, please contact our support team immediately to secure your account.</p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
@endsection

@section('footer-note', "Didn't change your password? Contact support immediately.")
