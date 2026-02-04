import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CheckEmail() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Get email from localStorage or redirect
    const storedEmail = localStorage.getItem('resetEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      navigate('/reset-password');
    }
  }, [navigate]);

  const handleResendEmail = () => {
    console.log('Resend email to:', email);
    // Handle resend email logic here
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 overflow-hidden" style={{
      backgroundColor: '#fafafa',
    }}>
      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden select-none">
        <span className="scribble text-slate-200 text-6xl absolute top-[10%] right-[15%] rotate-12">
          Idea Spark!
        </span>
        <span className="scribble text-slate-200 text-4xl absolute bottom-[20%] left-[10%] -rotate-6">
          Keep going...
        </span>
        <svg className="absolute top-1/4 left-1/4 opacity-[0.03]" height="200" viewBox="0 0 200 200" width="200">
          <path
            d="M10,100 C10,10 190,10 190,100 C190,190 10,190 10,100"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          ></path>
        </svg>
      </div>

     

      {/* Main Postcard */}
      <main className="w-full max-w-4xl z-10">
        <div style={{ perspective: '1000px' }}>
          <div
            className="rounded-sm p-8 md:p-12 flex flex-col md:flex-row gap-8 transform hover:rotate-1 transition-transform duration-500 ease-out"
            style={{
              backgroundColor: '#fdfaf3',
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0, 0, 0, 0.01) 1px, transparent 0)',
              backgroundSize: '32px 32px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1), inset 0 0 40px rgba(255, 255, 255, 0.5)',
              border: '1px solid #e7e2d5',
              position: 'relative',
              aspectRatio: '1.6/1',
            }}
          >
            {/* Overlay gradient */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 50%, rgba(0, 0, 0, 0.02) 100%)',
                pointerEvents: 'none',
              }}
            ></div>

            {/* Left Section */}
            <div className="flex-1 flex flex-col justify-center relative pr-4 z-10">
              <div className="mb-6">
                <span className="material-symbols-outlined text-emerald-500 text-4xl mb-4 block">
                  mail_lock
                </span>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Check Your Email</h2>
              </div>
              <p className="handwritten text-3xl md:text-4xl leading-snug text-slate-700 max-w-sm">
                We've sent a <span className="text-purple-600">magic link</span> your way! Check your inbox to get back to creating.
              </p>
              <div className="mt-12 hidden md:block">
                <div className="w-32 h-[1px] bg-slate-200 mb-4"></div>
                <div className="w-24 h-[1px] bg-slate-200 mb-4"></div>
                <div className="w-28 h-[1px] bg-slate-200"></div>
              </div>
            </div>

            {/* Divider */}
            <div
              style={{
                width: '1px',
                background: 'rgba(0, 0, 0, 0.1)',
                height: '80%',
                position: 'absolute',
                left: '50%',
                top: '10%',
                display: 'none',
                '@media (min-width: 768px)': {
                  display: 'block',
                },
              }}
              className="hidden md:block"
            ></div>

            {/* Right Section */}
            <div className="flex-1 flex flex-col justify-between items-end md:items-stretch pl-0 md:pl-12 pt-8 md:pt-0 z-10">
              {/* Postage Stamp */}
              <div className="flex justify-end mb-12">
                <div
                  className="flex items-center justify-center rotate-3 relative"
                  style={{
                    width: '80px',
                    height: '100px',
                    background: 'white',
                    border: '2px solid #ddd',
                    padding: '4px',
                    boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <div className="w-full h-full bg-emerald-50 border border-emerald-100 flex items-center justify-center relative">
                    <span className="material-symbols-outlined text-emerald-600 text-4xl">
                      mark_as_unread
                    </span>
                    <div
                      className="absolute scribble text-xs text-slate-400 bg-white px-1"
                      style={{
                        bottom: '-8px',
                        left: '-8px',
                      }}
                    >
                      AIR MAIL
                    </div>
                  </div>
                  {/* Stamp perforated edge */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: '-4px',
                      backgroundImage: 'radial-gradient(circle, transparent 70%, white 72%)',
                      backgroundSize: '8px 8px',
                      backgroundPosition: '-4px -4px',
                      pointerEvents: 'none',
                    }}
                  ></div>
                </div>
              </div>

              {/* Email Details */}
              <div className="w-full space-y-6">
                <div className="border-b-2 border-slate-200 pb-2">
                  <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                    To:
                  </span>
                  <p className="text-lg font-medium text-slate-800 truncate">{email}</p>
                </div>
                <div className="border-b-2 border-slate-200 pb-2">
                  <p className="text-slate-400 italic text-sm">Waiting for verification...</p>
                </div>
              </div>

              {/* Resend Button */}
              <div className="mt-auto pt-12 flex flex-col items-center md:items-end">
                <button
                  onClick={handleResendEmail}
                  className="group cursor-pointer bg-transparent focus:outline-none transition-all"
                  style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '50%',
                    padding: '1rem',
                    transform: 'rotate(-15deg)',
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'rotate(-10deg) scale(1.05)';
                    e.currentTarget.style.borderColor = '#9333ea';
                    e.currentTarget.style.color = '#9333ea';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'rotate(-15deg)';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.color = '#94a3b8';
                  }}
                >
                  <span className="text-[10px] uppercase font-bold tracking-tighter mb-1">
                    Didn't receive?
                  </span>
                  <span className="text-sm font-bold">RESEND EMAIL</span>
                </button>

                {/* Back to Sign In */}
                <a
                  className="mt-6 text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
                  href="/signin"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  Back to sign in
                </a>
              </div>
            </div>

            {/* Top Tape Decoration */}
            <div
              className="absolute -top-4 left-1/2 -translate-x-1/2 pointer-events-none"
              style={{
                width: '96px',
                height: '32px',
                background: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(2px)',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                transform: 'rotate(8deg)',
              }}
            ></div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <div className="fixed bottom-6 left-0 right-0 text-center text-[10px] text-slate-400 uppercase tracking-[0.2em] px-4">
        Paper Aesthetic v2.4 • Crafted for Focus
      </div>
    </div>
  );
}