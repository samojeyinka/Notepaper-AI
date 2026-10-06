import React from 'react';
import ContactHero from './ContactHero';
import ContactForm from './ContactForm';
import CustomerSupport from '../globals/CustomerSupport';

export default function ContactUs() {
  return (
    <main className="bg-paper pt-10 pb-24 md:pt-20 md:pb-36">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">
        <div className="lg:sticky lg:top-28">
          <ContactHero />
        </div>
        <ContactForm />
      </div>
      <CustomerSupport />
    </main>
  );
}
