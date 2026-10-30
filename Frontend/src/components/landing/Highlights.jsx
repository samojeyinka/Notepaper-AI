import React from 'react';

const ITEMS = [
  { number: '01', title: 'Write it your way', body: 'Keep notes, papers, and voice thoughts together in a workspace that feels like yours.' },
  { number: '02', title: 'Make it make sense', body: 'Turn your notes into clear summaries and study plans, ready when you are.' },
  { number: '03', title: 'Learn by doing', body: 'Create flashcards and quizzes from what you have written, then practice at your pace.' },
];

export default function Highlights() {
  return (
    <section className="landing-features py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        <div className="max-w-2xl mb-9 md:mb-12">
          <p className="landing-kicker">From blank page to ready to learn</p>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.045em] leading-tight mt-4">A little more from every note.</h2>
        </div>
        <div className="grid md:grid-cols-3 border-y border-stone-200">
          {ITEMS.map((item) => (
            <article key={item.number} className="landing-feature py-7 md:py-8 md:px-7 first:md:pl-0 last:md:pr-0 border-b md:border-b-0 md:border-r last:border-r-0 border-stone-200">
              <span className="landing-feature-number">{item.number}</span>
              <h3 className="text-xl font-semibold mt-5 tracking-tight">{item.title}</h3>
              <p className="text-sm leading-6 text-stone-500 mt-2 max-w-xs">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
