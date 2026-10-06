import React from 'react';
import ValuesSection from '../components/about/ValuesSection';
import StorySection from '../components/about/StorySection';
import AboutHero from '../components/about/AboutHero';
import Footer from '../components/globals/Footer';
import Header from '../components/globals/Header';
import CustomerSupport from '../components/globals/CustomerSupport';
import SEO from '../components/globals/SEO';

export default function AboutUsPage() {
  return (
    <>
      <SEO
        title="About Us"
        path="/about-us"
        description="Meet Notepaper — a Synchrome product built by a small team who believe digital notes should feel as good as a real notebook."
      />
      <Header />
      <AboutHero />
      <StorySection />
      <ValuesSection />
      <CustomerSupport />
      <Footer />
    </>
  );
}
