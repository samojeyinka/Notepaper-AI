import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { billingService } from '../../api/billingService'

// ── Plan data (features hardcoded, prices fetched from API) ───────────────────
const PLANS = [
    {
        key: 'free',
        name: 'Free',
        icon: 'eco',
        fallbackMonthly: 0,
        fallbackYearly: 0,
        fallbackYearlyBilled: null,
        tag: null,
        cardBg: 'bg-white',
        cardBorder: 'border-slate-100',
        edge: 'organic-edge-white',
        textColor: 'text-slate-600',
        priceColor: 'text-slate-900',
        subColor: 'text-slate-400',
        iconBg: 'bg-slate-50 border-dashed border-slate-200',
        iconColor: 'text-slate-400',
        checkIcon: 'check_circle',
        checkColor: 'text-accent-green',
        cta: 'Get started free',
        ctaStyle: 'bg-slate-50 border-2  border-slate-400 text-slate-400 hover:bg-slate-100',
        features: [
            { text: 'Unlimited notes, papers & folders' },
            { text: 'Basic flashcard decks' },
            { text: '2 AI presentation builds per day' },
            { text: '5 AI writes & Shakespeare rewrites / day' },
            { text: 'Unlimited voice to text' },
            { text: 'Standard themes & templates' },
            { text: 'Gemini Flash Lite AI model' },
        ],
    },
    {
        key: 'starter',
        name: 'Starter',
        icon: 'auto_awesome',
        fallbackMonthly: 3.99,
        fallbackYearly: 2.79,
        fallbackYearlyBilled: 33.50,
        tag: { text: 'Most Popular!', cls: 'bg-green-300 text-green-900 border-green-400' },
        cardBg: 'bg-[#F3F1FB]',
        cardBorder: 'border-purple-200/50',
        edge: 'organic-edge-purple',
        textColor: 'text-indigo-900',
        priceColor: 'text-indigo-900',
        subColor: 'text-indigo-700/60',
        iconBg: 'bg-white/60 border-white/80',
        iconColor: 'text-primary',
        checkIcon: 'done_all',
        checkColor: 'text-primary',
        cta: 'Start Starter',
        ctaStyle: 'bg-white border-2  border-primary text-primary shadow-md hover:shadow-xl',
        features: [
            { text: 'Everything in Free', bold: true },
            { text: '20 AI presentation builds per day' },
            { text: '50 AI writes & Shakespeare rewrites / day' },
            { text: 'Smarter & faster AI model', bold: true },
            { text: 'All premium themes & slide art' },
            { text: '3 auto note generations / day — works while you sleep' },
            { text: 'Scholar AI — 150 research pages / month', bold: true },
            { text: 'Priority support' },
        ],
    },
    {
        key: 'pro',
        name: 'Pro',
        icon: 'diamond',
        fallbackMonthly: 9.59,
        fallbackYearly: 6.66,
        fallbackYearlyBilled: 79.99,
        tag: null,
        cardBg: 'bg-[#F8F9FA]',
        cardBorder: 'border-slate-100',
        edge: 'organic-edge-white',
        textColor: 'text-slate-700',
        priceColor: 'text-slate-900',
        subColor: 'text-slate-400',
        iconBg: 'bg-slate-50 border-dashed border-slate-200',
        iconColor: 'text-primary',
        checkIcon: 'check_circle',
        checkColor: 'text-primary',
        cta: 'Go Pro',
        ctaStyle: 'bg-slate-50 border-2 border-gray-800 text-slate-700 hover:bg-white hover:shadow-md',
        features: [
            { text: 'Everything in Starter', bold: true },
            { text: '50 AI presentation builds per day' },
            { text: '150 AI writes & Shakespeare rewrites / day' },
            { text: 'AI quiz generator from your notes', bold: true },
            { text: '10 auto note generations / day — works while you sleep' },
            { text: 'Scholar AI — 500 research pages / month', bold: true },
            { text: 'Smart study reminders & daily nudges' },
            { text: 'Auto note summaries on save' },
            { text: 'Early access to new features' },
        ],
    },
    {
        key: 'premium',
        name: 'Premium',
        icon: 'workspace_premium',
        fallbackMonthly: 13.60,
        fallbackYearly: 9.34,
        fallbackYearlyBilled: 111.99,
        tag: { text: 'Best Value!', cls: 'bg-yellow-300 text-yellow-900 border-yellow-400' },
        cardBg: 'bg-[#F1F3F5]',
        cardBorder: 'border-purple-200/50',
        edge: 'organic-edge-purple',
        textColor: 'text-indigo-900',
        priceColor: 'text-indigo-900',
        subColor: 'text-indigo-700/60',
        iconBg: 'bg-white/60 border-white/80',
        iconColor: 'text-yellow-600',
        checkIcon: 'done_all',
        checkColor: 'text-primary',
        cta: 'Go Premium',
        ctaStyle: 'bg-white border-2  border-indigo-400  text-indigo-900 shadow-md hover:shadow-xl',
        features: [
            { text: 'Everything in Pro', bold: true },
            { text: 'Unlimited AI presentations', bold: true },
            { text: 'Unlimited AI writes & Shakespeare rewrites', bold: true },
            { text: 'Auto note generation — works while you sleep', bold: true },
            { text: 'Unlimited Scholar AI research papers', bold: true },
            { text: 'Personalised AI study plans' },
            { text: 'Auto flashcard generation from notes' },
            { text: 'All future AI features — first access' },
        ],
    },
]

