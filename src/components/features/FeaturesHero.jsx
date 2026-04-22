import React from 'react';

export default function FeaturesHero() {
  return (
    <div className="md:pt-4 pb-12 md:pb-24 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12 md:mb-24 relative">
          <h1 className="text-3xl md:text-6xl lg:text-8xl font-bold font-serif text-slate-900 leading-tight">
            Everything you need <br />
            to{' '}
            <span className="relative">
              master
              <svg
                className="absolute -bottom-2 left-0 w-full"
                fill="none"
                height="12"
                viewBox="0 0 200 12"
              >
                <path
                  d="M2 10C40 2 160 2 198 10"
                  stroke="#A78BFA"
                  strokeLinecap="round"
                  strokeWidth="4"
                ></path>
              </svg>
            </span>{' '}
            your craft.
          </h1>
        
        </div>
      </div>
    </div>
  );
}