export const GoldenRule = () => {
  return (
    <section className="privacy-principle bg-[#edf3ef] border border-[#dce5df] p-7 md:p-12 mt-3">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-10">
        <div className="flex-1 space-y-5">
          <p className="landing-kicker">OUR PRINCIPLE</p>
          <h2 className="text-2xl md:text-4xl font-semibold tracking-[-0.045em] text-stone-900 leading-snug">
            Your data is yours.
          </h2>
          <p className="text-stone-600 text-[15px] md:text-lg leading-relaxed">
            Your thoughts, sketches and notes are an extension of your mind. We
            don&rsquo;t own them, we don&rsquo;t lease them, and we never sell them.
            We are simply the stewards of your writing.
          </p>
        </div>
        <p className="privacy-principle-mark" aria-hidden="true">YOURS</p>
      </div>
    </section>
  );
};
