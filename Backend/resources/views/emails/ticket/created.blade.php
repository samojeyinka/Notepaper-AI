@extends('emails.layouts.base')

@section('title', 'Support Ticket Created')
@section('label', 'Support Ticket')
@section('greeting-label', 'Ticket confirmation')
@section('heading')Hey,<br><span class="name">{{ $full_name }}</span>@endsection

@section('content')
    <p class="message">Your support ticket has been successfully created. Our team will review your request and get back to you as soon as possible.</p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
    <div class="info-box">
        <strong>Subject:</strong> {{ $ticket->subject }}<br>
        <strong>Details:</strong> {{ $ticket->details }}
    </div>
    <div class="cta-wrap">
        <a href="{{ url(config('app.frontend_url') . '/lockedin/support-tickets/show/' . $ticket->id) }}" class="cta-btn">View Ticket</a>
    </div>
@endsection

@section('footer-note')Ticket ID: #{{ $ticket->id }}@endsection
