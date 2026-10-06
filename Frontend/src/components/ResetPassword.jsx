import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../api/authService';
import Toast from './globals/Toast';
import AuthShell from './auth/AuthShell';

const inputBase =
  'w-full  border bg-white px-4 py-3 text-[15px] text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-plum-200 focus:border-plum-400 transition-colors';

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
    <>
      <AuthShell
        aside={{
          title: ['Secure your', 'account.'],
          sub: 'One last step, choose a strong password and your notes are safe again.',
        }}
      >
        {toast && (
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        )}

        <header className="mb-7">
          <p className="eyebrow text-plum-700 mb-3">New password</p>
          <h1 className="font-display-serif text-3xl md:text-4xl font-semibold tracking-tight text-stone-900">
            Set a new password
          </h1>
          <p className="text-stone-500 text-[15px] mt-2">
            Choose something strong that you haven&rsquo;t used before.
          </p>
        </header>

        {/* Detailed validation errors */}
        {validationErrors.length > 0 && (
          <div className="mb-5 p-4 bg-red-50 border border-red-100 ">
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((msg, i) => (
                <li key={i} className="text-red-600 text-sm font-medium">{msg}</li>
              ))}
            </ul>
          </div>
        )}

        {!token && !validationErrors.length && (
          <div className="mb-5 p-4 bg-amber-50 border border-amber-200  flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-600">warning</span>
            <p className="text-amber-700 text-sm font-medium">
              No reset token found. Please check your email link or request a new one.
            </p>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="new_password" className="block text-[13px] font-semibold text-stone-700 mb-2">
              New password
            </label>
            <div className="relative">
              <input
                className={`${inputBase} pr-11`}
                id="new_password"
                placeholder="Enter a new password"
                type={showNewPassword ? 'text' : 'password'}
                value={passwords.new_password}
                onChange={(e) => handleInputChange('new_password', e.target.value)}
                required
              />
              <button
                type="button"
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showNewPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm_password" className="block text-[13px] font-semibold text-stone-700 mb-2">
              Confirm new password
            </label>
            <div className="relative">
              <input
                className={`${inputBase} pr-11`}
                id="confirm_password"
                placeholder="Repeat your new password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwords.new_password_confirmation}
                onChange={(e) => handleInputChange('new_password_confirmation', e.target.value)}
                required
              />
              <button
                type="button"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showConfirmPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-stone-900 hover:bg-stone-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5  transition-colors text-[15px] flex items-center justify-center gap-2"
            type="submit"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white  animate-spin" />
            ) : (
              'Update password'
            )}
          </button>
        </form>

        <footer className="mt-8 text-center">
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors text-[14px]"
          >
            <span className="material-symbols-outlined text-[16px]">replay</span>
            Need a new link?
          </Link>
        </footer>
      </AuthShell>
    </>
  );
}
