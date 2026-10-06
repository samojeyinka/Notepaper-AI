@extends('emails.layouts.base')

@section('title', 'Sprint Reminder')
@section('label', 'Sprint Reminder')
@section('greeting-label', 'Stay focused')
@section('heading')Hey,<br><span class="name">{{ $full_name }}</span>@endsection

@section('content')
    <p class="message">{{ $intro }}</p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
    <div class="cta-wrap">
        <a href="{{ $url }}" class="cta-btn">Continue Sprint</a>
    </div>
@endsection

@section('footer-note', 'Consistent practice leads to mastery.')
@section('badge', 'Schola Assistant')
