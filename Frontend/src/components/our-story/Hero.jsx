import React from 'react';

export const Hero = () => {
  return (
    <header className="max-w-3xl mx-auto px-5 sm:px-6 pt-8 md:pt-16 pb-2 text-center">
      <p className="eyebrow text-plum-700 mb-5">Our story</p>
      <h1 className="font-display-serif text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.08] text-stone-900">
        It started with a notebook
      </h1>
      <p className="text-stone-600 text-base md:text-lg mt-6 leading-relaxed">
        Notepaper is a small product with a simple belief: writing things down,
        by hand, still matters.
      </p>
    </header>
  );
};

export default Hero;
