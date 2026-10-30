import React from 'react'
import ContactUs from '../components/contact/ContactUs'
import Header from '../components/globals/Header'
import Footer from '../components/globals/Footer'
import SEO from '../components/globals/SEO'
import '@/styles/Landing.css'

const ContactUsPage = () => {
  return (
    <div className="landing-page contact-page bg-paper font-display text-stone-900 antialiased">
      <SEO
        title="Contact Us"
        path="/contact-us"
        description="Questions, feedback or a bug? Get in touch with the Notepaper team."
      />
      <Header />
      <ContactUs />
      <Footer />
    </div>
  )
}

export default ContactUsPage
