import { Link } from 'react-router-dom';

export const SubscriptionSection = () => {
 

  return (
    <section className="paper-scrap p-4 rounded-lg">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400">card_membership</span>
          <h2 className="text-[17px] font-medium">Subscription</h2>
        </div>
        <span className="px-2 py-1 bg-primary text-white text-[12px] font-normal rounded-md border-2 border-primary -rotate-2 shadow-sm font-sketch tracking-wider">
          PREMIUM
        </span>
      </div>

      <div className="space-y-3">
        <div className="p-5 rounded-xl bg-paper-cream border border-slate-200">
          <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest mb-2">Active Plan</p>
          <p className="font-semibold text-[15px]">Pro Annual Plan</p>
          <p className="text-2xl font-black text-primary">
            $99<span className="text-sm font-normal text-slate-400">/year</span>
          </p>
          <p className="text-xs text-slate-400 mt-2 italic font-handwriting">
            Next billing: June 15, 2024
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
           to={`/lockedin/invoices-&-billing?tab=subscription`}
            className="flex-1 px-2 py-1.5 bg-white border-2 border-slate-100 rounded-xl font-medium text-sm hover:border-primary transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">settings_suggest</span>
            Manage
          </Link>
        <Link
            to={`/lockedin/invoices-&-billing?tab=billing-history`}
            className="flex-1 px-2 py-1.5 bg-white border-2 border-slate-100 rounded-xl font-medium text-sm hover:border-primary transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">receipt_long</span>
            Invoices
          </Link>
        </div>
      </div>
    </section>
  );
};