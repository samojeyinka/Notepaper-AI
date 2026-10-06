@extends('emails.layouts.base')

@section('title', 'New Ticket Reply')
@section('label', 'Support Ticket')
@section('greeting-label', 'New reply on your ticket')
@section('heading')You have a<br><span class="name">new message</span>@endsection

@section('content')
    <p class="message">
        {{ $message->user->full_name }} has replied to your support ticket.
        Here is a preview of what was said.
    </p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
    <div class="info-box">
        <strong>Ticket:</strong> {{ $message->ticket->subject }}<br>
        <strong>Message:</strong> {{ $message->body }}
    </div>
    <div class="cta-wrap">
        <a href="{{ url(config('app.frontend_url') . '/lockedin/support-tickets/show/' . $message->ticket->id) }}" class="cta-btn">View Ticket</a>
        <p class="cta-note">Click above to open the full conversation.</p>
    </div>
@endsection

@section('footer-note', "You're receiving this because you have an open ticket with us.")
