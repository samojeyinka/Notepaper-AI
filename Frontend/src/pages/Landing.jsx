import React from 'react'
import Hero from '../components/landing/Hero'
import Highlights from '../components/landing/Highlights'
import CTA from '../components/landing/CTA'
import Footer from '../components/globals/Footer'
import Header from '../components/globals/Header'
import '@/styles/App.css'
import '@/styles/Landing.css'
import CustomerSupport from '../components/globals/CustomerSupport'
import SEO from '../components/globals/SEO'

const Landing = () => {
  return (
    <div className="landing-page bg-paper font-display text-stone-900 antialiased selection:bg-[#d8e3e1]">
      <SEO
        path="/"
        description="Notepaper is a calm home for your notes — write in your own handwriting, then turn them into study plans, flashcards, quizzes and presentations on a page that feels like paper."
      />
      <Header />
      <main className="relative overflow-hidden">
        <Hero />
        <Highlights />
        <CTA variant="landing" />
      </main>
      <CustomerSupport />
      <Footer />
    </div>
  )
}

export default Landing
