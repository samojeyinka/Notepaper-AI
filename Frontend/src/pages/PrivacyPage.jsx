import React from 'react'
import Privacy from '../components/privacy/Privacy'
import Header from '../components/globals/Header'
import Footer from '../components/globals/Footer'
import CustomerSupport from '../components/globals/CustomerSupport'
import SEO from '../components/globals/SEO'
import '@/styles/Landing.css'

const PrivacyPage = () => {
  return (
    <div className="landing-page legal-page legal-privacy bg-paper font-display text-stone-900 antialiased">
      <SEO
        title="Privacy Policy"
        path="/privacy"
        description="Notepaper is committed to protecting your data. Read our privacy policy and data security commitments."
      />
      <Header />
      <Privacy />
      <CustomerSupport />
      <Footer />
    </div>
  )
}

export default PrivacyPage
