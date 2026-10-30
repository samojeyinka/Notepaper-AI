import React from 'react';

export const TheFuture = () => {
  return (
    <section className="story-chapter story-chapter-future py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 grid md:grid-cols-[120px_1fr_1fr] gap-6 md:gap-10">
        <p className="landing-kicker">03, THE FUTURE</p>
        <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.05em] text-stone-900 mb-6 leading-tight">
          Calm software is a decision
        </h2>
        <div className="story-chapter-copy space-y-5 text-stone-600 text-[15px] md:text-lg leading-relaxed">
          <p>
            We will keep building useful ways to capture, organize, and revisit your writing. The aim is to make room for your work rather than pull your attention away from it.
          </p>
          <p>
            We want your notes to remain easy to find and useful to return to.
          </p>
        </div>
      </div>
    </section>
  );
};
