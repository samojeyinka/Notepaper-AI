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
    <section className="bg-white ring-1 ring-red-200/70 p-6 md:p-8">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex items-center justify-between gap-4 mb-5">
        <h2 className="font-display-serif text-[20px] font-semibold text-red-800 leading-tight">Danger zone</h2>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-[14.5px] font-semibold text-stone-800">Delete account</p>
          <p className="text-[13px] text-stone-500 leading-relaxed mt-1 max-w-md">
            Once deleted there is no going back. We'll email you a link so you can confirm before anything happens.
          </p>
        </div>

        <button
          onClick={handleRequestDeletion}
          disabled={loading || success}
          className={`shrink-0 px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 ${
            success
              ? 'bg-red-50 text-red-700'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          {success ? 'Check your email' : 'Request deletion'}
        </button>
      </div>

      {success && (
        <div className="mt-4 p-4 bg-red-50/60 border border-red-100 text-[13px] text-red-800 leading-relaxed">
          A confirmation link has been sent to your email — you must click it to finalise the deletion.
        </div>
      )}
    </section>
  );
}
