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
      await authService.restoreAccount({
        token: token,
        email: email,
      });

      setToast({ type: 'success', message: 'Welcome back! Your account has been restored.' });
      
      setTimeout(() => {
        navigate('/signin', { 
          state: { message: 'Restoration successful! You can now log in.' } 
        });
      }, 2000);

    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to restore account. Link may be expired.' });
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

      {/* Left Section - Decorative */}
      <section className="hidden md:flex flex-1 relative p-12 overflow-hidden items-center justify-center border-r border-stone-200" style={{
        backgroundColor: '#f5f3ff',
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.02) 1px, transparent 0)',
        backgroundSize: '24px 24px',
      }}>
        <div className="relative z-10 w-full max-w-lg">
          <div className="relative h-[400px] mb-8">
            <div className="absolute inset-0 bg-white paper-scrap rough-edge transform rotate-1 p-8 flex flex-col justify-center border-2 border-dashed border-purple-100">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6 leading-tight">
                Restoring your <span className="font-display italic text-purple-600">Legacy.</span>
              </h1>
              <p className="text-slate-600 text-lg font-medium opacity-90 leading-relaxed">
                Everything you've created is waiting. Let's pick up right where you left off.
              </p>
            </div>
            
            <div className="absolute -bottom-6 -left-6 w-32 h-32 flex items-center justify-center animate-bounce-slow">
              <span className="material-symbols-outlined text-7xl text-purple-200/50">auto_awesome</span>
            </div>
          </div>
        </div>
      </section>

      {/* Right Section - Main Action */}
      <section className="flex-1 p-8 md:p-16 flex flex-col justify-center bg-white relative">
        <div className="max-w-md mx-auto w-full text-center">
          <header className="mb-6 md:mb-10">
            <div className="w-12 h-12 md:w-20 md:h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl text-purple-600">verified</span>
            </div>
            <h2 className="text-xl md:text-2xl font-medium md:font-bold text-slate-900 mb-2">Ready to Restore?</h2>
            <p className="text-slate-500 font-normal font-handwriting text-[15px]">
              Glad to see you again! Click below to reactivate your account instantly.
            </p>
          </header>

          <div className="space-y-3 md:space-y-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-8">
              <p className="text-[12px] font-medium text-slate-400 uppercase tracking-widest mb-1">Restoring Account</p>
              <p className="text-slate-700 font-medium truncate italic">{email || 'Waiting for link data...'}</p>
            </div>

            <button
              onClick={handleRestore}
              disabled={loading || !token || !email}
              className="w-full bg-purple-600 text-[13px] hover:bg-black text-white font-medium md:font-bold py-2 md:py-4 rounded-lg md:rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 md:text-[15px]"
            >
              {loading && <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
              {loading ? 'Restoring...' : 'Bring My Account Back'}
            </button>

            <Link 
              to="/forgot-password" 
              className="inline-block text-slate-400 font-normal text-[13px] hover:text-purple-600 transition-colors handwritten"
            >
              Link expired? Request a new one.
            </Link>
          </div>

          <footer className="mt-16">
            <Link 
              className="text-slate-500 font-medium hover:text-purple-600 transition-colors flex items-center justify-center gap-2 group"
              to="/signin"
            >
              <span className="material-symbols-outlined text-[12px] group-hover:-translate-x-1 transition-transform">
                arrow_back
              </span>
              <span>Back to login</span>
            </Link>
          </footer>
        </div>
      </section>
    </main>
  );
}
