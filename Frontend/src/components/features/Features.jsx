import React from 'react';
import FeaturesHero from './FeaturesHero';
import FeaturesGrid from './FeaturesGrid';
import FeaturesShowcase from './FeaturesShowcase';
import CTA from '../landing/CTA';
import Header from '../globals/Header';
import Footer from '../globals/Footer';
import CustomerSupport from '../globals/CustomerSupport';

export default function Features() {
  return (
    <>
      <Header />
      <main className="bg-paper pb-10 md:pb-16">
        <FeaturesHero />
        <FeaturesGrid />
        <FeaturesShowcase />
      </main>
      <CTA />
      <CustomerSupport />
      <Footer />
    </>
  );
}
