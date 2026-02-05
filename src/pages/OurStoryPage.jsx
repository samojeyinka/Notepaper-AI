import React from 'react'
import OurStory from '../components/our-story/OurStory'
import Header from '../components/globals/Header'
import Footer from '../components/globals/Footer'
import CustomerSupport from '../components/globals/CustomerSupport'

const OurStoryPage = () => {
  return (
    <>
    <Header/>
    <OurStory/>
      <CustomerSupport/>
    <Footer/>
    </>
  )
}

export default OurStoryPage