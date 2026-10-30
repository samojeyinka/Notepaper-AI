import React from 'react';
import { Link } from 'react-router-dom';

export default function CTA({
  variant = 'default',
  title,
  description,
  buttonText = 'Start writing free',
  buttonLink = '/signup'
}) {
  const isLanding = variant === 'landing';
  const headingText = title || (isLanding ? 'Capture what matters' : 'Your next idea deserves a clean page');
  const bodyText = description || (isLanding
    ? 'Write down ideas, thoughts, and everything in between, then turn them into something you can learn from.'
    : 'Start a notebook today with no setup and no noise. Just you and a page that feels like paper.');

  return (
    <section className="landing-cta">
      <div className="landing-cta-panel relative flex items-center justify-center overflow-hidden mx-auto text-center">
        <div className="landing-cta-copy relative z-10 max-w-3xl px-5 sm:px-8 py-16 md:py-24">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.045em] leading-[1.08] text-white">
            {headingText}
          </h2>
          <p className="text-base md:text-lg mt-5 leading-relaxed text-white/90 max-w-xl mx-auto">
            {bodyText}
          </p>
          <div className="mt-8">
            <Link
              to={buttonLink}
              className="landing-button landing-button-paper px-8 py-3.5 text-[15px] font-semibold transition-colors shadow-sm"
            >
              {buttonText}
            </Link>
          </div>
        </div>
        <div className="landing-dune landing-dune-back" aria-hidden="true" />
        <div className="landing-dune landing-dune-front" aria-hidden="true" />
      </div>
    </section>
  );
}
