import React from 'react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="landing-hero overflow-hidden">
      <div className="landing-hero-panel relative flex items-center justify-center overflow-hidden mx-auto text-center">
        <div className="landing-hero-copy relative z-10 max-w-4xl px-5 sm:px-8 py-16 md:py-24">
          <h1 className="landing-heading text-[40px] leading-[1.04] sm:text-6xl lg:text-[76px] font-semibold tracking-[-0.055em] text-white">
            Your notes, ready
            <br className="hidden sm:block" /> to become <span>something more.</span>
          </h1>
          <p className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto mt-5">
            Write, dictate, or collect your ideas. Then turn them into study plans, flashcards, and quizzes when you need them.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link to="/signup" className="landing-button landing-button-paper w-full sm:w-auto px-8 py-3.5 text-[15px] font-semibold transition-colors shadow-sm">
              Start writing for free
            </Link>
            <Link to="/how-it-works" className="landing-button landing-button-hero-ghost w-full sm:w-auto px-8 py-3.5 text-[15px] font-semibold transition-colors">
              See how it works
            </Link>
          </div>
        </div>
        <div className="landing-dune landing-dune-back" aria-hidden="true" />
        <div className="landing-dune landing-dune-front" aria-hidden="true" />
      </div>

      <div className="landing-preview relative mt-12 md:mt-16 pb-8">
          <div className="landing-app-window mx-auto max-w-5xl overflow-hidden text-left">
            <div className="landing-app-topbar flex items-center justify-between px-5 md:px-7 py-4">
              <div className="flex items-center gap-2"><span className="landing-dot"/><span className="landing-dot"/><span className="landing-dot"/></div>
              <span className="text-xs text-stone-500">My study notebook</span>
              <span className="text-xs text-stone-400">Saved just now</span>
            </div>
            <div className="grid md:grid-cols-[220px_1fr] min-h-[310px] md:min-h-[385px]">
              <aside className="landing-app-sidebar hidden md:block p-5">
                <div className="text-[11px] uppercase tracking-wider text-stone-400 mb-4">Your workspace</div>
                <div className="landing-side-active">◫ <span>All notes</span></div>
                <div className="landing-side-item">▤ <span>Biology 101</span></div>
                <div className="landing-side-item">▤ <span>Lecture notes</span></div>
                <div className="landing-side-item">✦ <span>Study materials</span></div>
              </aside>
              <div className="grid sm:grid-cols-[1.1fr_.9fr] gap-4 p-4 md:p-6 bg-white">
                <article className="landing-note p-5 md:p-6">
                  <div className="text-[11px] font-medium text-stone-400">BIOLOGY 101 · TODAY</div>
                  <h2 className="landing-note-writing landing-note-title font-semibold mt-4 text-stone-900">Cellular respiration</h2>
                  <p className="landing-note-writing landing-note-body text-stone-700 mt-2">Cells convert glucose into usable energy. Glycolysis happens in the cytoplasm; the Krebs cycle and electron transport chain happen in the mitochondria.</p>
                  <div className="landing-note-writing landing-note-reminder mt-4 rounded-lg bg-[#f7f4ef] p-3 text-stone-600">Remember: oxygen is the final electron acceptor in the electron transport chain.</div>
                  <div className="flex gap-2 mt-5"><span className="landing-tag">Lecture notes</span><span className="landing-tag">Biology</span></div>
                </article>
                <article className="landing-study-card p-5 md:p-6 flex flex-col justify-between">
                  <div><div className="flex items-center justify-between"><span className="landing-study-label">MADE FROM YOUR NOTE</span><span className="landing-study-spark">✦</span></div>
                    <h3 className="text-xl font-semibold mt-5">Quick recall</h3>
                    <p className="text-sm text-stone-500 mt-2">What role does oxygen play in the electron transport chain?</p>
                  </div>
                  <div className="border-t border-stone-200 pt-4 mt-6"><span className="text-[11px] uppercase tracking-wider text-stone-400">Answer</span><p className="text-sm text-stone-700 mt-1">It acts as the final electron acceptor.</p></div>
                </article>
              </div>
            </div>
          </div>
      </div>
    </section>
  );
}
