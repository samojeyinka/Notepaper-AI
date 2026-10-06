import React from 'react'
import Hero from '../components/landing/Hero'
import Highlights from '../components/landing/Highlights'
import Manifesto from '../components/landing/Manifesto'
import CTA from '../components/landing/CTA'
import Footer from '../components/globals/Footer'
import Header from '../components/globals/Header'
import '@/styles/App.css'
import CustomerSupport from '../components/globals/CustomerSupport'
import SEO from '../components/globals/SEO'

const Landing = () => {
  return (
    <div className="bg-paper font-display text-stone-900 antialiased selection:bg-plum-200">
      <SEO
        path="/"
        description="Notepaper is a calm home for your notes — write, dictate or paste your thoughts onto a page that feels like paper, then organize, search and study them whenever you like."
      />
      <Header />
      <main className="relative overflow-hidden">
        <Hero />
        <Highlights />
        <Manifesto />
        <CTA />
      </main>
      <CustomerSupport />
      <Footer />
    </div>
  )
}

export default Landing
