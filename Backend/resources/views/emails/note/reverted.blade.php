@extends('emails.layouts.base')

@section('title', 'Note Reverted')
@section('label', 'Note Reverted')
@section('greeting-label', 'System action')
@section('heading')Hey,<br><span class="name">{{ $full_name }}</span>@endsection

@section('content')
    <p class="message">Your note <strong>"{{ $note->title }}"</strong> has been restored to a previous version (Version {{ $version->version_number }}). All content from that point in time has been recovered.</p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
    <div class="cta-wrap">
        <a href="{{ $url }}" class="cta-btn">View Note</a>
    </div>
@endsection

@section('footer-note')Restore date: {{ now()->format('M j, Y H:i') }}@endsection
@section('badge', 'Content Recovery')
