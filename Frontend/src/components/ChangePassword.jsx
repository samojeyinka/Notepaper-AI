import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { userService } from '../api/userService';
import { useAuth } from '../context/AuthContext';
import Toast from './globals/Toast';
import NotificationIcon from './user/NotificationIcon';

// Password field
export const PasswordInput = ({ label, placeholder, value, onChange, name, hint }) => {
  const fieldCls =
    'w-full bg-white border border-stone-200 px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-300 outline-none focus:ring-2 focus:ring-plum-200 transition-colors';
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400">{label}</label>
      <input
        type="password"
        name={name}
        className={fieldCls}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete="new-password"
      />
      {hint && <p className="text-[11px] text-stone-400">{hint}</p>}
    </div>
  );
};

// Main form
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

  useEffect(() => {
    const t = searchParams.get('token');
    if (t) setToken(t);
  }, [searchParams]);

  const handleInputChange = (field, value) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  const handleResendLink = async () => {
    if (resendTimer > 0) return;
    setResending(true);
    setToast(null);
    try {
      const res = await userService.requestPasswordChange();
      setToast({ type: 'success', message: res.message || 'A new reset link has been sent!' });
      setResendTimer(60);
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
        token,
        current_password: passwords.currentPassword,
        new_password: passwords.newPassword,
        new_password_confirmation: passwords.confirmPassword,
      });

      setToast({ type: 'success', message: 'Password changed successfully! Logging you out...' });
      setTimeout(async () => {
        await logout();
        navigate('/signin', {
          state: { message: 'Password updated. Please log in with your new credentials.' },
        });
      }, 2000);
    } catch (err) {
      if (err.errors) {
        const messages = Object.values(err.errors).flat();
        setValidationErrors(messages);
        setToast({ type: 'error', message: 'Please correct the highlighted fields.' });
      } else {
        setToast({ type: 'error', message: err.message || 'Failed to update password.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white ring-1 ring-stone-200/70 p-7 md:p-10">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <header className="flex items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-plum-700 mb-1.5">Account security</p>
          <h1 className="font-display-serif text-[24px] md:text-[28px] font-semibold tracking-tight text-stone-900 leading-tight">
            Change password
          </h1>
          <p className="text-stone-500 text-[13px] mt-1.5">Pick a strong password you haven't used before.</p>
        </div>
        <NotificationIcon />
      </header>

      {validationErrors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200">
          <p className="text-[13px] font-semibold text-red-800 mb-2">Before you save:</p>
          <ul className="space-y-1">
            {validationErrors.map((msg, i) => (
              <li key={i} className="text-red-700 text-[12.5px] leading-snug">• {msg}</li>
            ))}
          </ul>
        </div>
      )}

      {!token && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-[13px] text-amber-800 leading-relaxed">
          No security token found, did you open this from the link in your email?
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <PasswordInput
          label="Current password"
          placeholder="Your current password"
          value={passwords.currentPassword}
          onChange={(e) => handleInputChange('currentPassword', e.target.value)}
          name="currentPassword"
        />

        <PasswordInput
          label="New password"
          placeholder="A new, strong password"
          value={passwords.newPassword}
          onChange={(e) => handleInputChange('newPassword', e.target.value)}
          name="newPassword"
          hint="8+ characters, with a mix of letters, numbers and symbols if you can."
        />

        <PasswordInput
          label="Confirm new password"
          placeholder="Repeat your new password"
          value={passwords.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          name="confirmPassword"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-stone-900 text-white font-semibold text-sm hover:bg-stone-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span className="material-icons-round text-[17px]">lock</span>
              Save new password
            </>
          )}
        </button>
      </form>

      <div className="mt-8 flex flex-col items-center gap-5">
        <button
          type="button"
          onClick={handleResendLink}
          disabled={resending || resendTimer > 0}
          className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-plum-700 hover:text-plum-600 disabled:text-stone-400 disabled:cursor-not-allowed transition-colors"
        >
          {resendTimer > 0
            ? <>New link available in {resendTimer}s</>
            : resending
              ? 'Sending…'
              : 'Request a new reset link'}
        </button>

        <button
          onClick={() => navigate('/lockedin/profile-settings')}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-stone-500 hover:text-stone-800 transition-colors"
        >
          <span className="material-icons-round text-[15px]">arrow_back</span>
          Keep my current password
        </button>
      </div>
    </div>
  );
};

export const ChangePassword = () => {
  return (
    <main className="flex-1 lg:ml-64 px-4 sm:px-6 lg:px-10 pt-20 lg:pt-10 pb-32 min-w-0 flex items-start justify-center overflow-hidden">
      <div className="w-full max-w-xl my-auto">
        <ChangePasswordForm />
      </div>
    </main>
  );
};
