import React from 'react';
import ContactHero from './ContactHero';
import ContactForm from './ContactForm';


export default function ContactUs() {
  return (
    <main className="pt-32 pb-40 min-h-screen relative overflow-hidden bg-paper">
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none -z-10 opacity-10">
        {/* Coffee Cup */}
        <div className="absolute top-40 left-10 transform -rotate-12">
          <span className="material-symbols-outlined text-9xl text-slate-400">coffee</span>
          <div className="w-40 h-40 border-4 border-slate-300 rounded-full absolute -top-4 -left-4 opacity-40"></div>
        </div>

        {/* Stylus Pencil */}
        <div className="absolute bottom-40 right-20 transform rotate-45">
          <span className="material-symbols-outlined text-8xl text-slate-400">stylus_pencil</span>
        </div>

        {/* Attach File */}
        <div className="absolute top-1/4 right-1/4">
          <span className="material-symbols-outlined text-4xl text-slate-400 opacity-30">
            attach_file
          </span>
        </div>

        {/* Lightbulb */}
        <div className="absolute bottom-20 left-1/3">
          <span className="material-symbols-outlined text-6xl text-slate-400 opacity-20">
            lightbulb
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        {/* Left Column - Visual Elements */}
        <ContactHero />

        {/* Right Column - Contact Form */}
        <ContactForm />
      </div>
    </main>
  );
}