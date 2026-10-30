import React from 'react';
import ValuesSection from '../components/about/ValuesSection';
import StorySection from '../components/about/StorySection';
import AboutHero from '../components/about/AboutHero';
import CTA from '../components/landing/CTA';
import Footer from '../components/globals/Footer';
import Header from '../components/globals/Header';
import CustomerSupport from '../components/globals/CustomerSupport';
import SEO from '../components/globals/SEO';
import '@/styles/Landing.css';

export default function AboutUsPage() {
  return (
    <div className="landing-page bg-paper font-display text-stone-900 antialiased selection:bg-[#d8e3e1]">
      <SEO
        title="About Us"
        path="/about-us"
        description="Learn about NotepaperAI, a calm notebook designed to help students write notes and turn them into study plans, flashcards, and quizzes."
      />
      <Header />
      <main className="relative overflow-hidden">
        <AboutHero />
        <StorySection />
        <ValuesSection />
        <CTA
          title="Experience a calmer way to study"
          description="Open your notebook today and see how comfortable studying can feel when the software stays out of your way."
          buttonText="Start writing free"
          buttonLink="/signup"
        />
      </main>
      <CustomerSupport />
      <Footer />
    </div>
  );
}
