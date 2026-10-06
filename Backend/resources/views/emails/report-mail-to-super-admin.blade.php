@extends('emails.layouts.base')

@section('title', 'Suspension Report')
@section('label', 'Suspension Report')
@section('header-bg', 'linear-gradient(135deg, #78350f 0%, #b45309 100%)')
@section('greeting-label', 'Action required')
@section('heading')New<br><span class="name">Suspension Report</span>@endsection

@section('content')
    <p class="message">{{ $requestedBy->full_name }} has submitted a suspension report flagging <strong>{{ $count }} user{{ $count > 1 ? 's' : '' }}</strong> for review. Please log in to the admin panel to review the details and take appropriate action.</p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
    <div class="info-box">
        <strong>Reported by:</strong> {{ $requestedBy->full_name }}<br>
        <strong>Users flagged:</strong> {{ $count }}
    </div>
@endsection

@section('footer-note', 'This is an automated administrative notification from Notepaper AI.')
