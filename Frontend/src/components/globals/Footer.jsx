import React from 'react';
import { logo } from '../../assets/assets';
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
  { label: 'Help & support', href: 'help-&-support' },
];

const LEGAL = [
  { label: 'Privacy policy', href: 'privacy' },
  { label: 'Terms & conditions', href: 'terms' },
  { label: 'Refund policy', href: 'refund-policy' },
];

const socials = [
  { icon: <FiGithub size={16} />, label: 'GitHub', href: 'https://github.com/samojeyinka/notepaper-ai' },
  { icon: <FiTwitter size={16} />, label: 'X', href: 'https://x.com/notepaper-ai' },
  { icon: <FiFacebook size={16} />, label: 'Facebook', href: 'https://facebook.com/notepaper-ai' },
];

export default function Footer() {
  const linkCls = 'text-[13px] text-stone-400 hover:text-white transition-colors';
  const colTitle = 'text-[12px] uppercase tracking-[0.18em] font-semibold text-stone-300 mb-5';

  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-14 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-5">
              <img src={logo} alt="Notepaper AI" className="w-8 md:w-9 object-contain" />
              <span className="font-display-serif text-[20px] md:text-[22px] font-bold tracking-tight text-white">
                Notepaper<span className="text-plum-300 text-[15px] md:text-[16px] font-bold tracking-[0.18em] align-middle">AI</span>
              </span>
            </Link>
            <p className="text-[13px] md:text-sm text-stone-400 leading-relaxed max-w-xs">
              A calm home for your notes, thoughts and study material with the
              feel of real paper.
            </p>
            <div className="flex gap-4 mt-6">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="w-8 h-8  border border-stone-700 flex items-center justify-center text-stone-400 hover:text-white hover:border-stone-500 transition-colors"
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
              {LEGAL.map((l) => (
                <li key={l.href}>
                  <Link to={`/${l.href}`} className={linkCls}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className={colTitle}>Get in touch</h4>
            <ul className="space-y-3 text-[13px] text-stone-400">
              <li>
                <a href="mailto:support@synchrome.co" className="hover:text-white transition-colors">
                  support@synchrome.co
                </a>
              </li>
              <li>
                <a href="tel:+2349131710995" className="hover:text-white transition-colors">
                  +234 913 171 0995
                </a>
              </li>
   
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-stone-800 flex flex-col md:flex-row justify-between gap-3 items-start md:items-center">
          <p className="text-[12px] text-stone-500">© {new Date().getFullYear()} Notepaper AI. All rights reserved.</p>
          <p className="text-[12px] text-stone-500">A Synchrome product</p>
        </div>
      </div>
    </footer>
  );
}
