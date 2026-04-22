export const FoundersLetter = () => {
  return (
    <section className="py-20 md:py-40 bg-yellow-50 relative overflow-hidden">
      {/* Decorative SVG - Reading Glasses (Top Left) */}
      <div className="absolute top-20 left-10 opacity-20 hidden xl:block grayscale pointer-events-none">
        <svg className="text-slate-500" height="150" viewBox="0 0 100 100" width="150">
          <path
            d="M10,40 Q30,35 50,40 Q70,45 90,40 L90,60 Q70,65 50,60 Q30,55 10,60 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          ></path>
          <circle cx="30" cy="50" fill="none" r="15" stroke="currentColor" strokeWidth="1"></circle>
          <circle cx="70" cy="50" fill="none" r="15" stroke="currentColor" strokeWidth="1"></circle>
          <path d="M45,50 Q50,55 55,50" fill="none" stroke="currentColor" strokeWidth="1"></path>
        </svg>
        <p className="font-sketch text-xs mt-2 text-center">Reading glasses</p>
      </div>

      {/* Decorative SVG - Fountain Pen (Bottom Right) */}
      <div className="absolute bottom-20 right-10 opacity-20 hidden xl:block grayscale pointer-events-none">
        <svg className="text-slate-500 -rotate-45" height="80" viewBox="0 0 150 60" width="200">
          <path
            d="M10,30 L100,30 L110,25 L140,30 L110,35 L100,30"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          ></path>
          <path d="M100,20 L100,40" fill="none" stroke="currentColor" strokeWidth="1"></path>
        </svg>
        <p className="font-sketch text-xs mt-4 text-center">Fountain pen</p>
      </div>

      {/* Main Letter Card */}
      <div className="max-w-3xl mx-auto px-6 relative">
        <div className="bg-white p-12 lg:p-20 paper-shadow paper-edge relative transform hover:-rotate-1 transition-transform duration-500">
          {/* Washi Tape on Top */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-12 bg-blue-300/40 opacity-60"></div>

          {/* Header */}
          <div className="mb-6 md:mb-12 flex justify-between items-start border-b border-slate-100 pb-4 md:pb-8">
            <div className="space-y-1">
              <p className="font-serif-elegant text-slate-400 text-sm">October 24, 2025</p>
              <p className="font-serif-elegant text-slate-400 text-sm">Internet</p>
            </div>
            <div className="w-6 h-6 md:w-12 md:h-12 bg-purple-100 rounded flex items-center justify-center text-purple-600">
              <span className="material-symbols-outlined">auto_awesome</span>
            </div>
          </div>

          {/* Letter Content */}
          <div className="font-serif-elegant text-slate-800 text-[13px] md:text-lg leading-relaxed space-y-3 md:space-y-6">
            <p>To our community of thinkers,</p>
            <p>
              We built Notepaper AI because we missed the weight of a journal in our hands and the freedom of a blank page. We believe that technology should amplify our humanity, not replace it.
            </p>
            <p>
              Every feature we design—from the "ink & work of art" to our AI-powered reflection prompts—is crafted to help you slow down, think more deeply, and rediscover the joy of your own handwriting.
            </p>
            <p>
              Thank you for being part of this journey. We're just getting started.
            </p>
          </div>

          {/* Footer with Signatures */}
          <div className="mt-8 md:mt-16 pt-4 md:pt-8 border-t border-slate-50 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <p className="font-serif-elegant text-sm text-slate-400 mb-4">With gratitude,</p>
              <div className="space-y-4">
                <div>
                  <p className="font-handwritten text-2xl md:text-3xl text-blue-600">Sam</p>
                  <p className="font-serif-elegant text-xs text-slate-400 mt-2 uppercase tracking-widest">
                    Founder, Notepaper AI
                  </p>
                </div>
              </div>
            </div>
       
          </div>
        </div>
      </div>
    </section>
  );
};