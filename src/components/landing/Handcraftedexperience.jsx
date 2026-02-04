import React from 'react';

export default function HandcraftedExperience() {
  return (
    <section className="py-32 relative bg-white" id="features">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-serif-elegant font-extrabold text-ink-black">
            Handcrafted Experience
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-lg">
            We didn't just build a note app. We digitized the feeling of graphite on paper.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="group relative bg-paper p-10 paper-shadow border border-slate-100 hover:-translate-y-2 transition-transform">
            <div className="w-16 h-16 bg-white hand-drawn-border flex items-center justify-center mb-8">
              <span className="material-symbols-outlined text-primary text-3xl">fluid_med</span>
            </div>
            <h3 className="text-2xl font-serif-elegant font-bold mb-4 text-ink-black">Organic Ink Flow</h3>
            <p className="text-slate-600 leading-relaxed">
              Our AI mimics the pressure, speed, and subtle imperfections of your unique handwriting style.
            </p>
            <div className="mt-8 font-sketch text-primary text-lg">"Beautifully Personal"</div>
          </div>

          <div className="group relative bg-paper p-10 paper-shadow border border-slate-100 hover:-translate-y-2 transition-transform rotate-1">
            <div className="w-16 h-16 bg-white hand-drawn-border flex items-center justify-center mb-8">
              <span className="material-symbols-outlined text-accent-green text-3xl">psychology</span>
            </div>
            <h3 className="text-2xl font-serif-elegant font-bold mb-4 text-ink-black">Thought Synthesis</h3>
            <p className="text-slate-600 leading-relaxed">
              AI analyzes your handwriting to find connections between notes you took months apart.
            </p>
            <div className="washi-tape-vert -top-4 -right-2 opacity-30"></div>
          </div>

          <div className="group relative bg-paper p-10 paper-shadow border border-slate-100 hover:-translate-y-2 transition-transform -rotate-1">
            <div className="w-16 h-16 bg-white hand-drawn-border flex items-center justify-center mb-8">
              <span className="material-symbols-outlined text-accent-yellow text-3xl">auto_stories</span>
            </div>
            <h3 className="text-2xl font-serif-elegant font-bold mb-4 text-ink-black">Smart Archiving</h3>
            <p className="text-slate-600 leading-relaxed">
              Everything is searchable. Even your sketches are indexed and categorized by the AI brain.
            </p>
            <div className="absolute -bottom-4 right-4 font-sketch text-slate-300 text-4xl">03</div>
          </div>
        </div>
      </div>
    </section>
  );
}