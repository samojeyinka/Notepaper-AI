@extends('emails.layouts.base')

@section('title', 'Team Update')
@section('label', 'Team Update')
@section('greeting-label', 'Team update')
@section('heading')Admin<br><span class="name">Team Update</span>@endsection

@section('content')
    <p class="message">{{ $user->full_name }} has joined the Notepaper AI administrative team as <strong>{{ $roleName }}</strong>. The team has been updated accordingly. Welcome them aboard and ensure they have everything they need to get started.</p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
@endsection

@section('footer-note', 'This is an automated administrative notification from Notepaper AI.')
