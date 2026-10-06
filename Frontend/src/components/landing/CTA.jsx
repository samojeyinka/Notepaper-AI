import React from 'react';
import { Link } from 'react-router-dom';

export default function CTA() {
  return (
    <section className="bg-stone-900 text-white">
      <div className="max-w-4xl mx-auto px-5 sm:px-6 py-20 md:py-32 text-center">
        <h2 className="font-display-serif text-3xl md:text-5xl font-semibold tracking-tight leading-tight">
          Your next great idea is worth writing down.
        </h2>
        <p className="text-stone-400 text-base md:text-lg mt-5 max-w-xl mx-auto leading-relaxed">
          Start a notebook today, no setup, no noise. Just you and a page that
          feels like paper.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-9">
          <Link
            to="/signup"
            className="w-full sm:w-auto px-8 py-3.5  bg-white text-stone-900 text-[15px] font-semibold hover:bg-stone-200 transition-colors"
          >
            Get started free
          </Link>
         
        </div>
      </div>
    </section>
  );
}
