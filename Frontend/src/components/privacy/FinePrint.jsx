const SECTIONS = [
  {
    title: '1. Information we collect',
    body: [
      'We collect your email address for account creation and sync. Content is processed to deliver the features you use, and never mined for anything else.',
      'Usage metadata (like when you last opened the app) is collected to improve performance but is never linked to the content of your notes.',
    ],
  },
  {
    title: '2. Processing & your content',
    body: [
      'When you use Notepaper\'s writing and study tools, the content you provide is processed to produce the result you asked for. This happens in a secure, isolated environment.',
      'We do not use your private notes to train shared models. Your writing style is your property alone.',
    ],
  },
  {
    title: '3. Third-party AI providers',
    body: [
      'AI features use keys you bring from providers such as Google, DeepSeek, OpenAI, or Claude. Requests are sent to the provider you choose to deliver the feature you asked for.',
      'Provider usage and charges are managed directly by that provider. Notepaper does not collect payment details or charge you for AI usage.',
    ],
  },
  {
    title: '4. Your rights',
    body: [
      'You have the right to access, correct, or delete your information at any time. We respond to all privacy requests within 48 hours.',
      'You can control data preferences directly in your account settings.',
    ],
  },
];

export const FinePrint = () => {
  return (
    <section className="mt-12">
      <div className="text-center mb-8">
        <p className="landing-kicker mb-4">DETAILS</p>
        <h2 className="text-2xl md:text-4xl font-semibold tracking-[-0.045em] text-stone-900">
          Written for humans, not just lawyers
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {SECTIONS.map((s) => (
          <div key={s.title} className="privacy-detail bg-white border border-stone-200 p-6 md:p-8">
            <h4 className="text-lg font-semibold text-stone-900 mb-4">{s.title}</h4>
            <div className="space-y-3 text-stone-600 text-[14px] md:text-[15px] leading-relaxed">
              {s.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
