import React from 'react';

export default function AboutHero() {
  return (
    <header className="relative pt-20 md:pt-40 pb-10 md:pb-20 flex flex-col items-center text-center px-6">
      <div className="max-w-3xl space-y-4 mb-20 relative z-10">
        <span className="font-sketch text-[16px] md:text-2xl text-primary block mb-2">- The founding vision -</span>
        <h1 className="text-4xl md:text-6xl lg:text-8xl font-serif-elegant font-extrabold leading-tight text-slate-900">
          Crafted with <span className="italic font-normal">intention</span>.
        </h1>
        <p className="text-[14px] md:text-xl text-slate-600 max-w-xl mx-auto font-normal md:font-medium">
          We're a small team of dreamers, designers, and engineers obsessed with the friction-less joy of physical paper.
        </p>
      </div>

      <div className="relative w-full max-w-lg h-[400px] md:h-[500px] mb-32">
        {/* Main Card */}
        <div className="absolute inset-0 bg-white paper-shadow paper-edge rotate-[-4deg] z-10 p-4 border border-slate-100">
          <div className="w-full h-full bg-slate-50 relative overflow-hidden flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-200 text-[10rem]">desk</span>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5"></div>
          </div>
          <div className="washi-tape -top-4 left-10 bg-blue-200/40"></div>
        </div>

        {/* Grid Paper Card */}
        <div className="absolute top-20 -right-12 w-54 h-70 md:w-64 md:h-80 bg-paper paper-shadow rotate-[6deg] z-20 p-8 grid-paper border-l-8 border-accent-pink/20">
          <div className="washi-tape-vert -top-8 right-10 bg-yellow-200/50"></div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-accent-pink/10 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-accent-pink">lightbulb</span>
            </div>
            <p className="font-handwritten text-lg text-slate-700 leading-tight">
              "What if digital ink felt like it had weight?"
            </p>
            <p className="font-sketch text-sm text-slate-400">- First Brainstorm, 2023</p>
          </div>
        </div>

        {/* Photo Card */}
        <div className="absolute -bottom-10 -left-16 w-72 h-56 bg-white paper-shadow rotate-[-8deg] z-30 p-2">
          <div className="w-full h-full bg-slate-100 flex items-center justify-center relative overflow-hidden">
            <span className="material-symbols-outlined text-slate-300 text-6xl">groups</span>
          </div>
          <div className="absolute -right-4 -top-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
            <span className="material-symbols-outlined">favorite</span>
          </div>
        </div>
      </div>
    </header>
  );
}