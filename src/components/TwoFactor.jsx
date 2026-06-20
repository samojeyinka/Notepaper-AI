import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from './globals/Alert';

export default function TwoFactor() {
  const { verify2fa } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // temp_token arrives via navigation state on first load.
  // We persist it to sessionStorage so a page refresh doesn't break the flow.
  const stateToken = location.state?.tempToken;
  useEffect(() => {
    if (stateToken) sessionStorage.setItem('np_2fa_token', stateToken);
  }, [stateToken]);
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
      navigate('/lockedin', { replace: true });
    } catch (err) {
      setError({ message: err?.message || 'Invalid OTP. Please try again.' });
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full max-w-6xl mx-auto flex flex-col md:flex-row overflow-hidden bg-white min-h-[85vh]">
      {/* Left decorative section */}
      <section
        className="hidden md:flex flex-1 relative p-12 overflow-hidden items-center justify-center border-r border-stone-200"
        style={{
          backgroundColor: '#fdfaf3',
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.02) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      >
        <div className="relative z-10 text-center max-w-sm">
          <div className="relative inline-block mb-8">
            <div
              className="w-32 h-32 flex items-center justify-center mx-auto"
              style={{
                backgroundColor: '#e0e7ff',
                filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))',
                border: '1px solid #e7e2d5',
                clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
              }}
            >
              <span className="material-symbols-outlined text-5xl text-indigo-600">security</span>
            </div>
            {/* accent dot */}
            <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-amber-100 border border-stone-200 flex items-center justify-center shadow-sm" style={{ transform: 'rotate(15deg)' }}>
              <span className="material-symbols-outlined text-amber-600" style={{ fontSize: '18px' }}>lock</span>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-3">Two-Factor <span className="italic text-purple-600">Authentication</span></h1>
          <p className="text-slate-500 leading-relaxed">
            Your account has an extra layer of security. Enter the 6-digit code from your authenticator app to continue.
          </p>
        </div>
      </section>

      {/* Right form section */}
      <section className="flex-1 p-8 md:p-16 flex flex-col justify-center bg-white relative">
        <div className="max-w-md mx-auto w-full">
          <header className="mb-10">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4 ring-4 ring-purple-50">
              <span className="material-symbols-outlined text-2xl text-purple-600">smartphone</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Verify It's You</h2>
            <p className="text-slate-500">Enter the 6-digit one-time code from your authenticator app.</p>
          </header>

          {error && <Alert type="error" message={error.message} details={error.details} />}

          <form onSubmit={handleSubmit}>
            {/* OTP inputs */}
            <div className="flex gap-3 justify-center mb-8" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all duration-150 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100
                    ${digit ? 'border-purple-400 bg-purple-50' : 'border-slate-200 bg-white'}`}
                  style={{ caretColor: '#7c3aed', color: '#1e293b' }}
                  disabled={loading}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || otp.join('').length < 6}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ boxShadow: '0 20px 25px -5px rgba(147, 51, 234, 0.2)' }}
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/signin" className="text-purple-600 font-bold hover:underline inline-flex items-center gap-1 text-sm">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
              Back to Sign In
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
