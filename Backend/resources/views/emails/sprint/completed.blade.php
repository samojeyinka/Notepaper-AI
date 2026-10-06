@extends('emails.layouts.base')

@section('title', 'Sprint Accomplished')
@section('label', 'Sprint Accomplished')
@section('header-bg', 'linear-gradient(135deg, #065f46 0%, #059669 100%)')
@section('greeting-label', 'Great work')
@section('heading')Bravo,<br><span class="name">{{ $full_name }}</span>@endsection

@section('content')
    <p class="message">You've successfully completed all challenges in your sprint: <strong>"{{ $title }}"</strong>. This is a significant step toward mastering your topics.</p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
    <div class="cta-wrap">
        <a href="{{ $url }}" class="cta-btn">Review Sprint Results</a>
    </div>
@endsection

@section('footer-note')Milestone reached: {{ now()->format('M j, Y') }}@endsection
@section('badge', 'Schola Assistant')
