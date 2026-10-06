import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../api/authService';
import Toast from './globals/Toast';
import AuthShell from './auth/AuthShell';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
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
    setLoading(true);
    setToast(null);

    try {
      await authService.requestPasswordReset(email);
      setSuccess(true);
      setResendTimer(60);
      setToast({ type: 'success', message: 'Reset link sent! Please check your email.' });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to send reset link.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthShell
        aside={{
          title: ['Retrieve your', 'creations.'],
          sub: 'A reset link takes about a minute to arrive. If it does not, check your spam folder or ask us for another.',
        }}
      >
        {toast && (
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        )}

        <header className="mb-8">
          <p className="eyebrow text-plum-700 mb-3">{success ? 'Almost there' : 'Account recovery'}</p>
          <h1 className="font-display-serif text-3xl md:text-4xl font-semibold tracking-tight text-stone-900">
            {success ? 'Check your email' : 'Reset your password'}
          </h1>
          <p className="text-stone-500 text-[15px] mt-2 leading-relaxed">
            {success
              ? `We've sent a recovery link to ${email}. Follow it to choose a new password.`
              : 'Enter the email linked to your account and we\'ll send you a link to get back in.'}
          </p>
        </header>

        {!success ? (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-[13px] font-semibold text-stone-700 mb-2">
                Email address
              </label>
              <input
                className="w-full  border border-stone-200 bg-white px-4 py-3 text-[15px] text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-plum-200 focus:border-plum-400 transition-colors"
                id="email"
                placeholder="you@yourdomain.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              disabled={loading || !email.trim()}
              className="w-full bg-stone-900 hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5  transition-colors text-[15px] flex items-center justify-center gap-2"
              type="submit"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white  animate-spin" />
              ) : (
                'Send reset link'
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className=" bg-plum-50 ring-1 ring-plum-100 p-5 flex items-center gap-4">
              <div className="w-11 h-11 shrink-0  bg-white text-plum-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">mail</span>
              </div>
              <p className="text-plum-900 text-[14px] leading-relaxed">
                If the link does not arrive within a few minutes, you can request
                another one below.
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || resendTimer > 0}
              className="w-full border border-stone-300 text-stone-800 disabled:opacity-50  py-3.5 font-semibold text-[14px] hover:border-stone-900 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-stone-400/30 border-t-stone-900  animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">replay</span>
                  {resendTimer > 0 ? `Resend link in ${resendTimer}s` : 'Resend reset link'}
                </>
              )}
            </button>
          </div>
        )}

        <footer className="mt-8 text-center">
          <Link
            to="/signin"
            className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors text-[14px]"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to log in
          </Link>
        </footer>
      </AuthShell>
    </>
  );
}
