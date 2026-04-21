// Hero Section
export const Hero = () => {
  return (
    <header className="relative pt-10 md:pt-20 pb-5 md:pb-10 overflow-hidden">
      {/* Decorative Icon - Top Left */}
      <div className="absolute top-20 left-10 opacity-20 hidden lg:block">
        <span className="material-symbols-outlined text-[60px] md:text-[120px] text-slate-400 rotate-12">
          history_edu
        </span>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <h1 className="text-3xl md:text-6xl lg:text-8xl font-serif-elegant font-semibold md:font-extrabold leading-tight text-slate-900 mb-3 md:mb-6">
          Our Story <span className="text-purple-500 italic">&</span> Vision
        </h1>
        <p className="text-[15px] md:text-xl text-slate-600 font-handwritten max-w-xl mx-auto leading-relaxed">
          A journey back to the soul of writing, powered by the intelligence of tomorrow.
        </p>
      </div>
    </header>
  );
};

export default Hero;