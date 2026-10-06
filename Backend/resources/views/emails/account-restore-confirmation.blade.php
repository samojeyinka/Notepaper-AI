@extends('emails.layouts.base')

@section('title', 'Account Restored')
@section('label', 'Account Restored')
@section('header-bg', 'linear-gradient(135deg, #065f46 0%, #059669 100%)')
@section('greeting-label', 'Welcome back')
@section('heading')Hey there,<br><span class="name">{{ $user->full_name }}</span>@endsection

@section('content')
    <p class="message">Your Notepaper AI account has been successfully restored. Everything is right where you left it — your notes, folders, and settings are all intact. We're glad to have you back.</p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
@endsection

@section('footer-note', "Didn't request this restoration? Please contact support immediately.")
