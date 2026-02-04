import React from 'react';
import FeaturesHero from './FeaturesHero';
import FeaturesGrid from './FeaturesGrid';
import FeaturesShowcase from './FeaturesShowcase';
import CTA from '../landing/CTA';
import Header from '../globals/Header';
import Footer from '../globals/Footer';


export default function Features() {
  return (
    <>
    <Header/>
      <main className="pt-32 pb-24 relative z-10 bg-white">
        <FeaturesHero />
        <FeaturesGrid />
        <FeaturesShowcase />
      </main>
      <CTA />
      
      {/* Floating FAB */}
      <button className="fixed bottom-8 right-8 w-16 h-16 bg-white hand-drawn-border shadow-2xl flex items-center justify-center z-50 hover:scale-110 active:scale-95 transition-all rounded-full">
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
      <Footer/>
    </>
  );
}