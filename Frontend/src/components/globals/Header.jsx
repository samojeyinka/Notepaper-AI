import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = [
  { label: 'Features', href: 'features' },
  { label: 'How it works', href: 'how-it-works' },
  { label: 'About', href: 'about-us' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  return (
    <>
      <nav className="fixed top-0 inset-x-0 z-50 bg-paper/90 backdrop-blur-md border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 h-16 lg:h-[72px] flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileMenuOpen(false)}>
            {/* <img src={notepaperMark} alt="" aria-hidden="true" className="w-8 h-8 md:w-9 md:h-9 object-contain" /> */}
            <span className="font-display text-[20px] md:text-[22px] font-bold tracking-tight text-stone-900">
              Notepaper<span className="text-[#587A7D] text-[15px] md:text-[16px] font-bold tracking-[0.08em] align-middle"> AI</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={`/${link.href}`}
                className="text-[15px] font-medium text-stone-600 hover:text-stone-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/lockedin"
                  className="px-5 py-2  text-[14px] font-semibold border border-stone-300 text-stone-800 hover:border-stone-900 transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="px-5 py-2  text-[14px] font-semibold text-stone-500 hover:text-stone-900 transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="px-4 py-2  text-[14px] font-semibold text-stone-700 hover:text-stone-900 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5  text-[14px] font-semibold bg-stone-900 text-white hover:bg-stone-700 transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden p-2 -mr-2  hover:bg-stone-100 transition-colors text-stone-900"
          >
            <span className="material-symbols-outlined text-[28px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden border-t border-stone-200/80 bg-paper transition-[max-height,opacity] duration-300 ease-out ${
            mobileMenuOpen ? 'max-h-[480px] opacity-100' : 'max-h-0 opacity-0 border-t-0'
          }`}
        >
          <div className="px-5 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={`/${link.href}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 text-[15px] font-medium text-stone-700 hover:text-stone-900"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 mt-2 border-t border-stone-200 flex gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/lockedin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5  text-[14px] font-semibold border border-stone-300 text-stone-800"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="flex-1 py-2.5  text-[14px] font-semibold border border-stone-300 text-stone-500"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/signin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5  text-[14px] font-semibold border border-stone-300 text-stone-800"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5  text-[14px] font-semibold bg-stone-900 text-white"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <div className="h-16 lg:h-[72px]" />
    </>
  );
}
