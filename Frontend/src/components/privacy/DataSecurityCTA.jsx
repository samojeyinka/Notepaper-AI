export const DataSecurityCTA = () => {
  return (
    <section className="privacy-contact my-12 md:my-16 bg-[#45666c] p-8 md:p-12 text-center text-white">
      <div className="max-w-2xl mx-auto">
        <h3 className="text-2xl md:text-4xl font-semibold tracking-[-0.045em] mb-4">
          Have questions about your data?
        </h3>
        <p className="text-stone-400 text-[15px] md:text-base leading-relaxed mb-8">
          Our team is happy to walk you through exactly how we handle and protect
          your writing.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <a
            href="mailto:support@synchrome.co"
            className="px-7 py-3 rounded-full bg-white text-stone-900 text-[14px] font-semibold hover:bg-stone-100 transition-colors"
          >
            Email the team
          </a>
          <a
            href="/privacy"
            className="px-7 py-3 rounded-full border border-white/50 text-white text-[14px] font-semibold hover:bg-white/10 transition-colors"
          >
            Re-read the policy
          </a>
        </div>
      </div>
    </section>
  );
};
