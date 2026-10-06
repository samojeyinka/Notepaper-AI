@extends('emails.layouts.base')

@section('title', 'API Key Connected')
@section('label', 'Security')
@section('greeting-label', 'Confirmation')
@section('heading')Hey,<br><span class="name">{{ $full_name }}</span>@endsection

@section('content')
    <p class="message">Your <strong>{{ $provider }}</strong> API key has been saved successfully. It is stored encrypted and is only ever used server-side.</p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>
    <div class="info-box">
        <strong>Provider:</strong> {{ $provider }}<br>
        @if ($model)
        <strong>Model:</strong> {{ $model }}
        @endif
    </div>
    <p class="message">All AI features on Notepaper AI are now unlocked. You only need one key — it powers note generation, quizzes, study plans and more.</p>
    <div class="cta-wrap">
        <a href="{{ $url }}" class="cta-btn">Manage API Keys</a>
    </div>
@endsection

@section('footer-note', 'Never share your API key with anyone. You can add or remove keys at any time from Profile Settings.')
