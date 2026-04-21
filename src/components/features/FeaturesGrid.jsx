import React from 'react';

export default function FeaturesGrid() {
  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-32 items-stretch">
        {/* AI Study Collaboration */}
        <div className="relative group h-full">
          <div className="bg-[#E9E1FF] blob-shape p-10 md:p-12 h-full flex flex-col items-center text-center transform hover:rotate-2 transition-transform duration-500 shadow-xl border border-purple-200">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-4 md:w-24 md:h-8 washi-tape bg-purple-400/30 rotate-3 z-20"></div>

            {/* Icon */}
            <div className="w-10 h-10 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center mb-8 shadow-inner relative">
              <span className="material-symbols-outlined text-primary text-4xl">attach_file</span>
              <div className="absolute -right-24 top-0 scribble-note text-purple-600/60 text-sm w-32 text-left hidden lg:block">
                <svg className="mb-1" height="20" width="40">
                  <path
                    d="M0 10 Q20 0 40 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  ></path>
                </svg>
                shared by team
              </div>
            </div>

            <h3 className="text-xl md:text-2xl font-bold font-serif mb-4 text-purple-900">
              AI Study Collaboration
            </h3>
            <p className="text-purple-800/70 font-normal md:font-medium text-[12px] md:text-base">
              Real-time shared notes that organize themselves based on your team's collective input.
            </p>
           
          </div>
        </div>

        {/* Report & Presentation */}
        <div className="relative h-full">
          <div className="bg-[#FFF9E6] pentagon-shape p-12 h-full flex flex-col items-center text-center transform hover:-rotate-2 transition-transform duration-500 shadow-xl border border-yellow-200">
            {/* Prompt Box */}
            <div className="w-full bg-white/80 rounded-lg p-4 mb-8 shadow-sm border border-yellow-200/50">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-yellow-600">
                <span className="material-symbols-outlined !text-sm">auto_awesome</span> PROMPT
              </div>
              <div className="bg-yellow-50 p-1.5 md:p-3 rounded text-[12px] md:text-sm text-left font-mono border-l-4 border-yellow-400">
                "Turn my bio notes into a 5-slide visual report"
              </div>
            </div>

            <h3 className="text-[17px] md:text-2xl font-bold font-serif mb-4 text-yellow-900">
              Report &amp; Presentation
            </h3>
            <p className="text-yellow-800/70 text-[12px] md:text-base font-normal md:font-medium">
              Single text input transforms messy scribbles into layered, professional presentations.
            </p>
            <div className="absolute -top-6 -right-4 washi-tape bg-yellow-400/40 w-20 h-10 -rotate-12"></div>
          </div>
        </div>

        {/* AI Handwriting */}
        <div className="relative group h-full">
          <div className="bg-white p-12 h-full flex flex-col items-center text-center shadow-[5px_5px_0px_0px_#10B981] border-2 border-slate-100 rounded-sm transform hover:scale-105 transition-transform duration-300">
            <div className="absolute top-0 right-1/4 w-16 h-8 washi-tape bg-green-400/20 -rotate-45"></div>

            {/* Scribble Box */}
            <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rotate-2">
              <span className="scribble-note text-xl md:text-3xl text-slate-700">Scan to Text</span>
            </div>

            <h3 className="text-xl md:text-2xl font-bold font-serif mb-4">AI Handwriting</h3>
            <p className="text-slate-600 text-[12px] font-normal md:font-medium">
              Industry-leading handwriting recognition that preserves your unique style while making it
              searchable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}