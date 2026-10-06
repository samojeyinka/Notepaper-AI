import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from './globals/Alert';
import Toast from './globals/Toast';
import { SocialButton } from './SocialButtons';
import AuthShell from './auth/AuthShell';

// ── Audio helpers ────────────────────────────────────────────────────────────
let _audioCtx = null;
function ac() {
  if (!_audioCtx || _audioCtx.state === 'closed') {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}
function playButtonClick() {
  try {
    const ctx = ac(), osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.07);
    gain.gain.setValueAtTime(0.14, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.start(); osc.stop(ctx.currentTime + 0.09);
  } catch { /* audio is best-effort */ }
}
function playCheckTick() {
  try {
    const ctx = ac(), osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(900, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.start(); osc.stop(ctx.currentTime + 0.06);
  } catch { /* audio is best-effort */ }
}

// ── Input ────────────────────────────────────────────────────────────────────
const inputBase =
  'w-full  border bg-white px-4 py-3 text-[15px] text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-plum-200 focus:border-plum-400 transition-colors';

function Field({ id, label, type = 'text', value, onChange, placeholder, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-semibold text-stone-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={inputBase}
        />
        {children}
      </div>
    </div>
  );
}

// ── Live email status ─────────────────────────────────────────────────────────
function EmailStatus({ email }) {
  const checks = [
    { pass: /@/.test(email) },
    { pass: /^[^@]+@[^@]+\.[^@]{2,}$/.test(email) },
    { pass: !/\s/.test(email) },
    { pass: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) },
  ];
  const score   = checks.filter(c => c.pass).length;
  const isValid = score === 4;
  const color   = isValid ? '#059669' : score >= 2 ? '#d97706' : '#dc2626';
  const label   = isValid ? 'Valid email' : score >= 2 ? 'Almost there' : 'Invalid format';

  return (
    <div className="mt-2.5">
      <div className="flex gap-1 mb-1.5">
        {checks.map((c, i) => (
          <div key={i} className="h-1 flex-1  transition-all duration-300"
            style={{ backgroundColor: c.pass ? color : '#e7e5e4' }} />
        ))}
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color }}>{label}</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SignIn() {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const location     = useLocation();
  const from         = location.state?.from?.pathname || '/lockedin';

  const [formData, setFormData]       = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe]   = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [success, setSuccess]         = useState(null);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.email.trim()) {
      setError({ message: 'Please enter your email address.' });
      return;
    }
    if (!formData.password) {
      setError({ message: 'Please enter your password.' });
      return;
    }

    playButtonClick();
    setLoading(true);
    try {
      const result = await login({ ...formData, remember_me: rememberMe });
      if (result.requires2fa) {
        navigate('/auth/2fa', { state: { tempToken: result.tempToken }, replace: true });
        return;
      }
      setSuccess({ message: 'Welcome back! Taking you in...' });
      setTimeout(() => navigate(from, { replace: true }), 1500);
    } catch (err) {
      if (err?.message?.toLowerCase().includes('restore') || err?.message?.toLowerCase().includes('trashed')) {
        navigate('/restore-account', { state: { email: formData.email } });
        return;
      }
      let details = [];
      if (err?.errors) details = Object.values(err.errors).flat();
      setError({ message: err?.message || 'Login failed. Please check your credentials.', details });
    } finally {
      setLoading(false);
    }
  };

  const asidePerks = [
    'Everything autosaves as you write',
    'Private by default, yours to export',
    'Searchable from day one',
  ];

  return (
    <>
      <AuthShell
        aside={{
          title: ['Welcome back to your', 'notebook.'],
          sub: 'Everything you left behind is still here, organised, searchable and saved exactly the way you wrote it.',
          children: (
            <ul className="space-y-3">
              {asidePerks.map((p) => (
                <li key={p} className="flex items-center gap-3 text-[15px] text-stone-300">
                  <span className="material-symbols-outlined text-[18px] text-plum-300">check</span>
                  {p}
                </li>
              ))}
            </ul>
          ),
        }}
      >
        <header className="mb-8">
                <p className="eyebrow text-plum-700 mb-3">Sign in</p>
                <h1 className="font-display-serif text-3xl md:text-4xl font-semibold tracking-tight text-stone-900">
                  Welcome back
                </h1>
                <p className="text-stone-500 text-[15px] mt-2">
                  Log in to pick up where you left off.
                </p>
              </header>

              <SocialButton />

              <div className="relative flex py-3 items-center">
                <div className="flex-grow border-t border-stone-100" />
                <span className="flex-shrink mx-4 text-stone-400 text-[11px] font-semibold uppercase tracking-widest">
                  or continue with email
                </span>
                <div className="flex-grow border-t border-stone-100" />
              </div>

              <form onSubmit={handleSubmit} className="mt-2 space-y-5">
                {error && (
                  <Alert type="error" message={error.message} details={error.details} />
                )}

                <Field
                  id="email"
                  label="Email address"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@yourdomain.com"
                />
                {formData.email && <EmailStatus email={formData.email} />}

                <Field
                  id="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                >
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </Field>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => { playCheckTick(); setRememberMe(e.target.checked); }}
                      className="sr-only"
                    />
                    <span
                      className={`w-[18px] h-[18px]  border-2 flex items-center justify-center transition-colors ${
                        rememberMe ? 'bg-plum-700 border-plum-700' : 'bg-white border-stone-300'
                      }`}
                    >
                      {rememberMe && (
                        <span className="material-symbols-outlined text-white text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                      )}
                    </span>
                    <span className="text-[13px] text-stone-500">Keep me logged in</span>
                  </label>

                  <Link to="/forgot-password" className="text-[13px] font-semibold text-plum-700 hover:text-plum-600 link-underline">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-stone-900 hover:bg-stone-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5  transition-colors text-[15px] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white  animate-spin" />
                  ) : 'Log in'}
                </button>
              </form>

              <p className="mt-8 text-center text-stone-500 text-[14px]">
                Don&rsquo;t have an account?{' '}
                <Link to="/signup" className="text-plum-700 font-semibold hover:text-plum-600 link-underline">
                  Sign up free
                </Link>
              </p>
      </AuthShell>

      <Toast message={success?.message} type="success" onClose={() => setSuccess(null)} />
    </>
  );
}
