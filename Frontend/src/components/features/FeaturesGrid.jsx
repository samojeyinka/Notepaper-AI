import React from 'react';

const FEATURES = [
  {
    icon: 'ink_pen',
    title: 'Notes & papers',
    body: 'Pages that look and feel like your own writing. Type, sketch or write in any style you like.',
  },
  {
    icon: 'mic',
    title: 'Voice to text',
    body: 'Record a lecture or a passing thought and read it back as a clean, searchable note.',
  },
  {
    icon: 'style',
    title: 'Flashcards',
    body: 'Front-and-back study cards you style and flip through at your own pace.',
  },
  {
    icon: 'quiz',
    title: 'Quizzes',
    body: 'Build practice quizzes from the material you have already written, whenever you need a check.',
  },
  {
    icon: 'description',
    title: 'Papers & presentations',
    body: 'Longer documents and slide decks live beside your notes, no switching apps.',
  },
  {
    icon: 'folder_open',
    title: 'Folders & search',
    body: 'Keep a subject, course or project together, and find any line in seconds.',
  },
];

export default function FeaturesGrid() {
  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-28">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className=" border border-stone-200/90 bg-white p-8 hover:border-plum-200 hover:shadow-[0_16px_40px_-24px_rgba(88,61,139,0.35)] transition-all"
          >
            <div className="w-11 h-11  bg-plum-50 text-plum-700 flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-[22px]">{f.icon}</span>
            </div>
            <h3 className="text-lg font-semibold text-stone-900 mb-2">{f.title}</h3>
            <p className="text-[15px] leading-relaxed text-stone-500">{f.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
