const PILLARS = [
  {
    icon: 'encrypted',
    title: 'Encrypted everywhere',
    body: 'Your notes are encrypted in transit and at rest. Even we cannot read your private pages.',
  },
  {
    icon: 'money_off',
    title: 'No data selling',
    body: 'We never share your data with advertisers, and we have no ads on the platform. You pay your AI provider directly — we never see your bill.',
  },
  {
    icon: 'person_pin',
    title: 'Total user control',
    body: 'Export your entire library in one click. Delete your account and every trace of your data is removed.',
  },
];

export const ThreePillars = () => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
      {PILLARS.map((p) => (
        <div
          key={p.title}
          className=" bg-white ring-1 ring-stone-200/80 p-8"
        >
          <div className="w-11 h-11  bg-plum-50 text-plum-700 flex items-center justify-center mb-5">
            <span className="material-symbols-outlined text-[22px]">{p.icon}</span>
          </div>
          <h3 className="text-lg font-semibold text-stone-900 mb-2">{p.title}</h3>
          <p className="text-[14px] md:text-[15px] text-stone-500 leading-relaxed">{p.body}</p>
        </div>
      ))}
    </section>
  );
};
