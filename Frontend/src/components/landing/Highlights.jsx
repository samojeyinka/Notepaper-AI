import React from 'react';

const ITEMS = [
  {
    icon: 'ink_pen',
    title: 'Notes & papers',
    body: 'A realistic page to write on clean, quiet and saved as you go. Style it your way when you want to.',
  },
  {
    icon: 'mic',
    title: 'Voice notes',
    body: 'Dictate a lecture or a passing idea and read it back as text, tidied into your notebook.',
  },
  {
    icon: 'style',
    title: 'Flashcards & quizzes',
    body: 'Turn what you have written into something you can actually study fronts, backs and all.',
  },
];

export default function Highlights() {
  return (
    <section className="py-16 md:py-28 bg-paper">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="max-w-2xl mb-12 md:mb-16">
          <p className="eyebrow text-plum-700 mb-4">Inside your notebook</p>
          <h2 className="font-display-serif text-3xl md:text-5xl font-semibold tracking-tight text-stone-900">
            Everything you write, kept in one place
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ITEMS.map((item) => (
            <div
              key={item.title}
              className="group  border border-stone-200/90 bg-white p-8 md:p-10 hover:border-plum-200 hover:shadow-[0_16px_40px_-24px_rgba(88,61,139,0.35)] transition-all"
            >
              <div className="w-11 h-11  bg-plum-50 text-plum-700 flex items-center justify-center mb-6 group-hover:bg-plum-100 transition-colors">
                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              </div>
              <h3 className="font-display-serif text-xl md:text-2xl font-semibold text-stone-900 mb-2.5">
                {item.title}
              </h3>
              <p className="text-[15px] leading-relaxed text-stone-500">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
