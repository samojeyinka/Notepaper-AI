import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { userService } from '../api/userService';
import { useAuth } from '../context/AuthContext';
import Toast from './globals/Toast';

// Logo/Header Component
export const ChangePasswordHeader = () => {
  return (
    <div className="fixed top-8 left-8">
      <a className="flex items-center gap-3" href="/">
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
          <span className="material-symbols-outlined">edit_note</span>
        </div>
        <span className="text-xl font-extrabold tracking-tight">
          Notepaper<span className="text-primary">.ai</span>
        </span>
      </a>
    </div>
  );
};

// Password Input Component - Reusable
export const PasswordInput = ({ label, placeholder, value, onChange, name }) => {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
        {label}
      </label>
      <input
        type="password"
        name={name}
        className="w-full bg-transparent border-none focus:ring-0 paper-lined-input font-handwriting text-xl text-slate-700 px-0 placeholder:text-slate-200"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

// Main Change Password Form
export const ChangePasswordForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [toast, setToast] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [token, setToken] = useState('');

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

  const handleResendLink = async () => {
    if (resendTimer > 0) return;

    setResending(true);
    setToast(null);

    try {
      const res = await userService.requestPasswordChange();
      setToast({ type: 'success', message: res.message || 'A new reset link has been sent!' });
      setResendTimer(60); // Start 60s cooldown
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to send reset link.' });
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast(null);
    setValidationErrors([]);

    // Client-side Validation
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setToast({ type: 'error', message: 'All fields are required' });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setToast({ type: 'error', message: 'New passwords do not match' });
      return;
    }

    if (!token) {
      setToast({ type: 'error', message: 'Invalid or missing security token.' });
      return;
    }

    setLoading(true);

    try {
      await userService.changePassword({
        token: token,
        current_password: passwords.currentPassword,
        new_password: passwords.newPassword,
        new_password_confirmation: passwords.confirmPassword,
      });

      setToast({ type: 'success', message: 'Password changed successfully! Logging you out...' });
      
      setTimeout(async () => {
        await logout();
        navigate('/signin', { 
          state: { message: 'Password updated. Please log in with your new credentials.' } 
        });
      }, 2000);

    } catch (err) {
      // Handle Laravel Validation Errors
      if (err.errors) {
        const messages = Object.values(err.errors).flat();
        setValidationErrors(messages);
        setToast({ type: 'error', message: 'Please correct the highlighted errors.' });
      } else {
        setToast({ type: 'error', message: err.message || 'Failed to update password.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="paper-scrap p-6 md:p-8 rounded-lg border-b-4 border-slate-200 relative">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <header className="mb-5">
        <h1 className="font-serif text-xl md:text-2xl text-ink-blue mb-2">Update your security</h1>
        <p className="font-handwriting text-[15px] text-slate-400">Keep your thoughts safe and secret...</p>
      </header>

      {/* Static Validation Errors Alert */}
      {validationErrors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-100 rounded-2xl">
          <div className="flex items-center gap-2 mb-2 text-red-700 font-bold">
            <span className="material-symbols-outlined text-red-600">error</span>
            <span>Security Requirements Not Met:</span>
          </div>
          <ul className="list-disc list-inside space-y-1">
            {validationErrors.map((msg, i) => (
              <li key={i} className="text-red-600 text-[13px] font-medium leading-tight">
                {msg}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!token && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <span className="material-symbols-outlined text-amber-600 mt-1">warning</span>
          <p className="text-amber-700 text-[14px] font-medium leading-tight">
            No security token found! Did you click the link from your email?
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ... form fields remain same ... */}
        <PasswordInput
          label="Current Password"
          placeholder="••••••••••••"
          value={passwords.currentPassword}
          onChange={(e) => handleInputChange('currentPassword', e.target.value)}
          name="currentPassword"
        />

        <PasswordInput
          label="New Password"
          placeholder="••••••••••••"
          value={passwords.newPassword}
          onChange={(e) => handleInputChange('newPassword', e.target.value)}
          name="newPassword"
        />

        <PasswordInput
          label="Confirm New Password"
          placeholder="••••••••••••"
          value={passwords.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          name="confirmPassword"
        />

        <div className="pt-3 relative">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-slate-900 text-white font-medium rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-1.5 text-[16px] disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <span className="material-symbols-outlined">lock_open</span>
            )}
            {loading ? 'Updating...' : 'Save New Password'}
          </button>
          
          {/* Decorative Lock Icon */}
          <div className="absolute -right-16 md:-right-24 bottom-2 hidden md:block">
            <div className="relative group">
              <span className="material-symbols-outlined text-5xl text-slate-300 rotate-12 mb-2">lock</span>
              <div className="absolute -top-12 -left-4 w-24 h-24">
                <svg className="w-16 h-16 text-slate-400 -rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 14l-7 7m0 0l-7-7m7 7V3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                </svg>
                <p className="font-sketch text-slate-400 text-sm absolute -top-4 left-8 whitespace-nowrap">Safety first!</p>
              </div>
            </div>
          </div>
        </div>
      </form>

      <div className="mt-8 flex flex-col items-center gap-6">
        <button
          type="button"
          onClick={handleResendLink}
          disabled={resending || resendTimer > 0}
          className={`
            px-6 py-2.5 rounded-2xl border-2 transition-all flex items-center gap-2 group
            ${resendTimer > 0 
              ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed' 
              : 'bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-100 hover:border-indigo-200 active:scale-95 shadow-sm hover:shadow-md'}
          `}
        >
          {resending ? (
            <span className="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-md animate-spin"></span>
          ) : (
            <span className={`material-symbols-outlined text-[20px] ${resendTimer > 0 ? 'text-slate-300' : 'text-indigo-500 group-hover:scale-110 transition-transform'}`}>
              replay
            </span>
          )}
          <span className={`text-[12px] font-medium uppercase tracking-widest ${resendTimer > 0 ? '' : 'font-display'}`}>
            {resendTimer > 0 ? (
              <span className="flex items-center gap-1.5">
                New link available in <span className="font-sketch text-lg text-slate-600">{resendTimer}s</span>
              </span>
            ) : 'Request New Reset Link'}
          </span>
        </button>

        <button
          onClick={() => navigate('/lockedin/profile-settings')}
          className="font-sketch text-slate-400 hover:text-purple-500 transition-colors text-base underline underline-offset-4 decoration-dashed decoration-1"
        >
          Wait, I'll keep the old one
        </button>
      </div>
    </div>
  );
};

// Footer Info
export const ChangePasswordFooter = () => {
  return (
    <div className="mt-5 text-center px-4">
      <p className="font-handwriting text-xs text-slate-400">
        Your password is protected by Paper-Sync™ AES-256 encryption.
      </p>
    </div>
  );
};

// Main Page Component
export const ChangePassword = () => {
  return (
    <div className="flex-1 lg:ml-64 p-3 lg:p-8 pt-20 lg:pt-8 bg-slate-50 text-slate-900 font-display min-h-screen flex items-center justify-center overflow-hidden">
      <ChangePasswordHeader />

      <main className="w-full max-w-xl relative">
        <ChangePasswordForm />
        <ChangePasswordFooter />
      </main>
    </div>
  );
};

