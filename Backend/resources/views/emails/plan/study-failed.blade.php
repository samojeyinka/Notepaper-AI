@extends('emails.layouts.base')

@section('title', 'Study Plan Failed')
@section('label', 'Study Plan Failed')
@section('header-bg', 'linear-gradient(135deg, #78350f 0%, #b45309 100%)')
@section('greeting-label', 'Something went wrong')
@section('heading')Hey,<br><span class="name">{{ $full_name }}</span>@endsection

@section('content')
    <p class="message">We were unable to generate your study plan <strong>"{{ $name }}"</strong>. This is usually a temporary issue with our AI service.</p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
    <div class="info-box">
        Head back to Study Plans and try creating it again — it typically resolves on a retry.
    </div>
    <div class="cta-wrap">
        <a href="{{ $url }}" class="cta-btn">Go to Study Plans</a>
    </div>
@endsection

@section('footer-note', 'If this keeps happening, please contact support.')
@section('badge', 'Schola Assistant')
