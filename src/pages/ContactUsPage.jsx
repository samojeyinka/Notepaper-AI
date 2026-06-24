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
        description="Have a question or feedback? Get in touch with the Notepaper AI team — we'd love to hear from you."
      />
    <Header/>
    <ContactUs/>
    <Footer/>
    </>
  )
}

export default ContactUsPage