import { useState } from 'react';
import { userService } from '../api/userService';
import { ToggleSwitch } from './ProfileSettings';
import TwoFactorModal from './globals/TwoFactorModal';
import Toast from './globals/Toast';
import { useAuth } from '../context/AuthContext';

export default function SecuritySection() {
  const { user } = useAuth();

  // Derive 2FA state directly from global context — reactive to all updates
  const twoFAEnabled = !!user?.google2fa_enabled;
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handle2FAToggle = () => {
    setModalOpen(true);
  };

  const handleRequestReset = async () => {
    setLoading(true);
    setToast(null);

    try {
      const res = await userService.requestPasswordChange();
      setToast({ type: 'success', message: res.message || 'Reset link sent! Please check your email.' });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to send reset link.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="bg-white ring-1 ring-stone-200/70 p-6 md:p-7 h-full flex flex-col">
        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}

        <div className="mb-7">
          <h2 className="font-display-serif text-[20px] font-semibold text-stone-900 leading-tight">Security</h2>
          <p className="text-stone-500 text-[12.5px] mt-1">Sign-in and account protection.</p>
        </div>

        <div className="divide-y divide-stone-100">
          {/* Password */}
          <div className="flex items-center justify-between py-4 first:pt-0">
            <div>
              <p className="text-[14px] font-semibold text-stone-800">Password</p>
              <p className="text-[12px] text-stone-400 mt-0.5">Keep it strong and unique</p>
            </div>
            <button
              onClick={handleRequestReset}
              disabled={loading}
              className="text-[12.5px] font-semibold text-plum-700 hover:text-plum-600 underline underline-offset-4 decoration-plum-200 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Sending…' : 'Change password'}
            </button>
          </div>

          {/* 2FA */}
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-[14px] font-semibold text-stone-800">Two-factor authentication</p>
              <p className="text-[12px] text-stone-400 mt-0.5">Adds an extra layer of security</p>
            </div>
            <ToggleSwitch
              checked={twoFAEnabled}
              onChange={handle2FAToggle}
              label=""
            />
          </div>
        </div>

        {/* Status note */}
        <div className="mt-6 pt-5 border-t border-stone-100">
          <p className={`text-[12.5px] leading-relaxed ${twoFAEnabled ? 'text-emerald-700' : 'text-stone-500'}`}>
            {twoFAEnabled
              ? '✓ Two-factor authentication is on, your account is protected.'
              : 'Two-factor authentication is off. Turn it on for an extra layer of security.'}
          </p>
        </div>
      </section>

      <TwoFactorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        currentlyEnabled={twoFAEnabled}
        onSuccess={(enabled) => {
          setToast({
            type: 'success',
            message: enabled ? 'Two-factor authentication enabled!' : 'Two-factor authentication disabled.'
          });
        }}
      />
    </>
  );
}
