@extends('emails.layouts.base')

@section('title', 'API Key Removed')
@section('label', 'Security')
@section('greeting-label', 'Confirmation')
@section('heading')Hey,<br><span class="name">{{ $full_name }}</span>@endsection

@section('content')
    <p class="message">Your <strong>{{ $provider }}</strong> API key has been removed. It is no longer stored and can no longer be used by Notepaper AI.</p>
    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>

    @if ($promoted)
    <div class="info-box">
        <strong>Now using:</strong> {{ $promoted }}<br>
        <strong>Previous:</strong> {{ $provider }}
    </div>
    <p class="message">Your AI features stay unlocked — {{ $promoted }} is now your default provider.</p>
    @else
    <div class="info-box">
        <strong>Removed:</strong> {{ $provider }}<br>
        <strong>Keys connected:</strong> None
    </div>
    <p class="message">AI features will be unavailable until you connect a key again.</p>
    @endif

    <div class="cta-wrap">
        <a href="{{ $url }}" class="cta-btn">Manage API Keys</a>
    </div>
@endsection

@section('footer-note', 'If you did not remove this key, please secure your provider account and rotate its credentials immediately.')
