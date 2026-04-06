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
      <section className="paper-scrap p-4 rounded-lg relative">
        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
        <div className="flex items-center gap-2 mb-8">
          <span className="material-symbols-outlined text-slate-400">security</span>
          <h2 className="text-[17px] font-medium">Security</h2>
        </div>

        <div className="space-y-3">
          {/* Password */}
          <div className="flex items-center justify-between group">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-xs text-slate-400">Keep it strong and unique</p>
            </div>
            <button
              onClick={handleRequestReset}
              disabled={loading}
              className="text-primary font-bold text-sm hover:underline font-sketch disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Reset'}
            </button>
          </div>

          <hr className="border-dashed border-slate-200" />

          {/* 2FA Authentication */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">2FA Authentication</p>
              <p className="text-xs text-slate-400">Adds an extra layer of security</p>
            </div>
            <ToggleSwitch
              checked={twoFAEnabled}
              onChange={handle2FAToggle}
              label="2FA"
            />
          </div>

          {/* Status badge */}
          <div className={`pt-4 flex items-center gap-3 p-3 rounded-xl border ${
            twoFAEnabled
              ? 'bg-green-50 border-green-100'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <span className={`material-symbols-outlined ${twoFAEnabled ? 'text-green-500' : 'text-slate-400'}`}>
              {twoFAEnabled ? 'verified_user' : 'shield'}
            </span>
            <p className={`font-handwriting text-[14px] ${twoFAEnabled ? 'text-green-700' : 'text-slate-500'}`}>
              {twoFAEnabled ? 'Status: Protected & Synced' : 'Status: 2FA not enabled'}
            </p>
          </div>
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
