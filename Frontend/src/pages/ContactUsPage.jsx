import React from 'react'
import ContactUs from '../components/contact/ContactUs'
import Header from '../components/globals/Header'
import Footer from '../components/globals/Footer'
import SEO from '../components/globals/SEO'

const ContactUsPage = () => {
  return (
    <>
      <SEO
        title="Contact Us"
        path="/contact-us"
        description="Questions, feedback or a bug? Get in touch with the Notepaper team — real humans reply."
      />
    <Header/>
    <ContactUs/>
    <Footer/>
    </>
  )
}

export default ContactUsPage