import React, { useState } from 'react';
import { BsFacebook, BsGoogle } from 'react-icons/bs';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from './globals/Alert';
import Toast from './globals/Toast';

export default function SignIn() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Where to go after login — set by ProtectedRoute when redirecting
  const from = location.state?.from?.pathname || '/lockedin';

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await login({ ...formData, remember_me: rememberMe });

      if (result.requires2fa) {
        // Pass temp_token to 2FA page via state (not URL — keeps it off the address bar)
        navigate('/auth/2fa', { state: { tempToken: result.tempToken }, replace: true });
        return;
      }

      setSuccess({ message: 'Welcome back! Taking you in...' });
      setTimeout(() => navigate(from, { replace: true }), 1500);
    } catch (err) {
      if (err?.message?.toLowerCase().includes('restore') || err?.message?.toLowerCase().includes('trashed')) {
        navigate('/restore-account', { state: { email: formData.email } });
        return;
      }
      let details = [];
      if (err?.errors) details = Object.values(err.errors).flat();
      setError({ message: err?.message || 'Login failed. Please check your credentials.', details });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="w-full max-w-6xl mx-auto flex flex-col md:flex-row overflow-hidden bg-white min-h-[85vh]">
      {/* Left Section - Decorative */}
      <section className="hidden md:flex flex-1 relative p-12 overflow-hidden items-center justify-center border-r border-stone-200" style={{
        backgroundColor: '#fdfaf3',
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.02) 1px, transparent 0)',
        backgroundSize: '24px 24px',
      }}>
       

        <div className="relative z-10 w-full max-w-lg">
          {/* Main Card */}
          <div className="relative h-[400px] mb-8">
            <div className="absolute inset-0 bg-white paper-scrap rough-edge transform rotate-1 p-8 flex flex-col justify-center" style={{
              filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))',
              border: '1px solid #e7e2d5',
            }}>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6 leading-tight">
                Turn thoughts into <span className="font-display italic text-purple-600">masterpieces.</span>
              </h1>
              <p className="text-slate-600 text-[16px] font-normal opacity-90">
                The AI-powered creative hub for modern thinkers, students, and professionals.
              </p>
            </div>

            {/* Yellow Accent Shape */}
            <div className="absolute -top-10 -right-4 w-32 h-32 flex items-center justify-center transform rotate-12" style={{
              backgroundColor: '#ffedbc',
              filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))',
              border: '1px solid #e7e2d5',
              clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
            }}>
              <span className="material-symbols-outlined text-4xl text-amber-600">edit_note</span>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-2 h-2 rounded-full bg-slate-400 shadow-inner"></div>
            </div>

            {/* Testimonial Card */}
            <div className="absolute -bottom-6 -left-6 w-40 h-28 bg-pink-100 p-4 transform -rotate-3" style={{
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
              <p className="handwritten text-[15px] leading-none text-rose-800 pt-2">
                "This app changed my whole workflow..."
              </p>
              <div className="flex items-center gap-2 mt-2">
                <img
                  alt="User avatar"
                  className="w-6 h-6 rounded-full border border-rose-200"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8Xu1OjV5L3VKF6dwYX_LVs0lUBVgEl1Sx4GZuWU6dUCKTUS_XQh8zRjTZZeJUri_YHl0bjKdpUKlVdVq3RxPasgqwThglTNPNhmd8XNNCTgYhjRspL6nKRF9M7e41p3z74BDxIcbegQoXDl86RONwEg-n8DrL3n5Gl_4I3uf8GWyGZ6YOJFK08FWIFKSs6VsLduzQCXF2AtEpTxkh7t4y5O7yDRV448fhgFjR7BRgjsD9q4_0ev69zQaKbFhzs8ufQzi6K-b2LFHU"
                />
                <span className="text-[10px] uppercase tracking-wider font-bold text-rose-700">Sam O.</span>
              </div>
            </div>

            {/* Green Circle */}
            <div className="absolute top-20 -right-12 w-24 h-24 rounded-full flex items-center justify-center transform -rotate-6" style={{
              backgroundColor: '#dcfce7',
              filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))',
              border: '1px solid #e7e2d5',
            }}>
              <span className="material-symbols-outlined text-3xl text-emerald-600">auto_awesome</span>
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full shadow-md"></div>
            </div>

            {/* Blue Card */}
            <div className="absolute bottom-10 -right-8 w-36 h-48 p-4 transform rotate-6" style={{
              backgroundColor: '#e0e7ff',
              filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))',
              border: '1px solid #e7e2d5',
              clipPath: 'polygon(0% 2%, 2% 0%, 98% 1%, 100% 3%, 99% 97%, 97% 100%, 3% 99%, 0% 98%)',
            }}>
              <div className="w-full h-24 bg-indigo-200/50 rounded-sm mb-2"></div>
              <div className="space-y-1">
                <div className="h-1 w-full bg-indigo-300/30"></div>
                <div className="h-1 w-4/5 bg-indigo-300/30"></div>
                <div className="h-1 w-full bg-indigo-300/30"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right Section - Form */}
      <section className="flex-1 p-8 md:p-16 flex flex-col justify-center bg-white relative">
        <div className="max-w-md mx-auto w-full">
         

          {/* Header */}
          <header className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-500">Continue your creative journey.</p>
          </header>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors duration-200 shadow-sm">
              <BsGoogle/>
              <span className="text-sm font-semibold text-slate-700">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors duration-200 shadow-sm">
             <BsFacebook/>
              <span className="text-sm font-semibold text-slate-700">Facebook</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold uppercase tracking-widest handwritten text-lg">
              or use email
            </span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <Alert type="error" message={error.message} details={error.details} />}

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
                value={formData.email}
                onChange={handleInputChange}
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

            {/* Password Input */}
            <div className="group">
              <div className="flex justify-between mb-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest" htmlFor="password">
                  Password
                </label>
                <Link to={'/forgot-password'} className="text-xs font-semibold text-purple-600 hover:underline handwritten text-base" href="#">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  className="w-full ruled-input focus:ring-0 text-slate-800 placeholder-slate-300"
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  style={{
                    border: 'none',
                    borderBottom: '1px solid #e2e8f0',
                    background: 'transparent',
                    paddingLeft: 0,
                    paddingRight: 0,
                    borderRadius: 0,
                  }}
                />
                <button
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <input
                  className="rounded-sm text-purple-600 focus:ring-purple-600 border-slate-300"
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="text-xs text-slate-500" htmlFor="remember">
                  Keep me logged in
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="relative pt-4">
              <div className="absolute -top-6 right-0 pointer-events-none hidden md:block">
                <span className="scribble text-purple-600 text-xl rotate-12 inline-block">Jump back in!</span>
                <svg className="w-12 h-12 text-purple-600 -rotate-45 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  ></path>
                </svg>
              </div>
              <button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ boxShadow: '0 20px 25px -5px rgba(147, 51, 234, 0.2)' }}
                type="submit"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Log In'}
              </button>
            </div>
          </form>

          {/* Footer */}
          <footer className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              Don't have an account?{' '}
              <Link to={'/signup'} className="text-purple-600 font-medium hover:underline handwritten text-lg ml-1" href="#">
                Sign up here
              </Link>
            </p>
          </footer>
        </div>

      </section>

    </main>

    <Toast message={success?.message} type="success" onClose={() => setSuccess(null)} />
    </>
  );
}