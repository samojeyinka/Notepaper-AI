import React from 'react'
import VerifyEmail from '../components/VerifyEmail'
import Header from '../components/globals/Header'
import Footer from '../components/globals/Footer'
import CustomerSupport from '../components/globals/CustomerSupport'
import '@/styles/Landing.css'

const VerifyEmailPage = () => {
  return (
    <div className="landing-page auth-page bg-paper font-display text-stone-900 antialiased">
      <Header />
      <VerifyEmail />
      <CustomerSupport />
      <Footer />
    </div>
  )
}

export default VerifyEmailPage
