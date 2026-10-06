@extends('emails.layouts.base')

@section('title', 'Invitation Accepted')
@section('label', 'Invitation Accepted')
@section('greeting-label', 'New team member')
@section('heading')Hey there,<br><span class="name">Admin Team</span>@endsection

@section('content')
    <p class="message">{{ $user->full_name }} has accepted the invitation and joined the Notepaper AI administrative team as <strong>{{ $roleName }}</strong>. They now have access to the admin panel and are ready to contribute.</p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
@endsection

@section('footer-note', 'This is an automated administrative notification from Notepaper AI.')
