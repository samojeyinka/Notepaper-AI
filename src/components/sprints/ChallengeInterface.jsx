import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { sprintService } from '../../api/sprintService';
import Loader from '../globals/Loader';

// ── Instrument Serif font loader ──────────────────────────────────────────────
const SERIF_FONT_URL =
    'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap';

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

// ── Letter labels ─────────────────────────────────────────────────────────────
const LETTERS = ['A', 'B', 'C', 'D'];

// ── Quiz ─────────────────────────────────────────────────────────────────────
const QuizView = ({ content }) => {
    const [current,  setCurrent]  = useState(0);
    const [selected, setSelected] = useState(null);
    const [revealed, setRevealed] = useState(false);
    const [inputVal, setInputVal] = useState('');
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
            pct >= 90 ? { label: 'Excellent!',   emoji: '🏆', color: 'text-emerald-600', bg: 'bg-emerald-50' }
            : pct >= 75 ? { label: 'Great job!',  emoji: '🎉', color: 'text-violet-600',  bg: 'bg-violet-50'  }
            : pct >= 50 ? { label: 'Good effort', emoji: '👍', color: 'text-amber-600',   bg: 'bg-amber-50'   }
            :             { label: 'Keep trying!',emoji: '💪', color: 'text-rose-600',    bg: 'bg-rose-50'    };

        return (
            <div className="flex flex-col items-center justify-center py-6 md:py-12 w-full animate-[fadeIn_0.5s_ease]">
                <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-6 md:p-10 text-center space-y-6 md:space-y-8 w-full max-w-lg">
                    <div className={`w-20 h-20 md:w-24 md:h-24 ${grade.bg} rounded-full flex items-center justify-center mx-auto text-3xl md:text-5xl`}>
                        {grade.emoji}
                    </div>
                    <div>
                        <p className={`text-base font-bold ${grade.color}`}>{grade.label}</p>
                        <h2 className="text-slate-900 font-bold text-5xl md:text-6xl mt-1" style={{ fontFamily: "'Instrument Serif', serif" }}>{pct}%</h2>
                        <p className="text-slate-500 text-sm mt-1">{score} out of {questions.length} correct</p>
                    </div>

                    <div className="bg-slate-100 rounded-full h-2 md:h-3 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary via-indigo-400 to-primary rounded-full transition-all duration-1000"
                            style={{ width: `${pct}%` }}
                        />
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 text-left flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Performance</p>
                            <p className="text-slate-800 font-semibold">Streak: {streak}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Status</p>
                             <p className="text-slate-800 font-semibold">{pct >= 50 ? 'Passed' : 'Review Required'}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setCurrent(0); setSelected(null); setRevealed(false); setInputVal('');
                            setScore(0); setDone(false); setFlash(null); setStreak(0);
                        }}
                        className="w-full py-3.5 md:py-4 rounded-xl md:rounded-2xl bg-slate-900 text-white font-bold text-sm md:text-base hover:bg-slate-800 transition-colors shadow-xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                    >
                        <span className="material-icons-round text-[20px]">replay</span>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!q) return null;

    const isMultiple = q.options && q.options.length > 0;
    const progress   = Math.round((current / questions.length) * 100);

    const handleSelect = (i) => {
        if (revealed) return;
        setSelected(i);
        playSound('select');
    };

    const handleSubmit = () => {
        if (revealed) return;
        let correct = false;
        
        if (isMultiple) {
            if (selected === null) return;
            correct = selected === q.correct_index;
        } else {
            if (!inputVal.trim()) return;
            correct = inputVal.trim().toLowerCase() === q.correct_answer?.toLowerCase();
        }

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
            setInputVal('');
        }
    };

    return (
        <div className="space-y-6 md:space-y-8 animate-[fadeIn_0.4s_ease]">
            {/* Progress bar */}
            <div>
                <div className="flex items-end justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Question {current + 1} of {questions.length}
                    </span>
                    <span className="text-[10px] font-bold text-primary">{progress}% Completed</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary via-indigo-400 to-primary rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${progress}%`, boxShadow: '0 0 12px rgba(167,139,250,0.3)' }}
                    />
                </div>
            </div>

            {/* Question card */}
            <div className={`relative ${shake ? 'animate-[shake_0.4s_ease]' : ''}`}>
                <div
                    className="absolute -top-6 -right-6 w-24 h-24 bg-primary/5 blur-2xl pointer-events-none"
                    style={{ borderRadius: '42% 58% 70% 30%/45% 45% 55% 55%' }}
                />

                <div
                    className={`relative bg-white rounded-2xl md:rounded-[2rem] p-6 md:p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 transition-all duration-300 ${
                        flash === 'correct' ? 'ring-2 ring-emerald-300/50' :
                        flash === 'wrong'   ? 'ring-2 ring-rose-300/50'   : ''
                    }`}
                >
                    <span className="inline-block px-3 py-1 bg-slate-50 text-slate-400 text-[9px] font-bold uppercase tracking-widest rounded-full mb-4">
                        {isMultiple ? 'Multiple Choice' : 'Short Answer'}
                    </span>

                    <h2
                        className="text-[18px] md:text-2xl text-slate-800 leading-snug"
                        style={{ fontFamily: "'Instrument Serif', serif" }}
                    >
                        {q.question}
                    </h2>

                    {revealed && (
                        <div className={`mt-6 flex items-start gap-3 p-4 rounded-xl md:rounded-2xl text-sm ${
                            flash === 'correct'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                        }`}>
                            <span className="material-icons-round text-[18px] shrink-0 mt-0.5">
                                {flash === 'correct' ? 'check_circle' : 'cancel'}
                            </span>
                            <div>
                                <p className="font-bold text-[13px] mb-1">
                                    {flash === 'correct' ? 'Correct!' : `Incorrect${!isMultiple ? ` — Answer: ${q.correct_answer}` : ''}`}
                                </p>
                                <p className="text-[12px] leading-relaxed opacity-90">{q.explanation}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Options / Input */}
            {isMultiple ? (
                <div className="grid grid-cols-1 gap-3 md:gap-4">
                    {q.options.map((opt, i) => {
                        const isSelected = selected === i;
                        const isCorrect  = revealed && i === q.correct_index;
                        const isWrong    = revealed && isSelected && i !== q.correct_index;
                        const isDim      = revealed && !isCorrect && !isWrong;

                        return (
                            <button
                                key={i}
                                onClick={() => handleSelect(i)}
                                disabled={revealed}
                                className={`group w-full flex items-center gap-4 p-3 md:p-5 border-2 rounded-xl md:rounded-[1.2rem] text-left transition-all duration-200 ${
                                    isCorrect
                                        ? 'bg-white border-emerald-400 shadow-lg shadow-emerald-100'
                                        : isWrong
                                            ? 'bg-rose-50 border-rose-300'
                                            : isSelected
                                                ? 'bg-white border-primary shadow-lg shadow-primary/10'
                                                : isDim
                                                    ? 'opacity-40 border-slate-100 grayscale-[0.5]'
                                                    : 'bg-white border-slate-100 hover:border-primary/30 shadow-sm hover:shadow-md'
                                }`}
                            >
                                <div className={`w-8 h-8 md:w-10 md:h-10 flex-shrink-0 flex items-center justify-center rounded-lg md:rounded-xl font-bold text-sm transition-colors ${
                                    isCorrect
                                        ? 'bg-emerald-500 text-white'
                                        : isWrong
                                            ? 'bg-rose-400 text-white'
                                            : isSelected
                                                ? 'bg-primary text-white'
                                                : 'bg-slate-100 text-slate-500 group-hover:bg-primary group-hover:text-white'
                                }`}>
                                    {isCorrect
                                        ? <span className="material-icons-round text-[16px]">check</span>
                                        : isWrong
                                            ? <span className="material-icons-round text-[16px]">close</span>
                                            : LETTERS[i]
                                    }
                                </div>

                                <span className={`flex-1 text-[14px] md:text-[15px] leading-snug transition-colors ${
                                    isCorrect ? 'text-emerald-800 font-medium'
                                    : isWrong ? 'text-rose-700'
                                    : isSelected ? 'text-slate-900 font-medium'
                                    : 'text-slate-600 group-hover:text-slate-900'
                                }`}>
                                    {opt}
                                </span>

                                {isSelected && !revealed && (
                                    <span className="material-icons-round text-primary text-[18px] ml-auto">
                                        check_circle
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            ) : (
                <div className={`bg-white rounded-2xl md:rounded-[2rem] border-2 p-6 shadow-sm transition-all ${
                    revealed
                        ? flash === 'correct' ? 'border-emerald-400' : 'border-rose-300'
                        : 'border-slate-100 focus-within:border-primary/40 focus-within:shadow-md'
                }`}>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                        Your Answer
                    </label>
                    <input
                        type="text"
                        value={inputVal}
                        onChange={e => setInputVal(e.target.value)}
                        disabled={revealed}
                        placeholder="Type your answer…"
                        className="w-full bg-transparent text-lg md:text-xl text-slate-800 border-none outline-none placeholder-slate-200 disabled:opacity-60"
                        style={{ fontFamily: "'Instrument Serif', serif" }}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); revealed ? handleNext() : handleSubmit(); } }}
                    />
                </div>
            )}

            {/* Navigation row */}
            <div className="pt-4">
                {!revealed ? (
                    <button
                        onClick={handleSubmit}
                        disabled={isMultiple ? selected === null : !inputVal.trim()}
                        className="w-full py-2 md:py-4 bg-slate-900 text-white rounded-lg md:rounded-xl font-medium text-[14px] md:text-base shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                        Submit Answer
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className={`w-full py-4 text-white rounded-xl md:rounded-2xl font-bold text-[14px] md:text-base shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 ${
                            flash === 'correct'
                                ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'
                                : 'bg-primary hover:bg-primary/90 shadow-primary/20'
                        }`}
                    >
                        {current + 1 >= questions.length ? 'See Results' : 'Next Question'}
                        <span className="material-icons-round text-[20px]">arrow_forward</span>
                    </button>
                )}
            </div>
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

    // Load Instrument Serif
    useEffect(() => {
        if (document.querySelector(`link[href="${SERIF_FONT_URL}"]`)) return;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = SERIF_FONT_URL;
        document.head.appendChild(link);
    }, []);

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

            <div className="sticky top-3 md:top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-100 px-4 md:px-8 pt-16 lg:pt-0 py-4 flex items-center gap-4">
                <button onClick={() => navigate(`/lockedin/sprints/${sprintId}`)}
                    className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors shrink-0">
                    <span className="material-icons-round text-[15px] md:text-[18px]">arrow_back</span>
                </button>
                <div className="flex-1 min-w-0">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] md:text-[10px] font-semibold uppercase tracking-widest ${meta.bg} ${meta.color} mb-0.5`}>
                        <span className="material-icons-round text-[10px] md:text-[12px]">{meta.icon}</span>
                        {meta.label}
                    </div>
                    <h1 className="text-[14px] md:text-[15px] font-medium md:font-semibold text-slate-900 truncate">{challenge.title}</h1>
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
                        className="w-full py-2 bg-primary text-white rounded-lg font-medium text-[14px] md:text-[15px] hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-[0.98] shadow-md shadow-primary/20 flex items-center justify-center gap-2">
                        {completing
                            ? <><Loader size="sm" /></>
                            : <><span className="material-icons-round text-[14px] md:text-[16px]">check_circle</span> Mark as Complete</>
                        }
                    </button>
                </div>
            )}

            {completed && (
                <div className="fixed bottom-0 left-0 lg:left-64 right-0 z-50 px-4 py-2.5 bg-emerald-600 border-t border-emerald-500">
                    <p className="text-white font-semibold text-[15px] text-center flex items-center justify-center gap-2 mb-3">
                        <span className="material-icons-round text-[20px]">celebration</span>
                        Challenge Complete!
                        <span className="material-icons-round text-[20px]">emoji_events</span>
                    </p>
                    <button onClick={() => navigate(`/lockedin/sprints/${sprintId}`)}
                        className="w-full py-2 bg-white text-emerald-700 rounded-lg font-semibold text-[15px] hover:bg-emerald-50 transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2">
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
