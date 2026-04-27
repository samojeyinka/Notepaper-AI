import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { sprintService } from '../../api/sprintService';
import Loader from '../globals/Loader';

// ── Quiz ─────────────────────────────────────────────────────────────────────

const QuizView = ({ content }) => {
    const [current,  setCurrent]  = useState(0);
    const [selected, setSelected] = useState(null);
    const [revealed, setRevealed] = useState(false);
    const [score,    setScore]    = useState(0);
    const [done,     setDone]     = useState(false);

    const questions = content?.questions ?? [];
    const q = questions[current];

    if (!q) return null;
    if (done) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-20 h-20 rounded-3xl bg-emerald-100 flex items-center justify-center mb-4">
                    <span className="material-icons-round text-emerald-500 text-[40px]">emoji_events</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-1">Quiz complete!</h3>
                <p className="text-slate-500 text-[15px] mb-2">You scored</p>
                <p className="text-4xl font-semibold text-primary mb-1">{score}<span className="text-xl text-slate-400">/{questions.length}</span></p>
                <p className="text-[13px] text-slate-400">{Math.round((score / questions.length) * 100)}% correct</p>
            </div>
        );
    }

    const handleSelect = (i) => {
        if (revealed) return;
        setSelected(i);
        setRevealed(true);
        if (i === q.correct_index) setScore(s => s + 1);
    };

    const handleNext = () => {
        if (current + 1 >= questions.length) {
            setDone(true);
        } else {
            setCurrent(c => c + 1);
            setSelected(null);
            setRevealed(false);
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                <span>Question {current + 1} of {questions.length}</span>
                <span>{score} correct</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((current) / questions.length) * 100}%` }} />
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <p className="text-[15px] font-semibold text-slate-900 leading-snug">{q.question}</p>
            </div>

            <div className="space-y-2.5">
                {q.options.map((opt, i) => {
                    let cls = 'border-slate-200 bg-white text-slate-700 hover:border-primary/30';
                    if (revealed) {
                        if (i === q.correct_index) cls = 'border-emerald-400 bg-emerald-50 text-emerald-800';
                        else if (i === selected)   cls = 'border-red-400 bg-red-50 text-red-800';
                        else                       cls = 'border-slate-100 bg-slate-50 text-slate-400';
                    }
                    return (
                        <button key={i} onClick={() => handleSelect(i)}
                            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-[14px] font-medium ${cls}`}>
                            <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-[11px] font-bold ${
                                revealed && i === q.correct_index ? 'border-emerald-400 text-emerald-600'
                                : revealed && i === selected      ? 'border-red-400 text-red-600'
                                : 'border-current'
                            }`}>
                                {String.fromCharCode(65 + i)}
                            </span>
                            {opt}
                        </button>
                    );
                })}
            </div>

            {revealed && (
                <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Explanation</p>
                    <p className="text-[13px] text-slate-700 leading-relaxed">{q.explanation}</p>
                </div>
            )}

            {revealed && (
                <button onClick={handleNext}
                    className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-[14px] hover:bg-primary/90 transition-all active:scale-95">
                    {current + 1 >= questions.length ? 'See Results' : 'Next Question'}
                </button>
            )}
        </div>
    );
};

// ── Concept ───────────────────────────────────────────────────────────────────

const ConceptView = ({ content }) => (
    <div className="space-y-5">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Explanation</p>
            <p className="text-[14px] text-slate-700 leading-relaxed">{content?.explanation}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-4">Key Points</p>
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

// ── Quick Points ──────────────────────────────────────────────────────────────

const QuickpointsView = ({ content }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-3">
        {(content?.points ?? []).map((pt, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-blue-50">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[11px] font-bold text-blue-600">{i + 1}</span>
                </div>
                <p className="text-[13px] text-slate-700 leading-snug">{pt}</p>
            </div>
        ))}
    </div>
);

// ── Reading ───────────────────────────────────────────────────────────────────

const ReadingView = ({ content }) => (
    <div className="space-y-5">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Reading Passage</p>
            <p className="text-[14px] text-slate-700 leading-[1.8]">{content?.passage}</p>
        </div>
        <div className="bg-teal-50 rounded-2xl p-5 border border-teal-100">
            <p className="text-[11px] font-semibold text-teal-700 uppercase tracking-widest mb-2">Summary</p>
            <p className="text-[13px] text-teal-800 leading-relaxed">{content?.summary}</p>
        </div>
    </div>
);

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

    const [challenge,   setChallenge]   = useState(null);
    const [loading,     setLoading]     = useState(true);
    const [error,       setError]       = useState(null);
    const [completing,  setCompleting]  = useState(false);
    const [completed,   setCompleted]   = useState(false);

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

            {/* Header */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-100 px-4 md:px-8 pt-16 lg:pt-0 py-4 flex items-center gap-4">
                <button onClick={() => navigate(`/lockedin/sprints/${sprintId}`)} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors shrink-0">
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

                {/* Description */}
                <div className="mb-6">
                    <p className="text-[13px] text-slate-500 leading-relaxed">{challenge.description}</p>
                </div>

                {/* Content */}
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

            {/* Complete button */}
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
                <div className="fixed bottom-0 left-0 lg:left-64 right-0 z-50 px-6 py-4 bg-white/95 backdrop-blur border-t border-slate-100">
                    <button onClick={() => navigate(`/lockedin/sprints/${sprintId}`)}
                        className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold text-[15px] hover:bg-emerald-700 transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2">
                        <span className="material-icons-round text-[18px]">arrow_back</span>
                        Back to Sprint Roadmap
                    </button>
                </div>
            )}
        </div>
    );
};

export default ChallengeInterface;
