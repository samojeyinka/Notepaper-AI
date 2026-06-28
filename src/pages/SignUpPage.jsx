import React from 'react'
import SignUp from '../components/SignUp'
import Header from '../components/globals/Header'
import Footer from '../components/globals/Footer'
import CustomerSupport from '../components/globals/CustomerSupport'
import SEO from '../components/globals/SEO'

const SignUpPage = () => {
  return (
    <>
      <SEO
        title="Create Your Free Account"
        description="Sign up for Notepaper AI and start generating notes, flashcards, quizzes, and presentations with AI — for free."
        path="/signup"
      />
      <Header />
      <SignUp />
      <CustomerSupport />
      <Footer />
    </>
  )
}

export default SignUpPage