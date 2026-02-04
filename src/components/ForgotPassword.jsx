import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Store email for CheckEmail page and navigate
    localStorage.setItem('resetEmail', email);
    navigate('/forgot-password/check-email');
  };

  return (
    <main className="w-full max-w-6xl mx-auto flex flex-col md:flex-row overflow-hidden bg-white  min-h-[85vh]">
      {/* Left Section - Decorative */}
      <section className="hidden md:flex flex-1 relative p-12 overflow-hidden items-center justify-center border-r border-stone-200" style={{
        backgroundColor: '#fdfaf3',
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.02) 1px, transparent 0)',
        backgroundSize: '24px 24px',
      }}>
       
        <div className="relative z-10 w-full max-w-lg">
          {/* Main Card */}
          <div className="relative h-[400px] mb-8">
            <div className="absolute inset-0 bg-white paper-scrap rough-edge transform -rotate-1 p-8 flex flex-col justify-center" style={{
              filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))',
              border: '1px solid #e7e2d5',
            }}>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-6 leading-tight">
                Retrieve your <span className="font-display italic text-purple-600">creations.</span>
              </h1>
              <p className="text-slate-600 text-lg font-medium opacity-90">
                We're here to help you get back to your focus zone.
              </p>
            </div>

            {/* Yellow Key Shape */}
            <div className="absolute -top-10 -right-4 w-32 h-32 flex items-center justify-center transform rotate-12" style={{
              backgroundColor: '#ffedbc',
              filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))',
              border: '1px solid #e7e2d5',
              clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
            }}>
              <span className="material-symbols-outlined text-4xl text-amber-600">key</span>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-2 h-2 rounded-full bg-slate-400 shadow-inner"></div>
            </div>

            {/* Pink Quote Card */}
            <div className="absolute -bottom-6 -left-6 w-44 h-32 bg-pink-100 p-4 transform -rotate-3" style={{
              filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))',
              border: '1px solid #e7e2d5',
              clipPath: 'polygon(0% 2%, 2% 0%, 98% 1%, 100% 3%, 99% 97%, 97% 100%, 3% 99%, 0% 98%)',
            }}>
              <div className="tape absolute -top-4 left-1/2 -translate-x-1/2" style={{
                background: 'rgba(255, 255, 255, 0.4)',
                width: '60px',
                height: '20px',
                transform: 'rotate(-15deg)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                backdropFilter: 'blur(1px)',
              }}></div>
              <p className="handwritten text-xl leading-tight text-pink-900 pt-2">
                "Sometimes we just need a little nudge to remember where we left off."
              </p>
            </div>

            {/* Green Circle */}
            <div className="absolute top-20 -right-12 w-24 h-24 rounded-full flex items-center justify-center transform -rotate-6" style={{
              backgroundColor: '#dcfce7',
              filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))',
              border: '1px solid #e7e2d5',
            }}>
              <span className="material-symbols-outlined text-3xl text-emerald-600">support_agent</span>
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full shadow-md"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Right Section - Form */}
      <section className="flex-1 p-8 md:p-16 flex flex-col justify-center bg-white relative">
        <div className="max-w-md mx-auto w-full">
         

          {/* Header */}
          <header className="mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Reset your password</h2>
            <p className="text-slate-500">Enter your email and we'll send you a link to get back in.</p>
          </header>

          {/* Form */}
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="group">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1" htmlFor="email">
                Email Address
              </label>
              <input
                className="w-full ruled-input focus:ring-0 text-slate-800 placeholder-slate-300"
                id="email"
                placeholder="you@example.com"
                type="email"
                value={email}
                onChange={handleInputChange}
                required
                style={{
                  border: 'none',
                  borderBottom: '1px solid #e2e8f0',
                  background: 'transparent',
                  paddingLeft: 0,
                  paddingRight: 0,
                  borderRadius: 0,
                }}
              />
            </div>

            {/* Submit Button */}
            <div className="relative pt-4">
              <div className="absolute -top-6 right-2 pointer-events-none">
                <span className="scribble text-purple-600 text-xl rotate-12 inline-block">Don't worry!</span>
              </div>
              <button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98]"
                style={{
                  boxShadow: '0 20px 25px -5px rgba(147, 51, 234, 0.2)',
                }}
                type="submit"
              >
                Send Reset Link
              </button>
            </div>
          </form>

          {/* Footer */}
          <footer className="mt-12 text-center">
            <a 
              className="text-slate-500 font-semibold hover:text-purple-600 transition-colors flex items-center justify-center gap-2 group"
              href="/signin"
            >
              <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">
                arrow_back
              </span>
              <span className="handwritten text-xl">Back to login</span>
            </a>
          </footer>
        </div>

      
      </section>
    </main>
  );
}