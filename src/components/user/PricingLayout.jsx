import { useEffect, useState } from 'react';
import { billingService } from '../../api/billingService';
import { useBilling } from '../../hooks/useBilling';
import { usePlan } from '../../hooks/usePlan';

// ── Static plan metadata (features hardcoded for instant render, only prices fetched) ──
const PLAN_META = {
    free: {
        badge: null,
        accent: 'text-slate-500',
        ring: 'ring-slate-200',
        ctaStyle: 'bg-slate-100 text-slate-400 cursor-default',
        features: [
            { text: 'Unlimited notes, papers & folders' },
            { text: 'Basic flashcard decks' },
            { text: '2 AI presentation builds per day' },
            { text: '5 AI writes & Shakespeare rewrites / day' },
            { text: 'Unlimited voice to text' },
        ],
    },
    starter: {
        badge: { label: 'Popular', cls: 'bg-emerald-100 text-emerald-700' },
        accent: 'text-primary',
        ring: 'ring-primary/30',
        ctaStyle: 'bg-primary text-white hover:bg-primary/90 shadow-[0_4px_14px_rgba(101,65,196,0.35)]',
        features: [
            { text: 'Everything in Free', bold: true },
            { text: '20 AI presentation builds per day' },
            { text: '50 AI writes & Shakespeare rewrites / day' },
            { text: 'Smarter & faster AI model', bold: true },
            { text: 'All premium themes & slide art' },
            { text: '3 auto note generations / day — works while you sleep' },
            { text: 'Scholar AI — 150 research pages / month', bold: true },
        ],
    },
    pro: {
        badge: null,
        accent: 'text-indigo-600',
        ring: 'ring-indigo-200',
        ctaStyle: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-[0_4px_14px_rgba(79,70,229,0.3)]',
        features: [
            { text: 'Everything in Starter', bold: true },
            { text: '50 AI presentation builds per day' },
            { text: '150 AI writes & Shakespeare rewrites / day' },
            { text: 'AI quiz generator from your notes', bold: true },
            { text: '10 auto note generations / day' },
            { text: 'Scholar AI — 500 research pages / month', bold: true },
            { text: 'Smart study reminders' },
            { text: 'Early access to new features' },
        ],
    },
    premium: {
        badge: { label: 'Best Value', cls: 'bg-amber-100 text-amber-700' },
        accent: 'text-amber-600',
        ring: 'ring-amber-200',
        ctaStyle: 'bg-amber-500 text-white hover:bg-amber-600 shadow-[0_4px_14px_rgba(245,158,11,0.3)]',
        features: [
            { text: 'Everything in Pro', bold: true },
            { text: 'Unlimited AI presentations', bold: true },
            { text: 'Unlimited AI writes & Shakespeare rewrites', bold: true },
            { text: 'Unlimited auto note generation', bold: true },
            { text: 'Unlimited Scholar AI research papers', bold: true },
            { text: 'Personalised AI study plans' },
            { text: 'Auto flashcard generation' },
            { text: 'All future AI features — first access' },
        ],
    },
    team: {
        badge: null,
        accent: 'text-yellow-500',
        ring: 'ring-yellow-200',
        ctaStyle: 'bg-white text-slate-900 hover:bg-slate-100',
        features: [
            { text: 'Everything in Premium', bold: true },
            { text: '5 seats — full Premium for everyone', bold: true },
            { text: 'One invoice, owner invites by email' },
            { text: 'Team collaboration features' },
        ],
    },
};

const fmt = (n, symbol = '₦') => {
    if (n === 0) return `${symbol}0`;
    return `${symbol}${Number.isInteger(n) ? n.toLocaleString() : n.toFixed(2)}`;
};

const REGULAR_KEYS = ['free', 'starter', 'pro', 'premium'];

