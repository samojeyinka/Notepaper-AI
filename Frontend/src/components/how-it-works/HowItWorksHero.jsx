import React from 'react';
import { Link } from 'react-router-dom';

const FLOW = ['Write', 'Organize', 'Practice', 'Review'];

export default function HowItWorksHero() {
  return (
    <section className="how-opening">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 pt-16 md:pt-24 pb-14 md:pb-20">
        <div className="how-opening-grid">
          <div>
            <p className="landing-kicker">FROM FIRST THOUGHT TO NEXT REVIEW</p>
            <h1 className="landing-heading mt-5 text-[42px] leading-[1.02] sm:text-6xl lg:text-[76px] font-semibold tracking-[-0.06em] text-stone-950">A simple way to keep learning <span>in motion.</span></h1>
          </div>
          <div className="how-opening-aside">
            <p className="text-lg md:text-xl leading-relaxed text-stone-600">Begin with a note. NotepaperAI helps you shape it into a plan, practice what matters, and see what you want to revisit.</p>
            <Link to="/signup" className="landing-button landing-button-dark mt-7 px-7 py-3.5 text-[15px] font-semibold">Start with a note</Link>
          </div>
        </div>
        <div className="how-flow" aria-label="Write, organize, practice, review">
          {FLOW.map((step, index) => <div className="how-flow-item" key={step}><span>0{index + 1}</span><b>{step}</b></div>)}
        </div>
      </div>
    </section>
  );
}
