@extends('emails.layouts.base')

@section('title', 'Study Plan Ready')
@section('label', 'Study Plan')
@section('header-bg', 'linear-gradient(135deg, #065f46 0%, #059669 100%)')
@section('greeting-label', 'Schedule ready')
@section('heading')Hey,<br><span class="name">{{ $full_name }}</span>@endsection

@section('content')
    <p class="message">Great news — your study plan <strong>"{{ $name }}"</strong> has been generated and your schedule is ready.</p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
    <div class="info-box">
        Your personalized learning journey is waiting. Open your plan to see your upcoming tasks and goals.
    </div>
    <div class="cta-wrap">
        <a href="{{ $url }}" class="cta-btn">View Study Plan</a>
    </div>
@endsection

@section('footer-note', 'Stay on track with Notepaper AI.')
@section('badge', 'Schola Assistant')
