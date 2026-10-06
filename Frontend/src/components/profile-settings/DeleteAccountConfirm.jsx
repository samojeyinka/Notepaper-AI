import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { userService } from '../../api/userService';
import { useAuth } from '../../context/AuthContext';
import Toast from '../globals/Toast';

export default function DeleteAccountConfirm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [token, setToken] = useState('');
  const [permanent, setPermanent] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const t = searchParams.get('token');
    if (t) setToken(t);
  }, [searchParams]);

  // Resend timer countdown
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

  const handleResendLink = async () => {
    if (resendTimer > 0) return;
    setResending(true);
    setToast(null);
    try {
      await userService.requestAccountDeletion();
      setToast({ type: 'success', message: 'A fresh deletion link has been sent to your email.' });
      setResendTimer(60);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to resend link.' });
    } finally {
      setResending(false);
    }
  };

  const handleDelete = async () => {
    if (!token) {
      setToast({ type: 'error', message: 'Invalid or missing security token.' });
      return;
    }
    setLoading(true);
    setToast(null);
    try {
      await userService.deleteAccount({ token, permanent, reason });
      setToast({ type: 'success', message: 'Account processed. Goodbye!' });
      setTimeout(() => {
        logout();
        navigate('/', { replace: true });
      }, 2000);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete account. Token may be expired.' });
    } finally {
      setLoading(false);
    }
  };

  const optionCls = (selected, danger) =>
    `flex-1 w-full text-left p-5 border transition-all ${
      selected
        ? danger
          ? 'border-red-400 bg-red-50/60'
          : 'border-plum-400 bg-plum-50/50'
        : 'border-stone-200 bg-white hover:border-stone-300'
    }`;

  const markerCls = (selected, danger) =>
    `w-5 h-5 border flex items-center justify-center shrink-0 ${
      selected
        ? danger ? 'bg-red-600 border-red-600' : 'bg-plum-600 border-plum-600'
        : 'border-stone-300'
    }`;

  return (
    <div className="w-full max-w-2xl mx-auto py-8 md:py-14 px-4">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="bg-white ring-1 ring-red-200/80 p-7 md:p-10">
        <header className="mb-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-red-700 mb-2">Last step</p>
          <h1 className="font-display-serif text-[24px] md:text-[28px] font-semibold text-stone-900 tracking-tight">
            Final confirmation
          </h1>
          <p className="text-stone-500 text-[13.5px] mt-2 max-w-sm mx-auto leading-relaxed">
            How would you like to proceed? Either way, we'll email you before anything changes.
          </p>
        </header>

        <div className="space-y-6">
          {/* Choice options */}
          <div className="flex flex-col md:flex-row gap-4">
            <button onClick={() => setPermanent(false)} className={optionCls(!permanent, false)}>
              <div className="flex items-start gap-3.5">
                <span className={markerCls(!permanent, false)}>
                  {!permanent && <span className="w-2 h-2 bg-white" />}
                </span>
                <div>
                  <p className="font-semibold text-stone-900">Deactivate</p>
                  <p className="text-[12.5px] text-stone-500 mt-1 leading-relaxed">
                    Temporarily pause your account. You can restore it within 30 days.
                  </p>
                </div>
              </div>
            </button>

            <button onClick={() => setPermanent(true)} className={optionCls(permanent, true)}>
              <div className="flex items-start gap-3.5">
                <span className={markerCls(permanent, true)}>
                  {permanent && <span className="w-2 h-2 bg-white" />}
                </span>
                <div>
                  <p className="font-semibold text-stone-900">Permanent removal</p>
                  <p className="text-[12.5px] text-red-700/80 mt-1 leading-relaxed">
                    Your notes, files and profile are permanently deleted and cannot be recovered.
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">
              Why are you leaving? <span className="normal-case font-normal text-stone-300">(optional)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Tell us what we could do better…"
              className="w-full min-h-[110px] p-4 bg-white border border-stone-200 text-sm text-stone-800 placeholder:text-stone-300 outline-none focus:ring-2 focus:ring-plum-200 transition-all resize-none"
            />
          </div>

          <div className="px-4 py-3 bg-amber-50 border border-amber-200 text-[13px] text-amber-800 leading-relaxed">
            By confirming, your session ends and you'll be logged out immediately.
          </div>

          <button
            onClick={handleDelete}
            disabled={loading || !token}
            className={`w-full py-3 text-sm font-semibold transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              permanent ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-stone-900 text-white hover:bg-stone-700'
            }`}
          >
            {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {permanent ? 'Confirm permanent deletion' : 'Confirm deactivation'}
          </button>

          <div className="flex flex-col items-center gap-3 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={handleResendLink}
              disabled={resending || resendTimer > 0}
              className="text-[12.5px] font-semibold text-red-700 hover:text-red-600 disabled:text-stone-400 disabled:cursor-not-allowed transition-colors"
            >
              {resendTimer > 0
                ? `New link available in ${resendTimer}s`
                : resending
                  ? 'Sending…'
                  : 'Resend deletion link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
