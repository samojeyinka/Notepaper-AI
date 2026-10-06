<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Notepaper AI')</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background-color: #FDFBF7; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-weight: 400; color: #57534E; padding: 48px 16px; }
        .wrapper { max-width: 580px; margin: 0 auto; }
        .top-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
        .logo { font-family: 'Playfair Display', serif; font-size: 19px; font-weight: 600; letter-spacing: 0.01em; color: #1C1917; }
        .logo .ai { color: #6C4EA6; font-size: 14px; letter-spacing: 0.18em; margin-left: 2px; vertical-align: middle; }
        .label { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #A8A29E; }
        .card { background-color: #ffffff; border: 1px solid #E7E5E4; border-radius: 0; overflow: hidden; box-shadow: 0 10px 30px rgba(28,25,23,0.06); }
        .card-header { padding: 44px 48px 38px; }
        .greeting-label { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.6); margin-bottom: 14px; }
        .greeting { font-family: 'Playfair Display', serif; font-size: 34px; font-weight: 500; color: #ffffff; line-height: 1.25; }
        .greeting .name { color: #DCCCF0; }
        .card-body { padding: 40px 48px 44px; }
        .message { font-size: 15px; line-height: 1.85; color: #57534E; margin-bottom: 32px; max-width: 440px; }
        .message strong { color: #1C1917; font-weight: 600; }
        .divider { display: flex; align-items: center; gap: 14px; margin-bottom: 32px; }
        .divider-line { flex: 1; height: 1px; background: #E7E5E4; }
        .divider-dot { width: 4px; height: 4px; border-radius: 50%; background: #A487D0; }
        .cta-wrap { margin-bottom: 32px; }
        .cta-btn { display: inline-block; background-color: #6C4EA6; color: #ffffff !important; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; text-decoration: none; padding: 15px 34px; border-radius: 2px; }
        .cta-note { margin-top: 12px; font-size: 11px; color: #A8A29E; letter-spacing: 0.02em; }
        .info-box { background: #F7F3FB; border-left: 3px solid #A487D0; padding: 16px 20px; margin-bottom: 32px; font-size: 13px; color: #57534E; line-height: 1.7; border-radius: 0; }
        .info-box strong { color: #452F6E; font-weight: 600; }
        .info-box em { color: #6C4EA6; }
        .info-box a { color: #6C4EA6; text-decoration: none; }
        .card-footer { border-top: 1px solid #F5F5F4; padding: 22px 48px; display: flex; justify-content: space-between; align-items: center; }
        .footer-note { font-size: 11px; color: #A8A29E; line-height: 1.6; }
        .footer-note a { color: #6C4EA6; text-decoration: none; }
        .security-badge { font-size: 10px; letter-spacing: 0.12em; color: #A8A29E; text-transform: uppercase; white-space: nowrap; }
        .bottom-note { text-align: center; margin-top: 26px; font-size: 11px; color: #A8A29E; letter-spacing: 0.04em; }
        .meta { font-size: 11px; color: #A8A29E; margin-top: 8px; letter-spacing: 0.03em; }
        @media (max-width: 600px) {
            body { padding: 24px 12px; }
            .top-bar { margin-bottom: 22px; }
            .card-header { padding: 34px 26px 28px; }
            .greeting { font-size: 27px; }
            .card-body { padding: 28px 26px 32px; }
            .card-footer { padding: 20px 26px; flex-direction: column; align-items: flex-start; gap: 10px; }
            .security-badge { white-space: normal; }
        }
        @yield('extra-styles')
    </style>
</head>
<body>
<div class="wrapper">
    <div class="top-bar">
        <div class="logo">Notepaper<span class="ai">AI</span></div>
        <div class="label">@yield('label', 'Notification')</div>
    </div>
    <div class="card">
        <div class="card-header" style="background: @yield('header-bg', 'linear-gradient(135deg, #452F6E 0%, #6C4EA6 100%)');">
            <div class="greeting-label">@yield('greeting-label')</div>
            <div class="greeting">@yield('heading')</div>
        </div>
        <div class="card-body">
            @yield('content')
        </div>
        <div class="card-footer">
            <div class="footer-note">@yield('footer-note', 'This is an automated notification from Notepaper AI.')</div>
            <div class="security-badge">@yield('badge', 'Secure Mail')</div>
        </div>
    </div>
    <div class="bottom-note">© {{ date('Y') }} Notepaper AI · All rights reserved</div>
</div>
</body>
</html>
