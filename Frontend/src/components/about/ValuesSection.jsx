import React from 'react';

const VALUES = [
  {
    title: 'Authenticity',
    description: 'Real tools for real work. No fake urgency, no dark patterns.',
    icon: 'verified_user',
  },
  {
    title: 'Clarity',
    description: 'Complicated things hidden behind a simple, honest interface.',
    icon: 'visibility',
  },
  {
    title: 'Originality',
    description: 'We would rather be thoughtful than trendy, even if it takes longer.',
    icon: 'lightbulb',
  },
  {
    title: 'Craft',
    description: 'Attention to the details that most people only feel, never see.',
    icon: 'handyman',
  },
];

export default function ValuesSection() {
  return (
    <section className="py-12 md:py-24 bg-paper-darker/60">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="max-w-2xl mb-12 md:mb-16">
          <p className="eyebrow text-plum-700 mb-4">What we stand for</p>
          <h2 className="font-display-serif text-3xl md:text-5xl font-semibold tracking-tight text-stone-900">
            Our values
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {VALUES.map((v) => (
            <div
              key={v.title}
              className=" bg-white border border-stone-200/90 p-8 hover:border-plum-200 transition-colors"
            >
              <div className="w-11 h-11  bg-plum-50 text-plum-700 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-[22px]">{v.icon}</span>
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">{v.title}</h3>
              <p className="text-[15px] leading-relaxed text-stone-500">{v.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
