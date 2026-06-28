import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from './globals/Alert';
import Toast from './globals/Toast';
import { SocialButton } from './SocialButtons';

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
  } catch (_) {}
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
  } catch (_) {}
}

// ── Floating label input ─────────────────────────────────────────────────────
function FloatingInput({ id, label, type = 'text', value, onChange, children, delay = 0 }) {
  return (
    <div
      className="relative pt-5 pb-1"
      style={{ animation: 'stepIn 0.35s ease-out both', animationDelay: `${delay}ms` }}
    >
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder=" "
        className="peer w-full bg-transparent border-0 border-b border-slate-200 focus:border-purple-500 focus:outline-none focus:ring-0 text-slate-800 text-sm py-1.5 transition-colors duration-200"
      />
      <label
        htmlFor={id}
        className="absolute left-0 top-5 text-slate-400 text-sm pointer-events-none transition-all duration-200
          peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-placeholder-shown:font-normal
          peer-focus:!top-0 peer-focus:!text-[10px] peer-focus:!text-purple-500 peer-focus:!font-semibold peer-focus:!uppercase peer-focus:!tracking-wider
          peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-slate-400 peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wider"
      >
        {label}
      </label>
      {children}
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
  const color   = isValid ? '#10b981' : score >= 2 ? '#f59e0b' : '#ef4444';
  const label   = isValid ? 'Valid email' : score >= 2 ? 'Almost there' : 'Invalid format';

  return (
    <div className="mt-2" style={{ animation: 'stepIn 0.2s ease-out' }}>
      <div className="flex gap-1 mb-1.5">
        {checks.map((c, i) => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: c.pass ? color : '#e2e8f0' }} />
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

  return (
    <>
      <main className="w-full max-w-6xl mx-auto flex flex-col md:flex-row overflow-hidden bg-white min-h-[85vh]">

        {/* ── Left decorative section ── */}
        <section
          className="hidden md:flex flex-1 relative p-12 overflow-hidden items-center justify-center border-r border-stone-200"
          style={{
            backgroundColor: '#fdfaf3',
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.02) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        >
          <div className="relative z-10 w-full max-w-lg">
            <div className="relative h-[400px] mb-8">

              {/* Main card */}
              <div
                className="absolute inset-0 bg-white paper-scrap transform rotate-1 p-8 flex flex-col justify-center"
                style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))', border: '1px solid #e7e2d5' }}
              >
                <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 leading-tight">
                  Your notes
                  <br />
                  <span className="italic text-purple-600">missed you.</span>
                </h1>
                <p className="text-slate-500 text-[15px] font-normal">
                  Everything you left behind is right where you left it.
                </p>
              </div>

              {/* Yellow pentagon */}
              <div
                className="absolute -top-10 -right-4 w-32 h-32 flex items-center justify-center transform rotate-12"
                style={{ backgroundColor: '#ffedbc', filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))', border: '1px solid #e7e2d5', clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }}
              >
                <span className="material-symbols-outlined text-4xl text-amber-600">edit_note</span>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-2 h-2 rounded-full bg-slate-400 shadow-inner" />
              </div>

              {/* Testimonial sticky note */}
              <div
                className="absolute -bottom-6 -left-6 w-40 h-28 bg-pink-100 p-4 transform -rotate-3"
                style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))', border: '1px solid #e7e2d5', clipPath: 'polygon(0% 2%, 2% 0%, 98% 1%, 100% 3%, 99% 97%, 97% 100%, 3% 99%, 0% 98%)' }}
              >
                <div className="tape absolute -top-4 left-1/2 -translate-x-1/2" style={{ background: 'rgba(255,255,255,0.4)', width: '60px', height: '20px', transform: 'rotate(-15deg)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', backdropFilter: 'blur(1px)' }} />
                <p className="font-handwritten text-[15px] leading-none text-rose-800 pt-2">"This app changed my whole workflow..."</p>
                <div className="flex items-center gap-2 mt-2">
                  <img
                    alt="Sam O."
                    className="w-6 h-6 rounded-full border border-rose-200"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8Xu1OjV5L3VKF6dwYX_LVs0lUBVgEl1Sx4GZuWU6dUCKTUS_XQh8zRjTZZeJUri_YHl0bjKdpUKlVdVq3RxPasgqwThglTNPNhmd8XNNCTgYhjRspL6nKRF9M7e41p3z74BDxIcbegQoXDl86RONwEg-n8DrL3n5Gl_4I3uf8GWyGZ6YOJFK08FWIFKSs6VsLduzQCXF2AtEpTxkh7t4y5O7yDRV448fhgFjR7BRgjsD9q4_0ev69zQaKbFhzs8ufQzi6K-b2LFHU"
                  />
                  <span className="text-[10px] uppercase tracking-wider font-bold text-rose-700">Sam O.</span>
                </div>
              </div>

              {/* Green circle */}
              <div
                className="absolute top-20 -right-12 w-24 h-24 rounded-full flex items-center justify-center transform -rotate-6"
                style={{ backgroundColor: '#dcfce7', filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))', border: '1px solid #e7e2d5' }}
              >
                <span className="material-symbols-outlined text-3xl text-emerald-600">auto_awesome</span>
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full shadow-md" />
              </div>

              {/* Blue card */}
              <div
                className="absolute bottom-10 -right-8 w-36 h-48 p-4 transform rotate-6"
                style={{ backgroundColor: '#e0e7ff', filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))', border: '1px solid #e7e2d5', clipPath: 'polygon(0% 2%, 2% 0%, 98% 1%, 100% 3%, 99% 97%, 97% 100%, 3% 99%, 0% 98%)' }}
              >
                <div className="w-full h-24 bg-indigo-200/50 rounded-sm mb-2" />
                <div className="space-y-1">
                  <div className="h-1 w-full bg-indigo-300/30" />
                  <div className="h-1 w-4/5 bg-indigo-300/30" />
                  <div className="h-1 w-full bg-indigo-300/30" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Right form section ── */}
        <section className="flex-1 flex flex-col justify-center bg-white relative">
          <div className="p-8 md:p-16 w-full">
            <div className="max-w-md mx-auto w-full">

              {/* Header */}
              <header className="mb-6 md:mb-10" style={{ animation: 'stepIn 0.35s ease-out' }}>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Welcome back</h2>
                <p className="text-slate-400 text-[13px]">Continue your creative journey.</p>
              </header>

              {/* Social buttons */}
              <div style={{ animation: 'stepIn 0.35s ease-out both', animationDelay: '60ms' }}>
                <SocialButton />
              </div>

              {/* Divider */}
              <div className="relative flex py-4 items-center" style={{ animation: 'stepIn 0.35s ease-out both', animationDelay: '100ms' }}>
                <div className="flex-grow border-t border-slate-100" />
                <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">or use email</span>
                <div className="flex-grow border-t border-slate-100" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="mb-4" style={{ animation: 'stepIn 0.2s ease-out' }}>
                    <Alert type="error" message={error.message} details={error.details} />
                  </div>
                )}

                <div className="space-y-5">
                  {/* Email */}
                  <div>
                    <FloatingInput
                      id="email"
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      delay={140}
                    />
                    {formData.email && <EmailStatus email={formData.email} />}
                  </div>

                  {/* Password */}
                  <FloatingInput
                    id="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    delay={200}
                  >
                    {/* show/hide toggle */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-0 bottom-2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                    {/* Forgot password link — sits just below the field */}
                  </FloatingInput>

                  {/* Forgot + Remember row */}
                  <div
                    className="flex items-center justify-between pt-1"
                    style={{ animation: 'stepIn 0.35s ease-out both', animationDelay: '260ms' }}
                  >
                    {/* Custom checkbox */}
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <div className="relative flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={e => { playCheckTick(); setRememberMe(e.target.checked); }}
                          className="sr-only"
                        />
                        <div
                          className="w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200"
                          style={{
                            backgroundColor: rememberMe ? '#7c3aed' : '#fff',
                            borderColor: rememberMe ? '#7c3aed' : '#cbd5e1',
                          }}
                        >
                          {rememberMe && (
                            <span className="material-symbols-outlined text-white" style={{ fontSize: '10px', fontVariationSettings: "'FILL' 1" }}>check</span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-slate-500">Keep me logged in</span>
                    </label>

                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-purple-600 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                {/* Submit */}
                <div
                  className="mt-8"
                  style={{ animation: 'stepIn 0.35s ease-out both', animationDelay: '320ms' }}
                >
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                    style={{ boxShadow: '0 8px 20px -4px rgba(124,58,237,0.35)' }}
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing in...
                      </>
                    ) : 'Log In'}
                  </button>
                </div>
              </form>

              {/* Footer */}
              <footer className="mt-8 text-center" style={{ animation: 'stepIn 0.35s ease-out both', animationDelay: '380ms' }}>
                <p className="text-slate-400 text-xs">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-purple-600 font-semibold hover:underline font-handwritten text-sm ml-0.5">
                    Sign up here
                  </Link>
                </p>
              </footer>

            </div>
          </div>
        </section>

      </main>

      <Toast message={success?.message} type="success" onClose={() => setSuccess(null)} />
    </>
  );
}
