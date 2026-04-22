import React from 'react';

export default function Features() {
  return (
    <section className="py-4 relative bg-paper overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-serif-elegant font-extrabold mb-4 text-ink-black">
            Creative tools at your fingertips
          </h2>
          <p className="text-[14px] md:text-[16px] text-slate-500 max-w-lg mx-auto">
            Multiple ways to capture ideas, all unified into one beautiful workspace.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 items-center">
          {/* New Note Card */}
          <div className="organic-card-1 bg-accent-yellow p-6 md:p-12 paper-shadow group hover:scale-105 transition-all duration-500 flex flex-col items-center text-center text-white relative">
            <div className="w-10 h-10 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl">add</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-semibold md:font-bold mb-2">New Note</h3>
            <p className="opacity-80 text-[14px] md:text-[16px]">Start from a blank canvas</p>
            <div className="washi-tape -top-4 -right-2 rotate-12 bg-white/30"></div>
          </div>

          {/* Voice Record Card */}
          <div className="organic-card-2 bg-accent-green p-6 md:p-12 paper-shadow group hover:scale-105 transition-all duration-500 flex flex-col items-center text-center text-white relative md:-translate-y-8">
            <div className="w-10 h-10 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl">mic</span>
            </div>
           <h3 className="text-2xl md:text-3xl font-semibold md:font-bold mb-2">Voice Record</h3>
             <p className="opacity-80 text-[14px] md:text-[16px]">Speak your thoughts</p>
            <div className="absolute -left-12 bottom-0 hidden lg:block">
              <div className="font-sketch text-white rotate-[-20deg]">Translates to ink instantly!</div>
            </div>
          </div>

          {/* AI Generate Card */}
          <div className="organic-card-3 bg-primary p-6 md:p-12 paper-shadow group hover:scale-105 transition-all duration-500 flex flex-col items-center text-center text-white relative">
            <div className="w-10 h-10 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-[2rem] flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl">auto_awesome</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-semibold md:font-bold mb-2">AI Generate</h3>
             <p className="opacity-80 text-[14px] md:text-[16px]">Turn text to magic</p>
          </div>
        </div>

        {/* Decorative Arrow */}
        <div className="absolute -bottom-10 left-1/4 hidden lg:block">
          <svg className="sketchy-arrow text-slate-300 opacity-60 rotate-45" fill="none" height="80" viewBox="0 0 100 80" width="100">
            <path d="M10,10 Q50,40 90,70" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2"></path>
            <path d="M75,70 L90,70 L85,55" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2"></path>
          </svg>
        </div>
      </div>
    </section>
  );
}