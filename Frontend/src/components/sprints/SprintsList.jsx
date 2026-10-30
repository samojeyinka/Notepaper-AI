import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { sprintService } from '../../api/sprintService';
import { workspaceCache } from '../../api/workspaceCache';
import Loader from '../globals/Loader';
import NotificationIcon from '../user/NotificationIcon';

const PAGE_SIZE = 8;

const SORT_OPTIONS = [
    { id: 'newest',   label: 'Newest'        },
    { id: 'oldest',   label: 'Oldest'        },
    { id: 'title',    label: 'Title (A–Z)'   },
    { id: 'progress', label: 'Most Progress' },
];

const fmt = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Status dot colour + quiet label
const STATUS_META = {
    active:     { label: 'Active',     dot: 'bg-plum-600',  text: 'text-plum-700' },
    generating: { label: 'Building',   dot: 'bg-amber-600', text: 'text-amber-700' },
    completed:  { label: 'Completed',  dot: 'bg-stone-400', text: 'text-stone-500' },
    failed:     { label: 'Failed',     dot: 'bg-red-600',   text: 'text-red-600'   },
};

// ── Planner-style sprint card ─────────────────────────────────────────────────
const SprintPlannerCard = ({ sprint, onNavigate }) => {
    const total = sprint.challenges_count ?? 0;
    const done  = sprint.completed_challenges_count ?? 0;
    const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
    const meta  = STATUS_META[sprint.status] ?? STATUS_META.active;
    const range = sprint.start_date && sprint.end_date
        ? `${fmt(sprint.start_date)} – ${fmt(sprint.end_date)}`
        : '';

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onNavigate(sprint.id)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate(sprint.id); } }}
            className="group w-full text-left bg-white ring-1 ring-stone-200/70 px-5 md:px-6 py-4 hover:ring-plum-300 hover:-translate-y-0.5 transition-all cursor-pointer"
        >
            <div className="flex items-start justify-between gap-5">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 ${meta.dot} shrink-0`} />
                        <h3 className="font-semibold text-[15px] text-stone-900 truncate group-hover:text-plum-700 transition-colors">
                            {sprint.title}
                        </h3>
                    </div>
                    {sprint.goal && (
                        <p className="mt-1 text-[12.5px] text-stone-500 italic leading-relaxed line-clamp-1">
                            {sprint.goal}
                        </p>
                    )}
                    <p className="mt-2 text-[11.5px] text-stone-400 flex flex-wrap gap-x-4 gap-y-1">
                        {range && <span>{range}</span>}
                        <span>{total} {total === 1 ? 'challenge' : 'challenges'}</span>
                        {sprint.status === 'generating' ? (
                            <span className="text-amber-700 font-medium">Still building your plan…</span>
                        ) : (
                            <span>{done} cleared</span>
                        )}
                    </p>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-1.5">
                    {sprint.status === 'generating' ? (
                        <div className="flex items-center gap-2">
                            <Loader size="sm" />
                            <span className={`text-[10px] font-semibold uppercase tracking-widest ${meta.text}`}>{meta.label}</span>
                        </div>
                    ) : (
                        <span className={`text-[10px] font-semibold uppercase tracking-widest ${meta.text}`}>{meta.label}</span>
                    )}
                    <span className="hidden md:inline-flex items-center gap-1 text-[11.5px] font-semibold text-plum-700 opacity-0 group-hover:opacity-100 transition-opacity">
                        {sprint.status === 'completed' ? 'Review' : 'Continue'}
                        <span className="material-icons-round text-[14px]">arrow_forward</span>
                    </span>
                </div>
            </div>

            {sprint.status !== 'generating' && (
                <div className="mt-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9.5px] font-semibold uppercase tracking-widest text-stone-400">Progress</span>
                        <span className="text-[11px] font-semibold text-plum-700">{done}/{total} · {pct}%</span>
                    </div>
                    <div className="h-1 bg-stone-200 overflow-hidden">
                        <div className="h-full bg-plum-600 transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                </div>
            )}
        </div>
    );
};

const SprintsList = () => {
    const navigate = useNavigate();
    const [sprints,  setSprints]  = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState(null);
    const [search,   setSearch]   = useState('');
    const [sortBy,   setSortBy]   = useState('newest');
    const [sortOpen, setSortOpen] = useState(false);
    const [page,     setPage]     = useState(1);

    useEffect(() => {
        const cached = workspaceCache.getSprintsList();
        if (cached) { setSprints(cached); setLoading(false); return; }
        sprintService.list()
            .then(res => {
                const data = res.data ?? [];
                workspaceCache.setSprintsList(data);
                setSprints(data);
            })
            .catch(() => setError('Failed to load sprints.'))
            .finally(() => setLoading(false));
    }, []);

    const activeCount   = sprints.filter(s => s.status === 'active' || s.status === 'generating').length;
    const completedCount = sprints.filter(s => s.status === 'completed').length;
    const totalDone     = sprints.reduce((sum, s) => sum + (s.completed_challenges_count ?? 0), 0);
    const totalChallenges = sprints.reduce((sum, s) => sum + (s.challenges_count ?? 0), 0);
    const totalPct      = totalChallenges > 0 ? Math.round((totalDone / totalChallenges) * 100) : 0;

    const filtered = useMemo(() => {
        let list = [...sprints];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(s =>
                s.title?.toLowerCase().includes(q) ||
                s.goal?.toLowerCase().includes(q)
            );
        }
        switch (sortBy) {
            case 'oldest':   list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); break;
            case 'title':    list.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? ''));     break;
            case 'progress': list.sort((a, b) => {
                const pA = (a.challenges_count ?? 0) > 0 ? (a.completed_challenges_count ?? 0) / a.challenges_count : 0;
                const pB = (b.challenges_count ?? 0) > 0 ? (b.completed_challenges_count ?? 0) / b.challenges_count : 0;
                return pB - pA;
            }); break;
            default:         list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); break;
        }
        return list;
    }, [sprints, search, sortBy]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleSearch = (v) => { setSearch(v); setPage(1); };
    const handleSort   = (id) => { setSortBy(id); setSortOpen(false); setPage(1); };
    const goTo         = (id) => navigate(`/lockedin/sprints/${id}`);

    const currentSortLabel = SORT_OPTIONS.find(o => o.id === sortBy)?.label ?? 'Newest';
    const hasData = !loading && !error && sprints.length > 0;

    return (
        <div className="sprints-content flex-1 lg:ml-64 px-4 sm:px-6 lg:px-10 pt-20 lg:pt-10 pb-32 min-w-0 overflow-x-hidden">

            {/* Header */}
            <div className="sprints-header flex items-end justify-between gap-4 mb-8">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-plum-700 mb-1.5">Focused study</p>
                    <h1 className="font-display-serif text-[28px] md:text-[34px] font-semibold tracking-tight text-stone-900 leading-tight">Sprints</h1>
                    <p className="text-stone-500 text-[13px] md:text-sm mt-1.5">Short, focused study pushes with a clear end.</p>
                </div>
                <div className="flex items-center gap-3 md:gap-5">
                    <button
                        onClick={() => navigate('/lockedin/sprints/create')}
                        className="bg-stone-900 text-white px-5 py-2 text-sm font-semibold hover:bg-stone-700 active:scale-[0.98] transition-all"
                    >
                        New Sprint
                    </button>
                    <NotificationIcon />
                </div>
            </div>

            {/* Momentum banner */}
            {hasData && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-paper-darker/70 ring-1 ring-stone-200/80 px-6 md:px-9 py-6 md:py-8 mb-8">
                    <div className="max-w-sm">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-plum-700 mb-2">Momentum</p>
                        <p className="font-display-serif text-[19px] md:text-[22px] font-semibold text-stone-900 leading-snug">
                            {activeCount > 0
                                ? `You're in the middle of ${activeCount} active ${activeCount === 1 ? 'sprint' : 'sprints'}.`
                                : 'Nice work — you have a clean slate.'}
                        </p>
                        <p className="text-[13px] text-stone-500 mt-1.5 leading-relaxed">
                            {totalPct}% of your challenges are cleared. A little each day keeps the streak going.
                        </p>
                    </div>

                    <div className="flex items-center gap-8 md:gap-10 shrink-0">
                        <div>
                            <p className="font-display-serif text-[26px] md:text-[30px] font-semibold text-plum-700 leading-none">{totalDone}</p>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mt-1.5">Challenges cleared</p>
                        </div>
                        <div className="w-px h-9 bg-stone-300/70 hidden md:block" />
                        <div>
                            <p className="font-display-serif text-[26px] md:text-[30px] font-semibold text-stone-900 leading-none">{completedCount}</p>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mt-1.5">Completed sprints</p>
                        </div>
                        <div className="w-px h-9 bg-stone-300/70 hidden md:block" />
                        <div>
                            <p className="font-display-serif text-[26px] md:text-[30px] font-semibold text-stone-900 leading-none">{sprints.length}</p>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mt-1.5">Total sprints</p>
                        </div>
                    </div>
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
                            onChange={e => handleSearch(e.target.value)}
                            placeholder="Search your sprints…"
                            className="w-full bg-white border border-stone-200 py-2.5 pl-10 pr-4 text-sm text-stone-700 placeholder-stone-400 outline-none focus:ring-2 focus:ring-plum-200 transition-all"
                        />
                        {search && (
                            <button onClick={() => handleSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
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
                                        onClick={() => handleSort(opt.id)}
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

            {/* Loading */}
            {loading && (
                <div className="flex justify-center py-24">
                    <Loader />
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                    <p className="text-stone-500 text-sm">{error}</p>
                    <button
                        onClick={() => {
                            setError(null); setLoading(true);
                            sprintService.list()
                                .then(r => setSprints(r.data ?? []))
                                .catch(() => setError('Failed to load sprints.'))
                                .finally(() => setLoading(false));
                        }}
                        className="text-plum-700 text-sm font-semibold underline underline-offset-4 decoration-plum-300 hover:decoration-plum-600 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Empty — no sprints yet */}
            {!loading && !error && sprints.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <h3 className="font-display-serif text-[22px] font-semibold text-stone-900 mb-2">Plan your first sprint</h3>
                    <p className="text-stone-500 text-sm max-w-sm leading-relaxed mb-7">
                        Pick a goal, give it a few days, and let a sprint break it into one focused challenge at a time.
                    </p>
                    <button
                        onClick={() => navigate('/lockedin/sprints/create')}
                        className="px-6 py-3 bg-stone-900 text-white text-sm font-semibold hover:bg-stone-700 transition-all active:scale-[0.98]"
                    >
                        Create Sprint
                    </button>
                </div>
            )}

            {/* No search results */}
            {!loading && !error && sprints.length > 0 && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <p className="text-stone-500 font-medium">No sprints match "{search}"</p>
                    <button onClick={() => handleSearch('')} className="mt-2 text-plum-700 text-sm font-semibold underline underline-offset-4 decoration-plum-300 hover:decoration-plum-600 transition-colors">
                        Clear search
                    </button>
                </div>
            )}

            {/* Sprint stack */}
            {!loading && !error && paginated.length > 0 && (
                <>
                    <div className="space-y-3.5">
                        {paginated.map(s => (
                            <SprintPlannerCard key={s.id} sprint={s} onNavigate={goTo} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <p className="text-[12px] text-stone-400">
                                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
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
};

export default SprintsList;
