import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { sprintService } from '../../api/sprintService';
import { workspaceCache } from '../../api/workspaceCache';
import Loader from '../globals/Loader';

const CIRC     = 2 * Math.PI * 20;
const PAGE_SIZE = 8;

const SORT_OPTIONS = [
    { id: 'newest',   label: 'Newest'         },
    { id: 'oldest',   label: 'Oldest'         },
    { id: 'title',    label: 'Title (A–Z)'    },
    { id: 'progress', label: 'Most Progress'  },
];

const fmt = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const STATUS_META = {
    active:     { label: 'Active',     badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
    generating: { label: 'Generating', badge: 'bg-amber-50 text-amber-700 border border-amber-200'       },
    completed:  { label: 'Completed',  badge: 'bg-slate-100 text-slate-500 border border-slate-200'      },
    failed:     { label: 'Failed',     badge: 'bg-red-50 text-red-600 border border-red-200'             },
};

const CircleProgress = ({ pct }) => (
    <div className="relative w-11 h-11 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-slate-100" />
            <circle cx="24" cy="24" r="20" fill="transparent" stroke="currentColor" strokeWidth="4"
                strokeDasharray={CIRC}
                strokeDashoffset={CIRC * (1 - pct / 100)}
                strokeLinecap="round"
                className="text-primary transition-all duration-700"
            />
        </svg>
        <span className="absolute text-[10px] font-bold text-primary">{pct}%</span>
    </div>
);

const ListHeader = () => (
    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-100 bg-slate-50/50">
        {[
            { label: 'Sprint Name', cls: 'col-span-5'              },
            { label: 'Date Range',  cls: 'col-span-2'              },
            { label: 'Progress',    cls: 'col-span-2 text-center'  },
            { label: 'Action',      cls: 'col-span-3 text-right'   },
        ].map(({ label, cls }) => (
            <div key={label} className={`text-[11px] font-semibold text-slate-400 uppercase tracking-widest ${cls}`}>{label}</div>
        ))}
    </div>
);

const SprintRow = ({ sprint, onNavigate }) => {
    const total = sprint.challenges_count ?? 0;
    const done  = sprint.completed_challenges_count ?? 0;
    const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
    const meta  = STATUS_META[sprint.status] ?? STATUS_META.active;

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4 px-6 py-5 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
            <div className="col-span-5 flex items-center gap-4 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-icons-round text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                </div>
                <div className="min-w-0">
                    <h3 className="text-[14px] font-semibold text-slate-900 leading-snug truncate">{sprint.title}</h3>
                    {sprint.goal && <p className="text-[11px] text-slate-400 truncate">{sprint.goal}</p>}
                    <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${meta.badge}`}>{meta.label}</span>
                </div>
            </div>

            <div className="col-span-2 text-[13px] text-slate-500">
                {fmt(sprint.start_date)} – {fmt(sprint.end_date)}
            </div>

            <div className="col-span-2 flex justify-center">
                {sprint.status === 'generating'
                    ? <Loader size="sm" />
                    : <CircleProgress pct={pct} />
                }
            </div>

            <div className="col-span-3 flex justify-end">
                <button
                    onClick={() => onNavigate(sprint.id)}
                    className="bg-primary/10 text-primary px-5 py-2 rounded-lg text-[13px] font-semibold hover:bg-primary hover:text-white transition-all active:scale-95"
                >
                    {sprint.status === 'completed' ? 'View' : 'Continue'}
                </button>
            </div>
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

    const active    = sprints.filter(s => s.status === 'active' || s.status === 'generating');
    const completed = sprints.filter(s => s.status === 'completed');
    const totalDone = sprints.reduce((sum, s) => sum + (s.completed_challenges_count ?? 0), 0);

    const STATS = [
        { label: 'Active Sprints',  value: active.length,    icon: 'bolt',          bg: 'bg-violet-100',  text: 'text-violet-600'  },
        { label: 'Completed',       value: completed.length, icon: 'military_tech', bg: 'bg-emerald-100', text: 'text-emerald-600' },
        { label: 'Challenges Done', value: totalDone,        icon: 'check_circle',  bg: 'bg-amber-100',   text: 'text-amber-600'   },
        { label: 'Total Sprints',   value: sprints.length,   icon: 'library_books', bg: 'bg-blue-100',    text: 'text-blue-600'    },
    ];

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

    const goTo = (id) => navigate(`/lockedin/sprints/${id}`);

    const currentSortLabel = SORT_OPTIONS.find(o => o.id === sortBy)?.label ?? 'Newest';

    return (
        <div className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 min-w-0 overflow-x-hidden pb-28" style={{ background: '#F8F9FA' }}>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {STATS.map(stat => (
                    <div key={stat.label} className="bg-white p-5 rounded-xl flex items-center justify-between" style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.03)' }}>
                        <div>
                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold text-primary">{loading ? '—' : stat.value}</p>
                        </div>
                        <div className={`${stat.bg} p-3 rounded-lg ${stat.text} shrink-0`}>
                            <span className="material-icons-round text-[20px]">{stat.icon}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Section header */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900">All Sprints</h1>
                <button
                    onClick={() => navigate('/lockedin/sprints/create')}
                    className="bg-primary text-white px-5 py-2 rounded-lg text-[13px] font-semibold hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
                >
                    New Sprint
                </button>
            </div>

            {/* Search + Sort */}
            {!loading && !error && sprints.length > 0 && (
                <div className="flex items-center gap-3 mb-5">
                    <div className="relative flex-1">
                        <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">search</span>
                        <input
                            type="text"
                            value={search}
                            onChange={e => handleSearch(e.target.value)}
                            placeholder="Search sprints…"
                            className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-[13px] text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.04)' }}
                        />
                        {search && (
                            <button onClick={() => handleSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <span className="material-icons-round text-[16px]">close</span>
                            </button>
                        )}
                    </div>

                    <div className="relative shrink-0">
                        <button
                            onClick={() => setSortOpen(v => !v)}
                            className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-lg text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap"
                            style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.04)' }}
                        >
                            <span className="material-icons-round text-slate-400 text-[16px]">sort</span>
                            <span className="hidden sm:inline">{currentSortLabel}</span>
                            <span className="material-icons-round text-slate-400 text-[16px]">expand_more</span>
                        </button>
                        {sortOpen && (
                            <div
                                className="absolute right-0 top-11 bg-white rounded-lg border border-slate-100 py-1 w-44 z-50"
                                style={{ boxShadow: '0px 8px 24px rgba(0,0,0,0.08)' }}
                                onMouseLeave={() => setSortOpen(false)}
                            >
                                {SORT_OPTIONS.map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleSort(opt.id)}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 text-[13px] font-medium transition-colors ${sortBy === opt.id ? 'text-primary bg-primary/5' : 'text-slate-600 hover:bg-slate-50'}`}
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
                    <Loader size="xl" />
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                    <span className="material-icons-round text-red-400 text-[36px]">error_outline</span>
                    <p className="text-slate-500 text-sm">{error}</p>
                    <button
                        onClick={() => {
                            setError(null); setLoading(true);
                            sprintService.list()
                                .then(r => setSprints(r.data ?? []))
                                .catch(() => setError('Failed to load sprints.'))
                                .finally(() => setLoading(false));
                        }}
                        className="text-primary text-sm font-semibold hover:underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Empty (no sprints at all) */}
            {!loading && !error && sprints.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-4">
                        <span className="material-icons-round text-primary text-[40px]">bolt</span>
                    </div>
                    <h3 className="text-slate-800 font-semibold text-xl mb-2">No sprints yet</h3>
                    <p className="text-slate-400 text-sm max-w-xs leading-relaxed mb-6">Create your first AI-powered sprint and start a structured learning journey.</p>
                    <button
                        onClick={() => navigate('/lockedin/sprints/create')}
                        className="flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-white text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
                    >
                        <span className="material-icons-round text-[16px]">add_circle</span>
                        Create Sprint
                    </button>
                </div>
            )}

            {/* No search results */}
            {!loading && !error && sprints.length > 0 && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <span className="material-icons-round text-slate-300 text-[48px] mb-3">search_off</span>
                    <p className="text-slate-500 font-semibold">No sprints match "{search}"</p>
                    <button onClick={() => handleSearch('')} className="mt-3 text-primary text-sm font-semibold hover:underline">Clear search</button>
                </div>
            )}

            {/* List */}
            {!loading && !error && paginated.length > 0 && (
                <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.03)' }}>
                    <ListHeader />
                    {paginated.map(s => <SprintRow key={s.id} sprint={s} onNavigate={goTo} />)}
                </div>
            )}

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
                <div className="flex items-center justify-between mt-5 px-1">
                    <p className="text-[12px] text-slate-400">
                        Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-white hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <span className="material-icons-round text-[18px]">chevron_left</span>
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                            <button
                                key={n}
                                onClick={() => setPage(n)}
                                className={`w-8 h-8 rounded-lg text-[13px] font-semibold transition-all ${n === page ? 'bg-primary text-white' : 'text-slate-500 hover:bg-white hover:text-primary'}`}
                            >
                                {n}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-white hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <span className="material-icons-round text-[18px]">chevron_right</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SprintsList;
