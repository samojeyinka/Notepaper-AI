import React from 'react';
import { notepaperMark } from '../../assets/assets';
import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiFacebook } from 'react-icons/fi';

const EXPLORE = [
  { label: 'Features', href: 'features' },
  { label: 'How it works', href: 'how-it-works' },
  { label: 'Our story', href: 'our-story' },
];

const COMPANY = [
  { label: 'About us', href: 'about-us' },
  { label: 'Contact us', href: 'contact-us' },
  { label: 'Help and support', href: 'help-&-support' },
];

const LEGAL = [
  { label: 'Privacy policy', href: 'privacy' },
  { label: 'Terms and conditions', href: 'terms' },
  { label: 'Refund policy', href: 'refund-policy' },
];

const socials = [
  { icon: <FiGithub size={16} />, label: 'GitHub', href: 'https://github.com/samojeyinka/notepaper-ai' },
  { icon: <FiTwitter size={16} />, label: 'X', href: 'https://x.com/notepaper-ai' },
  { icon: <FiFacebook size={16} />, label: 'Facebook', href: 'https://facebook.com/notepaper-ai' },
];

export default function Footer() {
  const linkCls = 'text-sm text-stone-600 hover:text-[#45666C] transition-colors';
  const colTitle = 'text-xs uppercase tracking-[0.14em] font-semibold text-stone-900 mb-4';

  return (
    <footer className="site-footer bg-[#F3F1EB] text-stone-700 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              {/* <img src={notepaperMark} alt="" aria-hidden="true" className="w-9 h-9 object-contain" /> */}
              <span className="font-display text-[20px] md:text-[22px] font-bold tracking-tight text-stone-900">
                Notepaper<span className="text-[#587A7D] text-[15px] md:text-[16px] font-bold tracking-[0.08em] align-middle"> AI</span>
              </span>
            </Link>
            <p className="text-sm text-stone-600 leading-relaxed max-w-sm">
              A calm place for class notes, voice notes, and useful study tools.
            </p>
            <div className="flex gap-4 mt-6">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full border border-stone-300 flex items-center justify-center text-stone-600 hover:text-[#45666C] hover:border-[#587A7D] transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div>
            <h4 className={colTitle}>Explore</h4>
            <ul className="space-y-3">
              {EXPLORE.map((l) => (
                <li key={l.href}>
                  <Link to={`/${l.href}`} className={linkCls}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={colTitle}>Company</h4>
            <ul className="space-y-3">
              {COMPANY.map((l) => (
                <li key={l.href}>
                  <Link to={`/${l.href}`} className={linkCls}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={colTitle}>Legal</h4>
            <ul className="space-y-3">
              {LEGAL.map((l) => (
                <li key={l.href}>
                  <Link to={`/${l.href}`} className={linkCls}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className={colTitle}>Contact</h4>
            <ul className="space-y-3 text-sm text-stone-600">
              <li>
                <a href="mailto:support@synchrome.co" className="hover:text-[#45666C] transition-colors">
                  support@synchrome.co
                </a>
              </li>
              <li>
                <a href="tel:+2349131710995" className="hover:text-[#45666C] transition-colors">
                  +234 913 171 0995
                </a>
              </li>
   
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-5 border-t border-stone-300 flex flex-col md:flex-row justify-between gap-2 items-start md:items-center">
          <p className="text-xs text-stone-500">© {new Date().getFullYear()} Notepaper AI. All rights reserved.</p>
          <p className="text-xs text-stone-500">Made by Synchrome</p>
        </div>
      </div>
    </footer>
  );
}
