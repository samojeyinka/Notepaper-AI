import React from 'react';

import HowItWorksHero from '../components/how-it-works/HowItWorksHero';
import HowItWorksSteps from '../components/how-it-works/HowItWorksSteps';
import CTA from '../components/landing/CTA';
import Features from '../components/landing/Features';
import FeaturesDetail from '../components/landing/Featuresdetail';
import Header from '../components/globals/Header';
import Footer from '../components/globals/Footer';
import CustomerSupport from '../components/globals/CustomerSupport';
import SEO from '../components/globals/SEO';

export default function HowItWorksPage() {
    return (
        <>
            <SEO
              title="How It Works"
              path="/how-it-works"
              description="Speak, type, or paste — Notepaper AI converts your thoughts into beautiful handwritten notes, quizzes, flashcards, and presentations in seconds."
            />
            <Header />
            <main className="pt-12 pb-2 bg-paper">
                <HowItWorksHero />
                <HowItWorksSteps />
                <Features />
                <FeaturesDetail />
                <CTA />
            </main>
              <CustomerSupport/>
            <Footer />

        </>
    );
}