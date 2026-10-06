export const GoldenRule = () => {
  return (
    <section className=" bg-white ring-1 ring-stone-200/80 p-8 md:p-14 mt-10">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-10">
        <div className="flex-1 space-y-5">
          <p className="eyebrow text-plum-700">The golden rule</p>
          <h2 className="font-display-serif text-2xl md:text-4xl font-semibold tracking-tight text-stone-900 leading-snug">
            Your data is yours.
          </h2>
          <p className="text-stone-600 text-[15px] md:text-lg leading-relaxed">
            Your thoughts, sketches and notes are an extension of your mind. We
            don&rsquo;t own them, we don&rsquo;t lease them, and we never sell them.
            We are simply the stewards of your writing.
          </p>
        </div>
        <div className="w-24 h-24 shrink-0  bg-plum-50 text-plum-700 flex items-center justify-center self-center md:self-auto">
          <span className="material-symbols-outlined text-[44px]">lock</span>
        </div>
      </div>
    </section>
  );
};
