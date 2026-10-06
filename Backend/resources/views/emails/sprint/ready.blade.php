@extends('emails.layouts.base')

@section('title', 'Sprint Ready')
@section('label', 'Sprint Ready')
@section('header-bg', 'linear-gradient(135deg, #065f46 0%, #059669 100%)')
@section('greeting-label', 'Challenge awaits')
@section('heading')Hey,<br><span class="name">{{ $full_name }}</span>@endsection

@section('content')
    <p class="message">Great news — your sprint <strong>"{{ $title }}"</strong> has been generated and your first challenges are ready to go.</p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
    <div class="info-box">
        Keep your momentum going. Open your sprint to start tackling your challenges and track your progress.
    </div>
    <div class="cta-wrap">
        <a href="{{ $url }}" class="cta-btn">Start Your Sprint</a>
    </div>
@endsection

@section('footer-note', 'Consistent practice leads to mastery.')
@section('badge', 'Schola Assistant')
