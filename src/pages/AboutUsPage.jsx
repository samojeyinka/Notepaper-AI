import React from 'react';
import ValuesSection from '../components/about/ValuesSection';
import StorySection from '../components/about/StorySection';
import AboutHero from '../components/about/AboutHero';
import CTA from '../components/landing/CTA';
import Footer from '../components/globals/Footer';
import Header from '../components/globals/Header';
import CustomerSupport from '../components/globals/CustomerSupport';


export default function AboutUsPage() {
  return (
    <>
      <Header />
      <AboutHero />
      <StorySection />
      <ValuesSection />
      <CTA />
      <CustomerSupport />
      <Footer />
    </>
  );
}