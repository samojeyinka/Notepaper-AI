import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Pricing from '../components/globals/Pricing'
import Header from '../components/globals/Header'
import Footer from '../components/globals/Footer'
import CustomerSupport from '../components/globals/CustomerSupport'

const PricingPage = () => {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/lockedin/upgrade" replace />
  }

  return (
    <>
      <Header />
      <Pricing />
      <CustomerSupport />
      <Footer />
    </>
  )
}

export default PricingPage