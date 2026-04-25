import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizService } from '../../api/quizService';

// ── Module-level quiz list cache ──────────────────────────────────────────────
let _cache    = null;
let _cachedAt = null;
const CACHE_TTL = 5 * 60 * 1000;

export const invalidateQuizzesCache = () => { _cache = null; _cachedAt = null; };

// ── Best score helpers ────────────────────────────────────────────────────────
const getBestScore = (id) => {
    const v = localStorage.getItem(`quiz_best_${id}`);
    return v !== null ? parseInt(v, 10) : null;
};

// ── Subject icon/color map ────────────────────────────────────────────────────
const SUBJECT_STYLES = {
    auto:      { bg: 'bg-violet-100',  text: 'text-violet-600',  icon: 'quiz'      },
    science:   { bg: 'bg-blue-100',    text: 'text-blue-600',    icon: 'science'            },
    history:   { bg: 'bg-amber-100',   text: 'text-amber-600',   icon: 'history_edu'        },
    math:      { bg: 'bg-indigo-100',  text: 'text-indigo-600',  icon: 'calculate'          },
    english:   { bg: 'bg-emerald-100', text: 'text-emerald-600', icon: 'menu_book'          },
    geography: { bg: 'bg-teal-100',    text: 'text-teal-600',    icon: 'public'             },
    technology:{ bg: 'bg-slate-100',   text: 'text-slate-600',   icon: 'code'               },
    economics: { bg: 'bg-yellow-100',  text: 'text-yellow-700',  icon: 'payments'           },
};
const getSubjectStyle = (subject) =>
    SUBJECT_STYLES[subject?.toLowerCase()] ?? { bg: 'bg-slate-100', text: 'text-slate-500', icon: 'quiz' };

const DIFF_BADGE = {
    easy:   'bg-emerald-50 text-emerald-600',
    medium: 'bg-slate-100 text-slate-500',
    hard:   'bg-rose-50 text-rose-500',
};

const scoreBarColor = (pct) => {
    if (pct === null) return 'bg-slate-200';
    if (pct >= 80)   return 'bg-emerald-500';
    if (pct >= 55)   return 'bg-primary';
    return 'bg-rose-400';
};

