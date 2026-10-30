import React from 'react';
import { Link } from 'react-router-dom';

export default function AboutHero() {
  return (
    <section className="about-opening">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 pt-16 md:pt-24 pb-16 md:pb-24">
        <div className="about-opening-grid">
          <div className="about-opening-copy">
            <p className="landing-kicker">A NOTEBOOK FOR REAL LIFE</p>
            <h1 className="landing-heading mt-5 text-[42px] leading-[1.02] sm:text-6xl lg:text-[76px] font-semibold tracking-[-0.06em] text-stone-950">Made for the way ideas <span>actually grow.</span></h1>
            <p className="text-stone-600 text-base md:text-lg leading-relaxed mt-6 max-w-xl">NotepaperAI began with a simple belief. Your notes should feel like yours, and help you take the next step in learning.</p>
            <Link to="/features" className="landing-button landing-button-dark mt-8 px-7 py-3.5 text-[15px] font-semibold">Explore the notebook</Link>
          </div>
          <div className="about-opening-art" aria-label="A handwritten note beside study cards">
            <div className="about-paper-note"><small>MONDAY, 9:14 AM</small><strong>Start with one thought.</strong><p>Write down what caught your attention. You can decide what it means later.</p><i className="about-note-scribble" /></div>
            <div className="about-paper-slip"><small>KEEP THIS QUESTION</small><strong>What do I want to understand?</strong><i>01 / 03</i></div>
            <span className="about-art-caption">A space to think, then keep going.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
