import React from 'react';
import { Link } from 'react-router-dom';

export default function Hero() {
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <section className="relative overflow-hidden">
      {/* faint texture, kept very subtle */}
      <div className="absolute inset-0 dot-grid opacity-40 -z-10" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-paper-darker/40 -z-10" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 pt-16 md:pt-24 lg:pt-28 text-center">
        <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">
       
          <h1 className="font-display-serif text-[40px] leading-[1.08] sm:text-6xl lg:text-7xl font-semibold tracking-tight text-stone-900">
            The note-taking app that
            <span className="italic text-plum-700"> feels like paper.</span>
          </h1>
          <p className="text-stone-600 text-base md:text-xl leading-relaxed max-w-2xl mx-auto">
            A calm, uncluttered home for everything you want to remember. Write,
            speak, or paste your thoughts, then organize, search and revisit them
            whenever you like.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 pt-2">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-7 py-3.5  bg-stone-900 text-white text-[15px] font-semibold hover:bg-stone-700 transition-colors"
            >
              Start writing, it&rsquo;s free
            </Link>
            <Link
              to="/how-it-works"
              className="w-full sm:w-auto px-7 py-3.5  border border-stone-300 text-stone-800 text-[15px] font-semibold hover:border-stone-900 transition-colors"
            >
              See how it works
            </Link>
          </div>
        </div>

        {/* Product preview — one quiet sheet, no scrapbook */}
        <div className="relative mt-14 md:mt-20 pb-4">
          <div className="max-w-2xl mx-auto bg-white  shadow-[0_1px_2px_rgba(28,25,23,0.05),0_20px_45px_-20px_rgba(28,25,23,0.25)] ring-1 ring-stone-900/5 overflow-hidden text-left">
            {/* Sheet header */}
            <div className="flex items-center justify-between px-6 md:px-10 pt-6 md:pt-8 pb-3 border-b border-stone-100">
              <span className="text-[13px] font-medium text-stone-400">{today}</span>
              <span className="text-[12px] tracking-wide text-stone-300 uppercase">Morning pages</span>
            </div>
            {/* Ruled writing area */}
            <div className="px-6 md:px-10 py-6 md:py-9 paper-rule">
              <p className="font-handwritten text-[19px] md:text-[24px] leading-[28px] text-stone-700">
                Some of the best ideas arrive quietly — usually when the page
                is open and the phone is somewhere else.
              </p>
              <p className="font-handwritten text-[19px] md:text-[24px] leading-[28px] text-stone-400 mt-4">
                Keep a notebook. You never know which thought will matter.
              </p>
            </div>
          </div>
          <div className="mx-auto mt-6 max-w-md px-6">
            <p className="text-center text-[13px] text-stone-400">
              Write by hand, capture by voice, organize into folders, study with flashcards.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
