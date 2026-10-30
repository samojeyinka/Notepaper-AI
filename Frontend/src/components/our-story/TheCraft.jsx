import React from 'react';

export const TheCraft = () => {
  return (
    <section className="story-chapter story-chapter-craft py-12 md:py-20 bg-[#f3f1eb]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 grid md:grid-cols-[120px_1fr_1fr] gap-6 md:gap-10">
        <p className="landing-kicker">02, THE CRAFT</p>
        <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.05em] text-stone-900 mb-6 leading-tight">
          Digital pages, taken seriously
        </h2>
        <div className="story-chapter-copy space-y-5 text-stone-600 text-[15px] md:text-lg leading-relaxed">
          <p>
            The craft is in the small details. The spacing of a ruled line. The way a page leaves room for your thoughts. Your writing, kept clear on screen.
          </p>
          <p>
            The page is the center of the product. Tools should support the work you came to do and let you return to your notes in your own way.
          </p>
        </div>
      </div>
    </section>
  );
};
