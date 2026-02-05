export const GoldenRule = () => {
  return (
    <section className="relative">
      <div className="bg-white p-12 lg:p-20 paper-shadow paper-edge -rotate-1 relative overflow-hidden">
        {/* Washi Tape */}
        <div className="washi-tape top-4 left-1/2 -translate-x-1/2"></div>

        <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
          {/* Left Content */}
          <div className="flex-1 space-y-6">
            <h2 className="text-4xl lg:text-5xl font-serif-elegant font-extrabold text-slate-900">
              The Golden Rule: <br />
              <span className="text-purple-500 italic">Your data is yours.</span>
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              We believe that your thoughts, sketches, and notes are an extension of your mind. We don't own them, we don't lease them, and we certainly don't sell them. We are merely the stewards of your digital ink.
            </p>
            <div className="flex gap-4">
              <div className="stamp-top-secret font-sketch text-xl">Top Secret</div>
              <div className="flex items-center gap-2 text-purple-500 font-handwritten text-lg">
                <span className="material-symbols-outlined">verified_user</span>
                End-to-end respect
              </div>
            </div>
          </div>

          {/* Right Visual - Key Icon */}
          <div className="w-full md:w-1/3 flex justify-center">
            <div className="w-48 h-48 bg-purple-100 rounded-full flex items-center justify-center relative">
              <span className="material-symbols-outlined text-purple-500 text-8xl">key</span>
              <div className="absolute -bottom-2 -right-2 bg-white hand-drawn-border p-3">
                <span className="material-symbols-outlined text-green-600">lock</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Arrow SVG */}
      <div className="absolute -bottom-16 left-1/3 hidden lg:block">
        <svg
          className="text-slate-300"
          fill="none"
          height="100"
          viewBox="0 0 100 100"
          width="100"
        >
          <path
            d="M50 0 C 60 40, 40 60, 50 100"
            stroke="currentColor"
            strokeDasharray="4 4"
            strokeWidth="2"
          ></path>
          <path d="M40 90 L50 100 L60 90" stroke="currentColor" strokeWidth="2"></path>
        </svg>
      </div>
    </section>
  );
};
