import React from 'react'
import SignUp from '../components/SignUp'
import Header from '../components/globals/Header'
import Footer from '../components/globals/Footer'
import CustomerSupport from '../components/globals/CustomerSupport'

const SignUpPage = () => {
  return (
    <>
      <Header />
      <SignUp />
      <CustomerSupport />
      <Footer />
    </>
  )
}

export default SignUpPage