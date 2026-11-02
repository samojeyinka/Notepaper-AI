import React from 'react'
import TwoFactor from '../components/TwoFactor'
import Header from '../components/globals/Header'
import Footer from '../components/globals/Footer'
import '@/styles/Landing.css'

const TwoFactorPage = () => {
  return (
    <div className="landing-page auth-page bg-paper font-display text-stone-900 antialiased">
      <Header />
      <TwoFactor />
      <Footer />
    </div>
  )
}

export default TwoFactorPage
