export const DataSecurityCTA = () => {
  return (
    <section className="my-12 md:my-16  bg-stone-900 p-8 md:p-16 text-center text-white">
      <div className="max-w-2xl mx-auto">
        <h3 className="font-display-serif text-2xl md:text-4xl font-semibold tracking-tight mb-4">
          Have questions about your data?
        </h3>
        <p className="text-stone-400 text-[15px] md:text-base leading-relaxed mb-8">
          Our team is happy to walk you through exactly how we handle and protect
          your writing.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <a
            href="mailto:support@synchrome.co"
            className="px-7 py-3  bg-white text-stone-900 text-[14px] font-semibold hover:bg-stone-200 transition-colors"
          >
            Email the team
          </a>
          <a
            href="/privacy"
            className="px-7 py-3  border border-stone-600 text-white text-[14px] font-semibold hover:border-stone-400 transition-colors"
          >
            Re-read the policy
          </a>
        </div>
      </div>
    </section>
  );
};
