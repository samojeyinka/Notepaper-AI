import React from 'react';
import ValuesSection from '../components/about/ValuesSection';
import StorySection from '../components/about/StorySection';
import AboutHero from '../components/about/AboutHero';
import CTA from '../components/landing/CTA';
import Footer from '../components/globals/Footer';
import Header from '../components/globals/Header';


export default function AboutUsPage() {
  return (
    <>
    <Header/>
      <AboutHero />
      <StorySection />
      <ValuesSection />
      <CTA />
      
      {/* Floating FAB */}
      <button className="fixed bottom-8 right-8 w-16 h-16 bg-white hand-drawn-border shadow-2xl flex items-center justify-center z-50 hover:scale-110 active:scale-95 transition-all rounded-full">
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
      <Footer/>
    </>
  );
}