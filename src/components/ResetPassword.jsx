import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../api/authService';
import Toast from './globals/Toast';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({
    new_password: '',
    new_password_confirmation: '',
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [token, setToken] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Extract token from URL (e.g. ?token=XYZ)
  useEffect(() => {
    const t = searchParams.get('token');
    if (t) {
      setToken(t);
    }
  }, [searchParams]);

  const handleInputChange = (field, value) => {
    setPasswords(prev => ({
      ...prev,
      [field]: value,
    }));
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast(null);
    setValidationErrors([]);

    if (passwords.new_password !== passwords.new_password_confirmation) {
      setToast({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    if (!token) {
      setToast({ type: 'error', message: 'Missing or invalid security token.' });
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword({
        token: token,
        new_password: passwords.new_password,
        new_password_confirmation: passwords.new_password_confirmation,
      });

      setToast({ type: 'success', message: 'Password reset successful! Redirecting to login...' });
      
      setTimeout(() => {
        navigate('/signin', { 
          state: { message: 'Your password has been reset. Please log in with your new credentials.' } 
        });
      }, 2000);

    } catch (err) {
      if (err.errors) {
        const messages = Object.values(err.errors).flat();
        setValidationErrors(messages);
        setToast({ type: 'error', message: 'Please correct the errors below.' });
      } else {
        setToast({ type: 'error', message: err.message || 'Failed to reset password.' });
      }
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

      {/* Left Section - Decorative (Matching ForgotPassword) */}
      <section className="hidden md:flex flex-1 relative p-12 overflow-hidden items-center justify-center border-r border-stone-200" style={{
        backgroundColor: '#fdfaf3',
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.02) 1px, transparent 0)',
        backgroundSize: '24px 24px',
      }}>
        <div className="relative z-10 w-full max-w-lg">
          <div className="relative h-[400px] mb-8">
            <div className="absolute inset-0 bg-white paper-scrap rough-edge transform -rotate-1 p-8 flex flex-col justify-center" style={{
              filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.1))',
              border: '1px solid #e7e2d5',
            }}>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6 leading-tight">
                Secure your <span className="font-display italic text-purple-600">future.</span>
              </h1>
              <p className="text-slate-600 text-[15px] font-normal opacity-90">
                You're one step away from reclaiming your creative space.
              </p>
            </div>
            
            {/* Decorative Icon */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 flex items-center justify-center transform -rotate-12" style={{
              backgroundColor: '#dcfce7',
              filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.1))',
              border: '1px solid #e7e2d5',
              clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
            }}>
              <span className="material-symbols-outlined text-4xl text-emerald-600">verified_user</span>
            </div>
          </div>
        </div>
      </section>

      {/* Right Section - Form */}
      <section className="flex-1 p-8 md:p-16 flex flex-col justify-center bg-white relative">
        <div className="max-w-md mx-auto w-full">
          {/* Header */}
          <header className="mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2 font-serif-elegant">Set New Password</h2>
            <p className="text-slate-500 text-[14px] md:text-[15px] font-handwriting">
              Choose a strong password to keep your notes safe.
            </p>
          </header>

          {/* Detailed Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl animate-in slide-in-from-top-2">
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((msg, i) => (
                  <li key={i} className="text-red-600 text-sm font-medium">
                    {msg}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!token && !validationErrors.length && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-600">warning</span>
              <p className="text-amber-700 text-sm font-medium">
                No reset token found. Please check your email link or request a new one.
              </p>
            </div>
          )}

          {/* Form */}
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="group relative">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                New Password
              </label>
              <input
                className="w-full ruled-input focus:ring-0 text-slate-800 placeholder-slate-300 pr-10"
                placeholder="••••••••••••"
                type={showNewPassword ? 'text' : 'password'}
                value={passwords.new_password}
                onChange={(e) => handleInputChange('new_password', e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-2 bottom-3 text-slate-400 hover:text-purple-600 transition-colors"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showNewPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>

            <div className="group relative">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Confirm New Password
              </label>
              <input
                className="w-full ruled-input focus:ring-0 text-slate-800 placeholder-slate-300 pr-10"
                placeholder="••••••••••••"
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwords.new_password_confirmation}
                onChange={(e) => handleInputChange('new_password_confirmation', e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-2 bottom-3 text-slate-400 hover:text-purple-600 transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showConfirmPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>

            <div className="relative pt-4">
              <div className="absolute -top-6 right-2 pointer-events-none">
                <span className="scribble text-purple-600 text-xl rotate-12 inline-block">Safe & Sound</span>
              </div>
              <button
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                type="submit"
              >
                {loading && <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>

          {/* Footer */}
          <footer className="mt-12 text-center">
            <Link 
              className="text-slate-500 font-medium hover:text-purple-600 transition-colors flex items-center justify-center gap-2 group"
              to="/forgot-password"
            >
              <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">
                replay
              </span>
              <span className="handwritten text-[15px] text-primary">Need a new link?</span>
            </Link>
          </footer>
        </div>
      </section>
    </main>
  );
}
