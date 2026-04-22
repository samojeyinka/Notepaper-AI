import React from 'react';

export default function FeaturesShowcase() {
  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* Main Showcase Card */}
      <div className="bg-white border border-slate-200 card-shadow overflow-hidden rounded-lg mb-24 relative">
        {/* Notebook Spiral Holes */}
        <div className="absolute left-4 top-0 bottom-0 flex flex-col justify-around py-8 pointer-events-none">
          <div className="w-2 h-2 md:w-4 md:h-4 rounded-full bg-slate-200 shadow-inner"></div>
          <div className="w-2 h-2 md:w-4 md:h-4 rounded-full bg-slate-200 shadow-inner"></div>
          <div className="w-2 h-2 md:w-4 md:h-4 rounded-full bg-slate-200 shadow-inner"></div>
          <div className="w-2 h-2 md:w-4 md:h-4 rounded-full bg-slate-200 shadow-inner"></div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Column - Description */}
          <div className="p-12 lg:p-20 bg-slate-50/50 border-r border-slate-100">
            <div className="max-w-md">
              <h4 className="text-xs font-medium md:font-black uppercase tracking-widest text-primary mb-4">
                New Tool
              </h4>
              <h2 className="text-2xl md:text-4xl font-semibold md:font-bold font-serif mb-6 leading-tight">
                From messy draft to polished report.
              </h2>
              <p className="text-slate-600 mb-10 text-[13px] md:text-base font-normal md:font-medium">
                Simply highlight your notes and type a command. Notepaper AI handles the formatting,
                citations, and structure.
              </p>

              {/* Input Demo */}
              <div className="bg-white p-3 md:p-6 rounded-xl md:rounded-2xl shadow-sm border border-slate-200 flex items-center gap-2 md:gap-4">
                <div className="bg-primary/10 p-1 md:p-2 rounded-md md:rounded-lg text-primary">
                  <span className="material-symbols-outlined text-[10px] md:text-sm">magic_button</span>
                </div>
                <div className="flex-grow typewriter text-[10px] md:text-sm text-slate-500">
                  Generate study report...
                </div>
                <div className="bg-primary text-white p-1 md:p-2 rounded-full cursor-pointer hover:bg-purple-600 transition-colors">
                  <span className="material-symbols-outlined text-[10px] md:text-sm">arrow_forward</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Output Preview */}
          <div className="p-12 lg:p-20 relative bg-[#fff] overflow-hidden">
            {/* Ruled Paper Output */}
            <div className="ruled-paper typewriter text-slate-700 max-w-md mx-auto">
              <h3 className="text-[16px] md:text-lg font-bold uppercase mb-4 text-center border-b-2 border-slate-200">
                Study Report: Photosynthesis
              </h3>
              <p className="mb-4">1.0 EXECUTIVE SUMMARY</p>
              <p className="mb-4 text-sm">
                Light-dependent reactions occur in the thylakoid membrane. ATP and NADPH are synthesized...
              </p>
              <p className="mb-4 text-sm">2.0 KEY PROCESSES</p>
              <p className="mb-4 text-sm">
                Visible light is absorbed by chlorophyll pigments. Electrons are excited to a higher energy
                level...
              </p>
              <div className="animate-pulse inline-block w-2 h-5 bg-primary ml-1 align-middle"></div>
            </div>

            {/* Annotation */}
            <div className="absolute bottom-8 right-8 scribble-note text-primary rotate-[-5deg] text-lg bg-yellow-100/50 px-3 py-1 border border-yellow-200">
              Looks perfect! 🖊️
            </div>
          </div>
        </div>
      </div>

      {/* Client Logos Section */}
      <div className="text-center">
        <p className="text-slate-400 font-medium md:font-black uppercase tracking-[0.3em] text-[8px] md:text-xs mb-12">
          Crafted for the future of learning
        </p>
        <div className="flex flex-wrap justify-center gap-6 md:gap-24 opacity-30 grayscale">
          <div className="flex items-center gap-3 font-serif font-black text-[15px] md:text-2xl tracking-tighter italic">
            UNIVERSITY
          </div>
          <div className="flex items-center gap-3 font-serif font-black text-[15px] md:text-2xl tracking-tighter italic">
            CREATIVE
          </div>
          <div className="flex items-center gap-3 font-serif font-black text-[15px] md:text-2xl tracking-tighter italic">
            STUDIO
          </div>
          <div className="flex items-center gap-3 font-serif font-black text-[15px] md:text-2xl tracking-tighter italic">
            ACADEMY
          </div>
        </div>
      </div>
    </div>
  );
}