import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { quizService } from '../../api/quizService';
import Loader from '../globals/Loader';
import NotificationIcon from '../user/NotificationIcon';

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

const SUBJECT_LABELS = {
    auto: 'General', science: 'Science', history: 'History', math: 'Math',
    english: 'English', geography: 'Geography', technology: 'Technology', economics: 'Economics',
};

const subjectLabel = (s) => {
    if (!s) return '';
    const label = SUBJECT_LABELS[s.toLowerCase()];
    if (label) return label;
    return s.charAt(0).toUpperCase() + s.slice(1);
};

const PAGE_SIZE = 8;

// ── Quiz card (planner style) ─────────────────────────────────────────────────
const QuizCard = ({ quiz, onPlay, onDelete }) => {
    const best          = getBestScore(quiz.id);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    return (
        <div className="group w-full text-left bg-white ring-1 ring-stone-200/70 px-5 md:px-6 py-4 hover:ring-plum-300 hover:-translate-y-0.5 transition-all">
            <div className="flex items-start justify-between gap-5">
                {/* Left — quiz info */}
                <div
                    role="button"
                    tabIndex={0}
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={onPlay}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPlay(); } }}
                >
                    <h3 className="font-semibold text-[15px] text-stone-900 truncate group-hover:text-plum-700 transition-colors">
                        {quiz.title}
                    </h3>
                    <p className="mt-1 text-[12px] text-stone-500">
                        {subjectLabel(quiz.subject)}
                        <span className="text-stone-300 mx-1.5">·</span>
                        {quiz.question_count} {quiz.question_count === 1 ? 'question' : 'questions'}
                        {quiz.difficulty && (
                            <>
                                <span className="text-stone-300 mx-1.5">·</span>
                                <span className="capitalize">{quiz.difficulty}</span>
                            </>
                        )}
                    </p>
                </div>

                {/* Right — best score + menu */}
                <div className="shrink-0 flex items-center gap-4">
                    <div className="text-right">
                        {best !== null ? (
                            <>
                                <p className="font-display-serif text-[22px] font-semibold leading-none text-plum-700">{best}%</p>
                                <p className="text-[9.5px] font-semibold uppercase tracking-widest text-stone-400 mt-1">Best score</p>
                            </>
                        ) : (
                            <>
                                <p className="font-display-serif text-[22px] font-semibold leading-none text-stone-300">—</p>
                                <p className="text-[9.5px] font-semibold uppercase tracking-widest text-stone-300 mt-1">Not played</p>
                            </>
                        )}
                    </div>

                    <button
                        ref={menuRef}
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); }}
                        aria-label="Quiz options"
                        className="p-1.5 text-stone-400 hover:text-stone-700 transition-colors"
                    >
                        <span className="material-icons-round text-[20px]">more_vert</span>
                    </button>
                </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                    {quiz.created_at ? new Date(quiz.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                </span>
                <button
                    onClick={onPlay}
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-plum-700 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    {best !== null ? 'Play again' : 'Start'}
                    <span className="material-icons-round text-[14px]">arrow_forward</span>
                </button>
            </div>

            {menuOpen && createPortal(
                <div
                    style={{
                        position: 'fixed',
                        top: menuRef.current ? menuRef.current.getBoundingClientRect().bottom + 4 : 0,
                        right: menuRef.current ? window.innerWidth - menuRef.current.getBoundingClientRect().right : 0,
                        zIndex: 9999,
                    }}
                    className="workspace-menu bg-white ring-1 ring-stone-200 shadow-xl shadow-stone-900/10 py-1 w-40"
                >
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/quiz/${quiz.id}`);
                            setMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-stone-600 hover:bg-stone-50 transition-colors"
                    >
                        <span className="material-icons-round text-[15px] text-stone-400">link</span>
                        Copy link
                    </button>
                    <div className="h-px bg-stone-100 my-0.5" />
                    <button
                        onClick={() => { setMenuOpen(false); onDelete(quiz.id); }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <span className="material-icons-round text-[15px]">delete_outline</span>
                        Delete quiz
                    </button>
                </div>,
                document.body
            )}
        </div>
    );
};

// ── Empty state (no quizzes at all) ──────────────────────────────────────────
const EmptyState = ({ onCreate }) => (
    <div className="flex flex-col items-center justify-center py-24 text-center">
        <h3 className="font-display-serif text-[22px] font-semibold text-stone-900 mb-2">Test yourself on what you know</h3>
        <p className="text-stone-500 text-sm max-w-sm leading-relaxed mb-7">
            Feed in a topic or your own notes, and get a quiz that actually checks your understanding.
        </p>
        <button
            onClick={onCreate}
            className="px-6 py-3 bg-stone-900 text-white text-sm font-semibold hover:bg-stone-700 transition-all active:scale-[0.98]"
        >
            Create a quiz
        </button>
    </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Quizzes() {
    const navigate = useNavigate();

    const [quizzes,  setQuizzes]  = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [search,   setSearch]   = useState('');
    const [sortBy,   setSortBy]   = useState('newest');
    const [sortOpen, setSortOpen] = useState(false);
    const [page,     setPage]     = useState(1);

    const SORT_OPTIONS = [
        { id: 'newest',     label: 'Newest'          },
        { id: 'oldest',     label: 'Oldest'          },
        { id: 'title',      label: 'Title (A–Z)'     },
        { id: 'questions',  label: 'Most Questions'  },
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

    // ── Derived numbers ───────────────────────────────────────────────────────
    const totalQuestions = quizzes.reduce((s, q) => s + (q.question_count ?? 0), 0);
    const bestScore      = quizzes.reduce((best, q) => {
        const s = getBestScore(q.id);
        return s !== null && s > best ? s : best;
    }, -1);
    const playedCount    = quizzes.filter(q => getBestScore(q.id) !== null).length;

    // ── Filtered + sorted list ────────────────────────────────────────────────
    const displayed = useMemo(() => {
        let list = [...quizzes];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(x => x.title?.toLowerCase().includes(q) || subjectLabel(x.subject).toLowerCase().includes(q));
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
    const totalPages  = Math.max(1, Math.ceil(displayed.length / PAGE_SIZE));
    const paginated   = displayed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const hasData     = !loading && quizzes.length > 0;

    const goPlay = (id) => navigate(`/lockedin/quizzes/${id}/play`);

    return (
        <div className="quizzes-content flex-1 lg:ml-64 px-4 sm:px-6 lg:px-10 pt-20 lg:pt-10 pb-32 min-w-0 overflow-x-hidden">

            {/* Header */}
            <div className="quizzes-header flex items-end justify-between gap-4 mb-8">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-plum-700 mb-1.5">Test yourself</p>
                    <h1 className="font-display-serif text-[28px] md:text-[34px] font-semibold tracking-tight text-stone-900 leading-tight">Quizzes</h1>
                    <p className="text-stone-500 text-[13px] md:text-sm mt-1.5">Quiet check-ins to see what actually stuck.</p>
                </div>
                <div className="flex items-center gap-3 md:gap-5">
                    <button
                        onClick={() => navigate('/lockedin/generate?tab=quizzes')}
                        className="bg-stone-900 text-white px-5 py-2 text-sm font-semibold hover:bg-stone-700 active:scale-[0.98] transition-all"
                    >
                        New Quiz
                    </button>
                    <NotificationIcon />
                </div>
            </div>

            {/* Momentum banner */}
            {hasData && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-paper-darker/70 ring-1 ring-stone-200/80 px-6 md:px-9 py-6 md:py-8 mb-8">
                    <div className="max-w-sm">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-plum-700 mb-2">Your record</p>
                        <p className="font-display-serif text-[19px] md:text-[22px] font-semibold text-stone-900 leading-snug">
                            {playedCount > 0
                                ? `Best score so far is ${bestScore}%.`
                                : 'Nothing attempted yet — pick one and give it a go.'}
                        </p>
                        <p className="text-[13px] text-stone-500 mt-1.5 leading-relaxed">
                            {quizzes.length} {quizzes.length === 1 ? 'quiz' : 'quizzes'} in your library, {totalQuestions} questions between them.
                        </p>
                    </div>

                    <div className="flex items-center gap-8 md:gap-10 shrink-0">
                        <div>
                            <p className="font-display-serif text-[26px] md:text-[30px] font-semibold text-plum-700 leading-none">
                                {quizzes.length}
                            </p>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mt-1.5">Quizzes</p>
                        </div>
                        <div className="w-px h-9 bg-stone-300/70 hidden md:block" />
                        <div>
                            <p className="font-display-serif text-[26px] md:text-[30px] font-semibold text-stone-900 leading-none">{totalQuestions}</p>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mt-1.5">Questions</p>
                        </div>
                        <div className="w-px h-9 bg-stone-300/70 hidden md:block" />
                        <div>
                            <p className="font-display-serif text-[26px] md:text-[30px] font-semibold text-stone-900 leading-none">
                                {bestScore >= 0 ? `${bestScore}%` : '—'}
                            </p>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mt-1.5">Best score</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Make-a-quiz prompt (replaces the old gradient AI banner) */}
            {!loading && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-stone-900 text-white px-6 md:px-9 py-6 md:py-8 mb-8">
                    <div className="max-w-md">
                        <h2 className="font-display-serif text-[20px] md:text-[23px] font-semibold leading-snug">
                            Turn your notes into a quiz
                        </h2>
                        <p className="text-stone-400 text-[13px] mt-1.5 leading-relaxed">
                            Point it at a topic, or one of your notes, papers or decks — and it writes the questions.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/lockedin/generate?tab=quizzes')}
                        className="shrink-0 inline-flex items-center gap-2 bg-white text-stone-900 px-5 py-2.5 text-sm font-semibold hover:bg-stone-200 transition-colors"
                    >
                        Create a quiz
                        <span className="material-icons-round text-[16px]">arrow_forward</span>
                    </button>
                </div>
            )}

            {/* Search + sort */}
            {hasData && (
                <div className="flex items-center gap-3 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <span className="material-icons-round absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-[18px] pointer-events-none">search</span>
                        <input
                            type="text"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search your quizzes…"
                            className="w-full bg-white border border-stone-200 py-2.5 pl-10 pr-4 text-sm text-stone-700 placeholder-stone-400 outline-none focus:ring-2 focus:ring-plum-200 transition-all"
                        />
                        {search && (
                            <button onClick={() => { setSearch(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                                <span className="material-icons-round text-[16px]">close</span>
                            </button>
                        )}
                    </div>

                    <div className="relative shrink-0">
                        <button
                            onClick={() => setSortOpen(v => !v)}
                            className="flex items-center gap-2 bg-white border border-stone-200 px-4 py-2.5 text-[13px] font-medium text-stone-600 hover:bg-stone-50 transition-colors whitespace-nowrap"
                        >
                            <span className="material-icons-round text-stone-400 text-[16px]">sort</span>
                            <span className="hidden sm:inline">{currentSortLabel}</span>
                            <span className="material-icons-round text-stone-400 text-[16px]">expand_more</span>
                        </button>
                        {sortOpen && (
                            <div
                                className="absolute right-0 top-11 bg-white border border-stone-100 py-1 w-44 z-50 shadow-[0_12px_32px_rgba(28,25,23,0.12)]"
                                onMouseLeave={() => setSortOpen(false)}
                            >
                                {SORT_OPTIONS.map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => { setSortBy(opt.id); setSortOpen(false); setPage(1); }}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 text-[13px] font-medium transition-colors ${sortBy === opt.id ? 'text-plum-700 bg-plum-50' : 'text-stone-600 hover:bg-stone-50'}`}
                                    >
                                        {opt.label}
                                        {sortBy === opt.id && <span className="material-icons-round text-[14px]">check</span>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-24">
                    <Loader />
                </div>
            ) : quizzes.length === 0 ? (
                <EmptyState onCreate={() => navigate('/lockedin/generate?tab=quizzes')} />
            ) : displayed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <p className="text-stone-500 font-medium">No quizzes match "{search}"</p>
                    <button onClick={() => { setSearch(''); setPage(1); }} className="mt-2 text-plum-700 text-sm font-semibold underline underline-offset-4 decoration-plum-300 hover:decoration-plum-600 transition-colors">
                        Clear search
                    </button>
                </div>
            ) : (
                <>
                    <div className="space-y-3.5">
                        {paginated.map(quiz => (
                            <QuizCard
                                key={quiz.id}
                                quiz={quiz}
                                onPlay={() => goPlay(quiz.id)}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <p className="text-[12px] text-stone-400">
                                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, displayed.length)} of {displayed.length}
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    aria-label="Previous page"
                                    className="w-9 h-9 flex items-center justify-center text-stone-500 border border-stone-200 hover:border-stone-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <span className="material-icons-round text-[18px]">chevron_left</span>
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                                    <button
                                        key={n}
                                        onClick={() => setPage(n)}
                                        className={`w-9 h-9 text-[13px] font-semibold border transition-all ${n === page ? 'bg-stone-900 border-stone-900 text-white' : 'text-stone-500 border-stone-200 hover:border-stone-400'}`}
                                    >
                                        {n}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    aria-label="Next page"
                                    className="w-9 h-9 flex items-center justify-center text-stone-500 border border-stone-200 hover:border-stone-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <span className="material-icons-round text-[18px]">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
