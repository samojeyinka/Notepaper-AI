import React from 'react';

export default function ContactHero() {
  return (
    <div className="relative md:min-h-[600px] flex items-center justify-center">
      {/* Main Postcard */}
      <div className="relative z-20 bg-white p-6 md:p-12 paper-shadow rotate-[-2deg] w-full max-w-md border-b-[30px] border-white">
        {/* Postmark Stamp */}
        <div className="absolute top-6 right-6 postmark w-24 h-24 text-slate-300">
          <div className="text-[7px] md:text-[8px] font-bold text-center uppercase tracking-widest">
            Air Mail<br />
            Notepaper AI<br />
            Oct 2024
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-2xl md:text-6xl font-serif-elegant font-extrabold text-slate-900 leading-tight mb-8">
          Let's keep<br />
          in touch
        </h1>
        <p className="text-slate-500 text-[13px] md:text-[15px] font-normal md:font-medium italic">We're just a stamp away.</p>
      </div>

      {/* Email Card - Left Bottom */}
      <div className="hidden md:block md:absolute z-30 left-[-20px] bottom-10 md:bottom-20 bg-paper-darker p-6 paper-shadow rotate-3 border-l-4 border-accent-yellow/30 w-64">
        <div className="washi-tape-vert -top-4 left-1/2 -translate-x-1/2 bg-yellow-200/40"></div>
        <span className="text-xs uppercase tracking-widest font-bold text-slate-400 block mb-2">
          Hello at
        </span>
        <p className="font-handwritten text-xl text-primary">hello@Notepaper-ai</p>
      </div>

      {/* Social Card - Right Top */}
      <div className="hidden md:block absolute z-10 right-[-10px] top-10 bg-white p-6 paper-shadow -rotate-6 w-56 grid-paper">
        <div className="washi-tape -top-2 left-4 h-6 w-16 bg-blue-100/60 rotate-2"></div>
        <span className="text-xs uppercase tracking-widest font-bold text-slate-400 block mb-3">
          Find us
        </span>
        <div className="space-y-2 font-sketch text-lg text-slate-700">
          <p className="hover:text-primary cursor-pointer flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">share</span> @notepaperai
          </p>
          <p className="hover:text-primary cursor-pointer flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">alternate_email</span> studio.ink
          </p>
        </div>
      </div>

      {/* Handwritten Note - Bottom Right */}
      <div className="absolute bottom-10 right-10 z-30 transform rotate-12">
        <p className="font-sketch md:text-2xl text-accent-pink">Always listening!</p>
      </div>
    </div>
  );
}