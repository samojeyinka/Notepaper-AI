import React from 'react'
import TermsAndConditions from '../components/terms/TermsAndConditions'
import Header from '../components/globals/Header'
import Footer from '../components/globals/Footer'
import CustomerSupport from '../components/globals/CustomerSupport'
import SEO from '../components/globals/SEO'
import '@/styles/Landing.css'

const TermsPage = () => {
  return (
    <div className="landing-page legal-page legal-terms bg-paper font-display text-stone-900 antialiased">
      <SEO
        title="Terms & Conditions"
        path="/terms"
        description="Review the terms and conditions for using Notepaper, including accounts, your content, and third-party AI provider usage."
      />
      <Header />
      <TermsAndConditions />
      <CustomerSupport />
      <Footer />
    </div>
  )
}

export default TermsPage
