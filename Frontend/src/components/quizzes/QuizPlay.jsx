import { useState, useEffect, useCallback, useRef} from 'react';
import { useNavigate, useParams} from 'react-router-dom';
import { quizService} from '../../api/quizService';

// ── Hardcoded demo quizzes ────────────────────────────────────────────────────
export const DEMO_QUIZZES = [
    {
        id: 'science-101',
        title: 'Science Fundamentals',
        description: 'Core concepts from physics, chemistry, and biology',
        subject: 'Science',
        color: 'from-violet-500 to-purple-600',
        icon: 'science',
        questions: [
            {
                id: 1, type: 'multiple', category: 'Chemistry',
                question: 'What is the chemical formula for water?',
                options: ['H₂O₂', 'H₂O', 'CO₂', 'NaCl'],
                correct: 1,
                explanation: 'Water is made of two hydrogen atoms bonded to one oxygen atom.',
},
            {
                id: 2, type: 'multiple', category: 'Astronomy',
                question: 'Which planet is known as the Red Planet?',
                options: ['Venus', 'Jupiter', 'Mars', 'Saturn'],
                correct: 2,
                explanation: 'Mars appears red due to iron oxide (rust) on its surface.',
},
            {
                id: 3, type: 'input', category: 'Biology',
                question: 'How many bones are in the adult human body?',
                correct: '206',
                explanation: 'Adults have 206 bones; babies are born with about 270 that fuse over time.',
},
            {
                id: 4, type: 'multiple', category: 'Biology',
                question: 'What process do plants use to make food using sunlight?',
                options: ['Respiration', 'Fermentation', 'Digestion', 'Photosynthesis'],
                correct: 3,
                explanation: 'Photosynthesis converts sunlight, CO₂ and water into glucose and oxygen.',
},
            {
                id: 5, type: 'multiple', category: 'Chemistry',
                question: 'Which element has the atomic number 1?',
                options: ['Helium', 'Oxygen', 'Hydrogen', 'Carbon'],
                correct: 2,
                explanation: 'Hydrogen is the lightest and most abundant element in the universe.',
},
            {
                id: 6, type: 'input', category: 'Physics',
                question: 'What is the approximate speed of light in km/s?',
                correct: '300000',
                explanation: 'The speed of light is approximately 299,792 km/s, rounded to 300,000.',
},
            {
                id: 7, type: 'multiple', category: 'Biology',
                question: 'What is the largest organ in the human body?',
                options: ['Heart', 'Liver', 'Brain', 'Skin'],
                correct: 3,
                explanation: 'Skin is the largest organ, covering the entire body.',
},
            {
                id: 8, type: 'multiple', category: 'Physics',
                question: 'What force keeps planets in orbit around the Sun?',
                options: ['Magnetism', 'Friction', 'Gravity', 'Electricity'],
                correct: 2,
                explanation: 'Gravity is the attractive force between masses.',
},
        ],
},
    {
        id: 'history-world',
        title: 'World History',
        description: 'Key events and figures that shaped our world',
        subject: 'History',
        color: 'from-amber-500 to-orange-600',
        icon: 'history_edu',
        questions: [
            {
                id: 1, type: 'multiple', category: 'Modern History',
                question: 'In which year did World War II end?',
                options: ['1943', '1944', '1945', '1946'],
                correct: 2,
                explanation: 'WWII ended in 1945 with Germany surrendering in May and Japan in September.',
},
            {
                id: 2, type: 'input', category: 'American History',
                question: 'Who was the first President of the United States?',
                correct: 'george washington',
                explanation: 'George Washington served as the first U.S. President from 1789 to 1797.',
},
            {
                id: 3, type: 'multiple', category: 'Ancient History',
                question: 'Which ancient wonder was located in Alexandria, Egypt?',
                options: ['The Colosseum', 'The Great Lighthouse', 'The Pantheon', 'Stonehenge'],
                correct: 1,
                explanation: 'The Lighthouse of Alexandria was one of the Seven Wonders of the Ancient World.',
},
            {
                id: 4, type: 'multiple', category: 'Renaissance',
                question: 'The Renaissance period began in which country?',
                options: ['France', 'Spain', 'Italy', 'England'],
                correct: 2,
                explanation: 'The Renaissance began in Italy in the 14th century, starting in Florence.',
},
            {
                id: 5, type: 'input', category: 'Modern History',
                question: 'In what year did the Berlin Wall fall?',
                correct: '1989',
                explanation: 'The Berlin Wall fell on November 9, 1989, leading to German reunification in 1990.',
},
            {
                id: 6, type: 'multiple', category: 'Art History',
                question: 'Who painted the Mona Lisa?',
                options: ['Michelangelo', 'Raphael', 'Donatello', 'Leonardo da Vinci'],
                correct: 3,
                explanation: 'Leonardo da Vinci painted the Mona Lisa between approximately 1503 and 1519.',
},
        ],
},
];

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

