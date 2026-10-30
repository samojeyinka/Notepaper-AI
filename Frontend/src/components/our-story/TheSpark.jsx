import React from 'react';

export const TheSpark = () => {
  return (
    <section className="story-chapter story-chapter-spark py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 grid md:grid-cols-[120px_1fr_1fr] gap-6 md:gap-10">
        <p className="landing-kicker">01, THE SPARK</p>
        <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.05em] text-stone-900 mb-6 leading-tight">
          Why we missed paper
        </h2>
        <div className="story-chapter-copy space-y-5 text-stone-600 text-[15px] md:text-lg leading-relaxed">
          <p>
            Moving our work to screens made it easier to search and share. We also missed the feeling of giving an idea room to arrive before deciding how to organize it.
          </p>
          <p>
            A ruled page gave us that pause. We wanted to bring the same open space to a digital notebook. That became the beginning of Notepaper.
          </p>
        </div>
      </div>
    </section>
  );
};
