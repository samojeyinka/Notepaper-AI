@extends('emails.layouts.base')

@section('title', 'Payment Receipt')
@section('label', 'Payment Receipt')
@section('header-bg', 'linear-gradient(135deg, #322152 0%, #583D8B 100%)')
@section('greeting-label', 'Thank you')
@section('heading')Receipt for<br><span class="name">{{ $full_name }}</span>@endsection

@section('extra-styles')
.receipt-table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
.receipt-table th { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: #A8A29E; font-weight: 600; padding-bottom: 10px; border-bottom: 1px solid #E7E5E4; text-align: left; }
.receipt-table th.right, .receipt-table td.right { text-align: right; }
.receipt-table td { padding: 14px 0 0; font-size: 14px; color: #57534E; }
.receipt-table td.amount { font-size: 16px; font-weight: 600; color: #1C1917; }
.receipt-total { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-top: 1px solid #E7E5E4; margin-bottom: 28px; }
.receipt-total-label { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #A8A29E; }
.receipt-total-amount { font-size: 22px; font-weight: 700; color: #1C1917; }
.paid-badge { display: inline-flex; align-items: center; gap: 6px; background: #ECFDF5; color: #047857; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; padding: 5px 12px; border-radius: 2px; }
.ref-box { background: #F7F3FB; border-radius: 0; padding: 12px 16px; margin-bottom: 28px; font-size: 12px; color: #57534E; }
.ref-box span { color: #452F6E; font-weight: 600; font-family: monospace; font-size: 13px; }
@endsection

@section('content')
    <p class="message">Hi <strong>{{ $full_name }}</strong>, your payment was successful. Here's your receipt for the <strong>{{ $plan }}</strong> plan.</p>

    <div class="ref-box">
        Reference: <span>{{ $reference }}</span> &nbsp;·&nbsp; {{ $paid_at }}
    </div>

    <table class="receipt-table">
        <thead>
            <tr>
                <th>Description</th>
                <th>Billing</th>
                <th class="right">Amount</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{{ $plan }} Plan</td>
                <td>{{ $interval }}</td>
                <td class="right amount">{{ $amount_formatted }}</td>
            </tr>
        </tbody>
    </table>

    <div class="receipt-total">
        <div>
            <div class="receipt-total-label">Total charged</div>
            <div class="receipt-total-amount">{{ $amount_formatted }}</div>
        </div>
        <div class="paid-badge">&#10003; Paid</div>
    </div>

    <div class="divider"><div class="divider-line"></div><div class="divider-dot"></div><div class="divider-line"></div></div>

    <div class="cta-wrap">
        <a href="{{ $history_url }}" class="cta-btn">View Billing History</a>
        <p class="cta-note">You can download a PDF receipt from your billing history page.</p>
    </div>
@endsection

@section('footer-note', 'Questions about this charge? Email us at <a href="mailto:support@notepaper.ai">support@notepaper.ai</a>')
@section('badge', 'Secure Payment')
