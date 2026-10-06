import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { logo } from '../assets/assets';

export default function CheckEmail() {
  const [email] = useState(() => localStorage.getItem('resetEmail') || '');
  const navigate = useNavigate();

  useEffect(() => {
    // No email stored — send the user back to request a link
    if (!localStorage.getItem('resetEmail')) {
      navigate('/forgot-password');
    }
  }, [navigate]);

  const handleResendEmail = () => {
    console.log('Resend email to:', email);
    // Handle resend email logic here
  };

  return (
    <main className="min-h-[70vh] bg-paper flex items-center justify-center px-5 sm:px-6 py-14">
      <div className="w-full max-w-md">
        {/* Wordmark */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <img src={logo} alt="Notepaper AI" className="w-9 object-contain" />
          <span className="font-display-serif text-[22px] font-bold tracking-tight text-stone-900">
            Notepaper<span className="text-plum-600 text-[15px] font-bold tracking-[0.18em] align-middle">AI</span>
          </span>
        </div>

        <div className="bg-white  ring-1 ring-stone-900/5 shadow-[0_30px_70px_-40px_rgba(28,25,23,0.35)] p-8 md:p-12 text-center">
          <div className="w-14 h-14  bg-plum-50 text-plum-700 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-[28px]">mail</span>
          </div>

          <p className="eyebrow text-plum-700 mb-3">Almost there</p>
          <h1 className="font-display-serif text-3xl md:text-[34px] font-semibold tracking-tight text-stone-900">
            Check your email
          </h1>
          <p className="text-stone-500 text-[15px] leading-relaxed mt-3">
            We&rsquo;ve sent a reset link to{' '}
            <span className="font-semibold text-stone-800">{email || 'your inbox'}</span>.
            Open it to choose a new password.
          </p>

          <div className="my-7  bg-stone-50 ring-1 ring-stone-100 p-4 text-left space-y-2.5">
            {[
              'Check your inbox and spam folder',
              'Click the link inside the email',
              'Choose a new password to finish',
            ].map((tip, i) => (
              <div key={i} className="flex items-center gap-3 text-[13px] text-stone-600">
                <span className="w-5 h-5  bg-plum-100 text-plum-700 flex items-center justify-center text-[11px] font-bold">
                  {i + 1}
                </span>
                {tip}
              </div>
            ))}
          </div>

          <button
            onClick={handleResendEmail}
            className="w-full border border-stone-300 text-stone-800 hover:border-stone-900 transition-colors  py-3 font-semibold text-[14px] flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">replay</span>
            Didn&rsquo;t get it? Resend email
          </button>

          <Link
            to="/signin"
            className="mt-6 inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors text-[14px]"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to log in
          </Link>
        </div>
      </div>
    </main>
  );
}
