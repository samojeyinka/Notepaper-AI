import React from 'react';
import HowItWorksHero from '../components/how-it-works/HowItWorksHero';
import HowItWorksSteps from '../components/how-it-works/HowItWorksSteps';
import CTA from '../components/landing/CTA';
import Header from '../components/globals/Header';
import Footer from '../components/globals/Footer';
import CustomerSupport from '../components/globals/CustomerSupport';
import SEO from '../components/globals/SEO';
import '@/styles/Landing.css';

export default function HowItWorksPage() {
  return (
    <div className="landing-page bg-paper font-display text-stone-900 antialiased selection:bg-[#d8e3e1]">
      <SEO
        title="How It Works"
        path="/how-it-works"
        description="See how NotepaperAI helps you write notes by hand, create study schedules, and build flashcards and quizzes in four clear steps."
      />
      <Header />
      <main className="relative overflow-hidden">
        <HowItWorksHero />
        <HowItWorksSteps />
        <CTA
          title="Start studying with clarity"
          description="Create your first note in seconds and see how quickly it turns into study plans, flashcards, and quizzes."
          buttonText="Start writing free"
          buttonLink="/signup"
        />
      </main>
      <CustomerSupport />
      <Footer />
    </div>
  );
}
