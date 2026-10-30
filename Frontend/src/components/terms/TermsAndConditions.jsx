import React from 'react';

export default function TermsAndConditions() {
  return (
    <main className="terms-document max-w-7xl mx-auto px-5 sm:px-6 pt-12 md:pt-20 pb-20 md:pb-28">
      {/* Header */}
      <header className="terms-header pb-8 md:pb-12">
        <p className="landing-kicker mb-4">LEGAL</p>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-[-0.055em] text-stone-900">
          Terms &amp; Conditions
        </h1>
        <p className="text-stone-500 text-sm md:text-base mt-5">
          Last updated: July 11, 2026
        </p>
      </header>

      {/* Introduction */}
      <section className="terms-intro bg-[#edf3ef] border border-[#dce5df] p-7 md:p-10 mb-10">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-[-0.04em] text-stone-900 mb-5">
          Our agreement with you
        </h2>
        <p className="text-stone-600 text-[15px] md:text-lg leading-relaxed">
          Welcome to Notepaper. These Terms and Conditions govern your access to
          and use of our platform, services, and website. By creating an account
          or using Notepaper, you agree to comply with and be bound by these
          terms. Notepaper is a product owned and operated by Synchrome.
        </p>
      </section>

      {/* Content rows */}
      <section className="terms-sections grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="terms-section bg-white border border-stone-200 p-7 md:p-8">
          <h4 className="text-lg font-semibold text-stone-900 mb-4">
            1. Acceptance &amp; use of services
          </h4>
          <div className="space-y-3 text-stone-600 text-[14px] md:text-[15px] leading-relaxed">
            <p>
              By using our website and writing tools, you agree to these Terms. If
              you do not agree, you must not use or access Notepaper.
            </p>
            <p>
              We grant you a limited, non-exclusive, non-transferable license to
              access and use the platform solely for personal or commercial
              productivity purposes in accordance with these Terms.
            </p>
          </div>
        </div>

        <div className="terms-section bg-white border border-stone-200 p-7 md:p-8">
          <h4 className="text-lg font-semibold text-stone-900 mb-4">
            2. User accounts &amp; security
          </h4>
          <div className="space-y-3 text-stone-600 text-[14px] md:text-[15px] leading-relaxed">
            <p>
              To access features of Notepaper, you must register for an account
              using a valid email address. You are responsible for safeguarding
              your password and account details.
            </p>
            <p>
              You must notify us immediately at <strong>support@synchrome.co</strong> if
              you detect any unauthorized access or security breaches of your
              account.
            </p>
          </div>
        </div>

        <div className="terms-section bg-white border border-stone-200 p-7 md:p-8">
          <h4 className="text-lg font-semibold text-stone-900 mb-4">
            3. Fees, payments &amp; third-party AI providers
          </h4>
          <div className="space-y-3 text-stone-600 text-[14px] md:text-[15px] leading-relaxed">
            <p>
              Notepaper is provided <strong>free of charge</strong>. We do not
              sell subscriptions or paid plans, and we do not process payments on
              your behalf.
            </p>
            <p>
              AI features operate on a <strong>bring-your-own-key</strong> basis.
              You supply an API key from a third-party provider such as Google
              Gemini or DeepSeek, and you pay that provider directly for the usage
              you incur. Those charges are governed by that provider's own terms,
              and Notepaper is not a party to those transactions.
            </p>
            <p>
              We do <strong>not</strong> collect or store credit/debit card
              numbers, CVVs, expiration dates, or bank log-in credentials. API
              keys you add are encrypted before storage and are used only to
              contact the provider you selected.
            </p>
          </div>
        </div>

        <div className="terms-section bg-white border border-stone-200 p-7 md:p-8">
          <h4 className="text-lg font-semibold text-stone-900 mb-4">
            4. Intellectual property &amp; your content
          </h4>
          <div className="space-y-3 text-stone-600 text-[14px] md:text-[15px] leading-relaxed">
            <p>
              Your notes, uploaded documents, and generated files are your sole
              intellectual property. We do not claim ownership over any of your
              content.
            </p>
            <p>
              You grant Notepaper a limited license to process your content only as
              required to perform the actions you request, such as summarising,
              styling, and exporting.
            </p>
          </div>
        </div>

        <div className="terms-section bg-white border border-stone-200 p-7 md:p-8">
          <h4 className="text-lg font-semibold text-stone-900 mb-4">
            5. Acceptable use policy
          </h4>
          <div className="space-y-3 text-stone-600 text-[14px] md:text-[15px] leading-relaxed">
            <p>
              You agree not to use Notepaper for any unlawful activities, to
              transmit spam, or to upload malware or prohibited file types.
            </p>
            <p>
              We reserve the right to temporarily suspend or permanently terminate
              accounts that violate our acceptable use guidelines or abuse
              platform resources.
            </p>
          </div>
        </div>

        <div className="terms-section bg-white border border-stone-200 p-7 md:p-8">
          <h4 className="text-lg font-semibold text-stone-900 mb-4">
            6. Limitation of liability
          </h4>
          <div className="space-y-3 text-stone-600 text-[14px] md:text-[15px] leading-relaxed">
            <p>
              Notepaper is provided &ldquo;as is&rdquo; and &ldquo;as
              available&rdquo;. To the extent permitted by law, Synchrome and
              Notepaper shall not be liable for any indirect, incidental, or
              consequential damages resulting from your use or inability to use
              our platform.
            </p>
          </div>
        </div>
      </section>

      {/* Business details */}
      <footer className="terms-contact text-center py-8 border-t border-stone-200 mt-10">
        <h4 className="text-lg md:text-xl font-semibold text-stone-800 mb-2">
          Questions about these terms?
        </h4>
       
        <p className="text-stone-500 text-sm md:text-base">
          Email: support@synchrome.co &bull; Phone: +2349131710995
        </p>
      </footer>
    </main>
  );
}
