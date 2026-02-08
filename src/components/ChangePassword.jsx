import { useState } from 'react';

// Logo/Header Component
export const ChangePasswordHeader = () => {
  return (
    <div className="fixed top-8 left-8">
      <a className="flex items-center gap-3" href="#">
        <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white shadow-sm shadow-purple-500/20">
          <span className="material-symbols-outlined">edit_note</span>
        </div>
        <span className="text-xl font-extrabold tracking-tight">
          Notepaper<span className="text-purple-500">.ai</span>
        </span>
      </a>
    </div>
  );
};

// Password Input Component - Reusable
export const PasswordInput = ({ label, placeholder, value, onChange, name }) => {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-slate-400 uppercase tracking-[0.1em]">
        {label}
      </label>
      <input
        type="password"
        name={name}
        className="w-full bg-transparent border-none focus:ring-0 paper-lined-input font-handwriting text-xl text-ink-blue px-0 placeholder:text-slate-200"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

// Main Change Password Form
export const ChangePasswordForm = () => {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field, value) => {
    setPasswords(prev => ({
      ...prev,
      [field]: value,
    }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwords.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    // Success
    console.log('Password changed successfully');
    setSuccess(true);
    setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });

    // Reset success message after 3 seconds
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="paper-scrap p-6 md:p-8 rounded-lg border-b-4 border-slate-200">
      <header className="mb-5">
        <h1 className="font-serif text-xl md:text-2xl text-ink-blue mb-2">Update your security</h1>
        <p className="font-handwriting text-[15px] text-slate-400">Keep your thoughts safe and secret...</p>
      </header>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3">
          <span className="material-symbols-outlined text-green-600">check_circle</span>
          <p className="text-green-700 font-semibold">Password changed successfully!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
          <span className="material-symbols-outlined text-red-600">error</span>
          <p className="text-red-700 font-semibold">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
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
            className="w-full py-2 bg-purple-500 text-white font-medium rounded-full shadow-sm shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-1 transition-all flex items-center justify-center gap-1.5 text-[16px]"
          >
            <span className="material-symbols-outlined">lock_open</span>
            Save New Password
          </button>

          {/* Decorative Icon */}
          <div className="absolute -right-16 md:-right-24 bottom-2 hidden md:block">
            <div className="relative group">
              <span className="material-symbols-outlined text-5xl text-slate-300 rotate-12 mb-2">lock</span>
              <div className="absolute -top-12 -left-4 w-24 h-24">
                <svg className="w-16 h-16 text-slate-400 -rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  ></path>
                </svg>
                <p className="font-sketch text-slate-400 text-sm absolute -top-4 left-8 whitespace-nowrap">
                  Safety first!
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>

      <div className="mt-5 flex justify-center">
        <a
          href="#"
          className="font-sketch text-slate-400 hover:text-purple-500 transition-colors text-base underline underline-offset-4 decoration-dashed decoration-1"
        >
          Wait, I'll keep the old one
        </a>
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

