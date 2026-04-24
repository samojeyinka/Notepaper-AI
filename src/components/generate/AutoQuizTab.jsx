import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Constants ─────────────────────────────────────────────────────────────────
const QUESTION_COUNTS = [5, 10, 15, 20];

const DIFFICULTIES = [
    { id: 'easy',   label: 'Easy',   color: 'text-emerald-600', bg: 'bg-emerald-100', active: 'bg-emerald-500 text-white' },
    { id: 'medium', label: 'Medium', color: 'text-amber-600',   bg: 'bg-amber-100',   active: 'bg-amber-500 text-white'   },
    { id: 'hard',   label: 'Hard',   color: 'text-rose-600',    bg: 'bg-rose-100',    active: 'bg-rose-500 text-white'    },
];

const SUBJECTS = [
    { id: 'auto',      label: 'Auto-detect', icon: 'auto_awesome',  color: 'text-violet-500', bg: 'bg-violet-50' },
    { id: 'science',   label: 'Science',     icon: 'science',       color: 'text-blue-500',   bg: 'bg-blue-50'   },
    { id: 'history',   label: 'History',     icon: 'history_edu',   color: 'text-amber-500',  bg: 'bg-amber-50'  },
    { id: 'math',      label: 'Math',        icon: 'calculate',     color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { id: 'english',   label: 'English',     icon: 'menu_book',     color: 'text-emerald-500',bg: 'bg-emerald-50'},
    { id: 'geography', label: 'Geography',   icon: 'public',        color: 'text-teal-500',   bg: 'bg-teal-50'   },
];

const QUESTION_TYPES = [
    { id: 'multiple', label: 'Multiple Choice', icon: 'check_box' },
    { id: 'input',    label: 'Short Answer',     icon: 'edit_note'  },
    { id: 'both',     label: 'Mixed',            icon: 'shuffle'    },
];

// ── Locked source ─────────────────────────────────────────────────────────────
const LockedSource = ({ icon, label }) => (
    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 opacity-60 cursor-not-allowed select-none">
        <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
            <span className="material-icons-round text-slate-400 text-[14px]">{icon}</span>
        </div>
        <span className="text-xs text-slate-500 font-medium flex-1">{label}</span>
        <span className="material-icons-round text-slate-300 text-[14px]">lock</span>
    </div>
);

// ── Word counter ──────────────────────────────────────────────────────────────
const countWords = (str) => str.trim().split(/\s+/).filter(Boolean).length;

// ── Question preview card ─────────────────────────────────────────────────────
const QuestionPreview = ({ question, index }) => {
    const isMultiple = question.type === 'multiple';
    const LETTERS = ['A', 'B', 'C', 'D'];

    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Q{index + 1}</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    isMultiple
                        ? 'bg-violet-100 text-violet-600'
                        : 'bg-indigo-100 text-indigo-600'
                }`}>
                    {isMultiple ? 'Multiple Choice' : 'Short Answer'}
                </span>
            </div>

            {/* Question text */}
            <p className="text-sm font-semibold text-slate-800 leading-snug mb-4">
                {question.question}
            </p>

            {/* Options */}
            {isMultiple ? (
                <div className="grid grid-cols-2 gap-1.5">
                    {question.options.map((opt, i) => (
                        <div
                            key={i}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] transition-all ${
                                i === question.correct
                                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold'
                                    : 'bg-slate-50 text-slate-500'
                            }`}
                        >
                            <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-bold shrink-0 ${
                                i === question.correct ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                            }`}>
                                {LETTERS[i]}
                            </span>
                            <span className="leading-snug line-clamp-1">{opt}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl">
                    <span className="material-icons-round text-slate-300 text-[14px]">edit_note</span>
                    <span className="text-[11px] text-slate-400 italic">Student types their answer</span>
                </div>
            )}
        </div>
    );
};

// ── Hardcoded preview questions (shown after "generate") ──────────────────────
const PREVIEW_QUESTIONS = [
    {
        type: 'multiple',
        question: 'What is the primary function of mitochondria in a cell?',
        options: ['Protein synthesis', 'Energy production', 'Cell division', 'Waste removal'],
        correct: 1,
    },
    {
        type: 'multiple',
        question: 'Which organelle is known as the "control center" of the cell?',
        options: ['Ribosome', 'Lysosome', 'Nucleus', 'Vacuole'],
        correct: 2,
    },
    {
        type: 'input',
        question: 'What molecule carries genetic information in most living organisms?',
        correct: 'DNA',
    },
    {
        type: 'multiple',
        question: 'Which process do cells use to produce energy without oxygen?',
        options: ['Photosynthesis', 'Aerobic respiration', 'Anaerobic fermentation', 'Osmosis'],
        correct: 2,
    },
    {
        type: 'input',
        question: 'What is the powerhouse of the cell?',
        correct: 'Mitochondria',
    },
    {
        type: 'multiple',
        question: 'What type of bond holds the two strands of DNA together?',
        options: ['Ionic bonds', 'Covalent bonds', 'Hydrogen bonds', 'Peptide bonds'],
        correct: 2,
    },
    {
        type: 'multiple',
        question: 'Which phase of mitosis is characterized by chromosomes aligning at the cell\'s equator?',
        options: ['Prophase', 'Anaphase', 'Metaphase', 'Telophase'],
        correct: 2,
    },
    {
        type: 'input',
        question: 'What is the building block of proteins called?',
        correct: 'Amino acid',
    },
    {
        type: 'multiple',
        question: 'Which scientist is credited with the discovery of penicillin?',
        options: ['Louis Pasteur', 'Alexander Fleming', 'Robert Koch', 'Joseph Lister'],
        correct: 1,
    },
    {
        type: 'multiple',
        question: 'What is the process by which plants convert sunlight into chemical energy?',
        options: ['Respiration', 'Transpiration', 'Photosynthesis', 'Fermentation'],
        correct: 2,
    },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function AutoQuizTab() {
    const navigate = useNavigate();

    const [topic,        setTopic]        = useState('');
    const [details,      setDetails]      = useState('');
    const [questionCount,setQuestionCount]= useState(10);
    const [qType,        setQType]        = useState('multiple');
    const [difficulty,   setDifficulty]   = useState('medium');
    const [subject,      setSubject]      = useState('auto');

    const [status, setStatus] = useState('idle'); // idle | generating | done
    const [questions, setQuestions] = useState([]);

    const detailsWords = countWords(details);
    const detailsOver  = detailsWords > 50;

    const canGenerate = topic.trim() && !detailsOver;

    // Simulate generation (UI only — wires to AI later)
    const handleGenerate = () => {
        if (!canGenerate) return;
        setStatus('generating');
        setQuestions([]);
        setTimeout(() => {
            setQuestions(PREVIEW_QUESTIONS.slice(0, questionCount));
            setStatus('done');
        }, 2200);
    };

    const isGenerating = status === 'generating';
    const isDone       = status === 'done';

    return (
        <div className="flex-1 p-4 md:p-6 grid grid-cols-12 gap-4 md:gap-6 items-start">

            {/* ── Left — config ──────────────────────────────────────────── */}
            <section className="col-span-12 lg:col-span-4 flex flex-col gap-4">

                <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] p-6 flex flex-col gap-5">

                    {/* Header */}
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-rose-100 rounded-xl shrink-0">
                            <span className="material-icons-round text-rose-500 text-[20px]">quiz</span>
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-800 leading-tight">Quiz Generator</h2>
                            <p className="text-[10px] text-slate-400">AI builds your quiz from a topic</p>
                        </div>
                    </div>

                    {/* Topic */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Topic *</label>
                        <input
                            type="text"
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            disabled={isGenerating}
                            placeholder="e.g. Cell biology, French Revolution…"
                            className="w-full rounded-xl bg-slate-50 border-none px-4 py-3 text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-rose-300/40 transition disabled:opacity-50"
                        />
                    </div>

                    {/* Details */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Additional Context</label>
                            <span className={`text-[10px] font-bold ${detailsOver ? 'text-red-500' : 'text-slate-400'}`}>
                                {detailsWords}/50 words
                            </span>
                        </div>
                        <textarea
                            rows={3}
                            value={details}
                            onChange={e => setDetails(e.target.value)}
                            disabled={isGenerating}
                            placeholder="Specify scope, key concepts to include, or chapter/unit…"
                            className={`w-full resize-none rounded-xl bg-slate-50 border-none px-4 py-3 text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 transition disabled:opacity-50 ${
                                detailsOver ? 'ring-2 ring-red-300 focus:ring-red-400' : 'focus:ring-rose-300/40'
                            }`}
                        />
                        {detailsOver && (
                            <p className="text-[10px] text-red-500">Keep additional context under 50 words.</p>
                        )}
                    </div>

                    {/* Question count */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Number of Questions</label>
                        <div className="flex gap-2">
                            {QUESTION_COUNTS.map(n => (
                                <button
                                    key={n}
                                    onClick={() => setQuestionCount(n)}
                                    disabled={isGenerating}
                                    className={`flex-1 py-2 rounded-full text-xs font-bold transition-all disabled:opacity-50 ${
                                        questionCount === n
                                            ? 'bg-rose-100 text-rose-600'
                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                    }`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Question type */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Question Type</label>
                        <div className="flex flex-col gap-1.5">
                            {QUESTION_TYPES.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setQType(t.id)}
                                    disabled={isGenerating}
                                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 text-left ${
                                        qType === t.id
                                            ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200'
                                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                    }`}
                                >
                                    <span className={`material-icons-round text-[15px] ${qType === t.id ? 'text-rose-500' : 'text-slate-400'}`}>
                                        {t.icon}
                                    </span>
                                    {t.label}
                                    {qType === t.id && (
                                        <span className="ml-auto material-icons-round text-[14px] text-rose-400">check</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Difficulty */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Difficulty</label>
                        <div className="flex gap-2">
                            {DIFFICULTIES.map(d => (
                                <button
                                    key={d.id}
                                    onClick={() => setDifficulty(d.id)}
                                    disabled={isGenerating}
                                    className={`flex-1 py-2 rounded-full text-xs font-bold transition-all disabled:opacity-50 ${
                                        difficulty === d.id ? d.active : `${d.bg} ${d.color} hover:opacity-80`
                                    }`}
                                >
                                    {d.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Subject */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject</label>
                        <div className="grid grid-cols-3 gap-1.5">
                            {SUBJECTS.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => setSubject(s.id)}
                                    disabled={isGenerating}
                                    className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-[9px] font-bold transition-all disabled:opacity-50 ${
                                        subject === s.id
                                            ? `${s.bg} ${s.color} ring-1 ring-current/20`
                                            : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                    }`}
                                >
                                    <span className={`material-icons-round text-[15px] ${subject === s.id ? s.color : 'text-slate-400'}`}>
                                        {s.icon}
                                    </span>
                                    <span className="leading-none text-center">{s.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Generate button */}
                    {isGenerating ? (
                        <div className="flex items-center justify-center gap-3 py-4 bg-rose-50 rounded-2xl">
                            <span className="w-5 h-5 border-2 border-rose-300 border-t-rose-500 rounded-full animate-spin" />
                            <span className="text-sm font-semibold text-rose-500">Generating {questionCount} questions…</span>
                        </div>
                    ) : (
                        <button
                            onClick={handleGenerate}
                            disabled={!canGenerate}
                            className="w-full py-4 bg-primary text-white rounded-full font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(101,65,196,0.3)] hover:scale-[0.98] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
                        >
                            <span className="material-icons-round text-[20px]">auto_awesome</span>
                            {isDone ? 'Regenerate Quiz' : 'Generate Quiz'}
                        </button>
                    )}
                </div>

                {/* Pro — source material */}
                <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-700">Generate from your content</p>
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <span className="material-icons-round text-[10px]">workspace_premium</span>
                            Pro
                        </span>
                    </div>
                    <p className="text-[11px] text-slate-400 -mt-2">Generate a quiz directly from your existing Notepaper content.</p>
                    <div className="flex flex-col gap-2">
                        <LockedSource icon="description"  label="From a Note"           />
                        <LockedSource icon="article"      label="From a Paper"          />
                        <LockedSource icon="folder_open"  label="From a Folder"         />
                        <LockedSource icon="style"        label="From a Flashcard Set"  />
                    </div>
                </div>
            </section>

            {/* ── Right — preview workspace ──────────────────────────────── */}
            <section className="col-span-12 lg:col-span-8">
                <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] flex flex-col overflow-hidden relative" style={{ minHeight: '600px' }}>

                    {/* Header */}
                    <div className="px-6 py-4 flex items-center justify-between border-b border-slate-50 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-amber-400" />
                                <div className="w-3 h-3 rounded-full bg-green-400" />
                            </div>
                            <span className="text-xs font-bold text-slate-400 tracking-wide">Question Preview</span>
                            {isDone && (
                                <span className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded-full text-[10px] font-bold">
                                    {questions.length} questions ready
                                </span>
                            )}
                        </div>
                        {isDone && (
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold">
                                <span className={`px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                    difficulty === 'easy'   ? 'bg-emerald-100 text-emerald-600' :
                                    difficulty === 'medium' ? 'bg-amber-100 text-amber-600'     :
                                                             'bg-rose-100 text-rose-600'
                                }`}>
                                    {difficulty}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8">

                        {/* Empty state */}
                        {status === 'idle' && (
                            <div className="h-full flex flex-col items-center justify-center gap-6 text-center py-10">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-rose-400/10 blur-3xl rounded-full scale-150 animate-pulse pointer-events-none" />
                                    <div className="relative w-28 h-28 bg-slate-50 rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
                                        <span className="material-icons-round text-rose-400 text-5xl">quiz</span>
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-rose-100 p-2 rounded-full shadow-sm">
                                        <span className="material-icons-round text-rose-500 text-[15px]">auto_awesome</span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">AI Quiz Generator</h3>
                                    <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                                        Enter a topic on the left, choose your settings, and hit{' '}
                                        <strong className="text-slate-600">Generate Quiz</strong> to build your quiz instantly.
                                    </p>
                                </div>
                                {/* Ghost previews */}
                                <div className="w-full max-w-sm space-y-2 opacity-20 pointer-events-none select-none mt-2">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="h-20 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200" />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Generating skeleton */}
                        {isGenerating && (
                            <div className="space-y-3 animate-pulse">
                                {[...Array(Math.min(questionCount, 5))].map((_, i) => (
                                    <div key={i} className="rounded-2xl bg-slate-100 p-5" style={{ opacity: 1 - i * 0.12 }}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="h-2.5 w-8 bg-slate-200 rounded-full" />
                                            <div className="h-2.5 w-20 bg-slate-200 rounded-full" />
                                        </div>
                                        <div className="h-4 w-4/5 bg-slate-200 rounded-full mb-2" />
                                        <div className="h-3 w-3/5 bg-slate-200 rounded-full mb-4" />
                                        <div className="grid grid-cols-2 gap-2">
                                            {[...Array(4)].map((_, j) => (
                                                <div key={j} className="h-8 bg-slate-200 rounded-xl" />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Generated questions */}
                        {isDone && questions.length > 0 && (
                            <div className="space-y-3">
                                {questions.map((q, i) => (
                                    <QuestionPreview key={i} question={q} index={i} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="shrink-0 px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {isDone
                                ? `${questions.length} questions · ${SUBJECTS.find(s => s.id === subject)?.label ?? 'General'} · ${difficulty}`
                                : 'Status: Idle'
                            }
                        </span>
                        <button
                            onClick={() => isDone && navigate('/lockedin/quizzes')}
                            disabled={!isDone}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-xs font-bold hover:scale-[0.98] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-[0_4px_12px_rgba(101,65,196,0.3)]"
                        >
                            <span className="material-icons-round text-[16px]">save</span>
                            Save Quiz
                        </button>
                    </div>

                    {/* Decorative glow */}
                    <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-rose-400/5 rounded-full blur-3xl pointer-events-none" />
                </div>
            </section>
        </div>
    );
}
