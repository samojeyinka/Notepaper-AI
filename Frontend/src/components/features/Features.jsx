import React from 'react';
import FeaturesHero from './FeaturesHero';
import FeaturesGrid from './FeaturesGrid';
import CTA from '../landing/CTA';
import Header from '../globals/Header';
import Footer from '../globals/Footer';
import CustomerSupport from '../globals/CustomerSupport';

export default function Features() {
  return (
    <div className="landing-page bg-paper font-display text-stone-900 antialiased selection:bg-[#d8e3e1]">
      <Header />
      <main className="relative overflow-hidden">
        <FeaturesHero />
        <FeaturesGrid />
        <CTA
          title="Turn everyday notes into exam confidence"
          description="Write down your thoughts today and let NotepaperAI generate study plans, flashcards, and quizzes when you need them."
          buttonText="Start writing free"
          buttonLink="/signup"
        />
      </main>
      <CustomerSupport />
      <Footer />
    </div>
  );
}
