import React from 'react';

import HowItWorksHero from '../components/how-it-works/HowItWorksHero';
import HowItWorksSteps from '../components/how-it-works/HowItWorksSteps';
import CTA from '../components/landing/CTA';
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
              description="How Notepaper works: write or record your thoughts onto a page that feels like paper, file them in folders, then turn them into flashcards and quizzes whenever you want to study."
            />
            <Header />
            <main className="pb-4 bg-paper">
                <HowItWorksHero />
                <HowItWorksSteps />
                <CTA />
            </main>
            <CustomerSupport/>
            <Footer />
        </>
    );
}
