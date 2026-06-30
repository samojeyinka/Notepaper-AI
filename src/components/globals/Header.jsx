import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { logo } from '../../assets/assets';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  const navLinks = [
    { label: 'Features', href: 'features' },
    { label: 'About Us ', href: 'about-us' },
    { label: 'Plans', href: 'pricing' },
    { label: 'Contact Us', href: 'contact-us' },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-paper backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <a
              href="http://127.0.0.1:8020/"
              className="hidden sm:block text-[12px] font-medium text-slate-400 hover:text-primary transition-colors"
            >
              &larr; Synchrome
            </a>
            <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Notepaper AI" className="w-10"/>
              <span className="text-xl font-bold tracking-tight font-serif-elegant hidden sm:block text-ink-black">
                Notepaper<span className="text-primary">-ai</span>
              </span>

            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 font-medium">
            {navLinks.map((link) => (
              <Link
              key={link.label}
                to={`/${link.href}`}
                className="text-ink-black hover:text-primary transition-colors text-[13px] lg:text-[16px]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Buttons */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to={'/lockedin'} className="text-[14px] md:text-[16px] sm:block lg:font-semibold px-6 py-2 rounded-full border border-slate-300 hover:bg-slate-50 transition-all text-ink-black">
                  Dashboard
                </Link>
                <button 
                  onClick={logout} 
                  className="hidden text-[14px] md:text-[16px] hand-drawn-border bg-white px-8 py-2 font-bold hover:scale-105 transition-transform text-ink-black"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to={'/signin'} className="hidden text-[12px] lg:text-[16px] sm:block md:font-medium lg:font-semibold px-1.5 py-1 lg:px-6 lg:py-2 rounded-full border border-slate-300 hover:bg-slate-50 transition-all text-ink-black">
                  Log in
                </Link>
                <Link to={'/signup'} className="hand-drawn-border text-[12px] lg:text-[16px] bg-white px-2 py-1 lg:px-8 lg:py-2 font-medium md:font-bold hover:scale-105 transition-transform text-ink-black">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span className="material-symbols-outlined text-4xl text-ink-black">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden fixed inset-0 top-20 z-40 bg-paper/95 backdrop-blur-lg border-t border-slate-200/50 transition-all duration-300 ease-out ${
          mobileMenuOpen
            ? 'opacity-100 pointer-events-auto translate-y-0'
            : 'opacity-0 pointer-events-none -translate-y-3'
        }`}>
          <div className="max-w-7xl mx-auto px-6 py-4 bg-paper-cream">
            <nav className="flex flex-col gap-2 mb-8">
              {navLinks.map((link, i) => (
                <Link
                  key={link.label}
                  to={`/${link.href}`}
                  className={`text-[14px] font-normal text-ink-black hover:text-primary py-1.5 px-2 rounded-md hover:bg-slate-50 transition-all duration-300 ${
                    mobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                  }`}
                  style={{ transitionDelay: mobileMenuOpen ? `${i * 60 + 60}ms` : '0ms' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-slate-200/50 my-2"></div>

            <div className={`flex flex-col gap-3 transition-all duration-300 ${
              mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`} style={{ transitionDelay: mobileMenuOpen ? '320ms' : '0ms' }}>
              {isAuthenticated ? (
                <>
                  <Link
                    to={'/lockedin'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-1.5 text-center text-[12px] font-normal text-ink-black hover:bg-slate-50 rounded-lg border border-slate-300"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="w-full py-1.5 hand-drawn-border bg-white font-medium text-ink-black hover:scale-105"
                  >
                    Log out 
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to={'/signin'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-1.5 text-center text-[12px] font-normal text-ink-black hover:bg-slate-50 rounded-lg border border-slate-300"
                  >
                    Log in
                  </Link>
                  <Link
                    to={'/signup'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-1.5 text-center text-[14px] hand-drawn-border bg-white font-semibold text-ink-black hover:scale-105"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <div className="h-20"></div>
    </>
  );
}