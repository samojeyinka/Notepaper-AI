@extends('emails.layouts.base')

@section('title', 'Ticket Status Updated')
@section('label', 'Support Ticket')
@section('greeting-label', 'Status update')
@section('heading')Hey,<br><span class="name">{{ $full_name }}</span>@endsection

@section('content')
    <p class="message">The status of your support ticket has been updated to <strong>{{ $statusLabel }}</strong>.</p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
    <div class="info-box">
        <strong>Ticket:</strong> #{{ $ticket->id }} – {{ $ticket->subject }}<br>
        <strong>New Status:</strong> {{ $statusLabel }}
    </div>
    <div class="cta-wrap">
        <a href="{{ $url }}" class="cta-btn">View Ticket</a>
    </div>
@endsection

@section('footer-note', 'Thank you for reaching out to Notepaper AI support.')
