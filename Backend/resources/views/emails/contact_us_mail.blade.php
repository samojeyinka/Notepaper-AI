@extends('emails.layouts.base')

@section('title', 'Contact Us Message')
@section('label', 'Contact Us Message')
@section('greeting-label', 'New message received')
@section('heading')User<br><span class="name">Reached Out</span>@endsection

@section('extra-styles')
    .message-box { background: #F7F3FB; border: 1px solid #E7E5E4; border-radius: 0; padding: 20px 24px; margin-bottom: 36px; }
    .message-box-label { font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: #6C4EA6; margin-bottom: 10px; font-weight: 600; }
    .message-box-body { font-size: 14px; line-height: 1.75; color: #57534E; }
@endsection

@section('content')
    <p class="message">
        A user has submitted a message through the <strong>Contact Us</strong> form on Notepaper AI.
        Their details and message are included below. Please respond to them at your earliest convenience.
    </p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
    <div class="info-box">
        <strong>Name:</strong> {{ $contactData['name'] }}<br>
        <strong>Email:</strong> <a href="mailto:{{ $contactData['email'] }}">{{ $contactData['email'] }}</a><br>
        <strong>Received:</strong> {{ now()->format('F j, Y \a\t g:i A') }}
    </div>
    <div class="message-box">
        <div class="message-box-label">Message</div>
        <div class="message-box-body">{{ $contactData['message'] }}</div>
    </div>
    <div class="cta-wrap">
        <a href="mailto:{{ $contactData['email'] }}?subject=Re: Your message to Notepaper AI" class="cta-btn">Reply to {{ $contactData['name'] }}</a>
        <p class="cta-note">Clicking the button opens a pre-addressed reply to the sender.</p>
    </div>
@endsection

@section('footer-note', "This is an automated notification from Notepaper AI. Do not reply directly to this email.")
