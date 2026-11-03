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
      <SEO path="/" />
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
