import React from 'react';

export default function Library() {
  return (
    <section className="py-32 bg-paper-darker relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-20">
        <svg className="sketchy-arrow text-slate-400" fill="none" height="100" viewBox="0 0 100 100" width="100">
          <path d="M50,0 Q60,50 50,100" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"></path>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-serif-elegant font-extrabold flex items-center gap-3 text-ink-black">
              On your desk <span className="material-symbols-outlined text-primary">auto_awesome_motion</span>
            </h2>
            <p className="text-slate-500">Pick up where you left your pen.</p>
          </div>
          <a className="text-ink-black font-bold decoration-wavy underline underline-offset-4 hover:text-primary transition-colors">
            See Library
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="bg-white p-5 paper-shadow -rotate-2 hover:rotate-0 transition-transform cursor-pointer rounded-lg">
            <div className="aspect-[4/5] bg-paper paper-edge p-6 mb-4 lined-paper rounded-lg">
              <p className="font-handwritten text-xl text-slate-700 leading-loose">
                "The purpose of art is washing the dust of daily life off our souls."
              </p>
            </div>
            <div className="px-2">
              <h4 className="font-serif-elegant font-bold text-lg text-ink-black">Morning Quote</h4>
              <p className="font-sketch text-slate-400">Monday Session</p>
            </div>
          </div>

          <div className="bg-white p-5 paper-shadow rotate-1 hover:rotate-0 transition-transform cursor-pointer rounded-lg">
            <div className="aspect-[4/5] bg-paper paper-edge p-6 mb-4 grid-paper rounded-lg">
              <div className="h-4 w-1/2 bg-accent-green/20 mb-4"></div>
              <p className="font-handwritten text-xl text-slate-600 leading-snug">
                Layout ideas for the new landing page. Use paper textures and washi tape...
              </p>
            </div>
            <div className="px-2">
              <h4 className="font-serif-elegant font-bold text-lg text-ink-black">Design Notes</h4>
              <p className="font-sketch text-slate-400">Sketchbook</p>
            </div>
          </div>

          <div className="bg-white p-5 paper-shadow rotate-3 hover:rotate-0 transition-transform cursor-pointer rounded-lg">
            <div className="aspect-[4/5] bg-paper paper-edge p-6 mb-4 lined-paper rounded-lg">
              <span className="material-symbols-outlined text-slate-200 text-6xl block text-center mb-4">mic</span>
              <p className="font-handwritten text-xl text-slate-600">
                Transcribed voice note from the lecture...
              </p>
            </div>
            <div className="px-2">
              <h4 className="font-serif-elegant font-bold text-lg text-ink-black">Philosophy Class</h4>
              <p className="font-sketch text-slate-400">Voice Record</p>
            </div>
          </div>

          <div className="bg-white p-5 paper-shadow -rotate-1 hover:rotate-0 transition-transform cursor-pointer rounded-lg">
            <div className="aspect-[4/5] bg-paper paper-edge p-6 mb-4 grid-paper rounded-lg">
              <p className="font-handwritten text-xl text-primary">
                Buy more oil paints and the new canvas for the sunset series.
              </p>
            </div>
            <div className="px-2">
              <h4 className="font-serif-elegant font-bold text-lg text-ink-black">Supplies List</h4>
              <p className="font-sketch text-slate-400">Journal</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}