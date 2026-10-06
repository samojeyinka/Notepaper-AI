import React from 'react';

const CHAPTERS = [
  {
    kicker: 'The idea',
    title: 'The best notes still start on paper',
    body: 'Every note-taking app we tried pushed us toward speed, more typing, more tabs, more to-do lists. We wanted the opposite: a place that let a thought sit still long enough to become a good one.',
  },
  {
    kicker: 'The craft',
    title: 'We obsess over the page',
    body: 'Margins, ruled lines, the weight of a page, how ink settles on paper. Those small details are the product. We spent our time making the page feel right instead of piling on more buttons.',
  },
  {
    kicker: 'The people',
    title: 'Built for people who think on paper',
    body: 'Students at a desk, teachers planning a lesson, writers on a deadline, engineers sketching an idea. Notepaper is for anyone whose best thinking happens with a pen in hand.',
  },
];

export default function StorySection() {
  return (
    <section className="py-10 md:py-16">
      <div className="max-w-3xl mx-auto px-5 sm:px-6">
        {CHAPTERS.map((c, i) => (
          <div
            key={c.kicker}
            className={`py-10 md:py-14 ${i > 0 ? 'border-t border-stone-200' : ''}`}
          >
            <p className="eyebrow text-plum-700 mb-4">{c.kicker}</p>
            <h2 className="font-display-serif text-2xl md:text-4xl font-semibold tracking-tight text-stone-900 mb-4 leading-snug">
              {c.title}
            </h2>
            <p className="text-stone-600 text-[15px] md:text-lg leading-relaxed max-w-2xl">
              {c.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
