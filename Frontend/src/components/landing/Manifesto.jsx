import React from 'react';
import { Link } from 'react-router-dom';

export default function Manifesto() {
  return (
    <section className="py-20 md:py-36 bg-paper-darker/60">
      <div className="max-w-4xl mx-auto px-5 sm:px-6 text-center space-y-8">
        <p className="eyebrow text-plum-700">Why Notepaper</p>
        <p className="font-display-serif text-[26px] leading-[1.35] sm:text-4xl md:text-[44px] font-medium tracking-tight text-stone-900">
          &ldquo;Fast tools make you produce. Calm tools make you{' '}
          <span className="italic text-plum-700">think</span>. We built the
          second kind.&rdquo;
        </p>
        <div>
          <Link
            to="/features"
            className="link-underline text-[15px] font-semibold text-plum-700 hover:text-plum-600"
          >
            Explore what&rsquo;s inside
          </Link>
        </div>
      </div>
    </section>
  );
}
