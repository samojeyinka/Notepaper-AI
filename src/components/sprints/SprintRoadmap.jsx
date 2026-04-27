import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const COMPONENT_META = {
    quiz:        { label: 'Quiz',         icon: 'quiz',                 color: 'text-violet-600', bg: 'bg-violet-100'  },
    concept:     { label: 'Concepts',     icon: 'lightbulb',            color: 'text-amber-600',  bg: 'bg-amber-100'   },
    quickpoints: { label: 'Quick Points', icon: 'format_list_bulleted', color: 'text-blue-600',   bg: 'bg-blue-100'    },
    reading:     { label: 'Read',         icon: 'auto_stories',         color: 'text-teal-600',   bg: 'bg-teal-100'    },
};

// Zigzag positions — cycles every 6 nodes
const ZIGZAG = ['translate-x-0', 'translate-x-14', 'translate-x-14', 'translate-x-0', '-translate-x-14', '-translate-x-14'];

const fmtDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Handles both plain string status and backed-enum objects from the API
const sv = (s) => (s && typeof s === 'object' ? s.value : s);

const SprintRoadmap = ({ sprint }) => {
    const navigate    = useNavigate();
    const [selectedId, setSelectedId] = useState(null);

    const challenges = sprint.challenges ?? [];
    const total      = challenges.length || (sprint.challenges_count ?? 0);
    const completed  = challenges.filter(c => sv(c.status) === 'completed').length;
    const pct        = total > 0 ? Math.round((completed / total) * 100) : 0;

    const selected = challenges.find(c => c.id === selectedId) ?? null;

    const toggleSelect = (id) => setSelectedId(prev => prev === id ? null : id);

    const handleOpenChallenge = (challenge) => {
        if (sv(challenge.status) === 'locked') return;
        navigate(`/lockedin/sprints/${sprint.id}/challenges/${challenge.id}`);
    };

    return (
        <div className="flex-1 lg:ml-64 min-w-0 flex flex-col" style={{ background: '#F8F9FA', minHeight: '100vh' }}>

            {/* Header */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-100 px-4 md:px-8 pt-16 lg:pt-4 pb-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/lockedin/sprints')} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors shrink-0">
                        <span className="material-icons-round text-[18px]">arrow_back</span>
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-[15px] md:text-lg font-semibold text-slate-900 truncate">{sprint.title}</h1>
                        <p className="text-[11px] text-slate-400">
                            {fmtDate(sprint.start_date)} – {fmtDate(sprint.end_date)} · {completed}/{total} challenges done
                        </p>
                    </div>
                    <span className="text-[12px] font-semibold text-primary shrink-0">{pct}%</span>
                </div>
                <div className="mt-3 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary via-indigo-400 to-primary rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                </div>
            </div>

            <div className="flex flex-1 min-h-0">

                {/* ── Roadmap path ── */}
                <div className="flex-1 overflow-y-auto p-4 pt-10 pb-32">
                    <div className="relative flex flex-col items-center" style={{ maxWidth: 320, margin: '0 auto' }}>

                        <div className="absolute top-8 bottom-8 left-1/2 w-0.5 -translate-x-1/2 bg-slate-200 rounded-full" />

                        {challenges.map((challenge, idx) => {
                            const status       = sv(challenge.status);
                            const isAccessible = status !== 'locked';
                            const isSelected   = selectedId === challenge.id;
                            const zigzag       = ZIGZAG[idx % ZIGZAG.length];
                            const typeMeta     = COMPONENT_META[challenge.type] ?? COMPONENT_META.concept;

                            const nodeCfg = {
                                completed: { ring: 'ring-emerald-400', bg: 'bg-emerald-500', pulse: false },
                                active:    { ring: 'ring-primary',     bg: 'bg-primary',     pulse: true  },
                                ready:     { ring: 'ring-primary/40',  bg: 'bg-white',       pulse: false },
                                locked:    { ring: 'ring-slate-200',   bg: 'bg-slate-100',   pulse: false },
                            }[status] ?? { ring: 'ring-slate-200', bg: 'bg-slate-100', pulse: false };

                            return (
                                <div key={challenge.id} className="relative z-10 w-full flex flex-col items-center">
                                    {idx > 0 && (
                                        <div className={`w-1.5 h-1.5 rounded-full my-1 transition-colors ${isAccessible ? 'bg-primary/40' : 'bg-slate-200'}`} />
                                    )}

                                    <div className={`transform ${zigzag} transition-transform duration-300`}>
                                        <div className="flex flex-col items-center">
                                            <button
                                                onClick={() => isAccessible && toggleSelect(challenge.id)}
                                                disabled={!isAccessible}
                                                className={`relative w-16 h-16 rounded-full ring-4 ${nodeCfg.ring} ${nodeCfg.bg} flex items-center justify-center transition-all duration-200
                                                    ${isAccessible ? 'cursor-pointer hover:scale-110 active:scale-95 shadow-lg' : 'cursor-default opacity-60'}
                                                    ${isSelected ? 'scale-110 shadow-xl shadow-primary/30' : ''}
                                                `}
                                            >
                                                {nodeCfg.pulse && <div className="absolute inset-0 rounded-full bg-primary/25 animate-ping" />}

                                                {status === 'completed' && <span className="material-icons-round text-white text-[22px]">check</span>}
                                                {status === 'active'    && <span className="material-icons-round text-white text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>}
                                                {status === 'ready'     && <span className={`material-icons-round text-[18px] ${typeMeta.color}`}>{typeMeta.icon}</span>}
                                                {status === 'locked'    && <span className="material-icons-round text-slate-400 text-[18px]">lock</span>}
                                            </button>

                                            <p className={`text-[11px] font-bold mt-1.5 ${status === 'locked' ? 'text-slate-300' : 'text-slate-600'}`}>
                                                {challenge.challenge_order}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Inline expanded panel (mobile) */}
                                    {isSelected && (
                                        <div className="lg:hidden mt-3 w-72 bg-white rounded-2xl p-5 shadow-lg border border-slate-100 text-left z-20 animate-[fadeIn_0.15s_ease]">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-0.5">Challenge {challenge.challenge_order}</p>
                                                    <h3 className="text-[15px] font-semibold text-slate-900">{challenge.title}</h3>
                                                </div>
                                                <button onClick={() => setSelectedId(null)} className="text-slate-400 hover:text-slate-600 transition-colors ml-2 mt-0.5 shrink-0">
                                                    <span className="material-icons-round text-[18px]">close</span>
                                                </button>
                                            </div>
                                            <p className="text-[12px] text-slate-500 leading-relaxed mb-3">{challenge.description}</p>
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${typeMeta.bg} ${typeMeta.color} mb-4`}>
                                                <span className="material-icons-round text-[12px]">{typeMeta.icon}</span>
                                                {typeMeta.label}
                                            </div>
                                            <button onClick={() => handleOpenChallenge(challenge)}
                                                className="w-full py-2.5 bg-primary text-white rounded-xl font-semibold text-[13px] hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-2">
                                                <span className="material-icons-round text-[16px]">play_arrow</span>
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
                            <div className="w-12 h-12 rounded-full bg-white border-4 border-slate-200 flex items-center justify-center shadow-sm">
                                <span className="material-icons-round text-slate-300 text-[20px]">flag</span>
                            </div>
                            <p className="text-[10px] text-slate-300 font-semibold mt-1.5">{fmtDate(sprint.end_date)}</p>
                        </div>
                    </div>
                </div>

                {/* ── Desktop right panel ── */}
                <div className="hidden lg:flex w-88 xl:w-96 border-l border-slate-100 flex-col p-6 overflow-y-auto shrink-0" style={{ background: '#fff', width: 360 }}>
                    {selected ? (
                        <>
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-0.5">Challenge {selected.challenge_order}</p>
                                    <h2 className="text-[18px] font-semibold text-slate-900 leading-snug">{selected.title}</h2>
                                </div>
                                <button onClick={() => setSelectedId(null)} className="text-slate-400 hover:text-slate-600 transition-colors mt-0.5 shrink-0 ml-3">
                                    <span className="material-icons-round text-[20px]">close</span>
                                </button>
                            </div>

                            <p className="text-[13px] text-slate-500 leading-relaxed mb-6">{selected.description}</p>

                            {(() => {
                                const m = COMPONENT_META[selected.type] ?? COMPONENT_META.concept;
                                return (
                                    <div className={`flex items-center gap-3 p-3 rounded-xl mb-6 ${m.bg}`}>
                                        <span className={`material-icons-round text-[18px] ${m.color}`}>{m.icon}</span>
                                        <span className={`text-[13px] font-semibold ${m.color}`}>{m.label}</span>
                                    </div>
                                );
                            })()}

                            <button onClick={() => handleOpenChallenge(selected)}
                                className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-[14px] hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md shadow-primary/20 mt-auto">
                                <span className="material-icons-round text-[18px]">play_arrow</span>
                                {sv(selected.status) === 'completed' ? 'Review Challenge' : 'Start Challenge'}
                            </button>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                                <span className="material-icons-round text-primary text-[28px]">touch_app</span>
                            </div>
                            <p className="text-[14px] font-semibold text-slate-700 mb-1">Select a challenge</p>
                            <p className="text-[12px] text-slate-400 leading-relaxed">Tap any unlocked node on the roadmap to see what's inside</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
};

export default SprintRoadmap;
