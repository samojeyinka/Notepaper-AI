import React from 'react'
import Hero from '../components/landing/Hero'
import Features from '../components/landing/Features'
import CTA from '../components/landing/CTA'
import Footer from '../components/globals/Footer'
import Header from '../components/globals/Header'
import '@/styles/App.css'
import HandcraftedExperience from '../components/landing/Handcraftedexperience'
import FeaturesDetail from '../components/landing/Featuresdetail'
import Library from '../components/landing/Library'

const Landing = () => {
  return (
    <div className="bg-background-dark font-display text-slate-100 antialiased selection:bg-primary/30">
      <Header />
      <main className="relative overflow-hidden">
        <Hero />
        <Features />
        <FeaturesDetail />
        <HandcraftedExperience/>
        <Library/>
        <CTA />
      </main>
      <Footer />
    </div>
  )
}

export default Landing