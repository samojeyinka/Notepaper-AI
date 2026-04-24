import { useNavigate } from 'react-router-dom';
import { DEMO_QUIZZES } from './QuizPlayPage';

// ── Subject color map ─────────────────────────────────────────────────────────
const SUBJECT_STYLES = {
    Science: { bg: 'bg-violet-100', text: 'text-violet-600', icon: 'science',     glow: 'from-violet-500 to-purple-600' },
    History: { bg: 'bg-amber-100',  text: 'text-amber-600',  icon: 'history_edu', glow: 'from-amber-500 to-orange-600'  },
    Math:    { bg: 'bg-blue-100',   text: 'text-blue-600',   icon: 'calculate',   glow: 'from-blue-500 to-indigo-600'   },
    English: { bg: 'bg-emerald-100',text: 'text-emerald-600',icon: 'menu_book',   glow: 'from-emerald-500 to-teal-600'  },
};

const getStyle = (subject) => SUBJECT_STYLES[subject] ?? {
    bg: 'bg-slate-100', text: 'text-slate-500', icon: 'quiz', glow: 'from-slate-400 to-slate-600',
};

// ── Quiz card ─────────────────────────────────────────────────────────────────
const QuizCard = ({ quiz }) => {
    const navigate = useNavigate();
    const style = getStyle(quiz.subject);

    return (
        <div
            className="group bg-white rounded-3xl border border-slate-100 p-5 hover:shadow-md hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            onClick={() => navigate(`/lockedin/quizzes/${quiz.id}/play`)}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${quiz.color ?? style.glow} flex items-center justify-center shadow-sm`}>
                    <span className="material-icons-round text-white text-[18px]">{quiz.icon ?? style.icon}</span>
                </div>
                <span className={`${style.bg} ${style.text} text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider`}>
                    {quiz.subject}
                </span>
            </div>

            {/* Content */}
            <h3 className="font-bold text-slate-900 text-[15px] leading-snug mb-1 group-hover:text-primary transition-colors">
                {quiz.title}
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">{quiz.description}</p>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-1 text-slate-400 text-xs">
                    <span className="material-icons-round text-[13px]">help_outline</span>
                    {quiz.questions.length} questions
                </div>
                <div className="flex items-center gap-1 text-primary text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Play
                    <span className="material-icons-round text-[13px]">play_arrow</span>
                </div>
            </div>
        </div>
    );
};

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = ({ onCreate }) => (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
        <div className="relative mb-6">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center">
                <span className="material-icons-round text-primary text-[36px]">quiz</span>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center shadow-sm">
                <span className="material-icons-round text-white text-[12px]">add</span>
            </div>
        </div>
        <h3 className="text-slate-800 font-bold text-lg mb-2">No quizzes yet</h3>
        <p className="text-slate-400 text-sm max-w-xs leading-relaxed mb-6">
            Create your first quiz to start testing your knowledge and tracking your progress.
        </p>
        <button
            onClick={onCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white text-sm font-bold shadow-md shadow-primary/30 hover:bg-primary/90 transition-all"
        >
            <span className="material-icons-round text-[16px]">add</span>
            Create Quiz
        </button>
    </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function QuizzesPage() {
    const navigate = useNavigate();

    // For demo purposes, use hardcoded quizzes — swap for API call later
    const quizzes = DEMO_QUIZZES;

    return (
        <div className="flex-1 lg:ml-64 p-3 lg:p-8 pt-20 lg:pt-8 min-h-screen">
            <div className="max-w-5xl mx-auto">

                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <button
                                onClick={() => navigate('/lockedin')}
                                className="text-slate-400 hover:text-slate-700 transition-colors"
                            >
                                <span className="material-icons-round text-[18px]">arrow_back</span>
                            </button>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Quizzes</h1>
                        </div>
                        <p className="text-slate-400 text-sm ml-7">Test your knowledge, track your progress</p>
                    </div>

                    <button
                        onClick={() => navigate('/lockedin/generate?tab=quizzes')}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary text-white text-sm font-bold shadow-md shadow-primary/30 hover:bg-primary/90 transition-all active:scale-[0.97]"
                    >
                        <span className="material-icons-round text-[16px]">add</span>
                        <span className="hidden sm:inline">Create Quiz</span>
                    </button>
                </div>

                {/* ── Stats row ───────────────────────────────────────────── */}
                {quizzes.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mb-8">
                        {[
                            { label: 'Total Quizzes', value: quizzes.length, icon: 'quiz', color: 'text-violet-600', bg: 'bg-violet-50' },
                            { label: 'Questions',     value: quizzes.reduce((s, q) => s + q.questions.length, 0), icon: 'help_outline', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                            { label: 'Best Score',    value: '—',             icon: 'emoji_events', color: 'text-amber-600', bg: 'bg-amber-50' },
                        ].map(stat => (
                            <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 p-4">
                                <div className={`w-8 h-8 ${stat.bg} rounded-xl flex items-center justify-center mb-2`}>
                                    <span className={`material-icons-round text-[16px] ${stat.color}`}>{stat.icon}</span>
                                </div>
                                <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── AI Generate teaser ────────────────────────────────── */}
                <div
                    className="bg-gradient-to-r from-violet-500 to-primary rounded-3xl p-5 mb-8 flex items-center gap-4 cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() => navigate('/lockedin/generate?tab=quizzes')}
                >
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                        <span className="material-icons-round text-white text-[22px]">auto_awesome</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm">Generate Quiz with AI</p>
                        <p className="text-white/70 text-xs mt-0.5">Pick a topic and let AI create questions for you</p>
                    </div>
                    <div className="shrink-0 flex items-center gap-1 bg-white/20 rounded-xl px-3 py-1.5">
                        <span className="text-white text-xs font-semibold">Coming Soon</span>
                    </div>
                </div>

                {/* ── Quiz grid ──────────────────────────────────────────── */}
                <div>
                    <h2 className="text-base font-bold text-slate-700 mb-4">All Quizzes</h2>

                    {quizzes.length === 0 ? (
                        <div className="grid grid-cols-1">
                            <EmptyState onCreate={() => navigate('/lockedin/generate?tab=quizzes')} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {quizzes.map(quiz => (
                                <QuizCard key={quiz.id} quiz={quiz} />
                            ))}

                            {/* Create new card */}
                            <button
                                onClick={() => navigate('/lockedin/generate?tab=quizzes')}
                                className="group border-2 border-dashed border-slate-200 rounded-3xl p-5 flex flex-col items-center justify-center gap-3 hover:border-primary/40 hover:bg-primary/5 transition-all min-h-[160px]"
                            >
                                <div className="w-10 h-10 rounded-2xl bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                                    <span className="material-icons-round text-slate-400 group-hover:text-primary text-[20px] transition-colors">add</span>
                                </div>
                                <span className="text-sm font-semibold text-slate-400 group-hover:text-primary transition-colors">New Quiz</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
