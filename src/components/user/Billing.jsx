import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { paypal, paystack } from '../../assets/assets';

// Tab Component - Reusable
export const BillingTab = ({ isActive, label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`paper-tab px-4 py-1.5 text-[17px] transition-colors font-semibold ${
        isActive
          ? 'paper-tab-active bg-white  text-slate-900 border-t border-l border-r border-slate-200'
          : 'bg-slate-100/50  hover:bg-white  text-slate-400  hover:text-slate-700'
      }`}
    >
      {label}
    </button>
  );
};

// Header Component
export const BillingHeader = () => {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Account Settings</h1>
        <p className="text-slate-500 mt-1 font-handwriting text-[15px]">
          Manage your membership and payments.
        </p>
      </div>
    </header>
  );
};

// Plan Status Badge Component
export const PlanStatusBadge = ({ status, nextBillingDate }) => {
  const statusConfig = {
    active: {
      color: 'from-green-100 to-emerald-100',
      textColor: 'text-green-900',
      label: 'Active Plan',
    },
    upgrade: {
      color: 'from-amber-100 to-yellow-100',
      textColor: 'text-amber-900',
      label: 'Upgrade Available',
    },
    expired: {
      color: 'from-red-100 to-rose-100',
      textColor: 'text-red-900',
      label: 'Expired',
    },
  };

  const config = statusConfig[status] || statusConfig.active;

  return (
    <div className={`absolute -top-4 right-12 z-30 bg-gradient-to-r ${config.color} px-4 py-1 rotate-1 shadow-sm rounded-md`}>
      <span className={`font-sketch font-bold ${config.textColor} tracking-wide`}>
        {status === 'active' && `Next Billing: ${nextBillingDate}`}
        {status === 'upgrade' && 'Upgrade Your Plan'}
        {status === 'expired' && 'Subscription Expired'}
      </span>
    </div>
  );
};