export const PricingLayout = () => {
    const [annual, setAnnual]         = useState(false);
    const [priceMap, setPriceMap]     = useState({});   // key → { prices, currency, symbol }
    const [pricesLoaded, setPricesLoaded] = useState(false);

    const { plan: currentPlan, loaded } = usePlan();
    const { subscribe, loading, error } = useBilling();

    const currency = priceMap['starter']?.currency ?? 'ngn';
    const symbol   = priceMap['starter']?.symbol   ?? '₦';

    useEffect(() => {
        billingService.getPlans()
            .then(res => {
                const list = res?.data ?? res ?? [];
                const map = {};
                list.forEach(p => { map[p.key] = p; });
                setPriceMap(map);
                setPricesLoaded(true);
            })
            .catch(() => setPricesLoaded(true));
    }, []);

    const handleSubscribe = (planKey) => {
        subscribe(planKey, annual ? 'yearly' : 'monthly', currency);
    };

    const fmtPrice = (n) => fmt(n, symbol);

    // When annual: show per-month equivalent (yearly ÷ 12), bill line shows yearly total
    const displayPrice = (prices) => {
        if (!prices) return null;
        if (!annual) return prices.monthly ?? 0;
        return prices.yearly != null ? prices.yearly / 12 : null;
    };

    const teamPlan = priceMap['team'] ?? null;

    return (
        <div className="flex-1 lg:ml-64 min-h-screen bg-slate-50">
            <div className="max-w-5xl mx-auto px-4 py-8 md:py-10">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Upgrade your plan</h1>
                    {loaded && (
                        <p className="text-sm text-slate-400 mt-1">
                            You're currently on the{' '}
                            <span className="font-semibold text-slate-600 capitalize">{currentPlan}</span> plan.
                            {currentPlan === 'free' && ' Unlock more AI power below.'}
                        </p>
                    )}
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

                {/* Error */}
                {error && (
                    <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl text-sm">
                        <span className="material-icons-round text-[16px]">error_outline</span>
                        {error}
                    </div>
                )}

                {/* Plan cards — always render, skeleton only in price area */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {REGULAR_KEYS.map((key) => {
                        const meta       = PLAN_META[key];
                        const prices     = priceMap[key]?.prices ?? null;
                        const perMonth   = displayPrice(prices);
                        const isFree     = key === 'free';
                        const isCurrent  = loaded && currentPlan === key;
                        const isDowngrade = loaded && !isFree && currentPlan !== 'free' &&
                            REGULAR_KEYS.indexOf(key) < REGULAR_KEYS.indexOf(currentPlan);
                        const planName   = key.charAt(0).toUpperCase() + key.slice(1);

                        let ctaLabel    = `Upgrade to ${planName}`;
                        let ctaDisabled = false;
                        let ctaStyle    = meta.ctaStyle;

                        if (isCurrent) {
                            ctaLabel    = 'Current Plan';
                            ctaDisabled = true;
                            ctaStyle    = isFree
                                ? 'bg-slate-100 text-slate-400 cursor-default'
                                : 'bg-slate-100 text-slate-500 cursor-default ring-1 ring-slate-200';
                        } else if (isFree) {
                            ctaLabel    = 'Free Forever';
                            ctaDisabled = true;
                            ctaStyle    = 'bg-slate-100 text-slate-400 cursor-default';
                        } else if (isDowngrade) {
                            ctaLabel = `Switch to ${planName}`;
                        }

                        return (
                            <div
                                key={key}
                                className={`relative bg-white rounded-2xl p-5 flex flex-col gap-4 ring-1 shadow-sm transition-shadow hover:shadow-md ${meta.ring} ${isCurrent ? 'ring-2' : ''}`}
                            >
                                {meta.badge && !isCurrent && (
                                    <span className={`absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.badge.cls}`}>
                                        {meta.badge.label}
                                    </span>
                                )}
                                {isCurrent && (
                                    <span className="absolute top-4 right-4 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                        <span className="material-icons-round text-[11px]">check_circle</span>
                                        Current
                                    </span>
                                )}

                                {/* Name + price */}
                                <div>
                                    <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${meta.accent}`}>{planName}</p>
                                    {!pricesLoaded ? (
                                        <div className="h-9 w-28 bg-slate-100 rounded-lg animate-pulse" />
                                    ) : (
                                        <>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-bold text-slate-800">
                                                    {perMonth === 0 ? `${symbol}0` : fmtPrice(Math.round(perMonth))}
                                                </span>
                                                <span className="text-sm text-slate-400 font-medium">
                                                    {perMonth === 0 ? '/ forever' : '/ mo'}
                                                </span>
                                            </div>
                                            {annual && prices?.yearly > 0 && (
                                                <p className="text-[11px] text-slate-400 mt-0.5">
                                                    Billed {fmtPrice(prices.yearly)} / year
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Features — hardcoded, always instant */}
                                <ul className="flex flex-col gap-2 flex-1">
                                    {meta.features.map((f, i) => (
                                        <li key={i} className="flex items-start gap-2 text-[13px] text-slate-600">
                                            <span className={`material-icons-round text-[15px] mt-0.5 shrink-0 ${ctaDisabled ? 'text-slate-300' : meta.accent}`}>check</span>
                                            <span className={f.bold ? 'font-semibold text-slate-700' : ''}>{f.text}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <button
                                    disabled={ctaDisabled || loading}
                                    onClick={() => !ctaDisabled && handleSubscribe(key)}
                                    className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 ${ctaStyle}`}
                                >
                                    {loading ? (
                                        <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                                    ) : ctaLabel}
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
                            {!pricesLoaded ? (
                                <div className="h-8 w-24 bg-white/10 rounded-lg animate-pulse mt-3" />
                            ) : (
                                <div className="flex items-baseline gap-1 mt-3">
                                    <span className="text-2xl font-bold text-white">
                                        {fmtPrice(Math.round(annual
                                            ? (teamPlan?.prices?.yearly ?? 0) / 12
                                            : (teamPlan?.prices?.monthly ?? 0)
                                        ))}
                                    </span>
                                    <span className="text-slate-400 text-sm">/ mo</span>
                                </div>
                            )}
                            {annual && teamPlan?.prices?.yearly > 0 && (
                                <p className="text-slate-500 text-[11px] mt-0.5">
                                    Billed {fmtPrice(teamPlan.prices.yearly)} / year
                                </p>
                            )}
                        </div>
                        {currentPlan === 'team' ? (
                            <div className="shrink-0 flex items-center gap-2 px-6 py-3 bg-emerald-500/20 text-emerald-400 font-bold text-sm rounded-xl">
                                <span className="material-icons-round text-[16px]">check_circle</span>
                                Current Plan
                            </div>
                        ) : (
                            <button
                                disabled={loading}
                                onClick={() => handleSubscribe('team')}
                                className="shrink-0 px-6 py-3 bg-white text-slate-900 font-bold text-sm rounded-xl hover:bg-slate-100 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-60"
                            >
                                {loading
                                    ? <span className="w-4 h-4 border-2 border-slate-400/30 border-t-slate-700 rounded-full animate-spin" />
                                    : 'Launch Team'
                                }
                            </button>
                        )}
                    </div>
                </div>

                <p className="text-center text-[11px] text-slate-400 mt-6">
                    All paid plans can be cancelled anytime · Secure payment via Paystack
                </p>
            </div>
        </div>
    );
};