const TEAM_FEATURES = [
    { text: '5 user seats — owner invites by email', bold: true },
    { text: 'Everything in Premium for all 5 members', bold: true },
    { text: 'Shared workspace & library' },
    { text: 'Team usage dashboard & admin controls' },
    { text: 'Centralised billing — one invoice' },
    { text: 'All future AI features for the whole team' },
]

const fmtFallback = (n) => n === 0 ? '$0' : `$${n % 1 === 0 ? n : n.toFixed(2)}`

// ── Pricing component ─────────────────────────────────────────────────────────
const Pricing = () => {
    const [annual, setAnnual] = useState(false)
    const [priceMap, setPriceMap] = useState({})
    const [pricesLoaded, setPricesLoaded] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        billingService.getPlans()
            .then(res => {
                const list = res?.data ?? res ?? []
                const map = {}
                list.forEach(p => { map[p.key] = p })
                setPriceMap(map)
                setPricesLoaded(true)
            })
            .catch(() => setPricesLoaded(true))
    }, [])

    const getPrice = (plan) => {
        const p = priceMap[plan.key]?.prices
        if (!p) return { display: null, billed: null }
        if (!annual) return { display: p.monthly, billed: null }
        const perMonth = p.yearly != null ? p.yearly / 12 : null
        return { display: perMonth, billed: p.yearly }
    }

    const symbol = priceMap['starter']?.symbol ?? '$'
    const fmtPrice = (n) => {
        if (n === 0) return `${symbol}0`
        return `${symbol}${Number.isInteger(n) ? n.toLocaleString() : n.toFixed(2)}`
    }

    const teamPrices = priceMap['team']?.prices ?? null

    const handleCta = (planKey) => {
        navigate('/signup', { state: { plan: planKey } })
    }

    return (
        <div className="pt-16 md:pt-32 pb-24 relative z-10">
            <div className="max-w-7xl mx-auto px-6 relative">

                {/* Header */}
                <div className="text-center space-y-6 mb-10 md:mb-20 relative">
                    <h1 className="text-2xl md:text-5xl lg:text-7xl font-bold font-serif text-slate-900 leading-tight">
                        Simple pricing for <br />
                        unlimited creativity.
                    </h1>
                    <p className="text-[14px] md:text-xl text-slate-600 max-w-2xl mx-auto font-normal">
                        Choose the plan that fits your study flow. Upgrade anytime to unlock the full power of AI.
                    </p>

                    {/* Billing toggle */}
                    <div className="flex flex-col items-center pt-4 md:pt-8">
                        <div className="flex items-center justify-center gap-3 md:gap-6 p-1 md:p-2 bg-slate-200/30 rounded-full border border-slate-200/50 switch-shadow">
                            <button
                                onClick={() => setAnnual(false)}
                                className={`text-[10px] md:text-smm font-medium md:font-bold uppercase tracking-widest px-4 transition-colors ${!annual ? 'text-slate-900' : 'text-slate-400'}`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setAnnual(v => !v)}
                                className="relative flex items-center w-10 h-5 md:w-20 md:h-10 bg-white rounded-full border-2 border-slate-200 shadow-sm p-1"
                            >
                                <div className={`absolute w-4 h-4 md:w-8 md:h-8 bg-primary rounded-full transition-all duration-300 shadow-md ${annual ? 'right-1' : 'left-1'}`} />
                            </button>
                            <button
                                onClick={() => setAnnual(true)}
                                className={`text-[10px] md:text-sm font-medium md:font-bold uppercase tracking-widest px-4 flex items-center gap-2 transition-colors ${annual ? 'text-slate-900' : 'text-slate-400'}`}
                            >
                                Annual
                                <span className="px-2 py-0.5 bg-accent-green text-white text-[8px] md:text-[10px] rounded-md rotate-2 shrink-0">
                                    Save ~30%
                                </span>
                            </button>
                        </div>
                        {annual && (
                            <p className="mt-1.5 md:mt-3 text-[9px] md:text-xs text-slate-400 font-medium">
                                Billed as one payment per year · Cancel anytime
                            </p>
                        )}
                    </div>
                </div>

                {/* 2 × 2 plan grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto relative px-4">
                    {PLANS.map((plan) => {
                        const { display: apiPrice, billed: apiBilled } = getPrice(plan)
                        const price = apiPrice !== null
                            ? apiPrice
                            : (annual && plan.fallbackYearly > 0 ? plan.fallbackYearly : plan.fallbackMonthly)
                        const billedYearly = apiBilled !== null
                            ? apiBilled
                            : (annual ? plan.fallbackYearlyBilled : null)

                        return (
                            <div
                                key={plan.key}
                                className={`relative ${plan.cardBg} p-6 md:p-12 card-shadow ${plan.edge} border ${plan.cardBorder} flex flex-col h-full transform transition-all hover:translate-y-[-4px]`}
                            >
                                {/* Decorative fold */}
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-5 md:w-24 md:h-10 bg-slate-100/60 border-x border-slate-200/40 rotate-1 opacity-60" />

                                {/* Tag badge */}
                                {plan.tag && (
                                    <div className={`absolute -top-4 right-10 px-4 py-2 text-xs font-black uppercase tracking-widest rotate-3 shadow-md border ${plan.tag.cls}`}>
                                        {plan.tag.text}
                                    </div>
                                )}

                                {/* Icon + name + price */}
                                <div className="mb-6 md:mb-8">
                                    <div className={`w-8 h-8 md:w-16 md:h-16 border-2 rounded-lg flex items-center justify-center mb-6 shadow-sm ${plan.iconBg}`}>
                                        <span className={`material-symbols-outlined text-2xl md:text-3xl ${plan.iconColor}`}>{plan.icon}</span>
                                    </div>
                                    <h3 className={`text-xl md:text-3xl font-semibold md:font-bold font-serif mb-2 ${plan.priceColor}`}>{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        {!pricesLoaded && plan.key !== 'free' ? (
                                            <div className="h-10 w-28 bg-slate-200/60 rounded-lg animate-pulse" />
                                        ) : (
                                            <>
                                                <span className={`text-4xl md:text-5xl font-bold font-serif transition-all ${plan.priceColor}`}>
                                                    {plan.key === 'free' ? (symbol === '$' ? '$0' : `${symbol}0`) : fmtPrice(Math.round(price))}
                                                </span>
                                                <span className={`font-medium md:font-bold uppercase tracking-tighter text-[12px] md:text-sm ${plan.subColor}`}>
                                                    {price === 0 ? 'forever free' : '/ month'}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    {annual && billedYearly > 0 && pricesLoaded && (
                                        <p className={`text-xs mt-1 font-medium ${plan.subColor}`}>
                                            Billed {fmtPrice(billedYearly)} / year
                                        </p>
                                    )}
                                </div>

                                {/* Features — always visible, no loading wait */}
                                <div className={`space-y-4 mb-6 md:mb-12 flex-grow ${plan.textColor}`}>
                                    {plan.features.map((f, i) => (
                                        <div key={i} className="flex items-start gap-4 text-[12px] md:text-base">
                                            <span className={`material-symbols-outlined shrink-0 ${plan.checkColor}`}>
                                                {plan.checkIcon}
                                            </span>
                                            <span className={f.bold ? 'font-medium md:font-bold' : 'font-normal md:font-medium'}>
                                                {f.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA */}
                                <div className="relative group">
                                    <button
                                        onClick={() => handleCta(plan.key)}
                                        className={`w-full py-2.5 px-3 md:py-5 md:px-6 font-medium md:font-black uppercase tracking-widest text-[12px] md:text-sm transition-all active:scale-95 rounded-sm ${plan.ctaStyle}`}
                                    >
                                        {plan.cta}
                                    </button>
                                    {plan.key !== 'free' && (
                                        <div className="absolute -bottom-5 md:-bottom-7 left-0 w-full text-center scribble-note text-indigo-500/60 text-[11px] md:text-sm">
                                            Cancel anytime with one click
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Team plan — full width card */}
                <div className="max-w-5xl mx-auto px-4 pt-8 md:mt-16">
                    <div className="relative bg-slate-900 p-10 md:p-12 card-shadow rounded-sm border border-slate-700 overflow-hidden">

                        {/* Background glow */}
                        <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                        <div className="relative z-10 flex flex-col md:flex-row md:items-start gap-10">

                            {/* Left — info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center">
                                        <span className="material-symbols-outlined text-yellow-400 text-2xl">groups</span>
                                    </div>
                                    <div className="absolute top-0 right-10 md:static mt-0">
                                        <span className="px-3 py-1 bg-yellow-400 text-yellow-900 text-[10px] font-black uppercase tracking-widest rounded-sm rotate-1 inline-block">
                                            Team
                                        </span>
                                    </div>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold font-serif text-white mt-4 mb-1">Study Together.</h3>
                                <p className="text-slate-400 text-[12px] md:text-sm mb-6 max-w-sm">
                                    One plan, five people. The owner invites teammates by email — everyone gets full Premium access billed as one.
                                </p>
                                <div className="flex items-baseline gap-1 mb-1">
                                    {!pricesLoaded ? (
                                        <div className="h-10 w-28 bg-white/10 rounded-lg animate-pulse" />
                                    ) : (
                                        <>
                                            <span className="text-4xl md:text-5xl font-bold font-serif text-white">
                                                {teamPrices
                                                    ? fmtPrice(Math.round(annual ? teamPrices.yearly / 12 : teamPrices.monthly))
                                                    : (annual ? '$26.60' : '$39.20')
                                                }
                                            </span>
                                            <span className="text-slate-400 font-bold uppercase tracking-tighter text-sm">/ month</span>
                                        </>
                                    )}
                                </div>
                                {annual && teamPrices?.yearly > 0 && pricesLoaded && (
                                    <p className="text-slate-500 text-xs font-medium mb-2">
                                        Billed {fmtPrice(teamPrices.yearly)} / year
                                    </p>
                                )}

                                <button
                                    onClick={() => handleCta('team')}
                                    className="mt-8 py-4 px-10 bg-white text-slate-900 font-black uppercase tracking-widest text-sm hover:bg-slate-100 active:scale-95 transition-all rounded-sm shadow-lg"
                                >
                                    Launch Team
                                </button>
                                <p className="mt-2 scribble-note text-slate-500 text-sm">Cancel anytime with one click</p>
                            </div>

                            {/* Right — features (always visible) */}
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {TEAM_FEATURES.map((f, i) => (
                                    <div key={i} className="flex items-start gap-3 text-[11px] md:text-[13px]">
                                        <span className="material-symbols-outlined text-primary shrink-0 text-[20px]">done_all</span>
                                        <span className={`text-sm ${f.bold ? 'font-medium md:font-bold text-white' : 'font-normal md:font-medium text-slate-300'}`}>
                                            {f.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer trust strip */}
                <div className="mt-16 md:mt-32 text-center relative">
                    <div className="absolute -top-12 left-1/4 sketch-annotation opacity-30">
                        <svg height="40" viewBox="0 0 120 40" width="120">
                            <path d="M10,20 C40,5 80,35 110,20" fill="none" stroke="currentColor" strokeWidth="1" />
                        </svg>
                    </div>
                    <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs mb-7 md:mb-12">
                        Trusted by students across universities
                    </p>
                    <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-30 grayscale contrast-125">
                        <div className="font-serif font-black text-xl md:text-2xl tracking-tighter italic">UNIVERSITY</div>
                        <div className="font-serif font-black text-xl md:text-2xl tracking-tighter italic">CREATIVE</div>
                        <div className="font-serif font-black  text-xl md:text-2xl tracking-tighter italic">STUDIO</div>
                        <div className="font-serif font-black  text-xl md:text-2xl tracking-tighter italic">ACADEMY</div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Pricing
