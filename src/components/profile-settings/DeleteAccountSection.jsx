import { useState } from 'react';
import { userService } from '../../api/userService';
import Toast from '../globals/Toast';

export default function DeleteAccountSection() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState(null);

  const handleRequestDeletion = async () => {
    setLoading(true);
    setToast(null);

    try {
      await userService.requestAccountDeletion();
      setSuccess(true);
      setToast({ type: 'success', message: 'Deletion request sent! Please check your email to confirm.' });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to send deletion request.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="paper-scrap p-4 rounded-lg relative overflow-hidden border border-red-100 bg-red-50/30">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="flex items-center gap-2 mb-6">
        <span className="material-symbols-outlined text-red-500">heart_broken</span>
        <h2 className="text-[15px] md:text-[17px] font-medium md:font-bold text-red-900">Danger Zone</h2>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-[14px] md:text-base font-medium md:font-semibold text-slate-800">Delete Account</p>
            <p className="text-[12px] md:text-xs text-slate-500 leading-relaxed max-w-md">
              Once you delete your account, there is no going back. Please be certain. 
              You can choose to deactivate temporarily or delete permanently via the link we'll send.
            </p>
          </div>
          
          <button
            onClick={handleRequestDeletion}
            disabled={loading || success}
            className={`px-3 md:px-6  py-1.5 md:py-2.5 rounded-md flex items-center justify-center md:font-medium text-center text-sm transition-all shadow-sm ${
              success 
                ? 'bg-green-100 text-green-700 cursor-default' 
                : 'bg-red-600 hover:bg-red-700 text-white active:scale-[0.98]'
            } disabled:opacity-50 flex items-center gap-2`}
          >
            {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
            {success ? (
              <>
                <span className="material-symbols-outlined text-md">check_circle</span>
                Check Email
              </>
            ) : (
              'Request Deletion'
            )}
          </button>
        </div>

        {success && (
          <div className="p-3 bg-white/60 border border-green-100 rounded-xl animate-in slide-in-from-bottom-2 duration-300">
            <p className="text-xs text-green-800 font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">mail</span>
              A confirmation link has been sent to your email. You must click it to finalize the deletion.
            </p>
          </div>
        )}
      </div>

      {/* Decorative warning accent */}
      <div className="absolute -top-4 -right-4 opacity-[0.03] pointer-events-none rotate-12">
        <span className="material-symbols-outlined text-[120px]">warning</span>
      </div>
    </section>
  );
}
