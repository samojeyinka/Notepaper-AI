import { Link } from 'react-router-dom';
import { usePlan } from '../../hooks/usePlan';

const PLAN_CONFIG = {
    free: {
        label: 'FREE PLAN',
        headline: 'Unlock AI Insights',
        sub: 'Get more AI writes, quizzes & slides',
        cta: 'Upgrade Plan',
        gradient: 'from-slate-600 to-slate-700',
        icon: 'bolt',
    },
    starter: {
        label: 'STARTER PLAN',
        headline: 'More Power Awaits',
        sub: 'Pro gives you 3× more AI writes daily',
        cta: 'Go to Pro',
        gradient: 'from-purple-500 to-indigo-600',
        icon: 'trending_up',
    },
    pro: {
        label: 'PRO PLAN',
        headline: 'Go Unlimited',
        sub: 'Premium removes every AI limit',
        cta: 'Try Premium',
        gradient: 'from-indigo-500 to-blue-600',
        icon: 'rocket_launch',
    },
    premium: {
        label: 'PREMIUM PLAN',
        headline: "You're Unstoppable",
        sub: 'Every AI feature is yours to keep',
        cta: null,
        gradient: 'from-amber-500 to-orange-500',
        icon: 'workspace_premium',
    },
    team: {
        label: 'TEAM PLAN',
        headline: 'Team Mode Active',
        sub: '5 seats · full Premium for everyone',
        cta: null,
        gradient: 'from-yellow-500 to-amber-500',
        icon: 'groups',
    },
};

export const SidebarPlanCard = () => {
    const { plan, loaded } = usePlan();

    if (!loaded) return null;

    const config = PLAN_CONFIG[plan] ?? PLAN_CONFIG.free;

    return (
        <div className="px-4 pb-2">
            <div className={`bg-gradient-to-br ${config.gradient} rounded-2xl p-3 text-white relative overflow-hidden group`}>
                <div className="relative z-10">
                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-70 mb-1">{config.label}</p>
                    <p className="font-semibold leading-tight text-[13px] mb-0.5">{config.headline}</p>
                    <p className="text-[10px] opacity-70 mb-2 leading-snug">{config.sub}</p>
                    {config.cta && (
                        <Link
                            to="/lockedin/upgrade"
                            className="inline-block bg-white/20 hover:bg-white/30 text-white text-[11px] font-semibold py-1 px-2.5 rounded-lg transition-all"
                        >
                            {config.cta}
                        </Link>
                    )}
                    {!config.cta && (
                        <Link
                            to="/lockedin/upgrade"
                            className="inline-block bg-white/10 hover:bg-white/20 text-white/80 text-[11px] py-1 px-2.5 rounded-lg transition-all"
                        >
                            Manage plan
                        </Link>
                    )}
                </div>
                <span className="material-icons-round absolute -right-3 -bottom-3 text-white/10 text-7xl group-hover:scale-110 transition-transform select-none">
                    {config.icon}
                </span>
            </div>
        </div>
    );
};
