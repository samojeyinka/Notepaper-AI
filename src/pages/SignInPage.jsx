import React from 'react'
import SignIn from '../components/SignIn'
import Header from '../components/globals/Header'
import Footer from '../components/globals/Footer'
import CustomerSupport from '../components/globals/CustomerSupport'

const SignInPage = () => {
  return (
   <>
   <Header/>
   <SignIn/>
   <CustomerSupport/>
   <Footer/>
   </>
  )
}

export default SignInPage