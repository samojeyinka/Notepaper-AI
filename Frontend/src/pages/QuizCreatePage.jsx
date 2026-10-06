import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/user/Sidebar';
import NotificationIcon from '../components/user/NotificationIcon';

// ── Pro-locked source item ────────────────────────────────────────────────────
const LockedSource = ({ icon, label, color, bg }) => (
    <div className="relative flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50/50 opacity-60 cursor-not-allowed select-none">
        <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center`}>
            <span className={`material-icons-round text-[15px] ${color}`}>{icon}</span>
        </div>
        <span className="text-sm text-slate-500 font-medium flex-1">{label}</span>
        <div className="flex items-center gap-1 bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
            <span className="material-icons-round text-[10px]">lock</span>
            Pro
        </div>
    </div>
);

// ── Question type option ──────────────────────────────────────────────────────
const TypeOption = ({ id, icon, label, description, selected, onSelect }) => (
    <button
        onClick={() => onSelect(id)}
        className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all ${
            selected
                ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                : 'border-slate-100 bg-white hover:border-slate-300'
        }`}
    >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            selected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
        }`}>
            <span className="material-icons-round text-[17px]">{icon}</span>
        </div>
        <div className="min-w-0">
            <p className={`text-sm font-semibold ${selected ? 'text-primary' : 'text-slate-700'}`}>{label}</p>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{description}</p>
        </div>
        {selected && (
            <span className="material-icons-round text-primary text-[16px] shrink-0 mt-0.5">check_circle</span>
        )}
    </button>
);

// ── Subject picker ────────────────────────────────────────────────────────────
const SUBJECTS = [
    { id: 'science',  label: 'Science',  icon: 'science',     color: 'bg-violet-100 text-violet-600' },
    { id: 'history',  label: 'History',  icon: 'history_edu', color: 'bg-amber-100 text-amber-600'   },
    { id: 'math',     label: 'Math',     icon: 'calculate',   color: 'bg-blue-100 text-blue-600'     },
    { id: 'english',  label: 'English',  icon: 'menu_book',   color: 'bg-emerald-100 text-emerald-600'},
    { id: 'geography',label: 'Geography',icon: 'public',      color: 'bg-teal-100 text-teal-600'     },
    { id: 'other',    label: 'Other',    icon: 'category',    color: 'bg-slate-100 text-slate-500'   },
];

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function QuizCreatePage() {
    const navigate = useNavigate();

    const [title,      setTitle]      = useState('');
    const [subject,    setSubject]    = useState('');
    const [topic,      setTopic]      = useState('');
    const [questionCount, setQuestionCount] = useState(10);
    const [types,      setTypes]      = useState({ multiple: true, input: false });

    const toggleType = (key) => {
        setTypes(t => {
            const next = { ...t, [key]: !t[key] };
            // at least one must be selected
            if (!next.multiple && !next.input) return t;
            return next;
        });
    };

    const canCreate = title.trim() && subject && topic.trim();

    const handleCreate = () => {
        if (!canCreate) return;
        // For now, navigate to quizzes list — backend not wired yet
        navigate('/lockedin/quizzes');
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar activePage="/lockedin/quizzes" />
        <div className="flex-1 lg:ml-64 p-3 lg:p-8 pt-20 lg:pt-8 min-h-screen bg-slate-50/50">
            <div className="max-w-2xl mx-auto">

                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="flex items-center justify-between gap-3 mb-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/lockedin/quizzes')}
                            className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-all"
                        >
                            <span className="material-icons-round text-[18px]">arrow_back</span>
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Create Quiz</h1>
                            <p className="text-slate-400 text-xs mt-0.5">Set up your quiz details below</p>
                        </div>
                    </div>
                    <NotificationIcon />
                </div>

                <div className="space-y-5">

                    {/* ── Basic info ──────────────────────────────────────── */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-5 space-y-4">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Quiz Details</h2>

                        {/* Title */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Quiz Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. Organic Chemistry Chapter 4"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                            />
                        </div>

                        {/* Topic */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Topic / Focus Area</label>
                            <textarea
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                                placeholder="Describe what this quiz should cover — e.g. 'Molecular bonds, functional groups, and reactions in organic chemistry'"
                                rows={3}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
                            />
                        </div>
                    </div>

                    {/* ── Subject ─────────────────────────────────────────── */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-5">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Subject</h2>
                        <div className="grid grid-cols-3 gap-2">
                            {SUBJECTS.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => setSubject(s.id)}
                                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all text-center ${
                                        subject === s.id
                                            ? 'border-primary bg-primary/5 shadow-sm'
                                            : 'border-slate-100 hover:border-slate-300'
                                    }`}
                                >
                                    <div className={`w-8 h-8 rounded-xl ${s.color} flex items-center justify-center`}>
                                        <span className="material-icons-round text-[15px]">{s.icon}</span>
                                    </div>
                                    <span className={`text-[11px] font-semibold ${subject === s.id ? 'text-primary' : 'text-slate-600'}`}>
                                        {s.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Question count ───────────────────────────────────── */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Number of Questions</h2>
                            <span className="text-sm font-bold text-primary">{questionCount}</span>
                        </div>
                        <input
                            type="range"
                            min={5}
                            max={20}
                            step={5}
                            value={questionCount}
                            onChange={e => setQuestionCount(Number(e.target.value))}
                            className="w-full accent-primary cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-300 mt-1">
                            {[5, 10, 15, 20].map(n => (
                                <span key={n}>{n}</span>
                            ))}
                        </div>
                    </div>

                    {/* ── Question types ───────────────────────────────────── */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-5 space-y-2">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Question Types</h2>
                        <TypeOption
                            id="multiple"
                            icon="check_box"
                            label="Multiple Choice"
                            description="Four options per question with one correct answer"
                            selected={types.multiple}
                            onSelect={() => toggleType('multiple')}
                        />
                        <TypeOption
                            id="input"
                            icon="edit_note"
                            label="Short Answer"
                            description="Type the answer as text — tests recall, not recognition"
                            selected={types.input}
                            onSelect={() => toggleType('input')}
                        />
                    </div>

                    {/* ── Source material (pro locked) ──────────────────── */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Source Material</h2>
                            <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm">
                                <span className="material-icons-round text-[11px]">lock</span>
                                Pro Feature
                            </div>
                        </div>

                        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                            Upgrade to Pro to generate quizzes directly from your own notes, papers, and folders — perfectly tailored to your study material.
                        </p>

                        <div className="space-y-2">
                            <LockedSource icon="description"  label="From a Note"           color="text-violet-500" bg="bg-violet-50" />
                            <LockedSource icon="article"      label="From a Paper"          color="text-indigo-500" bg="bg-indigo-50" />
                            <LockedSource icon="folder_open"  label="From a Folder"         color="text-amber-500"  bg="bg-amber-50"  />
                            <LockedSource icon="style"        label="From a Flashcard Set"  color="text-rose-500"   bg="bg-rose-50"   />
                        </div>

                        {/* Upgrade CTA */}
                        <button
                            onClick={() => {/* navigate to upgrade */}}
                            className="mt-4 w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 text-white text-sm font-bold shadow-md shadow-amber-200 hover:opacity-90 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-icons-round text-[16px]">workspace_premium</span>
                            Upgrade to Pro
                        </button>
                    </div>

                    {/* ── Create button ─────────────────────────────────── */}
                    <button
                        onClick={handleCreate}
                        disabled={!canCreate}
                        className="w-full py-4 rounded-3xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/30 hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <span className="material-icons-round text-[18px]">quiz</span>
                        Create Quiz
                    </button>

                    <p className="text-center text-xs text-slate-300 pb-6">
                        AI quiz generation from topics is coming soon
                    </p>
                </div>
            </div>
        </div>
        </div>
    );
}
