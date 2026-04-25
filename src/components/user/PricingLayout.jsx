import { useState } from 'react';

const PLANS = [
    {
        key: 'free',
        name: 'Free',
        monthly: 0,
        yearly: 0,
        yearlyBilled: null,
        badge: null,
        accent: 'text-slate-500',
        ring: 'ring-slate-200',
        ctaLabel: 'Current Plan',
        ctaStyle: 'bg-slate-100 text-slate-400 cursor-default',
        ctaDisabled: true,
        features: [
            'Unlimited notes, papers & folders',
            'Basic flashcard decks',
            '2 AI presentation builds / day',
            '5 AI writes / day',
            'Unlimited voice to text',
        ],
    },
    {
        key: 'starter',
        name: 'Starter',
        monthly: 4.99,
        yearly: 3.49,
        yearlyBilled: 41.88,
        badge: { label: 'Popular', cls: 'bg-emerald-100 text-emerald-700' },
        accent: 'text-primary',
        ring: 'ring-primary/30',
        ctaLabel: 'Upgrade to Starter',
        ctaStyle: 'bg-primary text-white hover:bg-primary/90 shadow-[0_4px_14px_rgba(101,65,196,0.35)]',
        ctaDisabled: false,
        features: [
            'Everything in Free',
            '20 AI presentation builds / day',
            '50 AI writes / day',
            'DeepSeek V3 — smarter AI model',
            'All premium themes & slide art',
            'Full PDF & PPTX export',
            '3 auto note generations / day',
        ],
    },
    {
        key: 'pro',
        name: 'Pro',
        monthly: 11.99,
        yearly: 8.33,
        yearlyBilled: 99.99,
        badge: null,
        accent: 'text-indigo-600',
        ring: 'ring-indigo-200',
        ctaLabel: 'Upgrade to Pro',
        ctaStyle: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-[0_4px_14px_rgba(79,70,229,0.3)]',
        ctaDisabled: false,
        features: [
            'Everything in Starter',
            '50 AI presentation builds / day',
            '150 AI writes / day',
            'AI quiz generator from notes',
            '10 auto note generations / day',
            'Smart study reminders',
            'Early access to new features',
        ],
    },
    {
        key: 'premium',
        name: 'Premium',
        monthly: 17,
        yearly: 11.67,
        yearlyBilled: 139.99,
        badge: { label: 'Best Value', cls: 'bg-amber-100 text-amber-700' },
        accent: 'text-amber-600',
        ring: 'ring-amber-200',
        ctaLabel: 'Upgrade to Premium',
        ctaStyle: 'bg-amber-500 text-white hover:bg-amber-600 shadow-[0_4px_14px_rgba(245,158,11,0.3)]',
        ctaDisabled: false,
        features: [
            'Everything in Pro',
            'Unlimited AI presentations',
            'Unlimited AI writes',
            'Unlimited auto note generation',
            'Personalised AI study plans',
            'Auto flashcard generation',
            'All future AI features — first access',
        ],
    },
];

const fmt = (n) => n === 0 ? '$0' : `$${Number.isInteger(n) ? n : n.toFixed(2)}`;

export const PricingLayout = () => {
    const [annual, setAnnual] = useState(false);

    return (
        <div className="flex-1 lg:ml-64 min-h-screen bg-slate-50">
            <div className="max-w-5xl mx-auto px-4 py-8 md:py-10">

                {/* Page header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Upgrade your plan</h1>
                    <p className="text-sm text-slate-400 mt-1">You're currently on the <span className="font-semibold text-slate-600">Free</span> plan. Unlock more AI power below.</p>
                </div>

                {/* Billing toggle */}
                <div className="flex items-center gap-3 mb-8">
                    <span className={`text-sm font-semibold ${!annual ? 'text-slate-800' : 'text-slate-400'}`}>Monthly</span>
                    <button
                        onClick={() => setAnnual(v => !v)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${annual ? 'bg-primary' : 'bg-slate-200'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${annual ? 'left-6' : 'left-1'}`} />
                    </button>
                    <span className={`text-sm font-semibold ${annual ? 'text-slate-800' : 'text-slate-400'}`}>
                        Annual
                        <span className="ml-2 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-md">Save ~30%</span>
                    </span>
                </div>

                {/* Plan cards — 2 × 2 grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {PLANS.map((plan) => {
                        const price = annual && plan.yearly > 0 ? plan.yearly : plan.monthly;
                        const isStarter = plan.key === 'starter';

                        return (
                            <div
                                key={plan.key}
                                className={`relative bg-white rounded-2xl p-5 flex flex-col gap-4 ring-1 shadow-sm transition-shadow hover:shadow-md ${plan.ring} ${isStarter ? 'shadow-md' : ''}`}
                            >
                                {/* Badge */}
                                {plan.badge && (
                                    <span className={`absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full ${plan.badge.cls}`}>
                                        {plan.badge.label}
                                    </span>
                                )}

                                {/* Plan name + price */}
                                <div>
                                    <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${plan.accent}`}>{plan.name}</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-slate-800">{fmt(price)}</span>
                                        <span className="text-sm text-slate-400 font-medium">
                                            {price === 0 ? '/ forever' : '/ mo'}
                                        </span>
                                    </div>
                                    {annual && plan.yearlyBilled && (
                                        <p className="text-[11px] text-slate-400 mt-0.5">Billed ${plan.yearlyBilled} / year</p>
                                    )}
                                </div>

                                {/* Features */}
                                <ul className="flex flex-col gap-2 flex-1">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex items-start gap-2 text-[13px] text-slate-600">
                                            <span className={`material-icons-round text-[15px] mt-0.5 shrink-0 ${plan.ctaDisabled ? 'text-slate-300' : plan.accent}`}>
                                                check
                                            </span>
                                            <span className={i === 0 && plan.key !== 'free' ? 'font-semibold text-slate-700' : ''}>{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <button
                                    disabled={plan.ctaDisabled}
                                    className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${plan.ctaStyle}`}
                                >
                                    {plan.ctaLabel}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Team plan */}
                <div className="mt-4 relative bg-slate-900 rounded-2xl p-6 overflow-hidden">
                    <div className="absolute -top-16 -right-16 w-56 h-56 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-icons-round text-yellow-400 text-[20px]">groups</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400">Team Plan</span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">Study Together.</h3>
                            <p className="text-[13px] text-slate-400 max-w-sm">
                                5 seats, full Premium for everyone. One invoice, the owner invites by email.
                            </p>
                            <div className="flex items-baseline gap-1 mt-3">
                                <span className="text-2xl font-bold text-white">{annual ? '$33.25' : '$49'}</span>
                                <span className="text-slate-400 text-sm">/ month</span>
                            </div>
                            {annual && <p className="text-slate-500 text-[11px] mt-0.5">Billed $399 / year · ${annual ? '6.65' : '9.80'} per person</p>}
                        </div>
                        <button className="shrink-0 px-6 py-3 bg-white text-slate-900 font-bold text-sm rounded-xl hover:bg-slate-100 active:scale-95 transition-all">
                            Launch Team
                        </button>
                    </div>
                </div>

                {/* Footer note */}
                <p className="text-center text-[11px] text-slate-400 mt-6">
                    All paid plans can be cancelled anytime · Secure payment via Stripe
                </p>
            </div>
        </div>
    );
};
