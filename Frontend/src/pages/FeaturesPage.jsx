import React from 'react'
import Features from '../components/features/Features'
import SEO from '../components/globals/SEO'

const FeaturesPage = () => {
  return (
    <>
      <SEO
        title="Features"
        path="/features"
        description="Everything Notepaper does: notes, papers, voice memos, flashcards, quizzes and presentations — one calm notebook for all of it."
      />
      <Features />
    </>
  )
}

export default FeaturesPage