import React from 'react'
import SignIn from '../components/SignIn'
import Header from '../components/globals/Header'
import Footer from '../components/globals/Footer'
import CustomerSupport from '../components/globals/CustomerSupport'
import SEO from '../components/globals/SEO'
import '@/styles/Landing.css'

const SignInPage = () => {
  return (
   <div className="landing-page auth-page bg-paper font-display text-stone-900 antialiased">
   <SEO
     title="Sign In"
     description="Sign in to your Notepaper AI account and pick up where you left off."
     path="/signin"
   />
   <Header />
   <SignIn />
   <CustomerSupport />
   <Footer />
   </div>
  )
}

export default SignInPage
