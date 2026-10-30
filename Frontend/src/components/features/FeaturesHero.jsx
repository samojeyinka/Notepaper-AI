import React from 'react';
import { Link } from 'react-router-dom';

export default function FeaturesHero() {
  return (
    <section className="feature-hero">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 pt-16 md:pt-24 pb-14 md:pb-20">
        <div className="feature-hero-grid">
          <div>
            <p className="landing-kicker">NOTES THAT KEEP WORKING</p>
            <h1 className="landing-heading mt-5 text-[42px] leading-[1.02] sm:text-6xl lg:text-[76px] font-semibold tracking-[-0.06em] text-stone-950">
              Keep the note.<br /><span>Find the next step.</span>
            </h1>
          </div>
          <div className="feature-hero-aside">
            <p className="text-lg md:text-xl leading-relaxed text-stone-600">
              NotepaperAI gives your notes a quiet home, then helps you turn what you wrote into a plan, flashcards, and quizzes.
            </p>
            <div className="flex flex-wrap gap-3 mt-7">
              <Link to="/signup" className="landing-button landing-button-dark px-7 py-3.5 text-[15px] font-semibold">Start writing for free</Link>
              <Link to="/how-it-works" className="landing-button landing-button-light px-7 py-3.5 text-[15px] font-semibold">See the process</Link>
            </div>
          </div>
        </div>
        <div className="feature-hero-rule"><span>YOUR THOUGHTS</span><i /><span>YOUR STUDY TOOLS</span><i /><span>YOUR NEXT REVIEW</span></div>
      </div>
    </section>
  );
}
