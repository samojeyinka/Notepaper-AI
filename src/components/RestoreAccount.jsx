import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../api/authService';
import Toast from './globals/Toast';

export default function RestoreAccount() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Email can come from router state (email/password flow) or ?email= query param (social auth flow)
  const prefillEmail = location.state?.email || searchParams.get('email') || '';
  const [email, setEmail] = useState(prefillEmail);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [toast, setToast] = useState(null);

  // Handle Resend Timer Countdown
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email) {
      setToast({ type: 'error', message: 'Please enter your email address.' });
      return;
    }

    setLoading(true);
    setToast(null);

    try {
      await authService.requestRestoreAccount(email);
      setSuccess(true);
      setResendTimer(60);
      setToast({ type: 'success', message: 'Restoration link sent! Please check your email.' });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to send restoration link.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full max-w-6xl mx-auto flex flex-col md:flex-row overflow-hidden bg-white md:min-h-[85vh] relative">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Left Section - Decorative */}
      <section className="hidden md:flex flex-1 relative p-12 overflow-hidden items-center justify-center border-r border-stone-200" style={{
        backgroundColor: '#f6f8ff',
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.02) 1px, transparent 0)',
        backgroundSize: '24px 24px',
      }}>
        <div className="relative z-10 w-full max-w-lg">
          <div className="relative h-[400px] mb-8">
            <div className="absolute inset-0 bg-white paper-scrap rough-edge transform -rotate-1 p-8 flex flex-col justify-center shadow-lg border border-slate-100">
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-6 leading-tight">
                Welcome <span className="font-display italic text-purple-600">back!</span>
              </h1>
              <p className="text-slate-600 text-lg font-medium opacity-90 leading-relaxed">
                Your thoughts are still here, waiting for you to bring them back to life.
              </p>
            </div>
            
            {/* Decorative Heart / Recovery Icon */}
            <div className="absolute -top-10 -right-4 w-32 h-32 flex items-center justify-center transform rotate-12" style={{
              backgroundColor: '#e0e7ff',
              filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))',
              border: '1px solid #c7d2fe',
              clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
            }}>
              <span className="material-symbols-outlined text-4xl text-purple-600">favorite</span>
            </div>
          </div>
        </div>
      </section>

      {/* Right Section - Form */}
      <section className="flex-1 p-8 md:p-16 flex flex-col justify-center bg-white relative">
        <div className="max-w-md mx-auto w-full">
          <header className="mb-10">
            <h2 className="text-xl md:text-2xl font-medium md:font-bold text-slate-900 mb-2">
              {success ? 'Link Sent' : 'Restore Account'}
            </h2>
            <p className="text-slate-500 font-normal  text-[13px] md:text-base">
              {success 
                ? `We've sent a restoration link to ${email}. Check your inbox within the next 10 minutes.` 
                : "Your account is currently deactivated. No worries—you can reactivate it in seconds."}
            </p>
          </header>

          {!success ? (
            <form className="space-y-4 md:space-y-8" onSubmit={handleSubmit}>
              <div className="group">
                <label className="block text-[11px] md:text-xs font-medium md:font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Confirmation Email
                </label>
                <input
                  className="w-full ruled-input focus:ring-0 text-slate-800 placeholder-slate-300"
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={!!prefillEmail}
                  required
                />
                {prefillEmail && (
                  <p className="text-[10px] text-slate-400 mt-2 italic">
                    Restoring the account linked to this address.
                  </p>
                )}
              </div>

              <div className="relative pt-4">
                <div className="absolute -top-6 right-2 pointer-events-none">
                  <span className="scribble text-purple-600 text-[14px] md:text-xl rotate-12 inline-block">Recovery Window</span>
                </div>
                <button
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-[14px] md:text-base text-white font-medium md:font-bold py-2 md:py-4 rounded-md md:rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  type="submit"
                >
                  {loading && <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                  {loading ? 'Sending link...' : 'Receive Restoration Link'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="p-6 bg-purple-50 border border-purple-100 rounded-xl md:rounded-2xl flex items-center gap-4 animate-in fade-in zoom-in duration-500">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-purple-600 shadow-sm border border-purple-100">
                  <span className="material-symbols-outlined">mark_email_read</span>
                </div>
                <p className="text-purple-900 font-normal md:font-medium text-[11px] md:text-sm leading-relaxed">
                  We've sent the magic link. Click it to bring your account back to life!
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || resendTimer > 0}
                className="w-full py-2 md:py-4 border-2 border-purple-100 text-[13px] md:text-[15px]  rounded-lg md:rounded-xl font-medium md:font-bold transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin"></span>
                ) : (
                  <span className="material-symbols-outlined text-purple-600">replay</span>
                )}
                <span className="text-slate-700 font-display">
                  {resendTimer > 0 ? `Resend link in ${resendTimer}s` : 'Resend Link'}
                </span>
              </button>
            </div>
          )}

          <footer className="mt-12 text-center text-slate-400">
            <Link 
              className="text-slate-500 font-medium md:font-semibold hover:text-purple-600 transition-colors flex items-center justify-center gap-2 group"
              to="/signin"
            >
              <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">
                arrow_back
              </span>
              <span className="handwritten text-[13px] md:text-[15px] text-primary">Maybe later</span>
            </Link>
          </footer>
        </div>
      </section>
    </main>
  );
}
