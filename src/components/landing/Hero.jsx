import React from 'react';

export default function Hero() {
  return (
    <section className="relative pt-20 pb-2 overflow-hidden flex flex-col items-center text-center bg-paper">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-40">
        <div className="absolute top-40 left-10 w-64 h-64 bg-accent-yellow/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl px-6 space-y-10 mb-20 relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 font-medium text-sm border border-slate-200">
          <span className="material-symbols-outlined text-sm">auto_awesome</span>
          The soul of paper, the mind of AI
        </div>

        <h1 className="text-6xl lg:text-8xl font-serif-elegant font-extrabold leading-[1.05] text-slate-900">
          Your thoughts,<br />
          <span className="italic text-slate-700">beautifully handwritten</span>
          <br />
          by AI.
        </h1>

        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed relative z-50">
          Experience the tactile joy of traditional note-taking powered by modern intelligence. Transform voice and text into stunning, personal digital journals.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-40">
          <button className="hand-drawn-border bg-white px-12 py-4 text-xl font-bold shadow-lg hover:-rotate-1 hover:scale-105 transition-all text-ink-black">
            Start Your Journal
          </button>
          <button className="flex items-center gap-2 font-bold text-lg hover:text-primary transition-colors decoration-wavy underline underline-offset-8 text-ink-black">
            <span className="material-symbols-outlined">play_circle</span>
            Watch the process
          </button>
        </div>

        <div className="absolute -right-16 top-0 hidden lg:block pointer-events-none z-0">
          <svg className="sketchy-arrow text-slate-400 opacity-60" fill="none" height="80" viewBox="0 0 120 80" width="120">
            <path d="M10,60 Q40,10 110,20" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"></path>
            <path d="M100,10 L110,20 L102,32" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"></path>
          </svg>
          <div className="absolute -right-20 -top-8 w-40 transform rotate-6">
            <p className="font-sketch text-lg text-primary leading-tight">Feels like actual <span className="underline">ink</span> on paper!</p>
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-6xl h-auto lg:h-[600px] mt-12 mx-auto px-6 mb-10">
        <div className="absolute left-[5%] top-[10%] z-40 hidden lg:block">
          <div className="font-sketch text-lg text-slate-500 mb-2 transform -rotate-12">Just talk, we'll write...</div>
          <svg className="sketchy-arrow text-slate-400 opacity-60 transform -rotate-12" fill="none" height="60" viewBox="0 0 100 60" width="100">
            <path d="M10,10 Q50,50 90,40" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"></path>
            <path d="M80,35 L90,40 L85,52" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"></path>
          </svg>
        </div>

        <div className="relative mx-auto max-w-[600px] lg:max-w-full">
          <div className="absolute left-1/2 lg:left-1/3 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] h-auto lg:h-[750px] bg-white paper-shadow paper-edge rotate-1 z-20 p-8 lg:p-12 text-left lined-paper rounded-lg">
            <div className="washi-tape -top-4 left-1/3"></div>

            <div className="space-y-8">
              <div className="flex justify-between items-center mb-10">
                <span className="font-sketch text-slate-400 text-lg lg:text-xl">Oct 24, 2024</span>
                <div className="flex gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-100"></span>
                  <span className="w-3 h-3 rounded-full bg-slate-100"></span>
                </div>
              </div>

              <div className="font-handwritten text-xl lg:text-2xl text-slate-800 space-y-4 leading-loose mt-4">
                <p>The morning light hits...</p>
                <p>I realized today that <span className="bg-accent-yellow/20 px-2">creativity isn't a resource</span>, it's a practice.</p>
                <p className="text-primary italic">AI: This insight aligns with your previous notes on "The Creative Habit." Would you like to connect them?</p>
                <p>Building the new studio space next month...</p>
              </div>

              <div className="pt-12">
                <div className="w-48 h-1 bg-slate-100 mb-2"></div>
                <p className="font-sketch text-slate-400">#reflections #studio #growth</p>
              </div>
            </div>

            <div className="absolute -right-24 bottom-32 z-30 hidden xl:block">
              <svg className="sketchy-arrow text-slate-400 opacity-60" fill="none" height="100" viewBox="0 0 80 100" width="80">
                <path d="M70,10 Q10,40 20,90" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"></path>
                <path d="M12,80 L20,90 L32,85" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"></path>
              </svg>
              <div className="font-sketch text-lg text-accent-pink w-32 mt-2 -rotate-3">AI Handwriting synthesis</div>
            </div>
          </div>

          <div className="absolute left-[5%] top-20 w-64 lg:w-72 h-40 lg:h-48 bg-paper-darker paper-shadow -rotate-6 z-10 p-6 grid-paper border-l-4 border-accent-pink/30 rounded-lg">
            <div className="washi-tape-vert -top-4 right-8 bg-blue-200/40"></div>
            <span className="material-symbols-outlined text-slate-300 absolute top-4 right-4">push_pin</span>
            <p className="font-handwritten text-lg text-slate-600 leading-tight">
              Remember to pick up the heavy grain paper and some 2B pencils.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent-pink/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-accent-pink text-sm">check</span>
              </div>
              <span className="font-sketch text-sm line-through text-slate-400">Art Store Run</span>
            </div>
          </div>

          <div className="absolute right-[8%] top-32 w-56 lg:w-64 h-64 lg:h-72 bg-white paper-shadow rotate-12 z-10 p-4 border-b-[20px] border-white hidden lg:block rounded-lg">
            <div className="w-full h-48 bg-slate-50 mb-4 overflow-hidden relative rounded-lg flex items-center justify-center">
              <svg className="w-32 h-32" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                {/* Circle */}
                <circle cx="100" cy="60" r="30" fill="none" stroke="#A78BFA" strokeWidth="2" opacity="0.7"/>
                {/* Rectangle */}
                <rect x="65" y="110" width="50" height="45" fill="none" stroke="#10B981" strokeWidth="2" opacity="0.7"/>
                {/* Triangle */}
                <polygon points="150,140 170,180 130,180" fill="none" stroke="#FBBF24" strokeWidth="2" opacity="0.7"/>
                {/* Connecting lines */}
                <line x1="100" y1="90" x2="90" y2="110" stroke="#A78BFA" strokeWidth="1" opacity="0.5" strokeDasharray="4,2"/>
                <line x1="100" y1="90" x2="150" y2="140" stroke="#10B981" strokeWidth="1" opacity="0.5" strokeDasharray="4,2"/>
              </svg>
            </div>
            <p className="font-sketch text-center text-slate-600 text-xs">Geometry & Math viz</p>
            <div className="washi-tape -top-2 left-1/4 bg-yellow-200/40"></div>
          </div>

          <div className="absolute left-[15%] bottom-[-50px] w-64 h-64 bg-white paper-shadow rotate-3 z-30 p-8 flex flex-col justify-center items-center hidden lg:flex rounded-lg">
            <span className="material-symbols-outlined text-8xl text-slate-100 absolute select-none">draw</span>
            <div className="relative z-10 text-center">
              <span className="font-handwritten text-xl text-primary block mb-2">Voice Syncing...</span>
              <div className="flex gap-1 justify-center">
                <div className="w-1 h-4 bg-primary animate-pulse"></div>
                <div className="w-1 h-6 bg-primary animate-pulse"></div>
                <div className="w-1 h-3 bg-primary animate-pulse"></div>
                <div className="w-1 h-5 bg-primary animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="absolute right-[18%] bottom-[-20px] w-60 h-44 bg-paper-darker paper-shadow -rotate-2 z-30 p-6 flex flex-col justify-between hidden lg:flex rounded-lg">
            <div className="washi-tape-vert -right-2 top-1/4 bg-green-200/40 transform rotate-12"></div>
            <div>
              <h4 className="font-serif-elegant font-bold text-slate-700 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">quiz</span> AI Quiz Gen
              </h4>
              <p className="font-handwritten text-xs text-slate-500 mt-1">Ready for your morning review?</p>
            </div>
            <div className="h-1 w-full bg-slate-200 rounded-full mt-2">
              <div className="h-1 w-2/3 bg-accent-green rounded-full"></div>
            </div>
            <div className="text-[10px] font-sketch text-slate-400 text-right mt-1">Learning Mastery: 65%</div>
            <div className="absolute -right-24 bottom-0 hidden lg:block">
              <svg className="sketchy-arrow text-slate-400 opacity-60" fill="none" height="60" viewBox="0 0 100 60" width="100">
                <path d="M10,40 Q50,10 90,20" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"></path>
                <path d="M80,15 L90,20 L85,32" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"></path>
              </svg>
              <div className="font-sketch text-sm text-accent-green w-32 mt-1">Smart flashcards from notes!</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}