import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { scholarService } from '../../api/scholarService';
import { workspaceCache } from '../../api/workspaceCache';
import Loader from '../globals/Loader';

// ── Delete confirmation modal ─────────────────────────────────────────────────
function DeleteModal({ doc, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
            <div
                className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                        <span className="material-icons-round text-red-500 text-[20px]">delete_outline</span>
                    </div>
                    <div>
                        <p className="text-[14px] font-bold text-slate-800">Delete document?</p>
                        <p className="text-[12px] text-slate-400 mt-0.5 line-clamp-2">{doc.title || doc.prompt}</p>
                    </div>
                </div>
                <p className="text-[12px] text-slate-500">This action cannot be undone. The document and all its content will be permanently removed.</p>
                <div className="flex gap-2 pt-1">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-[13px] font-semibold hover:bg-red-600 transition-colors active:scale-95"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS = {
    pending_outline:    { label: 'Queued',      badge: 'text-slate-500 bg-slate-100',    icon: 'hourglass_empty', active: true  },
    generating_outline: { label: 'Researching', badge: 'text-violet-600 bg-violet-50',   icon: 'search',          active: true  },
    outline_ready:      { label: 'Writing',     badge: 'text-violet-600 bg-violet-50',   icon: 'edit',            active: true  },
    generating_chapter: { label: 'Writing',     badge: 'text-violet-600 bg-violet-50',   icon: 'edit',            active: true  },
    chapter_ready:      { label: 'Writing',     badge: 'text-violet-600 bg-violet-50',   icon: 'edit',            active: true  },
    assembling:         { label: 'Assembling',  badge: 'text-violet-600 bg-violet-50',   icon: 'sync',            active: true  },
    complete:           { label: 'Complete',    badge: 'text-emerald-600 bg-emerald-50', icon: 'check_circle',    active: false },
    failed:             { label: 'Failed',      badge: 'text-red-600 bg-red-50',         icon: 'error_outline',   active: false },
};

const ACTIVE = new Set(['pending_outline','generating_outline','outline_ready','generating_chapter','chapter_ready','assembling']);

function fmt(date) {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

// ── Three-dot menu ────────────────────────────────────────────────────────────
function CardMenu({ onOpen, onDelete }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const h = e => { if (!ref.current?.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [open]);

    return (
        <div ref={ref} className="relative" onClick={e => e.stopPropagation()}>
            <button
                onClick={() => setOpen(v => !v)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-colors"
            >
                <span className="material-icons-round text-[18px]">more_vert</span>
            </button>
            {open && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 py-1 min-w-[120px]">
                    <button
                        onClick={() => { setOpen(false); onOpen(); }}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-[12px] text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        <span className="material-icons-round text-[14px] text-slate-400">open_in_new</span>
                        Open
                    </button>
                    <button
                        onClick={() => { setOpen(false); onDelete(); }}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-[12px] text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <span className="material-icons-round text-[14px]">delete_outline</span>
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}

// ── Document card ─────────────────────────────────────────────────────────────
function DocCard({ doc, onOpen, onDelete }) {
    const s          = STATUS[doc.status] ?? STATUS.pending_outline;
    const isActive   = ACTIVE.has(doc.status);
    const isComplete = doc.status === 'complete';
    const isFailed   = doc.status === 'failed';
    const pages      = doc.pages?.length ?? doc.total_pages ?? 0;

    const actionLabel = isComplete ? 'Open' : isFailed ? 'View' : 'Resume';

    return (
        <div
            className="bg-surface-light rounded-xl border border-slate-100 p-4 flex flex-col gap-3 cursor-pointer hover:border-slate-200 transition-colors"
            onClick={onOpen}
        >
            {/* Top row: badge + menu */}
            <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${s.badge}`}>
                    <span className="material-icons-round text-[11px]">{s.icon}</span>
                    {s.label}
                </span>
                <CardMenu onOpen={onOpen} onDelete={onDelete} />
            </div>

            {/* Title */}
            <p className="text-[13px] font-semibold text-slate-800 leading-snug line-clamp-3 flex-1">
                {doc.title || doc.prompt}
            </p>

            {/* Date + words */}
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                    <span className="material-icons-round text-[12px]">calendar_today</span>
                    {fmt(doc.created_at)}
                </span>
                {doc.word_count > 0 && (
                    <span className="flex items-center gap-1">
                        <span className="material-icons-round text-[12px]">description</span>
                        {doc.word_count.toLocaleString()} words
                    </span>
                )}
            </div>

            {/* Bottom row: pages + action */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                <span className="text-[11px] text-slate-400">
                    {isActive
                        ? doc.current_page && doc.total_pages
                            ? `Page ${doc.current_page} of ${doc.total_pages}`
                            : 'Starting…'
                        : pages > 0
                            ? `${pages} ${pages === 1 ? 'page' : 'pages'}`
                            : ''}
                </span>
                <span className={`text-[12px] font-semibold ${isFailed ? 'text-red-500' : 'text-primary'}`}>
                    {actionLabel}
                </span>
            </div>
        </div>
    );
}

// ── New entry card ────────────────────────────────────────────────────────────
function NewEntryCard({ onClick }) {
    return (
        <div
            onClick={onClick}
            className="rounded-xl border-2 border-dashed border-slate-200 p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-colors min-h-[160px]"
        >
            <span className="material-icons-round text-slate-300 text-[36px]">note_add</span>
            <span className="text-[12px] font-semibold text-slate-400">Start New Entry</span>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const FILTER_OPTIONS = [
    { value: 'all',      label: 'All'         },
    { value: 'complete', label: 'Complete'     },
    { value: 'active',   label: 'In Progress'  },
    { value: 'failed',   label: 'Failed'       },
];

export default function Scholar() {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState([]);
    const [meta,      setMeta]      = useState(null);
    const [page,      setPage]      = useState(1);
    const [loading,   setLoading]   = useState(true);
    const [search,    setSearch]    = useState('');
    const [filter,    setFilter]    = useState('all');
    const [deleteDoc, setDeleteDoc] = useState(null);

    const fetchPage = (p, silent = false) => {
        if (!silent) setLoading(true);
        return scholarService.list(p)
            .then(res => {
                const data = res.data || [];
                const m    = res.meta || null;
                workspaceCache.setScholars(p, data, m);
                setDocuments(data);
                setMeta(m);
            })
            .catch(() => {})
            .finally(() => { if (!silent) setLoading(false); });
    };

    useEffect(() => {
        const cached = workspaceCache.getScholars(page);
        if (cached) {
            setDocuments(cached.data);
            setMeta(cached.meta);
            setLoading(false);
        } else {
            fetchPage(page);
        }
    }, [page]);

    // Poll every 10s while any document on the current page is still generating
    useEffect(() => {
        const hasActive = documents.some(d => ACTIVE.has(d.status));
        if (!hasActive) return;
        const id = setInterval(() => {
            workspaceCache.invalidateScholars();
            fetchPage(page, true);
        }, 10000);
        return () => clearInterval(id);
    }, [documents, page]);

    const handleDelete = async () => {
        const doc = deleteDoc;
        setDeleteDoc(null);
        try {
            await scholarService.destroy(doc.id);
            workspaceCache.invalidateScholars();
            setDocuments(prev => {
                const next = prev.filter(d => d.id !== doc.id);
                if (next.length === 0 && page > 1) setPage(p => p - 1);
                return next;
            });
            if (meta) {
                setMeta(m => m ? { ...m, total: Math.max(0, m.total - 1) } : m);
            }
        } catch { /* silent */ }
    };

    const goToPage = (p) => {
        if (!meta || p < 1 || p > meta.last_page) return;
        setPage(p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const isFiltering = search.trim() || filter !== 'all';

    const filtered = documents.filter(doc => {
        const matchesSearch = !search.trim() || [doc.title, doc.prompt].some(t =>
            t?.toLowerCase().includes(search.toLowerCase())
        );
        const matchesFilter =
            filter === 'all'      ? true :
            filter === 'complete' ? doc.status === 'complete' :
            filter === 'active'   ? ACTIVE.has(doc.status) :
            filter === 'failed'   ? doc.status === 'failed' :
            true;
        return matchesSearch && matchesFilter;
    });

    const totalDocs   = meta?.total ?? documents.length;
    const lastPage    = meta?.last_page ?? 1;
    const currentPage = meta?.current_page ?? page;

    return (
        <>
        {deleteDoc && (
            <DeleteModal
                doc={deleteDoc}
                onConfirm={handleDelete}
                onCancel={() => setDeleteDoc(null)}
            />
        )}
        <main className="flex-1 h-full overflow-y-auto bg-surface-light lg:ml-64 px-4 lg:px-8 pt-20 lg:pt-8 pb-12">
            <div className="max-w-6xl mx-auto">

                {/* ── Header ─────────────────────────────────────────── */}
                <div className="flex items-end justify-between mb-6">
                    <div>
                        <h1 className="text-[20px] md:text-[28px] font-medium md:font-bold text-slate-800 tracking-tight leading-tight">Documents</h1>
                        <p className="text-[13px] text-slate-400 mt-0.5">
                            {totalDocs > 0 ? `${totalDocs} document${totalDocs === 1 ? '' : 's'} total` : 'Deep work, done right.'}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/lockedin/scholar/new')}
                        className="flex items-center gap-1.5 px-3 md:px-5 py-1.5 md:py-2.5 rounded-md bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 transition-all active:scale-95"
                    >
                        <span className="material-icons-round text-[16px]">add</span>
                        New Document
                    </button>
                </div>

                {/* ── Search + Filter ─────────────────────────────────── */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="relative flex-1 max-w-sm">
                        <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search this page…"
                            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-700 placeholder-slate-400 outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <span className="material-icons-round text-[16px]">close</span>
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <select
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                            className="appearance-none bg-white border border-slate-200 rounded-xl pl-3 pr-8 py-2.5 text-[13px] font-medium text-slate-600 outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
                        >
                            {FILTER_OPTIONS.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                        <span className="material-icons-round absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] pointer-events-none">expand_more</span>
                    </div>
                </div>

                {/* ── Grid ───────────────────────────────────────────── */}
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader size="lg" />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filtered.map(doc => (
                                <DocCard
                                    key={doc.id}
                                    doc={doc}
                                    onOpen={() => navigate(`/lockedin/scholar/${doc.id}`)}
                                    onDelete={() => setDeleteDoc(doc)}
                                />
                            ))}
                            {/* "Start New Entry" card — only on last page with no filter */}
                            {!isFiltering && currentPage === lastPage && (
                                <NewEntryCard onClick={() => navigate('/lockedin/scholar/new')} />
                            )}
                            {/* No results state */}
                            {filtered.length === 0 && isFiltering && (
                                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                                    <span className="material-icons-round text-slate-200 text-5xl mb-3">search_off</span>
                                    <p className="text-[14px] font-semibold text-slate-500 mb-1">No documents found</p>
                                    <p className="text-[12px] text-slate-400">Try a different search or filter</p>
                                </div>
                            )}
                            {/* Empty state — no docs at all */}
                            {filtered.length === 0 && !isFiltering && (
                                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                                    <span className="material-icons-round text-slate-200 text-5xl mb-3">article</span>
                                    <p className="text-[14px] font-semibold text-slate-500 mb-1">No documents yet</p>
                                    <p className="text-[12px] text-slate-400">Create your first scholarly document</p>
                                </div>
                            )}
                        </div>

                        {/* ── Pagination ──────────────────────────────── */}
                        {lastPage > 1 && (
                            <div className="flex items-center justify-center gap-3 mt-8">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage <= 1}
                                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-[12px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <span className="material-icons-round text-[16px]">chevron_left</span>
                                    Prev
                                </button>

                                <div className="flex items-center gap-1.5">
                                    {Array.from({ length: lastPage }, (_, i) => i + 1).map(p => (
                                        <button
                                            key={p}
                                            onClick={() => goToPage(p)}
                                            className={`w-8 h-8 rounded-lg text-[12px] font-semibold transition-colors ${
                                                p === currentPage
                                                    ? 'bg-primary text-white'
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage >= lastPage}
                                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-[12px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                    <span className="material-icons-round text-[16px]">chevron_right</span>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
        </>
    );
}
