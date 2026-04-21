export const PrivacyHero = () => {
  return (
    <header className="pt-10 md:pt-20 pb-5 md:pb-10 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-2 py-1 md:px-4 md:py-1.5 rounded-full bg-slate-100 text-slate-600 font-normal md:font-medium text-sm border border-slate-200 mb-4 md:mb-8">
          <span className="material-symbols-outlined text-[12px] md:text-sm">shield_lock</span>
          Your Privacy is our Foundation
        </div>

        {/* Main Title */}
        <h1 className="text-3xl md:text-5xl lg:text-7xl font-serif-elegant font-extrabold text-slate-900 mb-3 md:mb-6">
          Privacy & Data Security
        </h1>

        {/* Last Updated */}
        <p className="text-[14px] md:text-xl text-slate-500 max-w-2xl mx-auto font-normal md:font-medium">
          Last updated: October 24, 2024
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