// ── Quiz Card ─────────────────────────────────────────────────────────────────
const QuizCard = ({ quiz, onDelete }) => {
    const navigate = useNavigate();
    const style    = getSubjectStyle(quiz.subject);
    const best     = getBestScore(quiz.id);
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div
            className="group bg-white rounded-lg md:rounded-2xl p-3 md:p-6 flex flex-col md:h-64 cursor-pointer border border-transparent hover:border-primary/10 hover:-translate-y-2 transition-all duration-200"
            style={{ boxShadow: '0 10px 30px rgba(44,47,50,0.06)' }}
            onClick={() => navigate(`/lockedin/quizzes/${quiz.id}/play`)}
        >
            {/* Top row */}
            <div className="flex items-start justify-between mb-3 md:mb-6">
                <div className={`w-7 h-7 md:w-12 md:h-12 ${style.bg} rounded-md md:rounded-xl flex items-center justify-center shrink-0`}>
                    <span className={`material-icons-round text-[13px] md:text-[22px] ${style.text}`}>{style.icon}</span>
                </div>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    {quiz.difficulty && (
                        <span className={`text-[8px] md:text-[10px] font-medium md:font-black px-1.5 md:px-3 py-0.5 md:py-1 rounded-full uppercase tracking-widest ${DIFF_BADGE[quiz.difficulty] ?? 'bg-slate-100 text-slate-500'}`}>
                            {quiz.difficulty}
                        </span>
                    )}
                    {/* Overflow menu */}
                    <div className="relative">
                        <button
                            onClick={() => setMenuOpen(v => !v)}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            <span className="material-icons-round text-[16px]">more_vert</span>
                        </button>
                        {menuOpen && (
                            <div
                                className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-slate-100 py-1 w-36 z-50"
                                onMouseLeave={() => setMenuOpen(false)}
                            >
                                <button
                                    onClick={() => { setMenuOpen(false); navigate(`/lockedin/quizzes/${quiz.id}/play`); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <span className="material-icons-round text-[14px] text-slate-400">play_arrow</span>
                                    Play Quiz
                                </button>
                                <div className="h-px bg-slate-100 my-0.5" />
                                <button
                                    onClick={() => { setMenuOpen(false); onDelete(quiz.id); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <span className="material-icons-round text-[14px]">delete_outline</span>
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Title */}
            <h4 className="text-[15px] md:text-[17px] font-medium md:font-bold text-slate-900 leading-snug line-clamp-2 mb-auto group-hover:text-primary transition-colors">
                {quiz.title}
            </h4>

            {/* Footer */}
            <div className="mt-3 md:mt-6">
                <div className="flex items-center justify-between text-sm mb-3">
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <span className="material-icons-round text-[16px]">format_list_bulleted</span>
                        <span className="font-medium md:font-bold text-xs">{quiz.question_count} Questions</span>
                    </div>
                    {best !== null ? (
                        <div className="flex items-center gap-1 text-primary">
                            <span className="material-icons-round text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                            <span className="font-bold text-xs">Best: {best}%</span>
                        </div>
                    ) : (
                        <span className="text-slate-300 text-xs md:font-medium">Not played yet</span>
                    )}
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-700 ${scoreBarColor(best)}`}
                        style={{ width: best !== null ? `${best}%` : '0%' }}
                    />
                </div>
            </div>
        </div>
    );
};

// ── New Quiz dashed card ──────────────────────────────────────────────────────
const NewQuizCard = ({ onClick }) => (
    <button
        onClick={onClick}
        className="group border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-4 h-72 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer w-full"
    >
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white text-slate-400 transition-all">
            <span className="material-icons-round text-[28px]">add</span>
        </div>
        <span className="font-bold text-slate-400 group-hover:text-primary transition-colors">New Quiz</span>
    </button>
);

// ── Empty state (no quizzes at all) ──────────────────────────────────────────
const EmptyState = ({ onCreate }) => (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-4">
            <span className="material-icons-round text-primary text-[40px]">quiz</span>
        </div>
        <h3 className="text-slate-800 font-black text-xl mb-2">No quizzes yet</h3>
        <p className="text-slate-400 text-sm max-w-xs leading-relaxed mb-6">
            Generate your first AI-powered quiz and start testing your knowledge.
        </p>
        <button
            onClick={onCreate}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-white text-sm font-black shadow-md shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
        >
            <span className="material-icons-round text-[16px]">auto_awesome</span>
            Generate Quiz with AI
        </button>
    </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Quizzes() {
    const navigate = useNavigate();

    const [quizzes, setQuizzes]   = useState([]);
    const [loading, setLoading]   = useState(true);
    const [search, setSearch]     = useState('');
    const [sortBy, setSortBy]     = useState('newest');
    const [sortOpen, setSortOpen] = useState(false);

    const SORT_OPTIONS = [
        { id: 'newest',     label: 'Newest'     },
        { id: 'oldest',     label: 'Oldest'     },
        { id: 'title',      label: 'Title (A–Z)' },
        { id: 'questions',  label: 'Most Questions' },
    ];

    const load = async (force = false) => {
        const now   = Date.now();
        const fresh = _cache && _cachedAt && (now - _cachedAt) < CACHE_TTL;
        if (!force && fresh) { setQuizzes(_cache); setLoading(false); return; }
        setLoading(true);
        try {
            const res  = await quizService.list();
            const data = res?.data?.data ?? res?.data ?? [];
            const list = Array.isArray(data) ? data : [];
            _cache = list; _cachedAt = Date.now();
            setQuizzes(list);
        } catch {
            setQuizzes(_cache ?? []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (id) => {
        try {
            await quizService.delete(id);
            const updated = (_cache ?? quizzes).filter(q => q.id !== id);
            _cache = updated;
            setQuizzes(updated);
        } catch { /* silent */ }
    };

    // ── Derived stats ─────────────────────────────────────────────────────────
    const totalQuestions = quizzes.reduce((s, q) => s + (q.question_count ?? 0), 0);
    const bestScore      = quizzes.reduce((best, q) => {
        const s = getBestScore(q.id);
        return s !== null && s > best ? s : best;
    }, -1);

    // ── Filtered + sorted list ────────────────────────────────────────────────
    const displayed = useMemo(() => {
        let list = [...quizzes];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(x => x.title?.toLowerCase().includes(q) || x.subject?.toLowerCase().includes(q));
        }
        switch (sortBy) {
            case 'oldest':    list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); break;
            case 'title':     list.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? '')); break;
            case 'questions': list.sort((a, b) => (b.question_count ?? 0) - (a.question_count ?? 0)); break;
            default:          list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); break;
        }
        return list;
    }, [quizzes, search, sortBy]);

    const currentSortLabel = SORT_OPTIONS.find(o => o.id === sortBy)?.label ?? 'Newest';

    return (
        <div className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 min-w-0 overflow-x-hidden pb-28">
            <div className="mb-6">

                {/* ── Page title row ─────────────────────────────────────── */}
                <div className="flex items-center justify-between mb-4 md:mb-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/lockedin')}
                            className="w-5 h-5 md:w-9 md:h-9 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
                        >
                            <span className="material-icons-round text-[14px] md:text-[18px]">arrow_back</span>
                        </button>
                        <div>
                            <h1 className="text-[15px] md:text-2xl font-semibold text-slate-900 leading-tight mb-1">Quizzes</h1>
                            <p className="text-[10px] md:text-[11px] text-slate-400 uppercase tracking-widest md:font-bold">The Curated Workspace</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/lockedin/generate?tab=quizzes')}
                        className="flex items-center gap-2 px-1 md:px-5 py-1 md:py-3 rounded-full bg-primary text-white text-sm md:font-semibold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
                    >
                        <span className="material-icons-round text-[15px] md:text-[16px]">add_circle</span>
                        <span className="hidden sm:inline">Create New Quiz</span>
                    </button>
                </div>

                {/* ── Stats cards ────────────────────────────────────────── */}
                <div className="grid grid-cols-3 gap-4 md:gap-6 mb-10">
                    {[
                        {
                            label: 'Total Quizzes',
                            value: loading ? '—' : quizzes.length,
                            icon:  'library_books',
                            bg:    'bg-violet-100',
                            text:  'text-violet-600',
                        },
                        {
                            label: 'Total Questions',
                            value: loading ? '—' : totalQuestions,
                            icon:  'format_list_numbered',
                            bg:    'bg-emerald-100',
                            text:  'text-emerald-600',
                        },
                        {
                            label: 'Best Score',
                            value: loading ? '—' : bestScore >= 0 ? bestScore : '—',
                            unit:  bestScore >= 0 && !loading ? '%' : '',
                            icon:  'military_tech',
                            bg:    'bg-amber-100',
                            text:  'text-amber-600',
                        },
                    ].map(stat => (
                        <div
                            key={stat.label}
                            className="rounded-md bg-white md:rounded-2xl p-2 md:p-5 flex-col flex md:flex-row md:items-center gap-2 md:gap-5 hover:-translate-y-1 transition-transform"
                            style={{ boxShadow: '0 10px 30px rgba(44,47,50,0.06)' }}
                        >
                            <div className={`w-5 h-5 md:w-12 md:h-12 ${stat.bg} rounded-2xl flex items-center justify-center shrink-0`}>
                                <span className={`material-icons-round text-[14px] md:text-[22px] ${stat.text}`}>{stat.icon}</span>
                            </div>
                            <div>
                                <p className="text-[8px]  md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
                                <p className="text-2xl md:text-3xl font-black text-slate-900 leading-none">
                                    {stat.value}
                                    {stat.unit && <span className="text-[11px] md:text-sm font-bold text-slate-400 ml-1">{stat.unit}</span>}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── AI Banner ──────────────────────────────────────────── */}
                <div
                    className="relative overflow-hidden rounded-2xl mb-8 bg-primary cursor-pointer group"
                    onClick={() => navigate('/lockedin/generate?tab=quizzes')}
                    style={{ boxShadow: '0 20px 60px rgba(101,65,196,0.25)' }}
                >
                    {/* Right-side image */}
                    <div className="absolute top-0 right-0 w-1/2 h-full">
                        <img
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCl_8nkb82DxOkLe2YD2fF-8NXRb5zCy-vjRqRRwQMerNvnJ0nBKfpS9fbIlyI3OdlzDNB5-lM5ZbPG81IlSggwaju5yUaVZkyRxu37yqT0_AiyBnutamqdX7jJw-fXeVnraToLnHnkwETeElAgCmaURzqeX5OjO8U4sIaCfOidvw5wl6x_j1l027qgqRwLvhl1QxJmm9dGnTes_Mb5y9megNb7tms2jbIILbDmUTZe8hTWFJxT_lZdEEn9344w1kQ7EJx_FUXjxFIA"
                            alt="Abstract AI background"
                            className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700"
                        />
                    </div>

                    {/* Text content */}
                    <div className="relative z-10  p-4 md:p-10 max-w-2xl">
                        <div className="inline-flex items-center gap-1.5 bg-black/30 text-[#ab8eff] px-3 py-1 rounded-full text-[10px] font-medium md:font-black uppercase tracking-tight mb-5">
                            AI Powered
                        </div>
                        <h2 className="text-[22px] md:text-4xl font-black text-white mb-3 leading-tight">
                            Instant Quizzes from your Notes
                        </h2>
                        <p className="text-white text-[15px] md:text-lg mb-4 md:mb-8 max-w-md">
                            Transform any lecture, document, or rough draft into a comprehensive quiz in seconds using Notepaper AI.
                        </p>
                        <button
                            className="inline-flex items-center gap-3 bg-amber-400 text-slate-900 px-3 md:px-7 py-1.5 md:py-3.5 rounded-full font-medium md:font-black text-[12px] md:text-sm hover:bg-amber-300 transition-colors active:scale-95"
                            onClick={e => { e.stopPropagation(); navigate('/lockedin/generate?tab=quizzes'); }}
                        >
                            Generate Quiz with AI
                            <span className="material-icons-round text-[15px] md:text-[18px]">arrow_forward</span>
                        </button>
                    </div>
                </div>

                {/* ── Search + Sort (below banner) ───────────────────────── */}
                <div className="flex items-center gap-1.5 md:gap-3 mb-4 md:mb-8">
                    {/* Search */}
                    <div className="relative flex-1 group">
                        <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] group-focus-within:text-primary transition-colors pointer-events-none">
                            search
                        </span>
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search your quizzes..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-md md:rounded-lg py-1.5 md:py-3 pl-11 pr-4 text-[12px] md:text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            style={{ boxShadow: '0 4px 12px rgba(44,47,50,0.06)' }}
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <span className="material-icons-round text-[16px]">close</span>
                            </button>
                        )}
                    </div>

                    {/* Sort dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setSortOpen(v => !v)}
                            className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-2 md:px-4 py-1.5 md:py-3 rounded-md md:rounded-lg text-sm font-medium md:font-bold text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap"
                            style={{ boxShadow: '0 4px 12px rgba(44,47,50,0.06)' }}
                        >
                     <span className="material-icons-round text-slate-400 text-[16px]">sort</span>
                            <span className="text-slate-800">{currentSortLabel}</span>
                            <span className="material-icons-round text-slate-400 text-[18px]">expand_more</span>
                        </button>
                        {sortOpen && (
                            <div
                                className="absolute right-0 top-12 bg-white rounded-md md:rounded-lg border border-slate-100 py-1.5 w-44 z-50"
                                onMouseLeave={() => setSortOpen(false)}
                            >
                                {SORT_OPTIONS.map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => { setSortBy(opt.id); setSortOpen(false); }}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors ${sortBy === opt.id ? 'text-primary bg-primary/5' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        {opt.label}
                                        {sortBy === opt.id && <span className="material-icons-round text-[14px]">check</span>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Quiz grid ──────────────────────────────────────────── */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[15px] md:text-xl font-semibold text-slate-900">My Quizzes</h3>
                        {search && displayed.length > 0 && (
                            <p className="text-xs text-slate-400 font-medium">{displayed.length} result{displayed.length !== 1 ? 's' : ''}</p>
                        )}
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl p-6 h-72 animate-pulse" style={{ boxShadow: '0 10px 30px rgba(44,47,50,0.06)' }}>
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-12 h-12 bg-slate-100 rounded-xl" />
                                        <div className="w-16 h-6 bg-slate-100 rounded-full" />
                                    </div>
                                    <div className="h-5 bg-slate-100 rounded-full w-4/5 mb-2" />
                                    <div className="h-4 bg-slate-100 rounded-full w-3/5 mb-auto" />
                                    <div className="mt-auto pt-6">
                                        <div className="h-1.5 bg-slate-100 rounded-full w-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : quizzes.length === 0 ? (
                        <EmptyState onCreate={() => navigate('/lockedin/generate?tab=quizzes')} />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    
                            {displayed.length === 0 ? (
                                <div className="col-span-full py-16 flex flex-col items-center text-center">
                                    <span className="material-icons-round text-slate-300 text-[48px] mb-3">search_off</span>
                                    <p className="text-slate-500 font-bold">No quizzes match "{search}"</p>
                                    <button onClick={() => setSearch('')} className="mt-3 text-primary text-sm font-bold hover:underline">Clear search</button>
                                </div>
                            ) : displayed.map(quiz => (
                                <QuizCard key={quiz.id} quiz={quiz} onDelete={handleDelete} />
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
