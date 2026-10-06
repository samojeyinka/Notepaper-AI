import React from 'react';

const POINTS = [
  'No ads, no feeds, no noise, just your notebook.',
  'Everything saves as you go; nothing to remember to press.',
  'Your writing stays yours, private until you choose to share it.',
];

export default function FeaturesShowcase() {
  return (
    <section className="bg-paper-darker/60">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-5">
          <p className="eyebrow text-plum-700">Quiet by design</p>
          <h2 className="font-display-serif text-3xl md:text-[40px] font-semibold tracking-tight leading-tight text-stone-900">
            Most apps add more.
            <br />
            <span className="italic text-plum-700">We subtracted.</span>
          </h2>
          <ul className="space-y-3.5 pt-2">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-[15px] md:text-base text-stone-600">
                <span className="material-symbols-outlined text-plum-600 text-[20px] mt-0.5">
                  check
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden lg:flex justify-center">
          <div className="w-full max-w-sm rotate-1  bg-white ring-1 ring-stone-900/5 shadow-[0_24px_50px_-24px_rgba(28,25,23,0.3)] p-8 space-y-4">
            <div className="h-3 w-2/5  bg-stone-200/80" />
            <div className="h-3 w-full  bg-stone-100" />
            <div className="h-3 w-11/12  bg-stone-100" />
            <div className="h-3 w-4/5  bg-stone-100" />
            <div className="pt-3 h-3 w-1/2  bg-plum-200/70" />
          </div>
        </div>
      </div>
    </section>
  );
}
