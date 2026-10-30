import React from 'react'
import SignUp from '../components/SignUp'
import Header from '../components/globals/Header'
import Footer from '../components/globals/Footer'
import CustomerSupport from '../components/globals/CustomerSupport'
import SEO from '../components/globals/SEO'
import '@/styles/Landing.css'

const SignUpPage = () => {
  return (
    <div className="landing-page auth-page bg-paper font-display text-stone-900 antialiased">
      <SEO
        title="Create Your Free Account"
        description="Create your Notepaper account and open your first page — free to start, no credit card required."
        path="/signup"
      />
      <Header />
      <SignUp />
      <CustomerSupport />
      <Footer />
    </div>
  )
}

export default SignUpPage
