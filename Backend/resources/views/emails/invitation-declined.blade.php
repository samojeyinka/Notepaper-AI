@extends('emails.layouts.base')

@section('title', 'Invitation Declined')
@section('label', 'Invitation Declined')
@section('header-bg', 'linear-gradient(135deg, #78350f 0%, #b45309 100%)')
@section('greeting-label', 'Invitation update')
@section('heading')Hey there,<br><span class="name">Admin Team</span>@endsection

@section('content')
    <p class="message">{{ $user->full_name }} has declined the invitation to join the Notepaper AI administrative team as <strong>{{ $roleName }}</strong>. No action has been taken on their account. You may wish to extend the invitation to another candidate.</p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
@endsection

@section('footer-note', 'This is an automated administrative notification from Notepaper AI.')
