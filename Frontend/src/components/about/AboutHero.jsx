import React from 'react';

export default function AboutHero() {
  return (
    <header className="max-w-3xl mx-auto px-5 sm:px-6 pt-8 md:pt-16 pb-4 text-center">
      <p className="eyebrow text-plum-700 mb-5">About Notepaper</p>
      <h1 className="font-display-serif text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.08] text-stone-900">
        We make software that
        <span className="italic text-plum-700"> feels like paper.</span>
      </h1>
      <p className="text-stone-600 text-base md:text-lg mt-7 max-w-2xl mx-auto leading-relaxed">
        Notepaper is a product of Synchrome, a small, independent team who
        grew up on real notebooks and could never find a digital one that felt
        as good.
      </p>
    </header>
  );
}
