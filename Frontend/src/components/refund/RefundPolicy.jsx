import React from 'react';

export default function RefundPolicy() {
  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-6 pt-8 md:pt-16 pb-20 md:pb-28 space-y-10">
      {/* Header */}
      <header className="text-center pb-4">
        <p className="eyebrow text-plum-700 mb-5">Legal</p>
        <h1 className="font-display-serif text-4xl md:text-6xl font-semibold tracking-tight text-stone-900">
          Refund policy
        </h1>
        <p className="text-stone-500 text-sm md:text-base mt-5">
          Last updated: September 29, 2026
        </p>
      </header>

      {/* Introduction */}
      <section className=" bg-white ring-1 ring-stone-200/80 p-8 md:p-14">
        <h2 className="font-display-serif text-2xl md:text-3xl font-semibold tracking-tight text-stone-900 mb-5">
          We don&apos;t charge you
        </h2>
        <p className="text-stone-600 text-[15px] md:text-lg leading-relaxed">
          Notepaper (a product by Synchrome) is <strong>free to use</strong>. We
          do not sell subscriptions, paid plans, credits, or add-ons, and we do
          not process any payment on your behalf. There is no subscription to
          cancel and no card for us to charge.
        </p>
        <p className="text-stone-600 text-[15px] md:text-lg leading-relaxed mt-4">
          AI features work because you bring your own API key from a provider
          such as Google Gemini or DeepSeek. Your usage is billed by that
          provider, directly to you, under their own terms.
        </p>
      </section>

      {/* Content cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className=" bg-white ring-1 ring-stone-200/80 p-8">
          <h4 className="font-display-serif text-xl font-semibold text-stone-900 mb-4">
            1. No payments are collected
          </h4>
          <div className="space-y-3 text-stone-600 text-[14px] md:text-[15px] leading-relaxed">
            <p>
              We never collect, store, or have access to your credit/debit card
              numbers, CVVs, expiration dates, or bank credentials, because we
              never ask for them.
            </p>
            <p>
              Notepaper has no payment gateway integrated. Any payment you make
              for AI usage goes directly to your chosen AI provider.
            </p>
          </div>
        </div>

        <div className=" bg-white ring-1 ring-stone-200/80 p-8">
          <h4 className="font-display-serif text-xl font-semibold text-stone-900 mb-4">
            2. Your API keys
          </h4>
          <div className="space-y-3 text-stone-600 text-[14px] md:text-[15px] leading-relaxed">
            <p>
              API keys you add are encrypted before storage and are used only to
              send your requests to the provider you selected. We never sell or
              share them.
            </p>
            <p>
              If you believe a key has been compromised, remove it from your
              profile settings and rotate it with your provider immediately.
            </p>
          </div>
        </div>

        <div className=" bg-white ring-1 ring-stone-200/80 p-8">
          <h4 className="font-display-serif text-xl font-semibold text-stone-900 mb-4">
            3. Third-party charges &amp; refunds
          </h4>
          <div className="space-y-3 text-stone-600 text-[14px] md:text-[15px] leading-relaxed">
            <p>
              Any amount you spend with Gemini, DeepSeek, or another AI provider
              is a matter between you and that provider. Notepaper is not a party
              to those transactions.
            </p>
            <p>
              We are therefore unable to issue, process, or refund those
              amounts. Refunds, credits, and plan changes must be requested
              directly from your AI provider.
            </p>
          </div>
        </div>

        <div className=" bg-white ring-1 ring-stone-200/80 p-8">
          <h4 className="font-display-serif text-xl font-semibold text-stone-900 mb-4">
            4. Getting help
          </h4>
          <div className="space-y-3 text-stone-600 text-[14px] md:text-[15px] leading-relaxed">
            <p>
              Because we take no payment, there is nothing to refund. If you have
              a question about your Notepaper account, contact us at{' '}
              <strong>support@synchrome.co</strong>.
            </p>
            <p>
              If your issue is a charge from an AI provider, contact that
              provider&apos;s support team — they will have the billing records we
              do not.
            </p>
          </div>
        </div>
      </section>

      {/* Business details */}
      <footer className="text-center pt-8 border-t border-stone-200">
        <h4 className="font-display-serif text-lg md:text-xl font-semibold text-stone-800 mb-2">
          Need assistance?
        </h4>

        <p className="text-stone-500 text-sm md:text-base">
          Email: support@synchrome.co &bull; Phone: +2349131710995
        </p>
      </footer>
    </div>
  );
}
