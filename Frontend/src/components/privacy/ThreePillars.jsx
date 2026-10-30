const PILLARS = [
  {
    number: '01',
    title: 'Encrypted everywhere',
    body: 'Your notes are encrypted in transit and at rest. Even we cannot read your private pages.',
  },
  {
    number: '02',
    title: 'No data selling',
    body: 'We never share your data with advertisers, and we have no ads on the platform. You pay your AI provider directly. We never see your bill.',
  },
  {
    number: '03',
    title: 'Total user control',
    body: 'Export your entire library in one click. Delete your account and every trace of your data is removed.',
  },
];

export const ThreePillars = () => {
  return (
    <section className="privacy-pillars grid grid-cols-1 md:grid-cols-3 gap-0 mt-10 border-y border-stone-200">
      {PILLARS.map((p) => (
        <div
          key={p.title}
          className="privacy-pillar p-6 md:p-8"
        >
          <span className="block text-xs text-[#587a7d] font-semibold mb-6">{p.number}</span>
          <h3 className="text-lg font-semibold text-stone-900 mb-2">{p.title}</h3>
          <p className="text-[14px] md:text-[15px] text-stone-500 leading-relaxed">{p.body}</p>
        </div>
      ))}
    </section>
  );
};
