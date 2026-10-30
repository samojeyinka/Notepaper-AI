import React from 'react';
import Features from '../components/features/Features';
import SEO from '../components/globals/SEO';
import '@/styles/Landing.css';

const FeaturesPage = () => {
  return (
    <>
      <SEO
        title="Features"
        path="/features"
        description="Capture notes and transform them into study plans, flashcards, and practice quizzes in one calm notebook."
      />
      <Features />
    </>
  );
};

export default FeaturesPage;
