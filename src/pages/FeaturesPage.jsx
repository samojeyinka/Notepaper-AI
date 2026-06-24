import React from 'react'
import Features from '../components/features/Features'
import SEO from '../components/globals/SEO'

const FeaturesPage = () => {
  return (
    <>
      <SEO
        title="Features"
        path="/features"
        description="AI handwriting, real-time study collaboration, voice-to-note, auto quiz generation, flashcards, and presentation builder — everything a student needs, in one beautiful platform."
      />
      <Features />
    </>
  )
}

export default FeaturesPage