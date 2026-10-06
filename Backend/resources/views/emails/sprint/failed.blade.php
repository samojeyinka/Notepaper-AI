@extends('emails.layouts.base')

@section('title', 'Sprint Failed')
@section('label', 'Sprint Failed')
@section('header-bg', 'linear-gradient(135deg, #78350f 0%, #b45309 100%)')
@section('greeting-label', 'Something went wrong')
@section('heading')Hey,<br><span class="name">{{ $full_name }}</span>@endsection

@section('content')
    <p class="message">We were unable to generate your sprint <strong>"{{ $title }}"</strong>. This is usually a temporary issue with our AI service.</p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
    <div class="info-box">
        Head back to Sprints and try creating it again — it typically resolves on a retry.
    </div>
    <div class="cta-wrap">
        <a href="{{ $url }}" class="cta-btn">Go to Sprints</a>
    </div>
@endsection

@section('footer-note', 'If this keeps happening, please contact support.')
@section('badge', 'Schola Assistant')
