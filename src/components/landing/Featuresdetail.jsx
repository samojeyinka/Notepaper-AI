import React from 'react';

export default function FeaturesDetail() {
  return (
    <section className="py-6 md:py-24 bg-paper">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-slate-900 rounded-[1.5rem] md:rounded-[3rem] p-12 text-white relative overflow-hidden paper-shadow">
            <div className="relative z-10 max-w-md">
              <h3 className="text-2xl md:text-4xl font-serif-elegant font-bold mb-3 md:mb-6">Master your studies with AI Quizzes.</h3>
              <p className="text-[13px] md:text-[16px] text-slate-400 mb-8 leading-relaxed">Simply upload your notes or record a lecture. Our AI automatically identifies key concepts and generates personalized flashcards and quizzes.</p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-[13px] md:text-[16px] font-normal md:font-medium">
                  <span className="material-symbols-outlined text-accent-green">check_circle</span>
                  <span className="">Automatic Concept Extraction</span>
                </li>
               <li className="flex items-center gap-3 text-[13px] md:text-[16px] font-normal md:font-medium">
                  <span className="material-symbols-outlined text-accent-green">check_circle</span>
                  <span className="font-medium">Spaced Repetition Scheduling</span>
                </li>
                <li className="flex items-center gap-3 text-[13px] md:text-[16px] font-normal md:font-medium">
                  <span className="material-symbols-outlined text-accent-green">check_circle</span>
                  <span className="font-medium">Instant Performance Analytics</span>
                </li>
              </ul>
            </div>
            <div className="absolute right-[-10%] top-[20%] w-64 h-96 bg-slate-800 rounded-3xl rotate-12 border border-slate-700 opacity-50 flex flex-col p-6 gap-4">
              <div className="h-8 w-3/4 bg-slate-700 rounded-lg"></div>
              <div className="h-12 w-full bg-slate-700/50 rounded-lg"></div>
              <div className="h-12 w-full bg-slate-700/50 rounded-lg"></div>
              <div className="h-12 w-full bg-slate-700/50 rounded-lg"></div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-primary rounded-[1.5rem] md:rounded-[3rem] p-6 md:p-12 text-white flex flex-col justify-between paper-shadow relative">
            <div>
              <span className="material-symbols-outlined text-4xl mb-6 block">ink_pen</span>
              <h3 className="text-2xl md:text-3xl font-semibold md:font-bold mb-2 md:mb-4">Organic Digital Ink</h3>
              <p className="opacity-80 text-[13px] md:text-[15px] mb-4 md:mb-8">Our AI models mimic human pressure and flow, creating notes that feel truly personal and tactile.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 md:p-8 rounded-2xl relative overflow-hidden">
              <p className="font-handwritten text-[15px] md:text-xl italic leading-relaxed">"Beautiful notes inspire better thinking"</p>
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <span className="material-symbols-outlined text-8xl">format_quote</span>
              </div>
            </div>
            <div className="washi-tape-vert top-0 left-10 -translate-y-4 opacity-40 bg-white"></div>
          </div>
        </div>
      </div>
    </section>
  );
}