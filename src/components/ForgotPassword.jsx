import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../api/authService';
import Toast from './globals/Toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

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

  const handleInputChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    <main className="w-full max-w-6xl mx-auto flex flex-col md:flex-row overflow-hidden bg-white min-h-[85vh] relative">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Left Section - Decorative (Remains largely the same) */}
      <section className="hidden md:flex flex-1 relative p-12 overflow-hidden items-center justify-center border-r border-stone-200" style={{
        backgroundColor: '#fdfaf3',
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.02) 1px, transparent 0)',
        backgroundSize: '24px 24px',
      }}>
        <div className="relative z-10 w-full max-w-lg">
          <div className="relative h-[400px] mb-8">
            <div className="absolute inset-0 bg-white paper-scrap rough-edge transform -rotate-1 p-8 flex flex-col justify-center" style={{
              filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))',
              border: '1px solid #e7e2d5',
            }}>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6 leading-tight">
                Retrieve your <span className="font-display italic text-purple-600">creations.</span>
              </h1>
              <p className="text-slate-600 text-[15px] font-normal opacity-90">
                We're here to help you get back to your focus zone.
              </p>
            </div>
            {/* ... Other decorative elements ... */}
            <div className="absolute -top-10 -right-4 w-32 h-32 flex items-center justify-center transform rotate-12" style={{
              backgroundColor: '#ffedbc',
              filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))',
              border: '1px solid #e7e2d5',
              clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
            }}>
              <span className="material-symbols-outlined text-4xl text-amber-600">key</span>
            </div>
          </div>
        </div>
      </section>

      {/* Right Section - Form */}
      <section className="flex-1 p-8 md:p-16 flex flex-col justify-center bg-white relative">
        <div className="max-w-md mx-auto w-full">
          {/* Header */}
          <header className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {success ? 'Check your email' : 'Reset your password'}
            </h2>
            <p className="text-slate-500">
              {success 
                ? `We've sent a recovery link to ${email}. Please check your inbox and spam folder.` 
                : "Enter your email and we'll send you a link to get back in."}
            </p>
          </header>

          {/* Form */}
          {!success ? (
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1" htmlFor="email">
                  Email Address
                </label>
                <input
                  className="w-full ruled-input focus:ring-0 text-slate-800 placeholder-slate-300"
                  id="email"
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="relative pt-4">
                <div className="absolute -top-6 right-2 pointer-events-none">
                  <span className="scribble text-purple-600 text-xl rotate-12 inline-block">Don't worry!</span>
                </div>
                <button
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  type="submit"
                >
                  {loading && <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="p-6 bg-purple-50 border border-purple-100 rounded-2xl flex items-center gap-4 animate-in fade-in zoom-in duration-500">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-purple-600 shadow-sm">
                  <span className="material-symbols-outlined">mark_email_read</span>
                </div>
                <p className="text-purple-900 font-medium text-sm leading-relaxed">
                  Link sent! If you don't receive it within a few minutes, you can request another one.
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || resendTimer > 0}
                className="w-full py-4 border-2 border-purple-100 rounded-xl font-bold transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin"></span>
                ) : (
                  <span className="material-symbols-outlined text-purple-600">replay</span>
                )}
                <span className="text-slate-700">
                  {resendTimer > 0 ? `Resend link in ${resendTimer}s` : 'Resend Reset Link'}
                </span>
              </button>
            </div>
          )}

          {/* Footer */}
          <footer className="mt-12 text-center">
            <Link 
              className="text-slate-500 font-medium hover:text-purple-600 transition-colors flex items-center justify-center gap-2 group"
              to="/signin"
            >
              <span className="material-symbols-outlined text-[12px] group-hover:-translate-x-1 transition-transform">
                arrow_back
              </span>
              <span className="handwritten text-xl">Back to login</span>
            </Link>
          </footer>
        </div>
      </section>
    </main>
  );
}