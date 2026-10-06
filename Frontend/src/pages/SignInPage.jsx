import React from 'react'
import SignIn from '../components/SignIn'
import Header from '../components/globals/Header'
import Footer from '../components/globals/Footer'
import CustomerSupport from '../components/globals/CustomerSupport'
import SEO from '../components/globals/SEO'

const SignInPage = () => {
  return (
   <>
   <SEO
     title="Sign In"
     description="Sign in to your Notepaper AI account and pick up where you left off."
     path="/signin"
   />
   <Header/>
   <SignIn/>
   <CustomerSupport/>
   <Footer/>
   </>
  )
}

export default SignInPage