import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { billingService } from '../api/billingService';
import { useAuth } from '../context/AuthContext';
import { usePlan } from '../hooks/usePlan';

const PaymentCallbackPage = () => {
    const [params]                    = useSearchParams();
    const navigate                    = useNavigate();
    const { invalidate }              = usePlan();
    const { refreshUser }             = useAuth();
    const [status, setStatus]         = useState('verifying'); // verifying | success | failed
    const [planName, setPlanName]     = useState('');

    useEffect(() => {
        const reference = params.get('reference') || params.get('trxref');

        if (!reference) {
            setStatus('failed');
            return;
        }

        billingService.verify(reference)
            .then(async (res) => {
                const plan = res?.data?.plan ?? '';
                setPlanName(plan.charAt(0).toUpperCase() + plan.slice(1));
                invalidate();
                await refreshUser();
                setStatus('success');
            })
            .catch(() => setStatus('failed'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-10 max-w-md w-full flex flex-col items-center text-center gap-6">

                {status === 'verifying' && (
                    <>
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Verifying your payment…</h2>
                            <p className="text-sm text-slate-400 mt-1">Please wait, this only takes a moment.</p>
                        </div>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                            <span className="material-icons-round text-emerald-500 text-[36px]">check_circle</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">
                                {planName ? `Welcome to ${planName}!` : 'Payment successful!'}
                            </h2>
                            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                                Your subscription is now active. All features are unlocked and ready to use.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/lockedin')}
                            className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all active:scale-[0.98] shadow-md shadow-primary/20"
                        >
                            Go to Dashboard
                        </button>
                    </>
                )}

                {status === 'failed' && (
                    <>
                        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                            <span className="material-icons-round text-red-400 text-[36px]">error_outline</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Payment not confirmed</h2>
                            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                                We couldn't verify your payment. If you were charged, contact support and we'll sort it out.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <button
                                onClick={() => navigate('/lockedin/upgrade')}
                                className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all active:scale-[0.98]"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => navigate('/lockedin')}
                                className="w-full py-2.5 border border-slate-200 text-slate-500 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentCallbackPage;
