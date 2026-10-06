import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationIcon from '../user/NotificationIcon';

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
        } catch { /* audio is best-effort */ }
    };
})();

// ─────────────────────────────────────────────────────────────────────────────
const COMPONENT_META = {
    quiz:        { label: 'Quiz',         icon: 'quiz',                 color: 'text-plum-700',  bg: 'bg-plum-100'  },
    concept:     { label: 'Concepts',     icon: 'lightbulb',            color: 'text-amber-700', bg: 'bg-amber-100' },
    quickpoints: { label: 'Quick Points', icon: 'format_list_bulleted', color: 'text-sky-700',   bg: 'bg-sky-100'   },
    reading:     { label: 'Read',         icon: 'auto_stories',         color: 'text-teal-700',  bg: 'bg-teal-100'  },
};

const DISC_CLS = {
    completed: 'border-emerald-300 bg-emerald-50',
    active:    'border-plum-400 bg-plum-50',
    ready:     'border-stone-200 bg-white',
    locked:    'border-stone-200 bg-stone-50',
};

const NODE = 56;      // disc size — w-14 h-14
const HALF = NODE / 2;
const GAP  = 56;      // breathing room between a row's labels and the next row's nodes

const colCount = (w) => (w < 640 ? 2 : w < 1280 ? 3 : 4);

const lineCls = (step, finished) => {
    if (step.isFinish) return finished ? 'bg-amber-300' : 'bg-stone-300';
    const s = sv(step.status);
    if (s === 'completed') return 'bg-emerald-400';
    if (s === 'active')    return 'bg-plum-400';
    return 'bg-stone-300';
};

const fmtDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const sv = (s) => (s && typeof s === 'object' ? s.value : s);

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const cfg = {
        completed: { label: 'Done',        cls: 'bg-emerald-50 text-emerald-700', icon: 'check_circle' },
        active:    { label: 'In Progress', cls: 'bg-plum-50 text-plum-700',       icon: 'bolt'         },
        ready:     { label: 'Ready',       cls: 'bg-stone-100 text-stone-600',    icon: 'lock_open'    },
        locked:    { label: 'Locked',      cls: 'bg-stone-100 text-stone-400',    icon: 'lock'         },
    }[status] ?? { label: status, cls: 'bg-stone-100 text-stone-500', icon: 'help' };

    return (
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${cfg.cls}`}>
            <span className="material-icons-round text-[10px]">{cfg.icon}</span>
            {cfg.label}
        </span>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
const SprintRoadmap = ({ sprint }) => {
    const navigate     = useNavigate();
    const [selectedId, setSelectedId] = useState(null);
    const [cols, setCols] = useState(() => colCount(window.innerWidth));

    useEffect(() => {
        const onResize = () => setCols((prev) => {
            const next = colCount(window.innerWidth);
            return next === prev ? prev : next;
        });
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

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

    const primaryBtn =
        'w-full py-2.5 bg-stone-900 text-white font-semibold text-[13px] hover:bg-stone-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2';

    // Path steps: every challenge plus a terminal "finish" node.
    const steps = [...challenges, { id: '__finish', isFinish: true }];

    // Serpentine rows — even rows run left → right, odd rows right → left.
    const rows = [];
    for (let i = 0; i < steps.length; i += cols) rows.push(steps.slice(i, i + cols));

    const gridStyle = { gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` };

    const metaFor = (step) => (step.isFinish ? null : (COMPONENT_META[step.type] ?? COMPONENT_META.concept));

    return (
        <div className="flex-1 lg:ml-64 min-w-0 flex flex-col h-screen overflow-hidden bg-paper font-display text-stone-900">

            {/* ── Header ── */}
            <div className="sticky top-0 z-20 bg-paper/95 backdrop-blur border-b border-stone-200 px-4 md:px-8 pt-16 lg:pt-4 pb-4">
                <div className="flex items-center gap-4 mb-4 mt-3 md:mt-0">
                    <button onClick={() => navigate('/lockedin/sprints')}
                        aria-label="Back to sprints"
                        className="w-9 h-9 border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:text-plum-700 hover:border-plum-300 transition-colors shrink-0">
                        <span className="material-icons-round text-[18px]">arrow_back</span>
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="font-display-serif text-[20px] md:text-[26px] font-semibold tracking-tight text-stone-900 truncate leading-tight">
                            {sprint.title}
                        </h1>
                        <p className="text-[11.5px] text-stone-400 mt-0.5">
                            {fmtDate(sprint.start_date)} – {fmtDate(sprint.end_date)}
                        </p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="font-display-serif text-[24px] font-semibold text-plum-700 leading-none tabular-nums">{pct}%</p>
                        <p className="text-[9.5px] font-semibold uppercase tracking-widest text-stone-400 mt-1.5">
                            {completed}/{total} done
                        </p>
                    </div>
                    <NotificationIcon />
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-stone-200 overflow-hidden">
                    <div
                        className={`h-full transition-all duration-700 ${isFinished ? 'bg-emerald-600' : 'bg-plum-600'}`}
                        style={{ width: `${pct}%` }}
                    />
                </div>

                {/* Stats chips */}
                {total > 0 && (
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                        {completed > 0 && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[9.5px] font-semibold uppercase tracking-[0.16em]">
                                <span className="material-icons-round text-[12px]">check_circle</span>
                                {completed} completed
                            </span>
                        )}
                        {total - completed > 0 && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 text-stone-500 text-[9.5px] font-semibold uppercase tracking-[0.16em]">
                                <span className="material-icons-round text-[12px]">radio_button_unchecked</span>
                                {total - completed} remaining
                            </span>
                        )}
                        {isFinished && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-[9.5px] font-semibold uppercase tracking-[0.16em]">
                                <span className="material-icons-round text-[12px]">emoji_events</span>
                                Sprint complete!
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="flex flex-1 min-h-0">

                {/* ── Roadmap path ── */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 pt-6 pb-32">
                    {challenges.length === 0 ? (
                        <div className="max-w-sm mx-auto mt-16 text-center">
                            <div className="w-14 h-14 mx-auto bg-stone-50 border border-stone-200 flex items-center justify-center mb-4">
                                <span className="material-icons-round text-stone-300 text-[24px]">route</span>
                            </div>
                            <p className="font-display-serif text-[18px] font-semibold text-stone-900 mb-1">No challenges yet</p>
                            <p className="text-[12.5px] text-stone-400 leading-relaxed">
                                Challenges will appear here as soon as this sprint finishes generating.
                            </p>
                        </div>
                    ) : (
                        <div className="max-w-[960px] mx-auto">
                            {rows.map((row, r) => {
                                const isEven  = r % 2 === 0;
                                const notLast = r < rows.length - 1;

                                const cells = new Array(cols).fill(null);
                                row.forEach((step, i) => { cells[isEven ? i : cols - 1 - i] = step; });

                                const firstCell = isEven ? 0 : cols - 1;
                                const lastCell  = isEven ? row.length - 1 : cols - row.length;
                                const nextStep  = notLast ? rows[r + 1][0] : null;
                                const elbowX    = ((lastCell + 0.5) / cols) * 100;

                                return (
                                    <div key={r}>
                                        {/* Node rail */}
                                        <div className="relative z-10 grid" style={gridStyle}>
                                            {cells.map((step, j) => {
                                                if (!step) return <div key={j} className="h-14" />;

                                                const meta        = metaFor(step);
                                                const status      = step.isFinish ? null : sv(step.status);
                                                const accessible  = !step.isFinish && status !== 'locked';
                                                const isSelected  = !step.isFinish && selectedId === step.id;
                                                const incomingCls = lineCls(step, isFinished);
                                                const successor   = isEven ? cells[j + 1] : cells[j - 1];
                                                const outgoingCls = successor ? lineCls(successor, isFinished) : incomingCls;
                                                const hasIncoming = j !== firstCell;
                                                const hasOutgoing = j !== lastCell;
                                                const inSide      = isEven ? 'left-0'  : 'right-0';
                                                const outSide     = isEven ? 'right-0' : 'left-0';

                                                return (
                                                    <div key={j} className="relative h-14 flex items-center justify-center">
                                                        {hasIncoming && (
                                                            <span className={`absolute top-1/2 -translate-y-1/2 ${inSide} w-1/2 h-[2px] ${incomingCls}`} />
                                                        )}
                                                        {hasOutgoing && (
                                                            <span className={`absolute top-1/2 -translate-y-1/2 ${outSide} w-1/2 h-[2px] ${outgoingCls}`} />
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={() => accessible && toggleSelect(step.id)}
                                                            disabled={!accessible}
                                                            aria-label={step.isFinish ? 'Finish line' : `Challenge ${step.challenge_order}: ${step.title}`}
                                                            aria-pressed={isSelected}
                                                            className={`relative z-10 w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-200
                                                                ${step.isFinish
                                                                    ? (isFinished
                                                                        ? 'border-amber-300 bg-amber-100 text-amber-600 hover:-translate-y-0.5'
                                                                        : 'border-stone-300 bg-white text-stone-400')
                                                                    : `${DISC_CLS[status] ?? DISC_CLS.ready}
                                                                        ${isSelected ? 'ring-2 ring-plum-400 ring-offset-2 ring-offset-paper' : ''}
                                                                        ${accessible ? 'cursor-pointer hover:-translate-y-0.5 active:scale-[0.97]' : 'cursor-default'}`}`}
                                                        >
                                                            <span className={`material-icons-round text-[20px] ${
                                                                step.isFinish
                                                                    ? (isFinished ? 'text-amber-600' : 'text-stone-400')
                                                                    : (status === 'locked' ? 'text-stone-400' : meta.color)
                                                            }`}>
                                                                {step.isFinish ? (isFinished ? 'emoji_events' : 'flag') : meta.icon}
                                                            </span>
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Labels + turn-around */}
                                        <div className="relative">
                                            <div className="relative z-10 grid pt-2.5" style={gridStyle}>
                                                {cells.map((step, j) => {
                                                    if (!step) return <div key={j} className="relative z-10 bg-paper" />;

                                                    const meta       = metaFor(step);
                                                    const status     = step.isFinish ? null : sv(step.status);
                                                    const accessible = !step.isFinish && status !== 'locked';
                                                    const isSelected = !step.isFinish && selectedId === step.id;

                                                    const body = (
                                                        <>
                                                            {!step.isFinish && (
                                                                <span className="block text-[9px] font-semibold tabular-nums text-stone-400 leading-none mb-1">
                                                                    {String(step.challenge_order).padStart(2, '0')}
                                                                </span>
                                                            )}
                                                            <span className={`block text-[11.5px] font-medium leading-snug break-words ${
                                                                step.isFinish
                                                                    ? (isFinished ? 'text-amber-700' : 'text-stone-500')
                                                                    : (status === 'locked' ? 'text-stone-400' : 'text-stone-800')
                                                            }`}>
                                                                {step.isFinish ? (isFinished ? 'Sprint complete!' : 'Finish line') : step.title}
                                                            </span>
                                                            {!step.isFinish && (
                                                                <span className={`block text-[8.5px] font-semibold uppercase tracking-[0.16em] mt-1 ${meta.color}`}>
                                                                    {meta.label}
                                                                </span>
                                                            )}
                                                        </>
                                                    );

                                                    return (
                                                        <div key={j} className="relative z-10 bg-paper px-2 pb-1 text-center">
                                                            {accessible ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleSelect(step.id)}
                                                                    aria-label={`Challenge ${step.challenge_order}: ${step.title}`}
                                                                    className={`w-full bg-paper transition-all ${
                                                                        isSelected
                                                                            ? ''
                                                                            : 'hover:underline decoration-plum-300 decoration-2 underline-offset-4'
                                                                    }`}
                                                                >
                                                                    {body}
                                                                </button>
                                                            ) : body}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {notLast && <div className="h-14" />}

                                            {notLast && (
                                                <div
                                                    className={`absolute w-[2px] ${lineCls(nextStep, isFinished)}`}
                                                    style={{ left: `${elbowX}%`, top: -HALF, bottom: -HALF, transform: 'translateX(-1px)' }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── Detail panel (desktop) ── */}
                <div className="hidden lg:flex border-l border-stone-200 flex-col shrink-0 overflow-hidden bg-white"
                    style={{ width: 360, height: '100%' }}>
                    {selected ? (
                        <div className="flex flex-col h-full">
                            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                            <p className="text-[9.5px] font-semibold uppercase tracking-[0.2em] text-plum-700">
                                                Challenge {selected.challenge_order}
                                            </p>
                                            <StatusBadge status={sv(selected.status)} />
                                        </div>
                                        <h2 className="font-display-serif text-[21px] font-semibold tracking-tight text-stone-900 leading-snug">{selected.title}</h2>
                                    </div>
                                    <button onClick={() => setSelectedId(null)}
                                        aria-label="Close"
                                        className="text-stone-400 hover:text-stone-600 transition-colors mt-0.5 shrink-0 ml-3">
                                        <span className="material-icons-round text-[20px]">close</span>
                                    </button>
                                </div>

                                <p className="text-[13.5px] text-stone-500 leading-relaxed mb-5">{selected.description}</p>

                                {(() => {
                                    const m = metaFor(selected);
                                    return (
                                        <div className={`flex items-center gap-3 p-3.5 ${m.bg}`}>
                                            <div className="w-10 h-10 bg-white/70 flex items-center justify-center shrink-0">
                                                <span className={`material-icons-round text-[20px] ${m.color}`}>{m.icon}</span>
                                            </div>
                                            <div>
                                                <p className="text-[9.5px] font-semibold text-stone-400 uppercase tracking-[0.2em]">Challenge type</p>
                                                <p className={`text-[14px] font-semibold ${m.color}`}>{m.label}</p>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            <div className="p-6 pt-0 border-t border-stone-100 mt-auto">
                                <button onClick={() => handleOpenChallenge(selected)} className={primaryBtn}>
                                    <span className="material-icons-round text-[19px]">
                                        {sv(selected.status) === 'completed' ? 'replay' : 'play_arrow'}
                                    </span>
                                    {sv(selected.status) === 'completed' ? 'Review Challenge' : 'Start Challenge'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                            <div className="w-16 h-16 bg-plum-50 border border-plum-100 flex items-center justify-center mb-4">
                                <span className="material-icons-round text-plum-600 text-[26px]">touch_app</span>
                            </div>
                            <p className="font-display-serif text-[19px] font-semibold text-stone-900 mb-1.5">Select a challenge</p>
                            <p className="text-[12.5px] text-stone-400 leading-relaxed">Pick any unlocked node to read what&rsquo;s inside</p>

                            <div className="mt-8 w-full space-y-2">
                                <div className="flex items-center justify-between px-4 py-3 bg-stone-50">
                                    <span className="text-[11px] text-stone-500 font-semibold uppercase tracking-widest flex items-center gap-1.5">
                                        <span className="material-icons-round text-[14px] text-emerald-600">check_circle</span>
                                        Completed
                                    </span>
                                    <span className="text-[13px] font-semibold text-stone-900 tabular-nums">{completed}/{total}</span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-3 bg-stone-50">
                                    <span className="text-[11px] text-stone-500 font-semibold uppercase tracking-widest flex items-center gap-1.5">
                                        <span className="material-icons-round text-[14px] text-plum-600">bar_chart</span>
                                        Progress
                                    </span>
                                    <span className="text-[13px] font-semibold text-stone-900 tabular-nums">{pct}%</span>
                                </div>
                                {sprint.end_date && (
                                    <div className="flex items-center justify-between px-4 py-3 bg-stone-50">
                                        <span className="text-[11px] text-stone-500 font-semibold uppercase tracking-widest flex items-center gap-1.5">
                                            <span className="material-icons-round text-[14px] text-stone-400">calendar_today</span>
                                            Ends
                                        </span>
                                        <span className="text-[13px] font-semibold text-stone-900">{fmtDate(sprint.end_date)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Detail sheet (mobile) ── */}
            {selected && (
                <>
                    <div
                        className="lg:hidden fixed inset-0 z-30 bg-stone-900/20"
                        onClick={() => setSelectedId(null)}
                        aria-hidden="true"
                    />
                    <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-stone-200 px-5 pt-5 pb-7 max-h-[75vh] overflow-y-auto custom-scrollbar animate-[slideUp_0.18s_ease]">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                    <p className="text-[9.5px] font-semibold uppercase tracking-[0.2em] text-plum-700">
                                        Challenge {selected.challenge_order}
                                    </p>
                                    <StatusBadge status={sv(selected.status)} />
                                </div>
                                <h3 className="font-display-serif text-[17px] font-semibold text-stone-900 leading-snug">{selected.title}</h3>
                            </div>
                            <button onClick={() => setSelectedId(null)}
                                aria-label="Close"
                                className="text-stone-400 hover:text-stone-600 transition-colors ml-2 mt-0.5 shrink-0">
                                <span className="material-icons-round text-[18px]">close</span>
                            </button>
                        </div>
                        <p className="text-[12.5px] text-stone-500 leading-relaxed mb-3">{selected.description}</p>
                        {(() => {
                            const m = metaFor(selected);
                            return (
                                <div className={`inline-flex items-center gap-1.5 px-2 py-1 text-[9.5px] font-semibold uppercase tracking-[0.16em] ${m.bg} ${m.color} mb-4`}>
                                    <span className="material-icons-round text-[12px]">{m.icon}</span>
                                    {m.label}
                                </div>
                            );
                        })()}
                        <button onClick={() => handleOpenChallenge(selected)} className={primaryBtn}>
                            <span className="material-icons-round text-[17px]">
                                {sv(selected.status) === 'completed' ? 'replay' : 'play_arrow'}
                            </span>
                            {sv(selected.status) === 'completed' ? 'Review' : 'Start Challenge'}
                        </button>
                    </div>
                </>
            )}

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default SprintRoadmap;
