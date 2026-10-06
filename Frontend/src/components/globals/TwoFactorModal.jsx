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
      className=" border-2 border-slate-100 shadow-sm"
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
          className={`w-7 md:w-10 h-7 md:h-12 text-center text-[15px] md:text-lg font-medium md:font-bold  md: border-2 outline-none transition-all duration-150 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 ${digit ? 'border-purple-400 bg-purple-50' : 'border-slate-200 bg-white'}`}
          style={{ color: '#1e293b', caretColor: '#7c3aed' }}
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
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white  md: shadow-2xl w-full max-w-md overflow-hidden"
        style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 md:w-9 md:h-9  md: bg-purple-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-600" style={{ fontSize: '20px' }}>
                {mode === 'enable' ? 'security' : 'lock_open'}
              </span>
            </div>
            <div>
              <h3 className="font-medium md:font-bold text-slate-900 text-[15px]">
                {mode === 'enable' ? 'Enable 2FA' : 'Disable 2FA'}
              </h3>
              <p className="text-[11.5px] md:text-xs text-slate-400">
                {mode === 'enable' ? 'Add an extra layer of security' : 'Remove two-factor authentication'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-6 h-6 md:w-8 md:h-8  hover:bg-slate-100 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-3 py-3 md:px-6 md:py-6">

          {/* Error */}
          {error && (
            <div className="mb-2 md:mb-4 flex items-start gap-2 p-1.5 md:p-3 bg-red-50 border border-red-100  md: text-[12px] md:text-sm text-red-600">
              <span className="material-symbols-outlined mt-0.5" style={{ fontSize: '16px' }}>error</span>
              <span>{error}</span>
            </div>
          )}

          {/* ── STEP: setup ──────────────────────────── */}
          {step === 'setup' && (
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16  md: bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-indigo-500 text-4xl">qr_code_2</span>
              </div>
              <h4 className="text-[14px] md:text-base font-medium md:font-bold text-slate-800 mb-2">Set Up Authenticator</h4>
              <p className="text-slate-500 text-[12px] md:text-sm mb-3 md:mb-6 leading-relaxed">
                You'll need an authenticator app like <strong>Google Authenticator</strong> or <strong>Authy</strong> to scan the QR code on the next step.
              </p>
              <button
                onClick={handleSetup}
                disabled={loading}
                className="w-full text-[14px] md:text-base bg-purple-600 hover:bg-purple-700 text-white font-medium py-1.5   md: transition-all active:scale-[0.98] disabled:opacity-60"
                style={{ boxShadow: '0 10px 20px -5px rgba(124,58,237,0.3)' }}
              >
                {loading ? 'Generating QR Code...' : 'Generate QR Code →'}
              </button>
            </div>
          )}

          {/* ── STEP: verify ─────────────────────────── */}
          {step === 'verify' && (
            <div>
              {/* Show QR only when enabling */}
              {mode === 'enable' && setupData && (
                <div className="mb-6">
                  <p className="text-[14px] md:text-sm font-medium md:font-semibold text-slate-700 mb-3 text-center">
                    Scan with your authenticator app
                  </p>
                  <div className="flex flex-col items-center gap-3">
                    <QrCanvas value={setupData.qr_url} />
                    {/* Manual entry fallback */}
                    <details className="w-full text-center">
                      <summary className="text-[11px] md:text-xs text-slate-400 cursor-pointer hover:text-slate-600 transition-colors">
                        Can't scan? Enter manually
                      </summary>
                      <div className="w-[fit-content] m-auto mt-1 md:mt-2 p-1.5 md:p-3 bg-slate-50  md: font-mono text-xs text-slate-600 break-all select-all border border-slate-200">
                        {setupData.secret_key}
                      </div>
                    </details>
                  </div>
                  <hr className="border-dashed border-slate-200 my-5" />
                </div>
              )}

              <p className="text-[13px] md:text-sm font-medium md:font-semibold text-slate-700 mb-1 text-center">
                {mode === 'enable' ? 'Enter the 6-digit code shown in your app' : 'Enter your current authenticator code to confirm'}
              </p>
              <p className="text-[11px] md:text-xs text-slate-400 text-center mb-4">
                The code refreshes every 30 seconds
              </p>

              <OtpInput value={otp} onChange={setOtp} disabled={loading} />

              <button
                onClick={handleVerify}
                disabled={loading || otp.length < 6}
                className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white font-medium md:font-bold py-1.5 md:py-3  md: transition-all active:scale-[0.98] disabled:opacity-60"
                style={{ boxShadow: '0 10px 20px -5px rgba(124,58,237,0.3)' }}
              >
                {loading ? 'Verifying...' : mode === 'enable' ? 'Enable 2FA' : 'Disable 2FA'}
              </button>
            </div>
          )}

          {/* ── STEP: done ───────────────────────────── */}
          {step === 'done' && (
            <div className="text-center py-4">
              <div className={`w-16 h-16  flex items-center justify-center mx-auto mb-4 ring-4 ${
                mode === 'enable' ? 'bg-emerald-100 ring-emerald-50' : 'bg-slate-100 ring-slate-50'
              }`}>
                <span className={`material-symbols-outlined text-4xl ${
                  mode === 'enable' ? 'text-emerald-600' : 'text-slate-500'
                }`}>
                  {mode === 'enable' ? 'verified_user' : 'lock_open'}
                </span>
              </div>
              <h4 className="font-bold text-slate-800 mb-2">
                {mode === 'enable' ? '2FA Enabled!' : '2FA Disabled'}
              </h4>
              <p className="text-slate-500 text-sm mb-6">
                {mode === 'enable'
                  ? 'Your account is now protected with two-factor authentication.'
                  : 'Two-factor authentication has been removed from your account.'}
              </p>
              <button
                onClick={onClose}
                className="w-full text-[14px] md:text-base bg-slate-900 hover:bg-slate-800 text-white font-medium md:font-bold py-1.5 md:py-3  md: transition-all active:scale-[0.98]"
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
