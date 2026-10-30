import React from 'react';

export const FoundersLetter = () => {
  return (
    <section className="story-letter py-12 md:py-24 bg-paper-darker/60">
      <div className="max-w-3xl mx-auto px-5 sm:px-6">
        <div className="story-letter-paper bg-white border border-stone-200 p-8 md:p-14">
          <p className="landing-kicker mb-8">A LETTER FROM THE FOUNDER</p>

          <div className="font-display-serif text-stone-800 text-[16px] md:text-lg leading-[1.9] space-y-6">
            <p>To everyone who writes things down,</p>
            <p>
              We built Notepaper because we missed the weight of a journal in our
              hands and the freedom of a blank page. We believe software should
              make room for thought, not replace it.
            </p>
            <p>Every decision in this product, from the feel of the ink to the calm of the interface, is in service of helping you slow down, think clearly, and keep the things that matter.</p>
            <p>Thank you for being part of the journey. We are just getting started.</p>
          </div>

          <div className="mt-10 pt-6 border-t border-stone-100 flex items-center justify-between">
            <div>
              <p className="font-handwritten text-2xl text-[#45666c]">Sam</p>
              <p className="text-[12px] uppercase tracking-[0.16em] text-stone-400 mt-1">
                Founder, Notepaper
              </p>
            </div>
            <p className="text-[13px] text-stone-400 italic hidden sm:block">
              A Synchrome product
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
