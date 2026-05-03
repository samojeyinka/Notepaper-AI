import { useEffect, useState } from 'react';
import { billingService } from '../../api/billingService';
import { useBilling } from '../../hooks/useBilling';
import { usePlan } from '../../hooks/usePlan';

export const FeatureItem = ({ label }) => (
    <li className="flex items-center space-x-1">
        <span className="material-symbols-outlined text-yellow-300 text-[13px]">check_circle</span>
        <span className="text-sm font-normal text-[12px]">{label}</span>
    </li>
);

export const PriceCard = ({ period, isActive, discount, onClick }) => (
    <button
        onClick={onClick}
        className={`px-2 py-0.5 rounded-xl font-normal text-[10px] md:text-[12px] transition-all ${
            isActive ? 'bg-white text-slate-900 shadow-md' : 'text-white/80 hover:text-white'
        }`}
    >
        {period}
        {discount && (
            <span className="text-[10px] bg-green-500/30 text-green-300 px-2 py-0.5 rounded-full ml-1">
                {discount}
            </span>
        )}
    </button>
);

export const FeatureStatCard = ({ icon, iconColor, rotation }) => (
    <div className={`bg-white/10 backdrop-blur-md p-4 rounded-[2rem] border border-white/20 transform transition-all hover:rotate-0 ${rotation}`}>
        <div className={`w-10 h-10 ${iconColor} rounded-full mb-3 flex items-center justify-center`}>
            <span className="material-symbols-outlined text-white">{icon}</span>
        </div>
        <div className="h-2 w-12 bg-white/30 rounded-full mb-2" />
        <div className="h-2 w-full bg-white/10 rounded-full" />
    </div>
);

// What to show based on current plan — targets the next sensible upgrade
const UPGRADE_CONFIG = {
    free: {
        targetPlan: 'starter',
        headline: 'Level up your study game',
        sub: 'More AI writes, smarter presentations, and full PDF export — starting today.',
        features: ['20 AI presentation builds / day', '50 AI writes / day', 'Full PDF & PPTX export'],
        cta: 'Get Starter',
        ctaColor: 'bg-purple-500 hover:bg-purple-600 shadow-purple-500/20',
        cards: [
            { icon: 'psychology',    iconColor: 'bg-yellow-400', rotation: '-rotate-3' },
            { icon: 'data_saver_on', iconColor: 'bg-green-400',  rotation: 'rotate-6 translate-y-8' },
            { icon: 'draw',          iconColor: 'bg-purple-400', rotation: '-translate-y-4' },
        ],
    },
    starter: {
        targetPlan: 'pro',
        headline: 'Ready for more? Upgrade to Pro',
        sub: '3× more AI writes, quiz generator from your notes, and smart study reminders.',
        features: ['50 AI presentation builds / day', '150 AI writes / day', 'AI quiz generator from notes'],
        cta: 'Upgrade to Pro',
        ctaColor: 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20',
        cards: [
            { icon: 'quiz',          iconColor: 'bg-blue-400',   rotation: '-rotate-3' },
            { icon: 'trending_up',   iconColor: 'bg-indigo-400', rotation: 'rotate-6 translate-y-8' },
            { icon: 'notifications', iconColor: 'bg-purple-400', rotation: '-translate-y-4' },
        ],
    },
    pro: {
        targetPlan: 'premium',
        headline: 'Go unlimited with Premium',
        sub: 'No caps on AI writes, presentations, or note generation — ever.',
        features: ['Unlimited AI presentations', 'Unlimited AI writes', 'Personalised AI study plans'],
        cta: 'Try Premium',
        ctaColor: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20',
        cards: [
            { icon: 'all_inclusive',     iconColor: 'bg-amber-400',  rotation: '-rotate-3' },
            { icon: 'workspace_premium', iconColor: 'bg-orange-400', rotation: 'rotate-6 translate-y-8' },
            { icon: 'auto_stories',      iconColor: 'bg-yellow-400', rotation: '-translate-y-4' },
        ],
    },
};

const fmt = (n, symbol = '₦') => {
    if (!n) return `${symbol}0`;
    return `${symbol}${Number.isInteger(n) ? n.toLocaleString() : n.toFixed(2)}`;
};

const ElevateProSection = () => {
    const { plan, loaded }              = usePlan();
    const { subscribe, loading }        = useBilling();
    const [interval, setInterval]       = useState('monthly');
    const [isVisible, setIsVisible]     = useState(true);
    const [planData, setPlanData]       = useState(null);

    const config = UPGRADE_CONFIG[plan];

    useEffect(() => {
        if (!config) return;
        billingService.getPlans()
            .then(res => {
                const plans = res?.data ?? res ?? [];
                const target = plans.find(p => p.key === config.targetPlan);
                if (target) setPlanData(target);
            })
            .catch(() => {});
    }, [config]);

    // Hide for premium, team, or if dismissed
    if (!loaded || !config || !isVisible) return null;

    const symbol   = planData?.symbol ?? '₦';
    const currency = planData?.currency ?? 'ngn';
    const price    = planData?.prices?.[interval] ?? null;

    const handleCta = () => subscribe(config.targetPlan, interval, currency);

    return (
        <section className="mb-6 lg:mb-8 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-4 sm:p-6 text-white relative overflow-hidden">
            {/* Close */}
            <button
                onClick={() => setIsVisible(false)}
                className="absolute top-4 right-4 z-20 p-1.5 hover:bg-white/10 rounded-lg transition-colors group"
                aria-label="Close"
            >
                <span className="material-icons-round text-white/60 group-hover:text-white text-xl">close</span>
            </button>

            {/* Background blurs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 opacity-20 blur-3xl -z-0" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-400 opacity-20 blur-3xl -z-0" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
                {/* Left */}
                <div className="max-w-md w-full">
                    <h2 className="text-[16px] md:text-lg font-semibold mb-2 leading-tight">
                        {config.headline}
                    </h2>
                    <p className="text-white/70 mb-4 leading-relaxed text-[12px] md:text-[13px]">
                        {config.sub}
                    </p>

                    {/* Interval toggle */}
                    <div className="flex items-center space-x-2 bg-white/10 p-1.5 rounded-2xl w-fit mb-4 border border-white/20">
                        <PriceCard
                            period="Monthly"
                            isActive={interval === 'monthly'}
                            onClick={() => setInterval('monthly')}
                        />
                        <PriceCard
                            period="Yearly"
                            isActive={interval === 'yearly'}
                            discount="~30% off"
                            onClick={() => setInterval('yearly')}
                        />
                    </div>

                    {/* Price */}
                    {price !== null && (
                        <p className="text-white/60 text-[11px] mb-3">
                            {fmt(price, symbol)}
                            <span className="ml-1">{interval === 'yearly' ? '/ mo, billed yearly' : '/ month'}</span>
                        </p>
                    )}

                    {/* Features */}
                    <ul className="space-y-2 mb-4">
                        {config.features.map((f, i) => (
                            <FeatureItem key={i} label={f} />
                        ))}
                    </ul>

                    {/* CTA */}
                    <button
                        onClick={handleCta}
                        disabled={loading}
                        className={`${config.ctaColor} text-white px-8 sm:px-10 py-2 rounded-xl font-medium text-sm shadow-xl transition-all flex items-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                        {loading ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>{config.cta}</span>
                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Right — decorative cards */}
                <div className="relative w-full max-w-sm lg:max-w-none hidden md:block">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full lg:w-80 xl:w-96 mx-auto">
                        {config.cards.map((card, i) => (
                            <FeatureStatCard key={i} {...card} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ElevateProSection;
