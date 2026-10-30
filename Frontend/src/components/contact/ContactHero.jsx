import React from 'react';

const DETAILS = [
  {
    label: 'Email us',
    value: 'support@synchrome.co',
    href: 'mailto:support@synchrome.co',
  },
  {
    label: 'Call us',
    value: '+234 913 171 0995',
    href: 'tel:+2349131710995',
  }
 
];

export default function ContactHero() {
  return (
    <div className="space-y-10">
      <div className="space-y-5">
        <p className="landing-kicker">CONTACT</p>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-[-0.055em] leading-[1.04] text-stone-900 mt-3">
          Tell us what is on your mind.
        </h1>
        <p className="text-stone-600 text-base md:text-lg leading-relaxed max-w-md">
          Have a question, an idea, or something that needs a closer look? Send a note and our team will get back to you.
        </p>
      </div>

      <ul className="contact-details grid sm:grid-cols-2 lg:grid-cols-1 gap-5 border-t border-stone-200 pt-6">
        {DETAILS.map((d) => (
          <li key={d.label}>
            <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-stone-500 mb-1.5">
              {d.label}
            </p>
            {d.href ? (
              <a href={d.href} className="text-[15px] md:text-base text-[#45666c] hover:text-[#355358] font-medium underline underline-offset-4 decoration-[#afc2bc]">
                {d.value}
              </a>
            ) : (
              <p className="text-[15px] md:text-base text-stone-700 font-medium">{d.value}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
