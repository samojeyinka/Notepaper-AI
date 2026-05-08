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
      await userService.deleteAccount({ 
        token, 
        permanent,
        reason 
      });
      
      setToast({ type: 'success', message: 'Account processed. Goodbye!' });
      
      // Logout and redirect after a short delay
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

  return (
    <div className="w-full max-w-2xl mx-auto py-0 md:py-12 px-4">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="paper-scrap  p-4 md:p-12 border-2 border-red-100 shadow-xl relative overflow-hidden">
        <header className="mb-10 text-center relative z-10">
          <div className="w-10 h-10 md:w-16 md:h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-red-50/50">
            <span className="material-symbols-outlined text-4xl text-red-600">person_off</span>
          </div>
          <h1 className="text-xl md:text-2xl font-medium md:font-semibold text-slate-900 mb-2">Final Confirmation</h1>
          <p className="text-slate-500 font-handwriting text-[13px] md:text-[15px]">
            This is the last step. How would you like to proceed?
          </p>
        </header>

        <div className="space-y-4 md:space-y-8 relative z-10">
          {/* Options Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setPermanent(false)}
              className={`p-3 md:p-6 rounded-2xl border-2 transition-all text-left flex flex-col gap-2 md:gap-3 ${
                !permanent 
                  ? 'border-primary bg-primary/5 shadow-md ring-4 ring-primary/5' 
                  : 'border-slate-100 hover:border-slate-200 bg-white'
              }`}
            >
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center ${!permanent ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                <span className="material-symbols-outlined">restart_alt</span>
              </div>
              <div>
                <p className="font-medium text-slate-900">Deactivate</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Temporarily disable your account. You can restore it within 30 days.
                </p>
              </div>
            </button>

            <button
              onClick={() => setPermanent(true)}
              className={`p-6 rounded-2xl border-2 transition-all text-left flex flex-col gap-3 ${
                permanent 
                  ? 'border-red-600 bg-red-50 shadow-md ring-4 ring-red-50' 
                  : 'border-slate-100 hover:border-slate-200 bg-white'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${permanent ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                <span className="material-symbols-outlined">delete_forever</span>
              </div>
              <div>
                <p className="font-medium text-slate-900">Permanent Removal</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed text-red-700/70">
                  Your notes, files, and profile will be <b>permanently</b> deleted and cannot be recovered.
                </p>
              </div>
            </button>
          </div>

          {/* Reason for leaving */}
          <div className="space-y-2">
            <label className="block text-[11px] md:text-xs font-medium md:font-bold text-slate-400 uppercase tracking-widest px-1">
              Why are you leaving us? (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Tell us what we could do better..."
              className="w-full min-h-[100px] p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-handwriting resize-none"
            />
          </div>

          <div className="p-2 bg-amber-50 border border-amber-200 rounded-md flex gap-3 text-sm text-amber-800">
            <span className="material-symbols-outlined text-amber-600 shrink-0">info</span>
            <p className="leading-relaxed italic font-normal text-[12px] md:text-[14px]">
              By confirming, your current session will be terminated and you will be logged out immediately.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleDelete}
              disabled={loading || !token}
              className={`w-full py-1 md:py-2 text-[13px] rounded-lg md:rounded-xl md:font-medium shadow-lg transition-all active:scale-[0.95] flex items-center justify-center gap-3 ${
                permanent 
                  ? 'bg-red-600 hover:bg-black text-white' 
                  : 'bg-slate-900 hover:bg-black text-white'
              } disabled:opacity-50`}
            >
              {loading && <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
              {permanent ? 'Confirm Permanent Deletion' : 'Confirm Deactivation'}
            </button>
          </div>

          {/* Resend Link Section */}
          <div className="flex flex-col items-center gap-4 border-t border-red-50 pt-8 mt-8">
            <button
               type="button"
               onClick={handleResendLink}
               disabled={resending || resendTimer > 0}
               className={`
                 group flex items-center gap-2 px-3 md:px-6 py-1.5 md:py-2.5 rounded-lg md:rounded-xl text-[11px] md:text-xs font-medium md:font-bold uppercase tracking-widest transition-all
                 ${resendTimer > 0 
                   ? 'bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed'
                   : 'bg-red-50 text-red-600 border border-red-100 hover:border-red-200 active:scale-95 shadow-sm'}
               `}
            >
              {resending ? (
                <span className="w-3 h-3 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin"></span>
              ) : (
                <span className={`material-symbols-outlined text-[18px] ${resendTimer > 0 ? 'text-slate-300' : 'group-hover:rotate-180 transition-transform duration-500'}`}>
                  replay
                </span>
              )}
              {resendTimer > 0 ? `New link available in ${resendTimer}s` : 'Resend Deletion Link'}
            </button>
            <p className="text-[11px] text-slate-400 italic font-handwriting">
              Link expired? Grab a fresh one above.
            </p>
          </div>
        </div>

        {/* Decorative background label */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none select-none text-[20vw] font-black z-0">
          DANGER
        </div>
      </div>
    </div>
  );
}
