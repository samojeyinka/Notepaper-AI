import React from 'react';
import { logo } from '../../assets/assets';
import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiFacebook } from 'react-icons/fi';

export default function Footer() {

  const companyLinks = [
    { label: 'Our Story', href: 'our-story' },
     { label: 'Contact Us', href: 'Contact-us' },
    { label: 'Privacy', href: 'privacy' },
    
  ]

 


   const navLinks = [
    { label: 'About Us ', href: 'about-us' },
     { label: 'How It Works', href: 'how-it-works' },
    { label: 'Plans', href: 'pricing' },
    
  ]

 const socialLinks = [
    { icon: <FiGithub/>, href: 'https://github.com/samojeyinka'},
    { icon: <FiTwitter/>, href: 'https://x.com/notepaperai'},
    { icon: <FiFacebook/>, href: 'https://facebook.com/notepaperai'},
 ]

  return (
    <footer className="bg-slate-900 text-paper py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16 mb-16">
          <div className="md:col-span-2">
            <Link to={'/'} className="flex items-center gap-1 mb-8">
             <img src={logo} alt="Notepaper AI" className="w-10"/>
              
              <span className="text-2xl font-bold font-serif-elegant">
                Notepaper<span className="text-primary">.ai</span>
              </span>
            </Link>
            <p className="text-slate-400 max-w-sm mb-10 leading-relaxed">
              Redefining digital handwriting with the warmth of tradition and the power of artificial intelligence.
            </p>
            <div className="flex gap-6">

              {socialLinks.map((link, index) => (
              <Link to={`/${link.href}`} key={index} target='_blank' className="text-slate-400 hover:text-white transition-colors" href="#">
                <span className="material-symbols-outlined">
                  {link.icon}
                </span>
              </Link>
              ))}
             
             
            </div>
          </div>

          <div>
            <h4 className="font-serif-elegant font-bold text-lg mb-8 text-white">Navigation</h4>
            <ul className="space-y-4 text-slate-400">

              {navLinks.map((navlink, index) => (
                  <li key={index}>
                <Link to={`/${navlink.href}`} className="hover:text-white transition-colors" href="#">
                  {navlink.label}
                </Link>
              </li>

              ))}
            
             
            </ul>
          </div>

          <div>
            <h4 className="font-serif-elegant font-bold text-lg mb-8 text-white">Company</h4>
            <ul className="space-y-4 text-slate-400">

              {companyLinks.map((comlink,index) => (
              <li key={index}>
                <Link to={`/${comlink.href}`} className="hover:text-white transition-colors" href="#">
                  {comlink.label}
                </Link>
              </li>
              ))}
             
             
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-sm">© 2026 Notepaper AI. Crafted with intention.</p>
          <div className="flex items-center gap-4 text-xs uppercase tracking-widest text-slate-500 font-bold">
            <span>Handmade in SF</span>
            <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
            <span>Global Sync Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
}