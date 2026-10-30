import React from 'react';

export const Hero = () => {
  return (
    <header className="story-opening max-w-7xl mx-auto px-5 sm:px-6 pt-16 md:pt-24 pb-12 md:pb-16">
      <div className="story-opening-copy">
        <p className="landing-kicker mb-5">OUR STORY</p>
        <h1 className="landing-heading text-4xl sm:text-6xl md:text-7xl font-semibold tracking-[-0.055em] leading-[1.02] text-stone-900">
          It started with a page.
        </h1>
        <p className="text-stone-600 text-base md:text-lg mt-6 leading-relaxed max-w-xl">
          We wanted a digital notebook with the ease of paper and enough help to make the notes useful when it is time to learn.
        </p>
      </div>
      <div className="story-opening-mark" aria-hidden="true"><span>NOTES</span><b>Thoughts<br />take shape<br />one page<br />at a time.</b><i /></div>
    </header>
  );
};

export default Hero;
