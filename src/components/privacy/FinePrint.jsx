export const FinePrint = () => {
  return (
    <section className="space-y-12 mt-4 md:mt-8">
      {/* Section Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-serif-elegant font-bold md:font-extrabold mb-2">The Fine Print</h2>
        <div className="font-sketch text-slate-400 text-[13px] md:text-[16px]">Written for humans, not just lawyers</div>
      </div>

      {/* Four Policy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-2 md:p-0">
        {/* Card 1: Information We Collect */}
        <div className="bg-white p-5 md:p-10 paper-shadow lined-paper border-l-4 border-purple-500 relative">
          <div className="washi-tape-vert -top-4 right-8 bg-blue-200/40"></div>
          <h4 className="text-xl md:text-2xl font-serif-elegant font-bold mb-6 text-slate-800">
            1. Information We Collect
          </h4>
          <div className="space-y-.5 md:space-y-2 text-slate-600 text-[13px] md:text-[16px] md:font-medium leading-loose">
            <p>
              We collect your email address for account creation and sync purposes. When you use AI handwriting synthesis, we process the stroke data locally whenever possible.
            </p>
            <p>
              Usage metadata (like when you last opened the app) is collected to improve performance but is never linked to the content of your notes.
            </p>
          </div>
        </div>

        {/* Card 2: AI & Data Processing */}
        <div className="bg-white  p-5 md:p-10 paper-shadow lined-paper border-l-4 border-pink-500 relative rotate-1">
          <div className="washi-tape-vert top-1/2 -left-3 -translate-y-1/2 bg-pink-200/40 transform -rotate-90 h-12"></div>
          <h4 className="text-xl md:text-2xl font-serif-elegant font-bold mb-6 text-slate-800">
            2. AI & Data Processing
          </h4>
          <div className="space-y-.5 md:space-y-2 text-slate-600 text-[13px] md:text-[16px] md:font-medium leading-loose">
            <p>
              Our AI models analyze your notes to provide summaries and connections. This processing happens in a secure, isolated sandbox environment.
            </p>
            <p>
              We do not use your private notes to train global AI models. Your unique handwriting style is your property alone.
            </p>
          </div>
        </div>

        {/* Card 3: Third-Party Services */}
        <div className="bg-white p-10 paper-shadow lined-paper border-l-4 border-yellow-500 relative -rotate-1">
          <h4 className="text-xl md:text-2xl font-serif-elegant font-bold mb-6 text-slate-800">
            3. Third-Party Services
          </h4>
          <div className="space-y-.5 md:space-y-2 text-slate-600 text-[13px] md:text-[16px] md:font-medium leading-loose">
            <p>
              We use trusted infrastructure providers for cloud storage and AI compute. Each partner is vetted for compliance with strict security standards (SOC2, GDPR).
            </p>
            <p>
              No third party is granted access to the contents of your notes for their own purposes.
            </p>
          </div>
          <div className="absolute bottom-4 right-4 opacity-30">
            <span className="material-symbols-outlined text-5xl">partner_exchange</span>
          </div>
        </div>

        {/* Card 4: Your Rights */}
        <div className="bg-white p-10 paper-shadow lined-paper border-l-4 border-green-500 relative">
          <div className="washi-tape -bottom-2 right-12 bg-green-200/40 rotate-2"></div>
          <h4 className="text-xl md:text-2xl font-serif-elegant font-bold mb-6 text-slate-800">
            4. Your Rights
          </h4>
          <div className="space-y-.5 md:space-y-2 text-slate-600 text-[13px] md:text-[16px] md:font-medium leading-loose">
            <p>
              You have the right to access, correct, or delete your information at any time. We respond to all privacy requests within 48 hours.
            </p>
            <p>
              You can opt-out of all non-essential data collection directly in your account settings under "Privacy Vault".
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};