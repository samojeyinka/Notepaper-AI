import React from 'react';

const VALUES = [
  { number: '01', title: 'The page comes first', description: 'Start with a clear, comfortable space to write. Useful tools should fit around the work, not crowd it.' },
  { number: '02', title: 'AI should help you learn', description: 'Use what you have written to create study materials that make the next review easier to begin.' },
  { number: '03', title: 'Practice beats rereading', description: 'Return to ideas through prompts and questions, so studying becomes an active part of your notes.' },
  { number: '04', title: 'Keep your own rhythm', description: 'Capture ideas when they arrive, organize them in your way, and study at a pace that works for you.' },
];

export default function ValuesSection() {
  return (
    <section className="about-values py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="about-values-heading"><p className="landing-kicker">WHAT GUIDES THE WORK</p><h2>A few things we try to get right.</h2></div>
        <div className="about-values-list">
          {VALUES.map((value) => <article key={value.number} className="about-value"><span>{value.number}</span><h3>{value.title}</h3><p>{value.description}</p></article>)}
        </div>
      </div>
    </section>
  );
}
