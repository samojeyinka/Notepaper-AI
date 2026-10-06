import React from 'react';

const STEPS = [
  {
    n: '01',
    icon: 'edit_note',
    title: 'Write or record',
    body: 'Open a blank page and write the way you like, or dictate a lecture and read it back as text. Nothing to configure, nothing in the way.',
  },
  {
    n: '02',
    icon: 'folder_open',
    title: 'Put it somewhere you will find it',
    body: 'Drop notes into folders for each course or project. Search works across everything, so a line from three months ago is never lost.',
  },
  {
    n: '03',
    icon: 'style',
    title: 'Revisit and study',
    body: 'Turn any note into flashcards or a quick quiz, and test yourself later. Your notebook quietly becomes a study space.',
  },
];

export default function HowItWorksSteps() {
  return (
    <section className="max-w-3xl mx-auto px-5 sm:px-6 py-14 md:py-24">
      <div className="space-y-12 md:space-y-16">
        {STEPS.map((step, i) => (
          <div key={step.n} className="flex gap-6 md:gap-10">
            {/* Number */}
            <div className="flex flex-col items-center">
              <span className="font-display-serif text-2xl md:text-3xl font-semibold text-plum-600 leading-none pt-1">
                {step.n}
              </span>
              {i < STEPS.length - 1 && <span className="w-px flex-1 bg-stone-200 my-4" />}
            </div>
            {/* Content */}
            <div className="pb-2">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9  bg-plum-50 text-plum-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[19px]">{step.icon}</span>
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-stone-900">{step.title}</h2>
              </div>
              <p className="text-stone-600 text-[15px] md:text-base leading-relaxed max-w-xl">
                {step.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
