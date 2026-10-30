import React from 'react';
import { Link } from 'react-router-dom';

const HIGHLIGHTS = [
  'Automatic cloud saving so your work is never lost',
  'Private workspaces with zero advertising and zero noisy feeds',
  'One click generation for study plans, flashcards, and quizzes',
  'Paper like notebook styling designed for calm daily focus',
];

export default function FeaturesShowcase() {
  return (
    <section className="py-20 md:py-28 bg-[#fdfbf7]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="landing-kicker">THOUGHTFUL LEARNING WORKFLOW</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.045em] leading-[1.12] text-stone-950 mt-4">
              Write at your own pace.{' '}
              <span className="text-[#45666c]">Study without friction.</span>
            </h2>
            <p className="text-stone-600 text-base md:text-lg leading-relaxed mt-5 max-w-xl">
              Most digital note tools overload you with complex menus and endless settings. NotepaperAI keeps the page calm and lets you focus on understanding the material.
            </p>

            <ul className="space-y-4 pt-6">
              {HIGHLIGHTS.map((item) => (
                <li key={item} className="flex items-center gap-3.5 text-[15px] md:text-base text-stone-700">
                  <div className="w-5 h-5 rounded-full bg-[#eaf0ee] text-[#45666c] flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Link
                to="/signup"
                className="landing-button landing-button-dark px-7 py-3.5 text-[15px] font-semibold transition-colors"
              >
                Create your first note
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="landing-app-window p-6 md:p-8 space-y-5 bg-white">
              <div className="flex items-center justify-between border-b border-stone-200/80 pb-4">
                <div className="flex items-center gap-2">
                  <span className="landing-dot" />
                  <span className="landing-dot" />
                  <span className="landing-dot" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#587a7d]">
                  Workflow preview
                </span>
                <span className="text-xs text-stone-400">Ready to study</span>
              </div>

              {/* Note preview snippet */}
              <div className="landing-note p-5">
                <div className="text-[11px] font-medium text-stone-400">ORGANIC CHEMISTRY CHAPTER 4</div>
                <h3 className="landing-note-writing landing-note-title font-semibold text-stone-900 mt-2">
                  Electrophilic Addition Reactions
                </h3>
                <p className="landing-note-writing landing-note-body text-stone-700 mt-2">
                  Alkenes react with electrophiles due to high electron density in the pi bond. The carbocation intermediate determines regioselectivity.
                </p>
                <div className="flex gap-2 mt-4">
                  <span className="landing-tag">Lecture note</span>
                  <span className="landing-tag">Organic Chem</span>
                </div>
              </div>

              {/* Companion generated card */}
              <div className="landing-study-card p-5">
                <div className="flex items-center justify-between">
                  <span className="landing-study-label">AUTOMATIC STUDY AID</span>
                  <span className="landing-study-spark">✦</span>
                </div>
                <h4 className="text-base font-semibold text-stone-900 mt-3">
                  Flashcard Recall
                </h4>
                <p className="text-sm text-stone-600 mt-1">
                  What determines regioselectivity in electrophilic addition to alkenes?
                </p>
                <div className="border-t border-stone-200/80 pt-3 mt-4">
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">Answer</span>
                  <p className="text-sm font-medium text-[#3f6267] mt-0.5">
                    The relative stability of the carbocation intermediate.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
