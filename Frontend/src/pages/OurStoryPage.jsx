import React from 'react'
import OurStory from '../components/our-story/OurStory'
import Header from '../components/globals/Header'
import Footer from '../components/globals/Footer'
import CustomerSupport from '../components/globals/CustomerSupport'
import SEO from '../components/globals/SEO'

const OurStoryPage = () => {
  return (
    <>
      <SEO
        title="Our Story"
        path="/our-story"
        description="How Notepaper started: a small team who missed the feel of a real notebook, and set out to build digital pages that feel the same."
      />
    <Header/>
    <OurStory/>
      <CustomerSupport/>
    <Footer/>
    </>
  )
}

export default OurStoryPage