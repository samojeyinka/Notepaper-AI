import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Pricing from '../components/globals/Pricing'
import Header from '../components/globals/Header'
import Footer from '../components/globals/Footer'
import CustomerSupport from '../components/globals/CustomerSupport'
import SEO from '../components/globals/SEO'

const PricingPage = () => {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/lockedin/upgrade" replace />
  }

  return (
    <>
      <SEO
        title="Pricing"
        path="/pricing"
        description="Start free, then unlock the full power of AI. Plans from $0 to $17/month — notes, quizzes, presentations, flashcards, and study plans. Cancel anytime."
      />
      <Header />
      <Pricing />
      <CustomerSupport />
      <Footer />
    </>
  )
}

export default PricingPage