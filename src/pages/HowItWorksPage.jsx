import React from 'react';

import HowItWorksHero from '../components/how-it-works/HowItWorksHero';
import HowItWorksSteps from '../components/how-it-works/HowItWorksSteps';
import CTA from '../components/landing/CTA';
import Features from '../components/landing/Features';
import FeaturesDetail from '../components/landing/Featuresdetail';
import Header from '../components/globals/Header';
import Footer from '../components/globals/Footer';
import CustomerSupport from '../components/globals/CustomerSupport';

export default function HowItWorksPage() {
    return (
        <>
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