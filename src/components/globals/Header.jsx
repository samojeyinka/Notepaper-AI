import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { logo } from '../../assets/assets';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Features', href: 'features' },
    { label: 'About Us ', href: 'about-us' },
    { label: 'Plans', href: 'pricing' },
    { label: 'Contact Us', href: 'contact-us' },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-paper/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Notepaper AI" className="w-10"/>
            <span className="text-xl font-bold tracking-tight font-serif-elegant hidden sm:block text-ink-black">
              Notepaper<span className="text-primary">.ai</span>
            </span>
          
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 font-medium">
            {navLinks.map((link) => (
              <Link
              key={link.label}
                to={`/${link.href}`}
                className="text-ink-black hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Buttons */}
          <div className="flex items-center gap-4">
            <Link to={'/signin'} className="hidden sm:block font-semibold px-6 py-2 rounded-full border border-slate-300 hover:bg-slate-50 transition-all text-ink-black">
              Log in
            </Link>
            <Link to={'/signup'} className="hand-drawn-border bg-white px-8 py-2 font-bold hover:scale-105 transition-transform text-ink-black">
              Get Started
            </Link>
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
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-20 z-40 bg-paper/95 backdrop-blur-lg border-t border-slate-200/50">
            <div className="max-w-7xl mx-auto px-6 py-8 bg-paper-cream">
              <nav className="flex flex-col gap-2 mb-8">
                {navLinks.map((link) => (
                  <Link
                  
                    to={link.href}
                    className="text-lg font-semibold text-ink-black hover:text-primary py-3 px-4 rounded-lg hover:bg-slate-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="border-t border-slate-200/50 my-4"></div>

              <div className="flex flex-col gap-3">
                <button className="w-full py-3 text-sm font-semibold text-ink-black hover:bg-slate-50 rounded-lg border border-slate-300">
                  Log in
                </button>
                <button className="w-full py-3 hand-drawn-border bg-white font-bold text-ink-black hover:scale-105">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
      <div className="h-20"></div>
    </>
  );
}