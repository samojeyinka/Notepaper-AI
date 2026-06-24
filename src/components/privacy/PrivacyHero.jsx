export const PrivacyHero = () => {
  return (
    <header className="pt-10 md:pt-20 pb-5 md:pb-10 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 text-center">
     
       

        {/* Main Title */}
        <h1 className="text-3xl md:text-5xl lg:text-7xl font-serif-elegant font-extrabold text-slate-900 mb-3 md:mb-6">
          Privacy & Data Security
        </h1>

        {/* Last Updated */}
        <p className="text-[14px] md:text-xl text-slate-500 max-w-2xl mx-auto font-normal md:font-medium">
          Last updated: July 1, 2026
        </p>
      </div>

      {/* Decorative Icons */}
      <div className="absolute top-20 left-10 opacity-10 hidden lg:block">
        <span className="material-symbols-outlined text-9xl">fingerprint</span>
      </div>
      <div className="absolute bottom-10 right-10 opacity-10 hidden lg:block">
        <span className="material-symbols-outlined text-9xl">lock_reset</span>
      </div>
    </header>
  );
};