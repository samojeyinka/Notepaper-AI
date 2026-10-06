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
        <p className="eyebrow text-plum-700">Contact us</p>
        <h1 className="font-display-serif text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1] text-stone-900">
          Talk to a human
        </h1>
        <p className="text-stone-600 text-base md:text-lg leading-relaxed max-w-md">
          A question, a bug, an idea for a feature, we read everything and we
          reply ourselves. No bots standing between you and us.
        </p>
      </div>

      <ul className="space-y-5">
        {DETAILS.map((d) => (
          <li key={d.label}>
            <p className="text-[12px] uppercase tracking-[0.16em] font-semibold text-stone-400 mb-1">
              {d.label}
            </p>
            {d.href ? (
              <a href={d.href} className="text-[15px] md:text-base text-plum-700 hover:text-plum-600 font-medium link-underline">
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
