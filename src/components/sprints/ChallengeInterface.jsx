import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { sprintService } from '../../api/sprintService';
import Loader from '../globals/Loader';

// ── Sound Engine ──────────────────────────────────────────────────────────────
const createSound = (ctx, type) => {
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);

    if (type === 'correct') {
        [523.25, 659.25, 783.99].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            osc.connect(gain);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.1);
            gain.gain.setValueAtTime(0.28, now + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.3);
        });
    } else if (type === 'wrong') {
        const osc = ctx.createOscillator();
        osc.connect(gain);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(160, now + 0.25);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
    } else if (type === 'complete') {
        [0, 0.12, 0.24, 0.4, 0.58].forEach((t, i) => {
            const osc = ctx.createOscillator();
            osc.connect(gain);
            osc.type = 'sine';
            osc.frequency.setValueAtTime([523.25, 659.25, 783.99, 1046.5, 1318.5][i], now + t);
            gain.gain.setValueAtTime(0.22, now + t);
            gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.22);
            osc.start(now + t);
            osc.stop(now + t + 0.22);
        });
    } else if (type === 'select') {
        const osc = ctx.createOscillator();
        osc.connect(gain);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc.start(now);
        osc.stop(now + 0.07);
    } else if (type === 'chime') {
        const osc = ctx.createOscillator();
        osc.connect(gain);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.linearRampToValueAtTime(1047, now + 0.15);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc.start(now);
        osc.stop(now + 0.7);
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

// ── Quiz ─────────────────────────────────────────────────────────────────────
const QuizView = ({ content }) => {
    const [current,  setCurrent]  = useState(0);
    const [selected, setSelected] = useState(null);
    const [revealed, setRevealed] = useState(false);
    const [score,    setScore]    = useState(0);
    const [done,     setDone]     = useState(false);
    const [shake,    setShake]    = useState(false);
    const [flash,    setFlash]    = useState(null);
    const [streak,   setStreak]   = useState(0);

    const questions = content?.questions ?? [];
    const q = questions[current];

    if (done) {
        const pct = Math.round((score / questions.length) * 100);
        const grade =
            pct >= 90 ? { label: 'Outstanding!', icon: 'emoji_events',   color: 'text-emerald-600', bg: 'bg-emerald-100', ring: 'ring-emerald-200' }
            : pct >= 75 ? { label: 'Great job!',  icon: 'celebration',    color: 'text-violet-600',  bg: 'bg-violet-100',  ring: 'ring-violet-200'  }
            : pct >= 50 ? { label: 'Good effort', icon: 'thumb_up',       color: 'text-amber-600',   bg: 'bg-amber-100',   ring: 'ring-amber-200'   }
            :             { label: 'Keep going!', icon: 'fitness_center', color: 'text-rose-600',    bg: 'bg-rose-100',    ring: 'ring-rose-200'    };
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-5">
                <div className={`w-24 h-24 ${grade.bg} ring-4 ${grade.ring} rounded-full flex items-center justify-center`}>
                    <span className={`material-icons-round text-[44px] ${grade.color}`}>{grade.icon}</span>
                </div>
                <div>
                    <p className={`text-base font-bold ${grade.color}`}>{grade.label}</p>
                    <p className="text-5xl font-bold text-slate-900 mt-1">{pct}%</p>
                    <p className="text-slate-400 text-sm mt-1">{score} / {questions.length} correct</p>
                </div>
                {streak >= 3 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full border border-orange-100">
                        <span className="material-icons-round text-orange-500 text-[18px]">local_fire_department</span>
                        <span className="text-[12px] font-semibold text-orange-600">Best streak: {streak}</span>
                    </div>
                )}
                <button
                    onClick={() => {
                        setCurrent(0); setSelected(null); setRevealed(false);
                        setScore(0); setDone(false); setFlash(null); setStreak(0);
                    }}
                    className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-semibold text-[14px] hover:bg-primary/90 transition-all active:scale-95 shadow-md shadow-primary/20"
                >
                    <span className="material-icons-round text-[18px]">replay</span>
                    Try Again
                </button>
            </div>
        );
    }

    if (!q) return null;

    const handleSelect = (i) => {
        if (revealed) return;
        setSelected(i);
        playSound('select');
    };

    const handleSubmit = () => {
        if (selected === null || revealed) return;
        const correct = selected === q.correct_index;
        setRevealed(true);
        setFlash(correct ? 'correct' : 'wrong');
        playSound(correct ? 'correct' : 'wrong');
        if (correct) {
            setScore(s => s + 1);
            setStreak(s => s + 1);
        } else {
            setStreak(0);
            setShake(true);
            setTimeout(() => setShake(false), 500);
        }
    };

    const handleNext = () => {
        if (current + 1 >= questions.length) {
            playSound('complete');
            setDone(true);
        } else {
            setCurrent(c => c + 1);
            setSelected(null);
            setRevealed(false);
            setFlash(null);
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                <span>Question {current + 1} of {questions.length}</span>
                <span className="flex items-center gap-1.5">
                    {streak >= 2 && <span className="material-icons-round text-orange-500 text-[16px] animate-bounce">local_fire_department</span>}
                    {score} correct
                </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(current / questions.length) * 100}%` }} />
            </div>

            <div className={`bg-white rounded-2xl p-6 shadow-sm border-2 transition-all duration-300 ${
                flash === 'correct' ? 'border-emerald-400 shadow-emerald-100/60' :
                flash === 'wrong'   ? 'border-red-400 shadow-red-100/60' :
                'border-slate-100'
            } ${shake ? 'animate-[shake_0.4s_ease]' : ''}`}>
                <p className="text-[15px] font-semibold text-slate-900 leading-snug">{q.question}</p>
                {revealed && (
                    <div className={`mt-4 flex items-start gap-2 p-3 rounded-xl text-[12px] leading-relaxed ${
                        flash === 'correct' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                    }`}>
                        <span className={`material-icons-round text-[18px] shrink-0 mt-0.5 ${flash === 'correct' ? 'text-emerald-500' : 'text-red-500'}`}>
                            {flash === 'correct' ? 'check_circle' : 'cancel'}
                        </span>
                        <div>
                            <p className="font-bold mb-0.5">{flash === 'correct' ? 'Correct!' : 'Not quite!'}</p>
                            <p className="opacity-90">{q.explanation}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-2.5">
                {q.options.map((opt, i) => {
                    const isSelected = selected === i;
                    const isCorrect  = revealed && i === q.correct_index;
                    const isWrong    = revealed && isSelected && i !== q.correct_index;
                    const isDim      = revealed && !isCorrect && !isWrong;

                    let cls = 'border-slate-200 bg-white text-slate-700 hover:border-primary/40 hover:shadow-sm cursor-pointer';
                    if (isSelected && !revealed) cls = 'border-primary bg-primary/5 text-slate-900 shadow-md shadow-primary/10 cursor-pointer';
                    if (isCorrect)  cls = 'border-emerald-400 bg-emerald-50 text-emerald-800 cursor-default';
                    if (isWrong)    cls = 'border-red-400 bg-red-50 text-red-800 cursor-default';
                    if (isDim)      cls = 'border-slate-100 bg-slate-50 text-slate-400 cursor-default';

                    return (
                        <button key={i} onClick={() => handleSelect(i)}
                            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-[14px] font-medium active:scale-[0.98] ${cls}`}>
                            <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-[11px] font-bold transition-all ${
                                isCorrect    ? 'border-emerald-400 bg-emerald-400 text-white'
                                : isWrong   ? 'border-red-400 bg-red-400 text-white'
                                : isSelected ? 'border-primary bg-primary text-white'
                                : 'border-current'
                            }`}>
                                {isCorrect
                                    ? <span className="material-icons-round text-[13px]">check</span>
                                    : isWrong
                                        ? <span className="material-icons-round text-[13px]">close</span>
                                        : String.fromCharCode(65 + i)
                                }
                            </span>
                            <span className="flex-1">{opt}</span>
                            {isCorrect && <span className="material-icons-round text-emerald-500 text-[18px]">check_circle</span>}
                            {isWrong   && <span className="material-icons-round text-red-400 text-[18px]">cancel</span>}
                        </button>
                    );
                })}
            </div>

            {!revealed ? (
                <button onClick={handleSubmit} disabled={selected === null}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold text-[14px] hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-lg">
                    Submit Answer
                </button>
            ) : (
                <button onClick={handleNext}
                    className={`w-full py-3 text-white rounded-xl font-semibold text-[14px] transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 ${
                        flash === 'correct'
                            ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'
                            : 'bg-primary hover:bg-primary/90 shadow-primary/20'
                    }`}>
                    <span className="material-icons-round text-[18px]">
                        {current + 1 >= questions.length ? 'flag' : 'arrow_forward'}
                    </span>
                    {current + 1 >= questions.length ? 'See Results' : flash === 'correct' ? 'Keep going!' : 'Next Question'}
                </button>
            )}
        </div>
    );
};

// ── Concept ───────────────────────────────────────────────────────────────────
const ConceptView = ({ content }) => {
    useEffect(() => { playSound('chime'); }, []);
    return (
        <div className="space-y-5">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <span className="material-icons-round text-[14px]">menu_book</span>
                    Explanation
                </p>
                <p className="text-[14px] text-slate-700 leading-relaxed">{content?.explanation}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                    <span className="material-icons-round text-[14px]">lightbulb</span>
                    Key Points
                </p>
                <ul className="space-y-3">
                    {(content?.key_points ?? []).map((pt, i) => (
                        <li key={i} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="material-icons-round text-amber-600 text-[14px]">lightbulb</span>
                            </div>
                            <p className="text-[13px] text-slate-700 leading-snug">{pt}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

// ── Quick Points ──────────────────────────────────────────────────────────────
const POINT_ICONS   = ['bolt', 'gps_fixed', 'key', 'diamond', 'rocket_launch', 'auto_awesome', 'star', 'local_fire_department'];
const POINT_COLORS  = ['text-yellow-500', 'text-primary', 'text-slate-500', 'text-cyan-500', 'text-indigo-500', 'text-violet-500', 'text-amber-500', 'text-orange-500'];

const QuickpointsView = ({ content }) => {
    useEffect(() => { playSound('chime'); }, []);
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-3">
            {(content?.points ?? []).map((pt, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100/60 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                        <span className={`material-icons-round text-[15px] ${POINT_COLORS[i % POINT_COLORS.length]}`}>
                            {POINT_ICONS[i % POINT_ICONS.length]}
                        </span>
                    </div>
                    <p className="text-[13px] text-slate-700 leading-snug">{pt}</p>
                </div>
            ))}
        </div>
    );
};

// ── Reading ───────────────────────────────────────────────────────────────────
const ReadingView = ({ content }) => {
    useEffect(() => { playSound('chime'); }, []);
    return (
        <div className="space-y-5">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <span className="material-icons-round text-[14px]">auto_stories</span>
                    Reading Passage
                </p>
                <p className="text-[14px] text-slate-700 leading-[1.8]">{content?.passage}</p>
            </div>
            <div className="bg-teal-50 rounded-2xl p-5 border border-teal-100">
                <p className="text-[11px] font-semibold text-teal-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <span className="material-icons-round text-[14px]">auto_awesome</span>
                    Summary
                </p>
                <p className="text-[13px] text-teal-800 leading-relaxed">{content?.summary}</p>
            </div>
        </div>
    );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const TYPE_META = {
    quiz:        { label: 'Quiz',         icon: 'quiz',                 color: 'text-violet-600', bg: 'bg-violet-100',  View: QuizView        },
    concept:     { label: 'Concepts',     icon: 'lightbulb',            color: 'text-amber-600',  bg: 'bg-amber-100',   View: ConceptView     },
    quickpoints: { label: 'Quick Points', icon: 'format_list_bulleted', color: 'text-blue-600',   bg: 'bg-blue-100',    View: QuickpointsView },
    reading:     { label: 'Read',         icon: 'auto_stories',         color: 'text-teal-600',   bg: 'bg-teal-100',    View: ReadingView     },
};

const ChallengeInterface = () => {
    const { sprintId, challengeId } = useParams();
    const navigate = useNavigate();

    const [challenge,  setChallenge]  = useState(null);
    const [loading,    setLoading]    = useState(true);
    const [error,      setError]      = useState(null);
    const [completing, setCompleting] = useState(false);
    const [completed,  setCompleted]  = useState(false);

    useEffect(() => {
        sprintService.showChallenge(sprintId, challengeId)
            .then(res => setChallenge(res.data))
            .catch(() => setError('Could not load this challenge.'))
            .finally(() => setLoading(false));
    }, [sprintId, challengeId]);

    const handleComplete = async () => {
        if (completing || completed) return;
        setCompleting(true);
        try {
            await sprintService.completeChallenge(sprintId, challengeId);
            playSound('complete');
            setCompleted(true);
        } catch {
            // ignore
        } finally {
            setCompleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 lg:ml-64 flex items-center justify-center min-h-screen" style={{ background: '#F8F9FA' }}>
                <div className="flex flex-col items-center gap-3">
                    <Loader size="xl" />
                    <p className="text-slate-400 text-sm">Loading challenge…</p>
                </div>
            </div>
        );
    }

    if (error || !challenge) {
        return (
            <div className="flex-1 lg:ml-64 flex items-center justify-center min-h-screen" style={{ background: '#F8F9FA' }}>
                <div className="text-center">
                    <p className="text-slate-500 mb-4">{error ?? 'Challenge not found.'}</p>
                    <button onClick={() => navigate(`/lockedin/sprints/${sprintId}`)} className="text-primary font-semibold text-sm hover:underline">Back to sprint</button>
                </div>
            </div>
        );
    }

    const statusStr = challenge.status?.value ?? challenge.status;
    const meta = TYPE_META[challenge.type] ?? TYPE_META.concept;
    const { View } = meta;
    const alreadyDone = statusStr === 'completed' || completed;

    return (
        <div className="flex-1 lg:ml-64 min-h-screen" style={{ background: '#F8F9FA' }}>

            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-100 px-4 md:px-8 pt-16 lg:pt-0 py-4 flex items-center gap-4">
                <button onClick={() => navigate(`/lockedin/sprints/${sprintId}`)}
                    className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors shrink-0">
                    <span className="material-icons-round text-[18px]">arrow_back</span>
                </button>
                <div className="flex-1 min-w-0">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest ${meta.bg} ${meta.color} mb-0.5`}>
                        <span className="material-icons-round text-[12px]">{meta.icon}</span>
                        {meta.label}
                    </div>
                    <h1 className="text-[15px] font-semibold text-slate-900 truncate">{challenge.title}</h1>
                </div>
                {alreadyDone && (
                    <span className="text-emerald-600 flex items-center gap-1 text-[11px] font-semibold shrink-0">
                        <span className="material-icons-round text-[16px]">check_circle</span>
                        Done
                    </span>
                )}
            </div>

            <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 pb-36">
                <div className="mb-6">
                    <p className="text-[13px] text-slate-500 leading-relaxed">{challenge.description}</p>
                </div>

                {challenge.content
                    ? <View content={challenge.content} />
                    : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                                <Loader size="lg" />
                            </div>
                            <p className="text-[15px] font-semibold text-slate-700 mb-1">Preparing your content…</p>
                            <p className="text-[13px] text-slate-400 leading-relaxed">AI is generating this challenge.<br />This page will update automatically.</p>
                        </div>
                    )
                }
            </div>

            {!alreadyDone && challenge.content && (
                <div className="fixed bottom-0 left-0 lg:left-64 right-0 z-50 px-6 py-4 bg-white/95 backdrop-blur border-t border-slate-100">
                    <button onClick={handleComplete} disabled={completing}
                        className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-[15px] hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-[0.98] shadow-md shadow-primary/20 flex items-center justify-center gap-2">
                        {completing
                            ? <><Loader size="sm" /> Saving…</>
                            : <><span className="material-icons-round text-[18px]">check_circle</span> Mark as Complete</>
                        }
                    </button>
                </div>
            )}

            {completed && (
                <div className="fixed bottom-0 left-0 lg:left-64 right-0 z-50 px-6 py-5 bg-emerald-600 border-t border-emerald-500">
                    <p className="text-white font-semibold text-[15px] text-center flex items-center justify-center gap-2 mb-3">
                        <span className="material-icons-round text-[20px]">celebration</span>
                        Challenge Complete!
                        <span className="material-icons-round text-[20px]">emoji_events</span>
                    </p>
                    <button onClick={() => navigate(`/lockedin/sprints/${sprintId}`)}
                        className="w-full py-3 bg-white text-emerald-700 rounded-xl font-semibold text-[15px] hover:bg-emerald-50 transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2">
                        <span className="material-icons-round text-[18px]">arrow_back</span>
                        Back to Sprint Roadmap
                    </button>
                </div>
            )}

            <style>{`
                @keyframes shake {
                    0%,100% { transform: translateX(0) }
                    20%     { transform: translateX(-10px) }
                    40%     { transform: translateX(10px) }
                    60%     { transform: translateX(-6px) }
                    80%     { transform: translateX(6px) }
                }
            `}</style>
        </div>
    );
};

export default ChallengeInterface;
