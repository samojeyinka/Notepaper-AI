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
        description="How Notepaper AI started: a founder's obsession with the feel of real paper and one question — what if digital ink had weight?"
      />
    <Header/>
    <OurStory/>
      <CustomerSupport/>
    <Footer/>
    </>
  )
}

export default OurStoryPage