import React from 'react';

export default function CTA() {
  return (
    <section className="py-32 bg-paper relative">
      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-gradient-to-r from-[#A78BFA] to-[#F472B6] rounded-[3rem] p-12 lg:p-16 text-center text-white paper-shadow relative overflow-hidden group">
          <div className="absolute top-8 left-8 opacity-20 group-hover:rotate-12 transition-transform">
            <span className="material-symbols-outlined text-8xl">draw</span>
          </div>

          <h2 className="text-5xl lg:text-6xl font-serif-elegant font-extrabold mb-6 relative z-10">
            Ready to transform your note-taking?
          </h2>
          <p className="text-xl opacity-90 mb-12 max-w-2xl mx-auto relative z-10 leading-relaxed">
            Join 50,000+ students and professionals who are leveling up their creative thinking with digital ink that matters.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 mb-8">
            <button className="bg-white text-primary px-10 py-4 rounded-full text-lg font-bold hover:scale-105 transition-transform shadow-xl">
              Get Started Free
            </button>
            <button className="border-2 border-white/40 px-10 py-4 rounded-full text-lg font-bold hover:bg-white/10 transition-all">
              Contact Sales
            </button>
          </div>

          <p className="text-sm opacity-60 font-medium tracking-widest uppercase relative z-10">
            No credit card required • 14-day free trial
          </p>

          <div className="absolute -bottom-8 -right-4 transform rotate-12 hidden lg:block">
            <div className="font-sketch text-2xl text-accent-pink">See you inside!</div>
          </div>
        </div>
      </div>
    </section>
  );
}