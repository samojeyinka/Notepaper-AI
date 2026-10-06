import React from 'react'
import RefundPolicy from '../components/refund/RefundPolicy'
import Header from '../components/globals/Header'
import Footer from '../components/globals/Footer'
import CustomerSupport from '../components/globals/CustomerSupport'
import SEO from '../components/globals/SEO'

const RefundPolicyPage = () => {
  return (
    <>
      <SEO
        title="Refund Policy"
        path="/refund-policy"
        description="Notepaper is free and collects no payments. Learn how AI provider charges and refunds work when you bring your own key."
      />
      <Header />
      <RefundPolicy />
      <CustomerSupport />
      <Footer />
    </>
  )
}

export default RefundPolicyPage