// ── Score screen ──────────────────────────────────────────────────────────────
const ScoreScreen = ({ score, total, quiz, onRestart, onBack}) => {
    const pct = Math.round((score / total) * 100);
    const grade =
        pct >= 90 ? { label: 'Excellent',    icon: 'emoji_events', tint: 'bg-emerald-50 text-emerald-600', color: 'text-emerald-700'}
        : pct >= 75 ? { label: 'Great job',   icon: 'celebration',  tint: 'bg-plum-50 text-plum-600',       color: 'text-plum-700'}
        : pct >= 50 ? { label: 'Good effort', icon: 'thumb_up',     tint: 'bg-amber-50 text-amber-600',     color: 'text-amber-700'}
        :             { label: 'Keep trying', icon: 'trending_up',  tint: 'bg-rose-50 text-rose-500',       color: 'text-rose-600'};

    useEffect(() => {
        playSound('complete');
        if (quiz?.id) {
            const key  =`quiz_best_${quiz.id}`;
            const prev = parseInt(localStorage.getItem(key) ?? '0', 10);
            if (pct > prev) localStorage.setItem(key, String(pct));
}
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center p-6 w-full bg-paper font-display text-stone-900">
            <div className="absolute inset-0 dot-grid opacity-60 pointer-events-none" />

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white  border border-stone-200 shadow-[0_16px_40px_-24px_rgba(28,25,23,0.35)] p-8 text-center space-y-6">
                    <div className={`w-16 h-16 ${grade.tint}  flex items-center justify-center mx-auto`}>
                        <span className="material-icons-round text-[30px]">{grade.icon}</span>
                    </div>
                    <div>
                        <p className={`text-sm font-semibold uppercase tracking-[0.16em] ${grade.color}`}>{grade.label}</p>
                        <h2 className="font-display-serif text-stone-900 font-semibold text-5xl mt-2">{pct}%</h2>
                        <p className="text-stone-500 text-sm mt-1">{score} out of {total} correct</p>
                    </div>

                    <div className="bg-stone-100  h-2 overflow-hidden">
                        <div
                            className="h-full bg-plum-600  transition-all duration-1000"
                            style={{ width:`${pct}%`}}
                        />
                    </div>

                    <div className="bg-stone-50 border border-stone-100  p-4 text-left">
                        <p className="text-[10px] text-stone-400 uppercase tracking-[0.16em] font-semibold mb-1">Quiz Completed</p>
                        <p className="text-stone-900 font-semibold">{quiz.title}</p>
                        <p className="text-stone-400 text-sm mt-0.5">{total} questions</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onBack}
                            className="flex-1 py-2 md:py-3.5  border border-stone-200 text-stone-600 font-semibold text-[12px] md:text-sm hover:bg-stone-50 transition-colors"
                        >
                            Back to Quizzes
                        </button>
                        <button
                            onClick={onRestart}
                            className="flex-1 py-2 md:py-3.5  bg-plum-600 text-white font-semibold text-[12px] md:text-sm hover:bg-plum-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Main Play Page ────────────────────────────────────────────────────────────
export default function QuizPlay() {
    const { id} = useParams();
    const navigate = useNavigate();

    // Try API first; fall back to demo data for hardcoded demo IDs
    const [quiz,      setQuiz]      = useState(null);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        const demoMatch = DEMO_QUIZZES.find(q => q.id === id);
        if (demoMatch) { setQuiz(demoMatch); return;}

        quizService.show(id)
            .then(res => {
                const data = res?.data ?? res;
                setQuiz(data);
})
            .catch(() => setLoadError(true));
}, [id]);

    const questions = quiz?.questions ?? [];

    const [currentIdx, setCurrentIdx] = useState(0);
    const [selected,   setSelected]   = useState(null);
    const [inputVal,   setInputVal]   = useState('');
    const [submitted,  setSubmitted]  = useState(false);
    const [score,      setScore]      = useState(0);
    const [done,       setDone]       = useState(false);
    const [shake,      setShake]      = useState(false);
    const [flash,      setFlash]      = useState(null);   // 'correct' | 'wrong'
    const [copied,     setCopied]     = useState(false);
    const inputRef = useRef(null);

    const q          = questions[currentIdx] ?? null;
    const progress   = Math.round((currentIdx / questions.length) * 100);
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
            : inputVal.trim().toLowerCase() === q.correct.toLowerCase();

        setSubmitted(true);
        setFlash(correct ? 'correct' : 'wrong');
        playSound(correct ? 'correct' : 'wrong');
        if (correct) setScore(s => s + 1);
        if (!correct) { setShake(true); setTimeout(() => setShake(false), 500);}
}, [hasAnswer, submitted, isMultiple, selected, inputVal, q]);

    // ── Advance ───────────────────────────────────────────────────────────────
    const advance = useCallback(() => {
        if (!submitted) return;
        const next = currentIdx + 1;
        if (next >= questions.length) { setDone(true); return;}
        setCurrentIdx(next);
        setSelected(null);
        setInputVal('');
        setSubmitted(false);
        setFlash(null);
}, [submitted, currentIdx, questions.length]);

    const goBack = () => {
        if (currentIdx === 0 || submitted) return;
        setCurrentIdx(i => i - 1);
        setSelected(null);
        setInputVal('');
        setSubmitted(false);
        setFlash(null);
};

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
                if (e.code === 'Space') { e.preventDefault(); if (selected !== null) checkAnswer(); return;}
}
            if (e.key === 'Enter') { e.preventDefault(); submitted ? advance() : checkAnswer();}
};
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
}, [done, isMultiple, submitted, q, selected, checkAnswer, advance]);

    // ── Results ───────────────────────────────────────────────────────────────
    const restart = () => {
        setCurrentIdx(0); setSelected(null); setInputVal('');
        setSubmitted(false); setScore(0); setDone(false); setFlash(null);
};

    // ── Loading / error states ────────────────────────────────────────────────
    if (loadError) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-paper font-display text-stone-900">
                <span className="material-icons-round text-stone-300 text-5xl">quiz</span>
                <p className="text-stone-500 font-medium">Quiz not found.</p>
                <button onClick={() => navigate('/lockedin/quizzes')} className="text-plum-700 text-sm font-semibold hover:underline">
                    Back to Quizzes
                </button>
            </div>
        );
}

    if (!quiz) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-paper">
                <span className="w-8 h-8 border-2 border-plum-200 border-t-plum-600 rounded-full animate-spin" />
            </div>
        );
}

    if (done) {
        return <ScoreScreen score={score} total={questions.length} quiz={quiz}
            onRestart={restart} onBack={() => navigate('/lockedin/quizzes')} />;
}

    // ── Play UI ───────────────────────────────────────────────────────────────
    return (
        <div className="flex-1 lg:ml-64 p-4 lg:p-8 pt-16 md:pt-4 min-w-0 overflow-x-hidden pb-28 bg-paper font-display text-stone-900">

            {/* ── Nav ─────────────────────────────────────────────────────── */}
            <nav className="px-2 md:px-6 pt-3 pb-2 md:pb-4 flex flex-col md:gap-5">
                {/* Top row */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate('/lockedin/quizzes')}
                        className="flex items-center gap-1.5 px-3 md:px-4 py-2 text-xs md:text-sm font-semibold text-stone-500 hover:text-stone-900 transition-colors"
                    >
                        <span className="material-icons-round text-[14px] md:text-[16px]">close</span>
                        Exit Quiz
                    </button>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/quiz/${id}`);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
}}
                        className="flex items-center gap-1.5 px-3 md:px-4 py-2 text-xs md:text-sm font-semibold text-stone-500 hover:text-plum-700 transition-colors"
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
                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                            Question {currentIdx + 1} of {questions.length}
                        </span>
                        <span className="text-[10px] font-semibold text-plum-700">{progress}% Completed</span>
                    </div>
                    <div className="h-1.5 md:h-2 w-full bg-stone-200  overflow-hidden">
                        <div
                            className="h-full bg-plum-600  transition-all duration-700 ease-out"
                            style={{ width:`${progress}%`}}
                        />
                    </div>
                </div>
            </nav>

            {/* ── Main ────────────────────────────────────────────────────── */}
            <main className="flex-grow flex items-center justify-center px-4 md:px-6 py-3">
                <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

                    {/* ── Left column (tip card) — large screens only ──── */}
                    <div className="hidden lg:flex lg:col-span-4 flex-col gap-6">
                        {/* Tip card */}
                        <div className="relative p-6 bg-plum-50 border border-plum-200  flex items-start gap-4">
                            <span className="material-icons-round text-plum-600 shrink-0 mt-0.5">lightbulb</span>
                            <p className="text-sm text-plum-800 leading-relaxed italic">
                                "Try to recall the answer before looking at the choices — it strengthens memory retrieval."
                            </p>
                        </div>

                        {/* Question counter card */}
                        <div className="bg-white border border-stone-200  p-5 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-plum-50  flex items-center justify-center">
                                <span className="material-icons-round text-plum-600 text-[20px]">quiz</span>
                            </div>
                            <div>
                                <p className="text-xs text-stone-400 font-semibold uppercase tracking-[0.16em]">Score so far</p>
                                <p className="font-display-serif text-2xl font-semibold text-stone-900 mt-0.5">
                                    {score} <span className="text-stone-300 text-lg font-normal">/ {currentIdx}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── Right column — question + options ────────────── */}
                    <div className="lg:col-span-8 w-full space-y-3 md:space-y-6">

                        {/* Question card — shape unchanged */}
                        <div className={`relative ${shake ? 'animate-[shake_0.4s_ease]' : ''}`}>
                            <div
                                className={`relative   border p-4 md:p-5 lg:p-7 shadow-[0_16px_40px_-24px_rgba(28,25,23,0.35)] transition-shadow ${
                                    flash === 'correct' ? 'border-emerald-300' :
                                    flash === 'wrong'   ? 'border-rose-300'   : 'border-stone-200'
}`}
                                style={{ background: '#ffffff'}}
                            >
                                {/* Category badge */}
                                <span className="inline-block px-1.5 md:px-3 py-0.5 md:py-1 bg-plum-50 text-plum-700 text-[8px] md:text-[10px] md:font-semibold uppercase tracking-[0.16em]  mb-2.5 md:mb-5">
                                    {q.category ?? (isMultiple ? 'Multiple Choice' : 'Short Answer')}
                                </span>

                                {/* Question text */}
                                <h2 className="font-display-serif text-[16px] md:text-2xl text-stone-900 leading-snug">
                                    {q.question}
                                </h2>

                                {/* Explanation after submit */}
                                {submitted && (
                                    <div className={`mt-3 md:mt-6 flex items-start gap-1.5 md:gap-3 p-4   text-[10px] md:text-sm ${
                                        flash === 'correct'
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'bg-rose-50 text-rose-700'
}`}>
                                        <span className="material-icons-round text-[17px] shrink-0 mt-0.5">
                                            {flash === 'correct' ? 'check_circle' : 'cancel'}
                                        </span>
                                        <div>
                                            <p className="font-semibold text-[12px] mb-1">
                                                {flash === 'correct' ? 'Correct!' :`Incorrect${!isMultiple ?` — Answer: ${q.correct}` : ''}`}
                                            </p>
                                            <p className="text-[12px] leading-relaxed opacity-90">{q.explanation}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Multiple choice options — shape unchanged ── */}
                        {isMultiple && (
                            <div className="grid grid-cols-1 gap-2 md:gap-4">
                                {q.options.map((opt, i) => {
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
                                            className={`group w-full flex items-center gap-2 md:gap-6 p-2 md:p-6 border-2   text-left transition-all duration-200 ${
                                                isCorrect
                                                    ? 'bg-white border-emerald-400 shadow-lg shadow-emerald-100'
                                                    : isWrong
                                                        ? 'bg-rose-50 border-rose-300'
                                                        : isSelected
                                                            ? 'bg-white border-plum-400 shadow-lg shadow-plum-100'
                                                            : 'bg-white border-transparent hover:border-plum-300 shadow-sm hover:shadow-md'
}`}
                                        >
                                            {/* Letter box */}
                                            <div className={`w-5 h-5 md:w-12 md:h-12 flex-shrink-0 flex items-center justify-center   font-bold text-sm md:text-base transition-colors ${
                                                isCorrect
                                                    ? 'bg-emerald-500 text-white'
                                                    : isWrong
                                                        ? 'bg-rose-400 text-white'
                                                        : isSelected
                                                            ? 'bg-plum-600 text-white'
                                                            : 'bg-stone-100 text-stone-500 group-hover:bg-plum-600 group-hover:text-white'
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
                                                : isSelected ? 'text-stone-900 font-normal md:font-medium'
                                                : 'text-stone-600 group-hover:text-stone-900'
}`}>
                                                {opt}
                                            </span>

                                            {/* Check icon on selected */}
                                            {isSelected && !submitted && (
                                                <span className="material-icons-round text-plum-600 text-[18px] ml-auto shrink-0">
                                                    check_circle
                                                </span>
                                            )}
                                        </button>
                                    );
})}
                            </div>
                        )}

                        {/* ── Short answer input — shape unchanged ────── */}
                        {!isMultiple && (
                            <div className={`bg-white   border-2 p-6 shadow-sm transition-all ${
                                submitted
                                    ? flash === 'correct' ? 'border-emerald-400' : 'border-rose-300'
                                    : 'border-transparent focus-within:border-plum-300 focus-within:shadow-md'
}`}>
                                <label className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400 mb-3">
                                    Your Answer
                                </label>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputVal}
                                    onChange={e => setInputVal(e.target.value)}
                                    disabled={submitted}
                                    placeholder="Type your answer…"
                                    className="w-full bg-transparent font-display-serif text-[13px] md:text-lg text-stone-900 border-none outline-none placeholder-stone-300 disabled:opacity-60"
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submitted ? advance() : checkAnswer();}}}
                                />
                            </div>
                        )}

                        {/* ── Navigation row ──────────────────────────── */}
                        <div className="flex items-center justify-between pt-2">
                            <button
                                onClick={goBack}
                                disabled={currentIdx === 0 || submitted}
                                className="flex items-center gap-2 text-stone-400 hover:text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium text-sm md:text-base"
                            >
                                <span className="material-icons-round text-[18px]">arrow_back</span>
                                Previous
                            </button>

                            {!submitted ? (
                                <button
                                    onClick={checkAnswer}
                                    disabled={!hasAnswer}
                                    className="flex items-center gap-2 md:gap-3 px-3 md:px-10 py-1.5 md:py-4 bg-plum-600 text-white   font-medium md:font-semibold text-sm md:text-base hover:bg-plum-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    Submit Answer
                                    <span className="material-icons-round text-[18px]">arrow_forward</span>
                                </button>
                            ) : (
                                <button
                                    onClick={advance}
                                    className="flex items-center gap-2 md:gap-3 px-3 md:px-10 py-1.5 md:py-4 bg-plum-600 text-white   font-medium md:font-semibold text-sm md:text-base hover:bg-plum-700 active:scale-95 transition-all"
                                >
                                    {currentIdx + 1 >= questions.length ? 'See Results' : 'Next Question'}
                                    <span className="material-icons-round text-[18px]">arrow_forward</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>

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
