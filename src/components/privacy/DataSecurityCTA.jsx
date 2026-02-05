export const DataSecurityCTA = () => {
  return (
    <section className="py-12">
      <div className="bg-slate-900 rounded-[3rem] p-12 text-center text-white paper-shadow relative overflow-hidden">
        {/* Decorative Icon */}
        <div className="absolute top-0 right-0 p-8 opacity-20">
          <span className="material-symbols-outlined text-9xl">verified</span>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto relative z-10">
          <h3 className="text-3xl font-serif-elegant font-bold mb-4">
            Have questions about your data?
          </h3>
          <p className="text-slate-400 mb-8">
            Our dedicated security team is here to help you understand how we protect your digital legacy.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold hover:scale-105 transition-all">
              Email Security Team
            </button>
            <button className="border border-slate-700 px-8 py-3 rounded-full font-bold hover:bg-slate-800 transition-all">
              Transparency Report
            </button>
          </div>
        </div>

        {/* Decorative Handwritten Text */}
        <div className="absolute bottom-6 left-12 hidden md:block">
          <p className="font-sketch text-purple-500 text-xl rotate-[-10deg]">
            We've got your back!
          </p>
        </div>
      </div>
    </section>
  );
};
