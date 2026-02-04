import React from 'react';

export default function ValuesSection() {
  const values = [
    {
      title: 'Authenticity',
      description: 'No fake interactions. Only real tools for real people.',
      icon: 'verified_user',
      gradient: 'from-accent-yellow',
      rotation: '-rotate-2',
    },
    {
      title: 'Clarity',
      description: 'Complex tech hidden behind a simple, beautiful interface.',
      icon: 'visibility',
      gradient: 'from-accent-green',
      rotation: 'rotate-3',
    },
    {
      title: 'Innovation',
      description: 'Reimagining the future of notes every single day.',
      icon: 'auto_awesome',
      gradient: 'from-accent-purple',
      rotation: 'rotate-1',
    },
    {
      title: 'Craftsmanship',
      description: 'Every pixel, every shadow, hand-tuned with love.',
      icon: 'handyman',
      gradient: 'from-accent-pink',
      rotation: '-rotate-3',
    },
  ];

  return (
    <section className="py-32 bg-paper-darker/30 relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20 relative">
          <h2 className="text-4xl lg:text-5xl font-serif-elegant font-extrabold">Our Values</h2>
          <div className="font-sketch text-primary text-xl mt-2 italic">
            What keeps our ink flowing.
          </div>
          <span className="material-symbols-outlined absolute -top-10 left-1/2 -translate-x-1/2 text-slate-200 text-6xl opacity-40">
            push_pin
          </span>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {values.map((value, index) => (
            <div
              key={index}
              className={`polaroid ${value.rotation} hover:rotate-0 transition-transform`}
            >
              {/* Image Area */}
              <div className="aspect-square bg-slate-100 mb-6 flex items-center justify-center overflow-hidden relative">
                <span className={`material-symbols-outlined text-6xl text-slate-300`}>
                  {value.icon}
                </span>
                <div className={`absolute inset-0 bg-gradient-to-tr ${value.gradient}/5 to-transparent`}></div>
              </div>

              {/* Text Area */}
              <h4 className="font-serif-elegant font-bold text-xl mb-2">{value.title}</h4>
              <p className="font-sketch text-slate-500 leading-tight">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}