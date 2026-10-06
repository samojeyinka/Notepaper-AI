@extends('emails.layouts.base')

@section('title', 'Two-Factor Auth Enabled')
@section('label', 'Two-Factor Auth')
@section('header-bg', 'linear-gradient(135deg, #065f46 0%, #059669 100%)')
@section('greeting-label', 'Security update')
@section('heading')Hey there,<br><span class="name">{{ $user->full_name }}</span>@endsection

@section('content')
    <p class="message">Two-factor authentication has been successfully enabled on your Notepaper AI account. From now on, you'll be prompted for a verification code each time you sign in. This extra layer of protection helps keep your account safe.</p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
    <div class="info-box">If you did not enable this setting, your account may be compromised. <strong>Please contact support immediately.</strong></div>
@endsection

@section('footer-note', "Didn't enable 2FA? Please secure your account right away.")
