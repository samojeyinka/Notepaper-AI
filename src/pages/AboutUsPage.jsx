import React from 'react';
import ValuesSection from '../components/about/ValuesSection';
import StorySection from '../components/about/StorySection';
import AboutHero from '../components/about/AboutHero';
import CTA from '../components/landing/CTA';
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
        description="Meet the team behind Notepaper AI — designers and engineers obsessed with bringing the tactile joy of physical paper into the digital world."
      />
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