// Payment Button Component - Reusable
export const PaymentButton = ({ label, icon, onClick, variant = 'primary' }) => {
  const baseClasses = 'w-full py-2 px-3 rounded-md font-medium flex items-center justify-center gap-3 transition-all';
  
  const variantClasses = {
    primary: 'bg-[#3bb75e] hover:bg-[#12c7f7] text-white shadow-lg shadow-purple-500/25',
    secondary: 'bg-[#003087]  text-white hover:bg-slate-800 border border-slate-200',
  };

  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses[variant]}`}>
      <img src={icon} className="w-7"/>
      {label}
    </button>
  );
};

// Plan Card Component - Reusable
export const PlanCard = ({ planName, price, description, features, isActive, onSelectPlan }) => {
  return (
    <div className={`paper-card rounded-large p-8 relative ${isActive ? 'border-2 border-purple-500' : ''}`}>
      {isActive && (
        <div className="absolute -top-3 right-4 bg-green-500 text-white px-4 py-1 rounded-full text-xs font-bold">
          Active Plan
        </div>
      )}
      
      <h3 className="text-2xl font-bold mb-2">{planName}</h3>
      <p className="text-slate-500 mb-3">{description}</p>
      
      <div className="mb-8">
        <span className="text-4xl font-bold">${price}</span>
        <span className="text-slate-500">/month</span>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3 text-slate-700">
            <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
            {feature}
          </li>
        ))}
      </ul>

      <PaymentButton
        label={isActive ? 'Current Plan' : 'Upgrade Now'}
        icon="upgrade"
        onClick={() => onSelectPlan(planName)}
        variant={isActive ? 'secondary' : 'primary'}
      />
    </div>
  );
};

// Subscription Tab
export const SubscriptionTab = () => {
  const [selectedPlan, setSelectedPlan] = useState('Premium');

  const plans = [
    {
      planName: 'Free',
      price: '0',
      description: 'Get started with the basics',
      features: ['10 notes per month', 'Basic search', 'Web access only'],
      isActive: selectedPlan === 'Free',
    },
    {
      planName: 'Premium',
      price: '7.99',
      description: 'Perfect for daily users',
      features: ['Unlimited notes', 'Advanced AI features', 'Voice recording', 'Cloud sync', 'Priority support'],
      isActive: selectedPlan === 'Premium',
    },
    {
      planName: 'Pro',
      price: '14.99',
      description: 'For power users',
      features: ['Everything in Premium', 'Team collaboration', 'Custom AI models', 'Advanced analytics', 'Dedicated support'],
      isActive: selectedPlan === 'Pro',
    },
  ];

  const handleSelectPlan = (planName) => {
    console.log('Selected plan:', planName);
    setSelectedPlan(planName);
  };

  return (
    <div className="space-y-4">
      {/* Current Plan Info */}
      <div className="paper-card rounded-large p-4 relative">
        <PlanStatusBadge status="active" nextBillingDate="July 15, 2024" />
        
        <div className="mb-4">
          <h2 className="text-[16px] font-medium mb-2">Current Subscription</h2>
          <p className="font-handwriting text-slate-400 text-[14px]">Premium Plan - $7.99/month</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <p className="text-sm text-slate-500 mb-1">Billing Cycle</p>
            <p className="font-normal">Monthly</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Next Billing Date</p>
            <p className="font-normal">July 15, 2024</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Auto-Renewal</p>
            <p className="font-normal">Enabled</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Status</p>
            <p className="font-normal text-green-600">Active</p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3">
          <h3 className="font-medium text-[15px] mb-4">Change Payment Method</h3>
          <div className="md:w-[50%] grid grid-cols-1 md:grid-cols-2 gap-4">
            <PaymentButton
              label="Pay with PayStack"
              icon={paystack}
              onClick={() => console.log('PayStack payment')}
              variant="primary"
            />
            <PaymentButton
              label="Pay with PayPal"
              icon={paypal}
              onClick={() => console.log('PayPal payment')}
              variant="secondary"

            />
          </div>
        </div>
      </div>

     

      {/* Support */}
      <div className="text-center pb-12">
        <div className="inline-block relative">
          <p className="font-sketch text-slate-400 text-sm max-w-xs mx-auto">
            Need help? Contact our support team at support@Notepaper-ai
          </p>
          <div className="absolute -left-12 -top-2 text-purple-500/30 rotate-[-20deg]">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 19l7-7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
              <path d="M19 12H5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

// Invoice Row Component - Reusable
export const InvoiceRow = ({ date, invoiceId, amount, isPaid, onDownload }) => {
  return (
    <tr className="group relative text-[13px]">
      <td className="h-10 px-4 text-ink-blue">{date}</td>
      <td className="h-10 px-4 text-slate-500">{invoiceId}</td>
      <td className="h-10 px-4 text-right font-bold text-slate-900">${amount}</td>
      <td className="h-10 px-4 text-center relative">
        {isPaid && (
          <div className="absolute -top-2 left-0 paid-stamp pointer-events-none">PAID</div>
        )}
        <button
          onClick={onDownload}
          className="inline-flex items-center justify-center p-1 rounded-md hover:bg-slate-100 transition-colors"
        >
          <span className={`material-symbols-outlined ${isPaid ? 'text-purple-500' : 'text-slate-400'}`}>
            attach_file
          </span>
        </button>
      </td>
    </tr>
  );
};

// Billing History Tab
export const BillingHistoryTab = () => {
  const invoices = [
    { date: 'June 15, 2024', invoiceId: 'INV-2024-006', amount: '7.99', isPaid: true },
    { date: 'May 15, 2024', invoiceId: 'INV-2024-005', amount: '7.99', isPaid: true },
    { date: 'April 15, 2024', invoiceId: 'INV-2024-004', amount: '7.99', isPaid: true },
    { date: 'March 15, 2024', invoiceId: 'INV-2024-003', amount: '7.99', isPaid: true },
    { date: 'February 15, 2024', invoiceId: 'INV-2024-002', amount: '7.99', isPaid: true },
    { date: 'January 15, 2024', invoiceId: 'INV-2024-001', amount: '7.99', isPaid: true },
  ];

  const handleDownload = (invoiceId) => {
    console.log('Downloading invoice:', invoiceId);
  };

  return (
    <div className="paper-card rounded-large p-12 relative">
      <PlanStatusBadge status="active" nextBillingDate="July 15, 2024" />

      <div className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-[16px] font-medium mb-1">Billing History</h2>
          <p className="font-handwriting text-slate-400 text-[12px] font-normal">Download your past transactions</p>
        </div>
        <div className="hidden md:block">
          <span className="material-symbols-outlined text-slate-200 text-6xl rotate-12">
            receipt
          </span>
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <th className="pb-4 px-4 font-sketch">Date</th>
              <th className="pb-4 px-4 font-sketch">Invoice ID</th>
              <th className="pb-4 px-4 font-sketch text-right">Amount</th>
              <th className="pb-4 px-4 font-sketch text-center">Action</th>
            </tr>
          </thead>
          <tbody className="ruled-lines font-handwriting text-xl">
            {invoices.map((invoice, index) => (
              <InvoiceRow
                key={index}
                date={invoice.date}
                invoiceId={invoice.invoiceId}
                amount={invoice.amount}
                isPaid={invoice.isPaid}
                onDownload={() => handleDownload(invoice.invoiceId)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-12 flex items-center justify-center gap-2">
        <div className="h-[1px] flex-1 bg-slate-100"></div>
        <p className="font-sketch text-slate-300 text-sm uppercase tracking-widest">End of History</p>
        <div className="h-[1px] flex-1 bg-slate-100"></div>
      </div>

      <div className="mt-4 text-center pb-12">
        <div className="inline-block relative">
          <p className="font-sketch text-slate-400 text-sm max-w-xs mx-auto">
            Contact support for enterprise billing and custom invoicing needs.
          </p>
          <div className="absolute -left-12 -top-2 text-purple-500/30 rotate-[-20deg]">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 19l7-7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
              <path d="M19 12H5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Billing Page
export const Billing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') || 'subscription';

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  return (
    <main className="flex-1 lg:ml-64 p-3 lg:p-8 pt-20 lg:pt-8 flex flex-col gap-4 overflow-y-auto max-w-5xl mx-auto w-full z-10 relative">
      <BillingHeader />

      {/* Tabs */}
      <div className="flex gap-2 px-4 translate-y-px z-20">
        <BillingTab
          isActive={tabParam === 'subscription'}
          label="Subscription"
          onClick={() => handleTabChange('subscription')}
        />
        <BillingTab
          isActive={tabParam === 'billing-history'}
          label="Billing History"
          onClick={() => handleTabChange('billing-history')}
        />
      </div>

      {/* Tab Content */}
      {tabParam === 'subscription' && <SubscriptionTab />}
      {tabParam === 'billing-history' && <BillingHistoryTab />}
    </main>
  );
};