import React from 'react';

export default function StorySection() {
  return (
    <section className="py-20 relative">
      <div className="max-w-4xl mx-auto px-6 space-y-40">
        {/* Story 1: The Human Touch */}
        <div className="flex flex-col md:flex-row items-center gap-12 relative">
          <div className="w-full md:w-1/2">
            <div className="organic-card-1 bg-accent-yellow p-12 paper-shadow text-white relative">
              <div className="washi-tape -top-4 right-10 bg-white/30"></div>
              <h2 className="text-4xl font-serif-elegant font-extrabold mb-6">The Human Touch</h2>
              <p className="text-lg opacity-90 leading-relaxed mb-4 font-medium">
                We believe that technology should adapt to humans, not the other way around. Our journey started in a small stationery shop in San Francisco, watching people interact with real tactile journals.
              </p>
              <div className="font-sketch text-xl border-t border-white/20 pt-4 mt-4">
                Analog souls, digital minds.
              </div>
            </div>
          </div>

          {/* Arrow annotation */}
          <div className="hidden md:block absolute -right-10 top-1/2">
            <svg className="sketchy-arrow text-slate-400 rotate-90" fill="none" height="120" viewBox="0 0 100 120" width="100">
              <path d="M50,10 Q80,60 50,110" fill="none" stroke="currentColor" strokeDasharray="4 4" strokeLinecap="round" strokeWidth="2"></path>
              <path d="M40,100 L50,110 L60,100" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2"></path>
            </svg>
            <p className="font-sketch text-slate-500 absolute top-10 left-16 w-32 rotate-12">
              The spark that started it all...
            </p>
          </div>
        </div>

        {/* Story 2: The Intelligence Behind the Ink */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-12 relative">
          <div className="w-full md:w-1/2">
            <div className="organic-card-2 bg-accent-green p-12 paper-shadow text-white relative">
              <div className="washi-tape-vert -left-4 top-10 bg-white/20 -rotate-12"></div>
              <h2 className="text-4xl font-serif-elegant font-extrabold mb-6">
                The Intelligence Behind the Ink
              </h2>
              <p className="text-lg opacity-90 leading-relaxed mb-4 font-medium">
                Our AI isn't just about automation; it's about enhancement. We spent thousands of hours training models to understand the nuance of a pen stroke, the hesitation in a line, and the context of a messy sketch.
              </p>
              <div className="bg-white/10 p-4 rounded-xl border border-white/20">
                <p className="font-handwritten text-sm">
                  Translating chaos into clarity, one stroke at a time.
                </p>
              </div>
            </div>
          </div>

          {/* Arrow annotation */}
          <div className="hidden md:block absolute -left-20 top-1/2">
            <svg className="sketchy-arrow text-slate-400 -scale-x-100 rotate-90" fill="none" height="120" viewBox="0 0 100 120" width="100">
              <path d="M50,10 Q80,60 50,110" fill="none" stroke="currentColor" strokeDasharray="4 4" strokeLinecap="round" strokeWidth="2"></path>
              <path d="M40,100 L50,110 L60,100" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2"></path>
            </svg>
          </div>
        </div>

        {/* Story 3: Designed for Thinkers */}
        <div className="flex flex-col md:flex-row items-center gap-12 relative bg-primary">
          <div className="w-full md:w-1/2">
            <div className="organic-card-3 bg-accent-purple p-12 paper-shadow text-white relative">
              <h2 className="text-4xl font-serif-elegant font-extrabold mb-6">
                Designed for Thinkers
              </h2>
              <p className="text-lg opacity-90 leading-relaxed mb-4 font-medium">
                Notepaper AI is built for the polymaths—the students who draw diagrams in biology class and the executives who sketch product roadmaps during meetings. We build for those who think with their hands.
              </p>
              <div className="flex gap-2 mt-6">
                <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">history_edu</span>
                </span>
                <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">palette</span>
                </span>
                <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">science</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}