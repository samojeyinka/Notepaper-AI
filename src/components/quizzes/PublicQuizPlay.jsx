import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { quizService } from '../../api/quizService';
import { logo } from '../../assets/assets';
import SEO from '../globals/SEO';

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

// ── Branded header ────────────────────────────────────────────────────────────
const Header = ({ title }) => (
    <header className="w-full flex items-center justify-between px-5 py-3 bg-white border-b border-slate-100 shrink-0">
        <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Notepaper-ai" className="w-7" />
            <span className="text-base font-semibold text-slate-800 tracking-tight">
                Notepaper<span className="text-primary">.ai</span>
            </span>
        </Link>
        <span className="text-[12px] text-slate-400 font-medium hidden sm:block truncate max-w-xs">{title}</span>
        <Link
            to="/signup"
            className="text-[12px] font-semibold text-primary bg-primary/8 hover:bg-primary/12 border border-primary/15 px-3 py-1.5 rounded-full transition-colors"
        >
            Sign up free
        </Link>
    </header>
);

// ── Score screen ──────────────────────────────────────────────────────────────
const ScoreScreen = ({ score, total, quiz, onRestart }) => {
    const pct = Math.round((score / total) * 100);
    const grade =
        pct >= 90 ? { label: 'Excellent!',   emoji: '🏆', color: 'text-emerald-600', bg: 'bg-emerald-50' }
        : pct >= 75 ? { label: 'Great job!',  emoji: '🎉', color: 'text-violet-600',  bg: 'bg-violet-50'  }
        : pct >= 50 ? { label: 'Good effort', emoji: '👍', color: 'text-amber-600',   bg: 'bg-amber-50'   }
        :             { label: 'Keep trying!',emoji: '💪', color: 'text-rose-600',    bg: 'bg-rose-50'    };

    useEffect(() => {
        playSound('complete');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 w-full" style={{ background: '#F8F9FA' }}>
            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-10 -left-10 w-56 h-56 bg-indigo-400/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white rounded-[1rem] md:rounded-[2rem] shadow-lg shadow-slate-200/50 border border-slate-100 p-8 text-center space-y-6">
                    <div className={`w-20 h-20 ${grade.bg} rounded-full flex items-center justify-center mx-auto text-4xl`}>
                        {grade.emoji}
                    </div>
                    <div>
                        <p className={`text-base font-bold ${grade.color}`}>{grade.label}</p>
                        <h2 className="text-slate-900 font-bold text-5xl mt-1" style={{ fontFamily: "'Instrument Serif', serif" }}>{pct}%</h2>
                        <p className="text-slate-500 text-sm mt-1">{score} out of {total} correct</p>
                    </div>

                    <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary via-indigo-400 to-primary rounded-full transition-all duration-1000"
                            style={{ width: `${pct}%` }}
                        />
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 text-left">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Quiz Completed</p>
                        <p className="text-slate-800 font-semibold">{quiz.title}</p>
                        <p className="text-slate-400 text-sm mt-0.5">{total} questions</p>
                    </div>

                    <div className="flex gap-3">
                        <Link
                            to="/signup"
                            className="flex-1 py-2 md:py-3.5 rounded-md md:rounded-xl border border-slate-200 text-slate-600 font-semibold text-[12px] md:text-sm hover:bg-slate-50 transition-colors text-center"
                        >
                            Create your own →
                        </Link>
                        <button
                            onClick={onRestart}
                            className="flex-1 py-2 md:py-3.5 rounded-md md:rounded-xl bg-slate-900 text-white font-bold text-[12px] md:text-sm hover:bg-slate-800 transition-colors shadow-md hover:scale-105 active:scale-95"
                        >
                            Try Again
                        </button>
                    </div>

                    <p className="text-[11px] text-slate-400">
                        Powered by{' '}
                        <Link to="/" className="text-primary hover:underline font-medium">Notepaper-ai</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

// ── Main component ────────────────────────────────────────────────────────────
export default function PublicQuizPlay() {
    const { id } = useParams();

    const [quiz,      setQuiz]      = useState(null);
    const [loadError, setLoadError] = useState(false);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selected,   setSelected]   = useState(null);
    const [inputVal,   setInputVal]   = useState('');
    const [submitted,  setSubmitted]  = useState(false);
    const [score,      setScore]      = useState(0);
    const [done,       setDone]       = useState(false);
    const [shake,      setShake]      = useState(false);
    const [flash,      setFlash]      = useState(null);
    const [copied,     setCopied]     = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        quizService.getPublic(id)
            .then(res => setQuiz(res?.data ?? res))
            .catch(() => setLoadError(true));
    }, [id]);

    // Load Instrument Serif
    useEffect(() => {
        if (document.querySelector(`link[href="${SERIF_FONT_URL}"]`)) return;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = SERIF_FONT_URL;
        document.head.appendChild(link);
    }, []);

    const questions  = quiz?.questions ?? [];
    const q          = questions[currentIdx] ?? null;
    const progress   = questions.length ? Math.round((currentIdx / questions.length) * 100) : 0;
    const isMultiple = q?.type === 'multiple';
    const hasAnswer  = isMultiple ? selected !== null : inputVal.trim().length > 0;

    // Focus input for short-answer questions
    useEffect(() => {
        if (!isMultiple && !submitted && inputRef.current) {
            inputRef.current.focus();
        }
    }, [currentIdx, isMultiple, submitted]);

    // ── Submit answer ─────────────────────────────────────────────────────────
    const checkAnswer = useCallback(() => {
        if (!hasAnswer || submitted || !q) return;
        const correct = isMultiple
            ? selected === q.correct
            : inputVal.trim().toLowerCase() === String(q.correct).toLowerCase();

        setSubmitted(true);
        setFlash(correct ? 'correct' : 'wrong');
        playSound(correct ? 'correct' : 'wrong');
        if (correct) setScore(s => s + 1);
        if (!correct) { setShake(true); setTimeout(() => setShake(false), 500); }
    }, [hasAnswer, submitted, isMultiple, selected, inputVal, q]);

    // ── Advance ───────────────────────────────────────────────────────────────
    const advance = useCallback(() => {
        if (!submitted) return;
        const next = currentIdx + 1;
        if (next >= questions.length) { setDone(true); return; }
        setCurrentIdx(next);
        setSelected(null);
        setInputVal('');
        setSubmitted(false);
        setFlash(null);
    }, [submitted, currentIdx, questions.length]);

    // ── Keyboard shortcuts ────────────────────────────────────────────────────
    useEffect(() => {
        const onKey = (e) => {
            if (done) return;
            if (isMultiple && !submitted) {
                const idx = LETTERS.indexOf(e.key.toUpperCase());
                if (idx !== -1 && q && idx < (q.options?.length ?? 0)) {
                    setSelected(idx);
                    playSound('select');
                    return;
                }
                if (e.code === 'Space') { e.preventDefault(); if (selected !== null) checkAnswer(); return; }
            }
            if (e.key === 'Enter') { e.preventDefault(); submitted ? advance() : checkAnswer(); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [done, isMultiple, submitted, q, selected, checkAnswer, advance]);

    const restart = () => {
        setCurrentIdx(0); setSelected(null); setInputVal('');
        setSubmitted(false); setScore(0); setDone(false); setFlash(null);
    };

    // ── Loading / error states ────────────────────────────────────────────────
    if (loadError) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header title="" />
                <div className="flex-1 flex flex-col items-center justify-center gap-4" style={{ background: '#F8F9FA' }}>
                    <span className="material-icons-round text-slate-300 text-5xl">quiz</span>
                    <p className="text-slate-500 font-medium">Quiz not found or no longer available.</p>
                    <Link to="/" className="text-primary text-sm font-semibold hover:underline">Go to Notepaper-ai</Link>
                </div>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8F9FA' }}>
                <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (done) {
        return (
            <div className="min-h-screen flex flex-col" style={{ background: '#F8F9FA' }}>
                <Header title={quiz.title} />
                <ScoreScreen score={score} total={questions.length} quiz={quiz} onRestart={restart} />
            </div>
        );
    }

    // ── Play UI ───────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen flex flex-col" style={{ background: '#F8F9FA' }}>
            <SEO
                title={quiz.title}
                description={`Take the "${quiz.title}" quiz on Notepaper AI — test your knowledge and challenge your friends.`}
                path={`/quiz/${id}`}
            />
            <Header title={quiz.title} />

            <div className="flex-1 p-4 lg:p-8 pt-4 min-w-0 overflow-x-hidden pb-28">

                {/* ── Nav ─────────────────────────────────────────────────── */}
                <nav className="px-2 md:px-6 pt-3 pb-2 md:pb-4 flex flex-col md:gap-5">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-3 md:px-4 py-2">
                            {quiz.subject}
                        </span>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                            }}
                            className="flex items-center gap-1.5 px-3 md:px-4 py-2 text-xs md:text-sm font-semibold text-slate-500 hover:text-primary transition-colors"
                        >
                            <span className="material-icons-round text-[14px] md:text-[16px]">
                                {copied ? 'check_circle' : 'share'}
                            </span>
                            {copied ? 'Link copied!' : 'Share'}
                        </button>
                    </div>

                    {/* Progress bar */}
                    <div>
                        <div className="flex items-end justify-between mb-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                Question {currentIdx + 1} of {questions.length}
                            </span>
                            <span className="text-[10px] font-bold text-primary">{progress}% Completed</span>
                        </div>
                        <div className="h-1.5 md:h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary via-indigo-400 to-primary rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${progress}%`, boxShadow: '0 0 7px rgba(80,69,250,0.2)' }}
                            />
                        </div>
                    </div>
                </nav>

                {/* ── Main ────────────────────────────────────────────────── */}
                <main className="flex-grow flex items-center justify-center px-4 md:px-6 py-3">
                    <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

                        {/* ── Left column — large screens only ────────── */}
                        <div className="hidden lg:flex lg:col-span-4 flex-col gap-6">
                            <div className="relative">
                                <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                                {/* Tip card */}
                                <div className="relative p-6 bg-yellow-50 border border-yellow-100 rounded-2xl flex items-start gap-4">
                                    <span className="material-icons-round text-yellow-500 shrink-0 mt-0.5">lightbulb</span>
                                    <p className="text-sm text-yellow-800 leading-relaxed italic">
                                        "Try to recall the answer before looking at the choices — it strengthens memory retrieval."
                                    </p>
                                </div>
                            </div>

                            {/* Score card */}
                            <div className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                                    <span className="material-icons-round text-primary text-[20px]">quiz</span>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Score so far</p>
                                    <p className="text-2xl font-bold text-slate-900 mt-0.5" style={{ fontFamily: "'Instrument Serif', serif" }}>
                                        {score} <span className="text-slate-300 text-lg font-normal">/ {currentIdx}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Sign-up nudge card */}
                            <div className="bg-white border border-slate-100 rounded-2xl p-5">
                                <p className="text-[11px] text-slate-500 leading-snug mb-3">
                                    Want to create quizzes like this from your own notes?
                                </p>
                                <Link
                                    to="/signup"
                                    className="block w-full text-center py-2 rounded-xl bg-primary text-white text-[12px] font-semibold hover:bg-primary/90 transition-colors"
                                >
                                    Sign up free on Notepaper-ai
                                </Link>
                            </div>
                        </div>

                        {/* ── Right column — question + options ─────── */}
                        <div className="lg:col-span-8 w-full space-y-3 md:space-y-6">

                            {/* Question card */}
                            <div className={`relative ${shake ? 'animate-[shake_0.4s_ease]' : ''}`}>
                                <div
                                    className="absolute -top-6 -right-6 w-28 h-28 bg-primary/8 blur-2xl pointer-events-none"
                                    style={{ borderRadius: '42% 58% 70% 30%/45% 45% 55% 55%' }}
                                />

                                <div
                                    className={`relative rounded-[.8rem] md:rounded-[1.5rem] border border-slate-100 p-4 md:p-5 lg:p-7 shadow-lg shadow-slate-200/60 transition-shadow ${
                                        flash === 'correct' ? 'ring-2 ring-emerald-300/50' :
                                        flash === 'wrong'   ? 'ring-2 ring-rose-300/50'   : ''
                                    }`}
                                    style={{ background: '#ffffff' }}
                                >
                                    {/* Category badge */}
                                    <span className="inline-block px-1.5 md:px-3 py-0.5 md:py-1 bg-slate-100 text-slate-500 text-[8px] md:text-[10px] md:font-bold uppercase tracking-widest rounded-full mb-2.5 md:mb-5">
                                        {q.category ?? (isMultiple ? 'Multiple Choice' : 'Short Answer')}
                                    </span>

                                    {/* Question text */}
                                    <h2
                                        className="text-[16px] md:text-2xl text-slate-800 leading-snug"
                                        style={{ fontFamily: "'Instrument Serif', serif" }}
                                    >
                                        {q.question}
                                    </h2>

                                    {/* Explanation after submit */}
                                    {submitted && (
                                        <div className={`mt-3 md:mt-6 flex items-start gap-1.5 md:gap-3 p-4 rounded-xl md:rounded-2xl text-[10px] md:text-sm ${
                                            flash === 'correct'
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'bg-rose-50 text-rose-700'
                                        }`}>
                                            <span className="material-icons-round text-[17px] shrink-0 mt-0.5">
                                                {flash === 'correct' ? 'check_circle' : 'cancel'}
                                            </span>
                                            <div>
                                                <p className="font-bold text-[12px] mb-1">
                                                    {flash === 'correct' ? 'Correct!' : `Incorrect${!isMultiple ? ` — Answer: ${q.correct}` : ''}`}
                                                </p>
                                                <p className="text-[12px] leading-relaxed opacity-90">{q.explanation}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ── Multiple choice ─────────────────────── */}
                            {isMultiple && (
                                <div className="grid grid-cols-1 gap-2 md:gap-4">
                                    {q.options?.map((opt, i) => {
                                        const isSelected = selected === i;
                                        const isCorrect  = submitted && i === q.correct;
                                        const isWrong    = submitted && isSelected && i !== q.correct;

                                        return (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    if (submitted) return;
                                                    setSelected(i);
                                                    playSound('select');
                                                }}
                                                disabled={submitted}
                                                className={`group w-full flex items-center gap-2 md:gap-6 p-2 md:p-6 border-2 rounded-xl md:rounded-3xl text-left transition-all duration-200 ${
                                                    isCorrect
                                                        ? 'bg-white border-emerald-400 shadow-lg shadow-emerald-100'
                                                        : isWrong
                                                            ? 'bg-rose-50 border-rose-300'
                                                            : isSelected
                                                                ? 'bg-white border-primary shadow-lg shadow-primary/10'
                                                                : 'bg-white border-transparent hover:border-primary/30 hover:shadow-sm'
                                                }`}
                                            >
                                                {/* Letter box */}
                                                <div className={`w-5 h-5 md:w-12 md:h-12 flex-shrink-0 flex items-center justify-center rounded-md md:rounded-2xl font-bold text-sm md:text-base transition-colors ${
                                                    isCorrect
                                                        ? 'bg-emerald-500 text-white'
                                                        : isWrong
                                                            ? 'bg-rose-400 text-white'
                                                            : isSelected
                                                                ? 'bg-primary text-white'
                                                                : 'bg-slate-100 text-slate-500 group-hover:bg-primary group-hover:text-white'
                                                }`}>
                                                    {isCorrect
                                                        ? <span className="material-icons-round text-[14px] md:text-[16px]">check</span>
                                                        : isWrong
                                                            ? <span className="material-icons-round text-[16px]">close</span>
                                                            : LETTERS[i]
                                                    }
                                                </div>

                                                {/* Option text */}
                                                <span className={`flex-1 text-[13px] md:text-base leading-snug transition-colors ${
                                                    isCorrect ? 'text-emerald-800 font-medium'
                                                    : isWrong ? 'text-rose-700'
                                                    : isSelected ? 'text-slate-900 font-normal md:font-medium'
                                                    : 'text-slate-600 group-hover:text-slate-900'
                                                }`}>
                                                    {opt}
                                                </span>

                                                {isSelected && !submitted && (
                                                    <span className="material-icons-round text-primary text-[18px] ml-auto shrink-0">
                                                        check_circle
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* ── Short answer input ───────────────────── */}
                            {!isMultiple && (
                                <div className={`bg-white rounded-xl md:rounded-3xl border-2 p-6 transition-all ${
                                    submitted
                                        ? flash === 'correct' ? 'border-emerald-400' : 'border-rose-300'
                                        : 'border-transparent focus-within:border-primary/40 focus-within:shadow-sm'
                                }`}>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                                        Your Answer
                                    </label>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={inputVal}
                                        onChange={e => setInputVal(e.target.value)}
                                        disabled={submitted}
                                        placeholder="Type your answer…"
                                        className="w-full bg-transparent text-[13px] md:text-lg text-slate-800 border-none outline-none placeholder-slate-300 disabled:opacity-60"
                                        style={{ fontFamily: "'Instrument Serif', serif" }}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submitted ? advance() : checkAnswer(); } }}
                                    />
                                </div>
                            )}

                            {/* ── Navigation row ──────────────────────── */}
                            <div className="flex items-center justify-end pt-2">
                                {!submitted ? (
                                    <button
                                        onClick={checkAnswer}
                                        disabled={!hasAnswer}
                                        className="flex items-center gap-2 md:gap-3 px-3 md:px-10 py-1.5 md:py-4 bg-slate-900 text-white rounded-md md:rounded-2xl font-medium md:font-semibold text-sm md:text-base shadow-md hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
                                    >
                                        Submit Answer
                                        <span className="material-icons-round text-[18px]">arrow_forward</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={advance}
                                        className="flex items-center gap-2 md:gap-3 px-3 md:px-10 py-1.5 md:py-4 bg-slate-900 text-white rounded-md md:rounded-2xl font-medium md:font-semibold text-sm md:text-base shadow-md hover:scale-105 active:scale-95 transition-all"
                                    >
                                        {currentIdx + 1 >= questions.length ? 'See Results' : 'Next Question'}
                                        <span className="material-icons-round text-[18px]">arrow_forward</span>
                                    </button>
                                )}
                            </div>

                            {/* Mobile sign-up nudge */}
                            <p className="lg:hidden text-center text-[11px] text-slate-400 pt-2">
                                Want to create quizzes like this?{' '}
                                <Link to="/signup" className="text-primary font-semibold hover:underline">
                                    Sign up free
                                </Link>
                            </p>
                        </div>
                    </div>
                </main>
            </div>

            {/* Shake keyframe */}
            <style>{`
                @keyframes shake {
                    0%,100%{transform:translateX(0)}
                    20%{transform:translateX(-10px)}
                    40%{transform:translateX(10px)}
                    60%{transform:translateX(-6px)}
                    80%{transform:translateX(6px)}
                }
            `}</style>
        </div>
    );
}
