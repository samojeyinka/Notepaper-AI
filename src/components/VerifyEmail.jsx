import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';
import Alert from './globals/Alert';

export default function VerifyEmail() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState(null); 

  const hasCalled = useRef(false);

  useEffect(() => {
     if (hasCalled.current) return;
     hasCalled.current = true;

     if (!token || !email) {
       setStatus('error');
       setMessage('Invalid verification link. Token or email is missing.');
       setLoading(false);
       return;
     }

     const verifyAccount = async () => {
        try {
           const res = await authService.verify({ token, email });
           setStatus('success');
           setMessage(res?.message || 'Your email has been successfully verified! Redirecting to sign in...');
           setTimeout(() => {
             navigate('/signin');
           }, 3500);
        } catch (err) {
           setStatus('error');
           setMessage(err?.message || 'Verification failed. The link might be expired or invalid.');
        } finally {
           setLoading(false);
        }
     };

     verifyAccount();
  }, [token, email]);

  const handleResend = async () => {
      setResending(true);
      setResendStatus(null);
      try {
         const res = await authService.resendVerification({ email });
         setResendStatus({ type: 'success', message: res?.message || 'A new verification link has been sent to your email.' });
      } catch (err) {
         setResendStatus({ type: 'error', message: err?.message || 'Failed to resend verification link.' });
      } finally {
         setResending(false);
      }
  };

  return (
    <main className="w-full max-w-6xl mx-auto flex flex-col md:flex-row overflow-hidden bg-white md:min-h-[85vh]">
       {/* UI for verifying / success / error */}
       <section className="flex-1 p-8 md:p-16 flex flex-col justify-center bg-[#fdfaf3] relative items-center text-center" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.02) 1px, transparent 0)',
        backgroundSize: '24px 24px',
      }}>
         <div className="max-w-md w-full bg-white  p-5 md:p-10 rounded-xl md:rounded-2xl shadow-sm border border-stone-200 flex flex-col items-center relative">
             
             {/* Yellow Accent Shape */}
             <div className="absolute -top-6 -right-6 w-20 h-20 flex items-center justify-center transform rotate-12" style={{
              backgroundColor: '#ffedbc',
              filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))',
              border: '1px solid #e7e2d5',
              clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
            }}>
              <span className="material-symbols-outlined text-2xl text-amber-600">mark_email_read</span>
            </div>

             {loading ? (
                <>
                  <div className="w-10 h-10 md:w-16 md:h-16 rounded-full border-[5px] border-purple-100 border-t-purple-600 border-l-purple-600 animate-spin mb-6"></div>
                  <h2 className="text-xl md:text-2xl font-semibold md:font-extrabold text-slate-800 mb-2">Verifying Email</h2>
                  <p className="text-slate-500 text-[12px] md:text-base">Please wait while we verify your account securely...</p>
                </>
             ) : status === 'success' ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-6 ring-4 ring-emerald-50">
                    <span className="material-symbols-outlined text-4xl text-emerald-600">verified</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Verified!</h2>
                  <p className="text-slate-500 mb-8">{message}</p>
                  <Link to="/signin" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium md:font-bold py-1.5 px-3 md:py-3 md:px-6 rounded-md md:rounded-xl shadow-[0_10px_15px_-3px_rgba(147,51,234,0.3)] transition-all active:scale-[0.98]">
                    Continue to Sign In
                  </Link>
                </>
             ) : (
                <>
                  <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-red-100 flex items-center justify-center mb-6 ring-4 ring-red-50">
                    <span className="material-symbols-outlined text-2xl md:text-4xl text-red-600">error</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-semibold md:font-extrabold text-slate-800 mb-2">Verification Failed</h2>
                  <p className="text-slate-500 mb-3 md:mb-6 text-[13px] md:text-base">{message}</p>
                  
                  {resendStatus && (
                     <div className="w-full text-left mb-6 text-sm">
                       <Alert type={resendStatus.type} message={resendStatus.message} />
                     </div>
                  )}

                  {email && (
                    <button 
                       onClick={handleResend}
                       disabled={resending}
                       className="w-full bg-slate-900 hover:bg-slate-800 text-white text-[12px] md:text-[15px] font-medium md:font-semibold py-1.5 px-3 md:py-2 md:px-4 rounded-md md:rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mb-4"
                    >
                      {resending ? 'Sending Link...' : 'Resend Verification Link'}
                    </button>
                  )}
                  
                  <Link to="/signup" className="text-purple-600 text-[13px] font-medium md:font-bold hover:underline inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Back to Sign Up
                  </Link>
                </>
             )}
         </div>
       </section>
    </main>
  );
}
