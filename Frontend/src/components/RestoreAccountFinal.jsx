import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../api/authService';
import Toast from './globals/Toast';

export default function RestoreAccountFinal() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');

  // Extract token and email from URL (e.g. ?token=XYZ&email=abc@test.com)
  useEffect(() => {
    const t = searchParams.get('token');
    const e = searchParams.get('email');
    if (t) setToken(t);
    if (e) setEmail(e);
  }, [searchParams]);

  const handleRestore = async () => {
    if (!token || !email) {
      setToast({ type: 'error', message: 'Missing restoration details. Please check your email link.' });
      return;
    }

    setLoading(true);
    setToast(null);

    try {
      await authService.restoreAccount({ token, email });
      setToast({ type: 'success', message: 'Welcome back! Your account has been restored.' });

      setTimeout(() => {
        navigate('/signin', {
          state: { message: 'Restoration successful! You can now log in.' },
        });
      }, 2000);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to restore account. Link may be expired.' });
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
          <p className="eyebrow text-plum-700 mb-5">One last step</p>
          <h1 className="font-display-serif text-4xl xl:text-5xl font-semibold tracking-tight text-stone-900 leading-[1.1] mb-6">
            Pick up where you <span className="italic text-plum-700">left off.</span>
          </h1>
          <p className="text-stone-600 text-[16px] leading-relaxed">
            Everything you've written is still there, exactly as you saved it. Confirm below and it's all yours again.
          </p>

          <div className="mt-12 bg-white ring-1 ring-stone-200/70 shadow-[0_20px_45px_-24px_rgba(28,25,23,0.3)] overflow-hidden">
            <div className="px-6 pt-5 pb-3 border-b border-stone-100 flex items-center justify-between">
              <span className="text-[11px] font-medium text-stone-400">Still there, waiting</span>
              <span className="text-[10px] uppercase tracking-widest text-stone-300">Notepaper</span>
            </div>
            <div className="px-6 py-5 paper-rule">
              <p className="font-handwritten text-[17px] leading-[27px] text-stone-500">
                Good notes aren't abandoned, they're just paused.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Right — action */}
      <section className="flex-1 p-8 md:p-16 flex flex-col justify-center bg-paper">
        <div className="max-w-md mx-auto w-full">
          <header className="mb-9 text-center md:text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-plum-700 mb-2">Restore account</p>
            <h2 className="font-display-serif text-[26px] md:text-[30px] font-semibold tracking-tight text-stone-900 leading-tight">
              Ready when you are
            </h2>
            <p className="text-stone-500 text-[13.5px] mt-2 leading-relaxed">
              Glad to see you again, one click and your account is back.
            </p>
          </header>

          <div className="space-y-6">
            <div className="p-5 bg-white ring-1 ring-stone-200/70">
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1.5">Restoring account</p>
              <p className="text-stone-800 font-medium truncate">{email || 'Waiting for link data…'}</p>
            </div>

            <button
              onClick={handleRestore}
              disabled={loading || !token || !email}
              className="w-full bg-stone-900 text-white text-[15px] font-semibold py-3 hover:bg-stone-700 transition-colors active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                'Bring my account back'
              )}
            </button>

            <p className="text-center">
              <Link
                to="/forgot-password"
                className="text-[13px] font-medium text-stone-500 hover:text-stone-900 transition-colors"
              >
                Link expired? Request a new one
              </Link>
            </p>
          </div>

          <footer className="mt-14">
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
