import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../api/authService';
import Toast from './globals/Toast';

export default function RestoreAccount() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const prefillEmail = location.state?.email || searchParams.get('email') || '';
  const [email, setEmail] = useState(prefillEmail);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [toast, setToast] = useState(null);

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
    <main className="w-full max-w-6xl mx-auto bg-paper font-display text-stone-900 antialiased selection:bg-plum-200 flex flex-col md:flex-row md:min-h-[85vh] relative">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Left — quiet message */}
      <section className="hidden md:flex flex-1 p-12 lg:p-16 items-center justify-center bg-paper-darker/50 border-r border-stone-200/70">
        <div className="max-w-md">
          <p className="eyebrow text-plum-700 mb-5">Welcome back</p>
          <h1 className="font-display-serif text-4xl xl:text-5xl font-semibold tracking-tight text-stone-900 leading-[1.1] mb-6">
            Your pages were <span className="italic text-plum-700">kept for you.</span>
          </h1>
          <p className="text-stone-600 text-[16px] leading-relaxed">
            Nothing was thrown away. Enter the address on the account and we'll send a link to bring it back.
          </p>

          {/* ruled sheet preview */}
          <div className="mt-12 bg-white ring-1 ring-stone-200/70 shadow-[0_20px_45px_-24px_rgba(28,25,23,0.3)] overflow-hidden">
            <div className="px-6 pt-5 pb-3 border-b border-stone-100 flex items-center justify-between">
              <span className="text-[11px] font-medium text-stone-400">A page worth keeping</span>
              <span className="text-[10px] uppercase tracking-widest text-stone-300">Notepaper</span>
            </div>
            <div className="px-6 py-5 paper-rule">
              <p className="font-handwritten text-[17px] leading-[27px] text-stone-500">
                Some notes you keep because you're not done with them yet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Right — form */}
      <section className="flex-1 p-8 md:p-16 flex flex-col justify-center bg-paper">
        <div className="max-w-md mx-auto w-full">
          <header className="mb-9">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-plum-700 mb-2">
              {success ? 'Check your inbox' : 'Restore account'}
            </p>
            <h2 className="font-display-serif text-[26px] md:text-[30px] font-semibold tracking-tight text-stone-900 leading-tight">
              {success ? 'Link on its way' : "Let's get you back in"}
            </h2>
            <p className="text-stone-500 text-[13.5px] mt-2 leading-relaxed">
              {success
                ? `We've sent a restoration link to ${email}. It's valid for 10 minutes.`
                : "Your account is deactivated — reactivating takes seconds."}
            </p>
          </header>

          {!success ? (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">
                  Confirmation email
                </label>
                <input
                  className="w-full bg-white border border-stone-200 px-4 py-3 text-[15px] text-stone-900 placeholder:text-stone-300 outline-none focus:ring-2 focus:ring-plum-200 focus:border-plum-400 transition-colors"
                  placeholder="you@yourdomain.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={!!prefillEmail}
                  required
                />
                {prefillEmail && (
                  <p className="text-[11px] text-stone-400 mt-2">
                    Restoring the account linked to this address.
                  </p>
                )}
              </div>

              <button
                disabled={loading}
                className="w-full bg-stone-900 text-white text-[15px] font-semibold py-3 hover:bg-stone-700 transition-colors active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                type="submit"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : 'Send restoration link'}
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="p-5 bg-plum-50/60 border border-plum-100 text-[13.5px] text-plum-900 leading-relaxed">
                We've sent the magic link — click it to bring your account back to life.
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || resendTimer > 0}
                className="w-full py-3 text-[13.5px] font-semibold text-plum-700 hover:text-plum-600 border border-plum-200 hover:border-plum-400 disabled:text-stone-400 disabled:border-stone-200 disabled:cursor-not-allowed transition-colors"
              >
                {resendTimer > 0 ? `Resend link in ${resendTimer}s` : loading ? 'Sending…' : 'Resend link'}
              </button>
            </div>
          )}

          <footer className="mt-12">
            <Link
              to="/signin"
              className="inline-flex items-center gap-2 text-[13px] font-medium text-stone-500 hover:text-stone-900 transition-colors"
            >
              <span className="material-icons-round text-[15px]">arrow_back</span>
              Back to sign in
            </Link>
          </footer>
        </div>
      </section>
    </main>
  );
}
