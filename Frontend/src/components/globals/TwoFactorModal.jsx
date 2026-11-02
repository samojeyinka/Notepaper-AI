import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { userService } from '../../api/userService';
import { useAuth } from '../../context/AuthContext';

// ─── QR Code canvas renderer ──────────────────────────────────────────
function QrCanvas({ value }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    QRCode.toCanvas(canvasRef.current, value, {
      width: 180,
      margin: 2,
      color: { dark: '#1e1b4b', light: '#ffffff' },
    });
  }, [value]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded-xl border-2 border-stone-100 shadow-sm"
    />
  );
}

// ─── OTP 6-digit input ────────────────────────────────────────────────
function OtpInput({ value, onChange, disabled }) {
  // Keep a proper 6-slot array — never rely on padEnd with empty fill
  const inputRefs = useRef([]);
  const slots = Array.from({ length: 6 }, (_, i) => value[i] || '');

  const update = (nextSlots) => {
    onChange(nextSlots.join(''));
  };

  const handleChange = (index, char) => {
    if (!/^\d?$/.test(char)) return;
    const next = [...slots];
    next[index] = char;
    update(next);
    if (char && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (slots[index]) {
        const next = [...slots];
        next[index] = '';
        update(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        const next = [...slots];
        next[index - 1] = '';
        update(next);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = Array.from({ length: 6 }, (_, i) => pasted[i] || '');
    update(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {slots.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (inputRefs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          disabled={disabled}
          autoFocus={i === 0}
          className={`w-7 md:w-10 h-7 md:h-12 rounded-lg text-center text-[15px] md:text-lg font-medium md:font-bold border-2 outline-none transition-all duration-150 focus:border-[#78988d] focus:ring-2 focus:ring-[#54786f]/15 ${digit ? 'border-[#78988d] bg-[#edf3ef]' : 'border-stone-200 bg-white'}`}
          style={{ color: '#1e293b', caretColor: '#54786f' }}
        />
      ))}
    </div>
  );
}


// ─── Steps ─────────────────────────────────────────────────────────────
// ENABLE flow: setup → scan QR → enter OTP → done
// DISABLE flow:         enter OTP → done

export default function TwoFactorModal({ isOpen, onClose, currentlyEnabled, onSuccess }) {
  const { updateUser } = useAuth();

  // Lock mode at the moment the modal opens — never re-derive from prop mid-session.
  // Without this, calling onSuccess() changes currentlyEnabled which flips mode
  // and the useEffect resets the modal to the opposite flow while still open.
  const lockedMode = useRef(null);
  if (isOpen && lockedMode.current === null) {
    lockedMode.current = currentlyEnabled ? 'disable' : 'enable';
  }
  const mode = lockedMode.current ?? (currentlyEnabled ? 'disable' : 'enable');

  // enable steps: 'setup' | 'verify' | 'done'
  // disable steps: 'verify' | 'done'
  const [step, setStep] = useState(mode === 'enable' ? 'setup' : 'verify');
  const [setupData, setSetupData] = useState(null);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset only when the modal opens fresh — not on prop changes
  useEffect(() => {
    if (isOpen) {
      lockedMode.current = currentlyEnabled ? 'disable' : 'enable';
      setStep(lockedMode.current === 'enable' ? 'setup' : 'verify');
      setSetupData(null);
      setOtp('');
      setError(null);
      const onKeyDown = (event) => { if (event.key === 'Escape') onClose(); };
      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    } else {
      // Clear lock so next open re-reads the correct current state
      lockedMode.current = null;
    }
  }, [isOpen]); // ← intentionally only [isOpen], NOT [mode] or [currentlyEnabled]

  // ---------- Step: setup — fetch QR code
  const handleSetup = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await userService.setup2fa();
      setSetupData(res.data);
      setStep('verify');
    } catch (err) {
      setError(err?.message || 'Failed to initialize 2FA setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ---------- Step: verify OTP
  const handleVerify = async () => {
    if (otp.length < 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (mode === 'enable') {
        await userService.enable2fa(otp);
        updateUser({ google2fa_enabled: true });
      } else {
        await userService.disable2fa(otp);
        updateUser({ google2fa_enabled: false });
      }
      onSuccess?.(mode === 'enable');
      setStep('done');
    } catch (err) {
      setError(err?.message || 'Invalid OTP. Please try again.');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="two-factor-modal-title"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] min-h-0 overflow-hidden flex flex-col"
        style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#edf3ef] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#54786f]" style={{ fontSize: '20px' }}>
                {mode === 'enable' ? 'security' : 'lock_open'}
              </span>
            </div>
            <div>
              <h3 id="two-factor-modal-title" className="font-semibold text-stone-900 text-[15px]">
                {mode === 'enable' ? 'Enable 2FA' : 'Disable 2FA'}
              </h3>
              <p className="text-xs text-stone-500">
                {mode === 'enable' ? 'Add an extra layer of security' : 'Remove two-factor authentication'}
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close two-factor authentication dialog" className="w-9 h-9 rounded-full hover:bg-stone-100 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 overflow-y-auto overscroll-contain px-4 py-4 md:px-6 md:py-6">

          {/* Error */}
          {error && (
            <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl p-3 bg-red-50 border border-red-100 text-[13px] text-red-700">
              <span className="material-symbols-outlined mt-0.5" style={{ fontSize: '16px' }}>error</span>
              <span>{error}</span>
            </div>
          )}

          {/* ── STEP: setup ──────────────────────────── */}
          {step === 'setup' && (
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#edf3ef] flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[#54786f] text-4xl">qr_code_2</span>
              </div>
              <h4 className="text-base font-semibold text-stone-900 mb-2">Set up authenticator</h4>
              <p className="text-stone-500 text-sm mb-5 leading-relaxed">
                You'll need an authenticator app like <strong>Google Authenticator</strong> or <strong>Authy</strong> to scan the QR code on the next step.
              </p>
              <button
                onClick={handleSetup}
                disabled={loading}
                className="w-full rounded-full bg-[#355c53] hover:bg-[#294b43] text-white font-semibold py-3 transition-all active:scale-[0.98] disabled:opacity-60"
                style={{ boxShadow: '0 10px 20px -5px rgba(53,92,83,0.22)' }}
              >
                {loading
                  ? <span className="inline-flex items-center justify-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/35 border-t-white animate-spin" />Generating QR code…</span>
                  : 'Generate QR code →'}
              </button>
            </div>
          )}

          {/* ── STEP: verify ─────────────────────────── */}
          {step === 'verify' && (
            <div>
              {/* Show QR only when enabling */}
              {mode === 'enable' && setupData && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-stone-700 mb-3 text-center">
                    Scan with your authenticator app
                  </p>
                  <div className="flex flex-col items-center gap-3">
                    <QrCanvas value={setupData.qr_url} />
                    {/* Manual entry fallback */}
                    <details className="w-full text-center">
                      <summary className="text-xs text-stone-500 cursor-pointer hover:text-stone-700 transition-colors">
                        Can't scan? Enter manually
                      </summary>
                      <div className="w-fit max-w-full m-auto mt-2 p-3 rounded-lg bg-stone-50 font-mono text-xs text-stone-600 break-all select-all border border-stone-200">
                        {setupData.secret_key}
                      </div>
                    </details>
                  </div>
                  <hr className="border-dashed border-stone-200 my-5" />
                </div>
              )}

              <p className="text-sm font-semibold text-stone-700 mb-1 text-center">
                {mode === 'enable' ? 'Enter the 6-digit code shown in your app' : 'Enter your current authenticator code to confirm'}
              </p>
              <p className="text-xs text-stone-500 text-center mb-4">
                The code refreshes every 30 seconds
              </p>

              <OtpInput value={otp} onChange={setOtp} disabled={loading} />

              <button
                onClick={handleVerify}
                disabled={loading || otp.length < 6}
                className="mt-6 w-full rounded-full bg-[#355c53] hover:bg-[#294b43] text-white font-semibold py-3 transition-all active:scale-[0.98] disabled:opacity-60"
                style={{ boxShadow: '0 10px 20px -5px rgba(53,92,83,0.22)' }}
              >
                {loading
                  ? <span className="inline-flex items-center justify-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/35 border-t-white animate-spin" />Verifying…</span>
                  : mode === 'enable' ? 'Enable 2FA' : 'Disable 2FA'}
              </button>
            </div>
          )}

          {/* ── STEP: done ───────────────────────────── */}
          {step === 'done' && (
            <div className="text-center py-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-4 ${
                mode === 'enable' ? 'bg-emerald-100 ring-emerald-50' : 'bg-slate-100 ring-slate-50'
              }`}>
                <span className={`material-symbols-outlined text-4xl ${
                  mode === 'enable' ? 'text-emerald-600' : 'text-slate-500'
                }`}>
                  {mode === 'enable' ? 'verified_user' : 'lock_open'}
                </span>
              </div>
              <h4 className="font-semibold text-stone-900 mb-2">
                {mode === 'enable' ? '2FA Enabled!' : '2FA Disabled'}
              </h4>
              <p className="text-stone-500 text-sm mb-6">
                {mode === 'enable'
                  ? 'Your account is now protected with two-factor authentication.'
                  : 'Two-factor authentication has been removed from your account.'}
              </p>
              <button
                onClick={onClose}
                className="w-full rounded-full bg-[#355c53] hover:bg-[#294b43] text-white font-semibold py-3 transition-all active:scale-[0.98]"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
