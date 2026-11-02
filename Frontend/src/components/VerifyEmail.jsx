import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';
import Alert from './globals/Alert';
import AuthShell from './auth/AuthShell';

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

  const stateIcon = loading ? 'mail' : status === 'success' ? 'verified' : 'error';
  const stateColor = loading || status === 'success'
    ? 'bg-[#edf3ef] text-[#54786f]'
    : 'bg-red-50 text-red-600';

  return (
    <AuthShell aside={{
      title: ['A little confirmation,', 'then you’re in.'],
      sub: 'Confirming your email keeps your notebook secure and makes sure we can help you recover your account if you need us.',
      children: <div className="flex items-center gap-3 text-sm text-[#50675f]"><span className="material-symbols-outlined text-[#54786f]">lock</span> Your account details stay private.</div>,
    }}>
      <div className="text-center">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 ${stateColor}`}>
          {loading
            ? <span className="w-6 h-6 rounded-full border-[3px] border-[#c7d5cb] border-t-[#54786f] animate-spin" aria-label="Verifying email" />
            : <span className="material-symbols-outlined text-[30px]" aria-hidden="true">{stateIcon}</span>}
        </div>

        <p className="auth-kicker mb-3">Email confirmation</p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-stone-900">
          {loading ? 'Checking your email' : status === 'success' ? 'You’re verified' : 'Couldn’t verify your email'}
        </h1>
        <p className="text-stone-500 text-[15px] leading-relaxed mt-3 mb-7">
          {loading ? 'Please wait while we securely confirm your account.' : message}
        </p>

        {!loading && status === 'success' && (
          <Link to="/signin" className="auth-primary-btn w-full font-semibold py-3.5 transition-colors text-[15px] inline-flex items-center justify-center gap-2">
            Continue to sign in <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        )}

        {!loading && status === 'error' && (
          <>
            {resendStatus && <div className="text-left mb-5"><Alert type={resendStatus.type} message={resendStatus.message} /></div>}
            {email && (
              <button type="button" onClick={handleResend} disabled={resending}
                className="auth-primary-btn w-full font-semibold py-3.5 transition-colors text-[15px] inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                {resending && <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" aria-hidden="true" />}
                {resending ? 'Sending link…' : 'Resend verification link'}
              </button>
            )}
            <Link to="/signup" className="auth-text-link mt-6 font-semibold hover:underline inline-flex items-center gap-1 text-sm">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>Back to sign up
            </Link>
          </>
        )}
      </div>
    </AuthShell>
  );
}
