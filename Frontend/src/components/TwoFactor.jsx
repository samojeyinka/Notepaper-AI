import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from './globals/Alert';
import AuthShell from './auth/AuthShell';

export default function TwoFactor() {
  const { verify2fa } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // temp_token arrives via navigation state on first load.
  // We persist it to sessionStorage so a page refresh doesn't break the flow.
  const stateToken = location.state?.tempToken;
  const destination = location.state?.from ?? sessionStorage.getItem('np_2fa_from') ?? '/lockedin';
  useEffect(() => {
    if (stateToken) sessionStorage.setItem('np_2fa_token', stateToken);
    if (location.state?.from) sessionStorage.setItem('np_2fa_from', location.state.from);
  }, [stateToken, location.state?.from]);
  const tempToken = stateToken ?? sessionStorage.getItem('np_2fa_token');

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRefs = useRef([]);

  // Redirect away if someone lands here without a temp token
  useEffect(() => {
    if (!tempToken) navigate('/signin', { replace: true });
  }, [tempToken, navigate]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // digits only
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto-advance
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pasted.split('').forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setError({ message: 'Please enter the complete 6-digit code.' });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await verify2fa(tempToken, code);
      sessionStorage.removeItem('np_2fa_token');
      sessionStorage.removeItem('np_2fa_from');
      navigate(destination, { replace: true });
    } catch (err) {
      setError({ message: err?.message || 'Invalid OTP. Please try again.' });
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell aside={{
      title: ['One more step to', 'your notebook.'],
      sub: 'Your account has an extra layer of security. Enter the six-digit code from your authenticator app to continue.',
      children: <div className="flex items-center gap-3 text-sm text-[#50675f]"><span className="material-symbols-outlined text-[#54786f]">verified_user</span> Your sign-in stays private and secure.</div>,
    }}>
      <header className="mb-8">
        <p className="auth-kicker mb-3">Account security</p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-stone-900">Verify it’s you</h1>
        <p className="text-stone-500 text-[15px] mt-2">Enter the 6-digit one-time code from your authenticator app.</p>
      </header>
      {error && <div className="mb-5"><Alert type="error" message={error.message} details={error.details} /></div>}
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2 sm:gap-3 justify-center mb-8" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input key={index} ref={(el) => (inputRefs.current[index] = el)} type="text" inputMode="numeric" maxLength={1}
              value={digit} onChange={(e) => handleChange(index, e.target.value)} onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-semibold rounded-xl border transition-all duration-150 outline-none focus:border-[#78988d] focus:ring-2 focus:ring-[#54786f]/15 ${digit ? 'border-[#78988d] bg-[#edf3ef]' : 'border-stone-200 bg-white'}`}
              style={{ caretColor: '#54786f', color: '#292d2a' }} disabled={loading} autoFocus={index === 0} aria-label={`Digit ${index + 1}`} />
          ))}
        </div>
        <button type="submit" disabled={loading || otp.join('').length < 6}
          className="auth-primary-btn w-full font-semibold py-3.5 transition-colors text-[15px] disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? <span className="inline-flex items-center justify-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Verifying…</span> : 'Verify & Continue'}
        </button>
      </form>
      <div className="mt-8 text-center">
        <Link to="/signin" className="auth-text-link font-semibold hover:underline inline-flex items-center gap-1 text-sm">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>Back to Sign In
        </Link>
      </div>
    </AuthShell>
  );
}
