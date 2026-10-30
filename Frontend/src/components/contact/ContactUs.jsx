import React from 'react';
import ContactHero from './ContactHero';
import ContactForm from './ContactForm';
import CustomerSupport from '../globals/CustomerSupport';

export default function ContactUs() {
  return (
    <main className="contact-layout bg-paper pt-12 pb-20 md:pt-20 md:pb-28">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 grid grid-cols-1 lg:grid-cols-[.9fr_1.1fr] gap-12 lg:gap-24 items-start">
        <div className="lg:sticky lg:top-28 pt-3">
          <ContactHero />
        </div>
        <ContactForm />
      </div>
      <CustomerSupport />
    </main>
  );
}
