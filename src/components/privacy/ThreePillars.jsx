export const ThreePillars = () => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-8 md:mt-4">
      {/* Encryption Card */}
      <div className="flex flex-col items-center text-center space-y-2 md:space-y-6">
        <div className="organic-card-1 bg-yellow-400 w-24 h-24 md:w-32 md:h-32 paper-shadow flex items-center justify-center text-white rotate-3">
          <span className="material-symbols-outlined text-5xl">encrypted</span>
        </div>
        <h3 className="text-xl md:text-2xl font-serif-elegant font-semibold md:font-bold">Military-Grade Encryption</h3>
        <p className="text-slate-500 text-[12px] md:text-[16px]">
          Your notes are encrypted at rest and in transit. Not even our engineers can read your personal journals.
        </p>
      </div>

      {/* No Data Selling Card */}
      <div className="flex flex-col items-center text-center space-y-2 md:space-y-6">
        <div className="organic-card-2 bg-green-500 w-32 h-32 paper-shadow flex items-center justify-center text-white -rotate-2">
          <span className="material-symbols-outlined text-5xl">money_off</span>
        </div>
        <h3 className="text-xl md:text-2xl font-serif-elegant font-semibold md:font-bold">No Data Selling</h3>
        <p className="text-slate-500 text-[12px] md:text-[16px]">
          We do not share your data with third-party advertisers. Our business model is based on subscriptions, not your privacy.
        </p>
      </div>

      {/* User Control Card */}
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="organic-card-3 bg-purple-500 w-32 h-32 paper-shadow flex items-center justify-center text-white rotate-6">
          <span className="material-symbols-outlined text-5xl">person_pin</span>
        </div>
        <h3 className="text-xl md:text-2xl font-serif-elegant font-semibold md:font-bold">Total User Control</h3>
        <p className="text-slate-500 text-[12px] md:text-[16px]">
          Export your entire library in one click. Delete your account and every trace of your data vanishes forever.
        </p>
      </div>
    </section>
  );
};
