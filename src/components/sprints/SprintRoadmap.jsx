import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Sound Engine ──────────────────────────────────────────────────────────────
const createSound = (ctx, type) => {
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);

    if (type === 'select') {
        const osc = ctx.createOscillator();
        osc.connect(gain);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.06);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
    } else if (type === 'start') {
        [392, 523.25, 659.25].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            osc.connect(gain);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.09);
            gain.gain.setValueAtTime(0.22, now + i * 0.09);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.18);
            osc.start(now + i * 0.09);
            osc.stop(now + i * 0.09 + 0.18);
        });
    }
};

const playSound = (() => {
    let ctx = null;
    return (type) => {
        try {
            if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
            if (ctx.state === 'suspended') ctx.resume();
            createSound(ctx, type);
        } catch (_) {}
    };
})();

// ─────────────────────────────────────────────────────────────────────────────
const COMPONENT_META = {
    quiz:        { label: 'Quiz',         icon: 'quiz',                 color: 'text-violet-600', bg: 'bg-violet-100' },
    concept:     { label: 'Concepts',     icon: 'lightbulb',            color: 'text-amber-600',  bg: 'bg-amber-100'  },
    quickpoints: { label: 'Quick Points', icon: 'format_list_bulleted', color: 'text-blue-600',   bg: 'bg-blue-100'   },
    reading:     { label: 'Read',         icon: 'auto_stories',         color: 'text-teal-600',   bg: 'bg-teal-100'   },
};

const ZIGZAG = ['translate-x-0', 'translate-x-16', 'translate-x-16', 'translate-x-0', '-translate-x-16', '-translate-x-16'];

const fmtDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const sv = (s) => (s && typeof s === 'object' ? s.value : s);

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const cfg = {
        completed: { label: 'Completed',   cls: 'bg-emerald-100 text-emerald-700', icon: 'check_circle'  },
        active:    { label: 'In Progress', cls: 'bg-primary/10 text-primary',      icon: 'bolt'          },
        ready:     { label: 'Ready',       cls: 'bg-slate-100 text-slate-600',     icon: 'lock_open'     },
        locked:    { label: 'Locked',      cls: 'bg-slate-100 text-slate-400',     icon: 'lock'          },
    }[status] ?? { label: status, cls: 'bg-slate-100 text-slate-500', icon: 'help' };

    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${cfg.cls}`}>
            <span className="material-icons-round text-[11px]">{cfg.icon}</span>
            {cfg.label}
        </span>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
const SprintRoadmap = ({ sprint }) => {
    const navigate     = useNavigate();
    const [selectedId, setSelectedId] = useState(null);

    const challenges = sprint.challenges ?? [];
    const total      = challenges.length || (sprint.challenges_count ?? 0);
    const completed  = challenges.filter(c => sv(c.status) === 'completed').length;
    const pct        = total > 0 ? Math.round((completed / total) * 100) : 0;
    const isFinished = pct === 100 && total > 0;

    const selected = challenges.find(c => c.id === selectedId) ?? null;

    const toggleSelect = (id) => {
        playSound('select');
        setSelectedId(prev => prev === id ? null : id);
    };

    const handleOpenChallenge = (challenge) => {
        if (sv(challenge.status) === 'locked') return;
        playSound('start');
        navigate(`/lockedin/sprints/${sprint.id}/challenges/${challenge.id}`);
    };

    return (
        <div className="flex-1 lg:ml-64 min-w-0 flex flex-col h-screen overflow-hidden" style={{ background: '#F8F9FA' }}>

            {/* ── Header ── */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-100 px-4 md:px-8 pt-16 lg:pt-4 pb-4">
                <div className="flex items-center gap-4 mb-3 mt-3 md:mt-0">
                    <button onClick={() => navigate('/lockedin/sprints')}
                        className="w-6 h-6 md:w-9 md:h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors shrink-0">
                        <span className="material-icons-round text-[15px] md:text-[18px]">arrow_back</span>
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-[15px] md:text-lg font-semibold text-slate-900 truncate">{sprint.title}</h1>
                        <p className="text-[11px] text-slate-400">{fmtDate(sprint.start_date)} – {fmtDate(sprint.end_date)}</p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-[20px] font-bold text-primary leading-none">{pct}%</p>
                        <p className="text-[10px] text-slate-400">{completed}/{total} done</p>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="h-1 md:h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                        style={{
                            width: `${pct}%`,
                            background: isFinished
                                ? 'linear-gradient(90deg,#10b981,#059669)'
                                : 'linear-gradient(90deg, var(--color-primary,#7c3aed), #818cf8)',
                            boxShadow: pct > 0 ? '0 0 12px rgba(124,58,237,0.35)' : 'none',
                        }}
                    />
                </div>

                {/* Stats chips */}
                {total > 0 && (
                    <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                        {completed > 0 && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-semibold">
                                <span className="material-icons-round text-[11px]">check_circle</span>
                                {completed} completed
                            </span>
                        )}
                        {total - completed > 0 && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-semibold">
                                <span className="material-icons-round text-[11px]">radio_button_unchecked</span>
                                {total - completed} remaining
                            </span>
                        )}
                        {isFinished && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-semibold">
                                <span className="material-icons-round text-[11px]">emoji_events</span>
                                Sprint complete!
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="flex flex-1 min-h-0">

                {/* ── Roadmap path ── */}
                <div className="flex-1 overflow-y-auto p-4 pt-10 pb-32">
                    <div className="relative flex flex-col items-center" style={{ maxWidth: 340, margin: '0 auto' }}>

                        {/* Progress-colored connector line */}
                        <div className="absolute top-8 bottom-8 left-1/2 w-1 -translate-x-1/2 rounded-full overflow-hidden">
                            <div className="w-full rounded-full transition-all duration-700"
                                style={{
                                    height: `${pct}%`,
                                    background: 'linear-gradient(to bottom,#10b981,#34d399)',
                                }}
                            />
                            <div className="w-full" style={{ height: `${100 - pct}%`, background: '#e2e8f0' }} />
                        </div>

                        {challenges.map((challenge, idx) => {
                            const status       = sv(challenge.status);
                            const isAccessible = status !== 'locked';
                            const isSelected   = selectedId === challenge.id;
                            const zigzag       = ZIGZAG[idx % ZIGZAG.length];
                            const typeMeta     = COMPONENT_META[challenge.type] ?? COMPONENT_META.concept;

                            const nodeCfg = {
                                completed: {
                                    bg:     'linear-gradient(135deg,#10b981,#059669)',
                                    ring:   'ring-emerald-300',
                                    shadow: 'shadow-emerald-200',
                                    pulse:  false,
                                },
                                active: {
                                    bg:     'linear-gradient(135deg,var(--color-primary,#7c3aed),#818cf8)',
                                    ring:   'ring-primary/40',
                                    shadow: 'shadow-primary/30',
                                    pulse:  true,
                                },
                                ready: {
                                    bg:     '#ffffff',
                                    ring:   'ring-slate-200',
                                    shadow: 'shadow-slate-200/80',
                                    pulse:  false,
                                },
                                locked: {
                                    bg:     '#f1f5f9',
                                    ring:   'ring-slate-200',
                                    shadow: '',
                                    pulse:  false,
                                },
                            }[status] ?? { bg: '#f1f5f9', ring: 'ring-slate-200', shadow: '', pulse: false };

                            return (
                                <div key={challenge.id} className="relative z-10 w-full flex flex-col items-center">
                                    {idx > 0 && (
                                        <div className={`w-2 h-2 rounded-full my-1 transition-colors ${
                                            status === 'completed' ? 'bg-emerald-400' :
                                            isAccessible ? 'bg-primary/30' : 'bg-slate-200'
                                        }`} />
                                    )}

                                    <div className={`transform ${zigzag} transition-transform duration-300`}>
                                        <div className="flex flex-col items-center">
                                            <button
                                                onClick={() => isAccessible && toggleSelect(challenge.id)}
                                                disabled={!isAccessible}
                                                className={`relative w-[72px] h-[72px] rounded-full ring-4 ${nodeCfg.ring} flex items-center justify-center transition-all duration-200
                                                    ${isAccessible
                                                        ? `cursor-pointer hover:scale-110 active:scale-95 shadow-lg ${nodeCfg.shadow}`
                                                        : 'cursor-default opacity-50'
                                                    }
                                                    ${isSelected ? 'scale-110 shadow-xl ring-primary/60' : ''}
                                                `}
                                                style={{ background: nodeCfg.bg }}
                                            >
                                                {/* Active pulse rings */}
                                                {nodeCfg.pulse && (
                                                    <>
                                                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                                                        <div className="absolute inset-[-6px] rounded-full border-2 border-primary/20 animate-pulse" />
                                                    </>
                                                )}

                                                {status === 'completed' && <span className="material-icons-round text-white text-[26px]">check</span>}
                                                {status === 'active'    && <span className="material-icons-round text-white text-[26px]">bolt</span>}
                                                {status === 'ready'     && <span className={`material-icons-round text-[22px] ${typeMeta.color}`}>{typeMeta.icon}</span>}
                                                {status === 'locked'    && <span className="material-icons-round text-slate-400 text-[20px]">lock</span>}

                                                {/* Type badge for completed nodes */}
                                                {status === 'completed' && (
                                                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${typeMeta.bg} border-2 border-white flex items-center justify-center shadow-sm`}>
                                                        <span className={`material-icons-round text-[11px] ${typeMeta.color}`}>{typeMeta.icon}</span>
                                                    </div>
                                                )}
                                            </button>

                                            {/* Label */}
                                            <div className="flex flex-col items-center mt-2">
                                                <p className={`text-[10px] font-bold leading-none ${
                                                    status === 'locked'    ? 'text-slate-300' :
                                                    status === 'completed' ? 'text-emerald-500' :
                                                    status === 'active'    ? 'text-primary' : 'text-slate-500'
                                                }`}>
                                                    {String(challenge.challenge_order).padStart(2, '0')}
                                                </p>
                                                <p className={`text-[10px] font-medium text-center mt-0.5 max-w-[84px] leading-tight line-clamp-2 ${
                                                    status === 'locked' ? 'text-slate-300' : 'text-slate-500'
                                                }`}>
                                                    {challenge.title}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile expanded panel */}
                                    {isSelected && (
                                        <div className="lg:hidden mt-4 w-72 bg-white rounded-2xl p-5 shadow-xl border border-slate-100 text-left z-20 animate-[fadeIn_0.15s_ease]">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                                                            Challenge {challenge.challenge_order}
                                                        </p>
                                                        <StatusBadge status={status} />
                                                    </div>
                                                    <h3 className="text-[15px] font-semibold text-slate-900 leading-snug">{challenge.title}</h3>
                                                </div>
                                                <button onClick={() => setSelectedId(null)}
                                                    className="text-slate-400 hover:text-slate-600 transition-colors ml-2 mt-0.5 shrink-0">
                                                    <span className="material-icons-round text-[18px]">close</span>
                                                </button>
                                            </div>
                                            <p className="text-[12px] text-slate-500 leading-relaxed mb-3">{challenge.description}</p>
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${typeMeta.bg} ${typeMeta.color} mb-4`}>
                                                <span className="material-icons-round text-[12px]">{typeMeta.icon}</span>
                                                {typeMeta.label}
                                            </div>
                                            <button onClick={() => handleOpenChallenge(challenge)}
                                                className={`w-full py-2 text-white rounded-md font-medium text-[13px] transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md ${
                                                    status === 'completed'
                                                        ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'
                                                        : 'bg-primary hover:bg-primary/90 shadow-primary/20'
                                                }`}>
                                                <span className="material-icons-round text-[16px]">
                                                    {status === 'completed' ? 'replay' : 'play_arrow'}
                                                </span>
                                                {status === 'completed' ? 'Review' : 'Start Challenge'}
                                            </button>
                                        </div>
                                    )}

                                    <div className="h-2" />
                                </div>
                            );
                        })}

                        {/* Finish flag */}
                        <div className="relative z-10 mt-2 flex flex-col items-center">
                            <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center shadow-sm transition-all duration-500 ${
                                isFinished ? 'bg-amber-50 border-amber-300 shadow-amber-200' : 'bg-white border-slate-200'
                            }`}>
                                <span className={`material-icons-round text-[24px] transition-colors ${isFinished ? 'text-amber-500' : 'text-slate-300'}`}>
                                    {isFinished ? 'emoji_events' : 'flag'}
                                </span>
                            </div>
                            <p className={`text-[10px] font-semibold mt-1.5 ${isFinished ? 'text-amber-500' : 'text-slate-300'}`}>
                                {isFinished ? 'Sprint Complete!' : fmtDate(sprint.end_date)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="hidden lg:flex border-l border-slate-100 flex-col shrink-0 overflow-hidden"
                    style={{ background: '#fff', width: 360, height: '100%' }}>
                    {selected ? (
                        <div className="flex flex-col h-full">
                            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                            <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                                                Challenge {selected.challenge_order}
                                            </p>
                                            <StatusBadge status={sv(selected.status)} />
                                        </div>
                                        <h2 className="text-[18px] font-semibold text-slate-900 leading-snug">{selected.title}</h2>
                                    </div>
                                    <button onClick={() => setSelectedId(null)}
                                        className="text-slate-400 hover:text-slate-600 transition-colors mt-0.5 shrink-0 ml-3">
                                        <span className="material-icons-round text-[20px]">close</span>
                                    </button>
                                </div>

                                <p className="text-[13px] text-slate-500 leading-relaxed mb-5">{selected.description}</p>

                                {(() => {
                                    const m = COMPONENT_META[selected.type] ?? COMPONENT_META.concept;
                                    return (
                                        <div className={`flex items-center gap-3 p-3 rounded-lg mb-5 ${m.bg}`}>
                                            <div className={`w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center shadow-sm`}>
                                                <span className={`material-icons-round text-[20px] ${m.color}`}>{m.icon}</span>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Challenge type</p>
                                                <p className={`text-[14px] font-semibold ${m.color}`}>{m.label}</p>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            <div className="p-6 pt-0 border-t border-slate-50 mt-auto">
                                <button onClick={() => handleOpenChallenge(selected)}
                                    className={`w-full py-2 text-white rounded-md font-medium text-[13px] transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg ${
                                        sv(selected.status) === 'completed'
                                            ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'
                                            : 'bg-primary hover:bg-primary/90 shadow-primary/25'
                                    }`}>
                                    <span className="material-icons-round text-[20px]">
                                        {sv(selected.status) === 'completed' ? 'replay' : 'play_arrow'}
                                    </span>
                                    {sv(selected.status) === 'completed' ? 'Review Challenge' : 'Start Challenge'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                                <span className="material-icons-round text-primary text-[28px]">touch_app</span>
                            </div>
                            <p className="text-[15px] font-semibold text-slate-700 mb-1">Select a challenge</p>
                            <p className="text-[12px] text-slate-400 leading-relaxed">Tap any unlocked node on the roadmap to see what's inside</p>

                            <div className="mt-8 w-full space-y-2">
                                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl">
                                    <span className="text-[12px] text-slate-500 font-medium flex items-center gap-1.5">
                                        <span className="material-icons-round text-[14px] text-emerald-500">check_circle</span>
                                        Completed
                                    </span>
                                    <span className="text-[13px] font-bold text-slate-800">{completed}/{total}</span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl">
                                    <span className="text-[12px] text-slate-500 font-medium flex items-center gap-1.5">
                                        <span className="material-icons-round text-[14px] text-primary">bar_chart</span>
                                        Progress
                                    </span>
                                    <span className="text-[13px] font-bold text-slate-800">{pct}%</span>
                                </div>
                                {sprint.end_date && (
                                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl">
                                        <span className="text-[12px] text-slate-500 font-medium flex items-center gap-1.5">
                                            <span className="material-icons-round text-[14px] text-slate-400">calendar_today</span>
                                            Ends
                                        </span>
                                        <span className="text-[13px] font-bold text-slate-800">{fmtDate(sprint.end_date)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default SprintRoadmap;
