import { useState, useEffect, useCallback, useRef } from "react";
import Loader from '../components/globals/Loader';
import { useParams, useNavigate, Link } from "react-router-dom";
import { Sidebar } from "../components/user/Sidebar";
import { FloatingAIButton, FolderShape } from "../components/user/FloatingAIButton";
import { folderService } from "../api/folderService";
import { noteService } from "../api/noteService";
import { flashcardService } from "../api/flashcardService";
import { paperService } from "../api/paperService";
import { presentationService } from "../api/presentationService";
import { FlashcardPreviewCard } from "./FlashcardsPage";
import NotificationIcon from "../components/user/NotificationIcon";
import { CardMenu, DeleteConfirmModal } from "../components/globals/DeleteConfirm";
import { workspaceCache } from "../api/workspaceCache";

// ── Module-level cache ────────────────────────────────────────────────────────
const _cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

const cacheGet = (key) => {
    const entry = _cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > CACHE_TTL) { _cache.delete(key); return null; }
    return entry.value;
};
const cacheSet = (key, value) => _cache.set(key, { value, ts: Date.now() });

export const invalidateFolderCache = (id) => {
    _cache.delete(`folder:${id}`);
    _cache.delete(`notes:${id}:updated_at:desc`);
    _cache.delete(`flashcards:${id}`);
    _cache.delete(`papers:${id}`);
    _cache.delete(`presentations:${id}`);
};

// ── helpers ───────────────────────────────────────────────────────────────────
const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const ROTATIONS = ['-rotate-1', 'rotate-2', '-rotate-2', 'rotate-1'];

const SORT_OPTIONS = [
    { value: 'updated_at:desc', label: 'Last updated' },
    { value: 'updated_at:asc',  label: 'Oldest first' },
    { value: 'title:asc',       label: 'Title A → Z' },
    { value: 'title:desc',      label: 'Title Z → A' },
];

const TABS = [
    { id: 'notes',         label: 'Notes',         icon: 'edit_note' },
    { id: 'papers',        label: 'Papers',        icon: 'article' },
    { id: 'flashcards',    label: 'Flashcards',    icon: 'style' },
    { id: 'presentations', label: 'Presentations', icon: 'slideshow' },
];

const snippetText = (raw) => {
    const cleaned = (raw ?? '').trim();
    if (!cleaned) return '';
    try {
        const parsed = JSON.parse(cleaned);
        const html = (parsed.pages ?? [])[0] ?? '';
        if (!html.trim()) return '';
        const div = document.createElement('div');
        div.innerHTML = html;
        return (div.textContent ?? div.innerText ?? '').trim().slice(0, 100);
    } catch {
        return cleaned.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100);
    }
};

// ── Card shell (div — lets us nest the card menu button) ─────────────────────
const CardShell = ({ onClick, className = '', children }) => (
    <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
        className={`text-left group focus:outline-none w-full cursor-pointer ${className}`}
    >
        {children}
    </div>
);

// ── Note card (quiet ruled sheet) ─────────────────────────────────────────────
const FolderNoteCard = ({ note, index, onClick, onDelete }) => (
    <CardShell onClick={onClick} className="relative h-full">
        {onDelete && (
            <div className="absolute top-2 right-2 z-10 bg-white/85  backdrop-blur-sm">
                <CardMenu onDelete={onDelete} />
            </div>
        )}
        <div className={`group h-full flex flex-col overflow-hidden bg-white  ring-1 ring-stone-200/70 transition-all hover:shadow-[0_16px_34px_-22px_rgba(28,25,23,0.28)] hover:ring-plum-200 ${ROTATIONS[index % ROTATIONS.length]}`}>
            <div className="paper-rule relative grow px-4 pt-3 pb-2 overflow-hidden">
                <p className="font-handwritten text-[13.5px] leading-[27px] text-stone-500 break-words">
                    {snippetText(note.snippet) || 'A quiet page, waiting for your words…'}
                </p>
            </div>
            <div className="flex items-end justify-between gap-2 border-t border-stone-100 px-4 py-2.5 bg-stone-50/60">
                <h3 className="text-[13px] font-semibold text-stone-800 truncate min-w-0">{note.title || 'Untitled Note'}</h3>
                <span className="shrink-0 text-[9.5px] font-medium uppercase tracking-widest text-stone-400">{timeAgo(note.updated_at)}</span>
            </div>
        </div>
    </CardShell>
);

// ── Paper card ────────────────────────────────────────────────────────────────
const PaperCard = ({ paper, onClick, onDelete }) => (
    <CardShell onClick={onClick} className="h-full">
        <div className="group h-full flex flex-col bg-white  ring-1 ring-stone-200/70 p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-22px_rgba(28,25,23,0.28)] hover:ring-plum-200">
            <div className="flex justify-between items-start mb-3">
                <div className="w-9 h-9  bg-plum-50 flex items-center justify-center shrink-0">
                    <span className="material-icons-round text-plum-700 text-[18px]">article</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 ">{timeAgo(paper.updated_at)}</span>
                    {onDelete && <CardMenu onDelete={onDelete} />}
                </div>
            </div>
            <h4 className="font-semibold text-[14px] text-stone-800 mb-1.5 line-clamp-1">{paper.title || 'Untitled Paper'}</h4>
            <p className="text-stone-400 text-[12px] line-clamp-3 leading-relaxed flex-1">{snippetText(paper.snippet ?? paper.content) || 'No content yet.'}</p>
            {paper.folder && (
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-stone-100">
                    <div className="w-3.5 h-3.5  shrink-0" style={{ backgroundColor: paper.folder.color ?? '#6C4EA6' }} />
                    <span className="text-[11px] text-stone-400 truncate">{paper.folder.name}</span>
                </div>
            )}
        </div>
    </CardShell>
);

// ── Presentation card ─────────────────────────────────────────────────────────
const THEME_BG = {
    modern:   '#0f172a', minimal: '#d1fae5', academic: '#1e3a5f',
    bold:     'linear-gradient(135deg,#6d28d9,#c026d3)',
    pastel:   'linear-gradient(135deg,#fce7f3,#e0e7ff)',
};

const PresentationCard = ({ presentation: pres, onClick, onDelete }) => (
    <CardShell onClick={onClick} className="h-full">
        <div className="group h-full flex flex-col overflow-hidden bg-white  ring-1 ring-stone-200/70 transition-all hover:shadow-[0_16px_34px_-22px_rgba(28,25,23,0.28)] hover:ring-plum-200">
            <div className="w-full aspect-video flex items-center justify-center relative"
                style={{ background: THEME_BG[pres.theme] ?? '#0f172a' }}>
                <span className="material-icons-round text-white/20 text-[40px]">slideshow</span>
                <span className="absolute bottom-2 right-3  bg-stone-950/50 text-white/90 text-[10px] font-medium px-2 py-0.5">
                    {pres.slide_count ?? 0} slides
                </span>
                {pres.theme && (
                    <span className="absolute top-2 left-2 text-[9px] bg-black/30 text-white/70 px-1.5 py-0.5  capitalize">{pres.theme}</span>
                )}
                {onDelete && (
                    <div className="absolute top-1.5 right-1.5 bg-white/85  backdrop-blur-sm">
                        <CardMenu onDelete={onDelete} />
                    </div>
                )}
            </div>
            <div className="p-3 flex-1 flex flex-col">
                <h4 className="font-semibold text-[14px] text-stone-800 line-clamp-1 mb-1">{pres.title || 'Untitled Presentation'}</h4>
                <p className="text-[11px] text-stone-400 mt-auto">{timeAgo(pres.updated_at)}</p>
                {pres.paper && (
                    <div className="flex items-center gap-1 mt-2 pt-2 border-t border-stone-100">
                        <span className="material-icons-round text-[12px] text-plum-500">article</span>
                        <span className="text-[11px] text-stone-400 truncate">{pres.paper.title}</span>
                    </div>
                )}
            </div>
        </div>
    </CardShell>
);

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyTab = ({ icon, message, sub }) => (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="w-16 h-16  bg-plum-50 text-plum-600 flex items-center justify-center">
            <span className="material-icons-round text-[30px]">{icon}</span>
        </div>
        <p className="text-sm text-stone-500 font-medium">{message}</p>
        {sub && <p className="text-stone-400 text-xs">{sub}</p>}
    </div>
);

// ── Search bar ────────────────────────────────────────────────────────────────
const SearchBar = ({ value, onChange }) => (
    <div className="relative flex-1 min-w-[180px]">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <span className="material-icons-round text-stone-400 text-[18px]">search</span>
        </div>
        <input
            className="w-full bg-white border border-stone-200 py-2 pl-11 pr-10 shadow-sm focus:ring-2 focus:ring-plum-200 focus:border-plum-400 text-[13px] md:text-sm placeholder-stone-400 outline-none transition-all"
            placeholder="Search notes…"
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
        />
        {value && (
            <button onClick={() => onChange('')} className="absolute inset-y-0 right-4 flex items-center text-stone-400 hover:text-stone-600 transition-colors">
                <span className="material-icons-round text-[16px]">close</span>
            </button>
        )}
    </div>
);

// ── Sort select ───────────────────────────────────────────────────────────────
const SortSelect = ({ value, options, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const selected = options.find(o => o.value === value);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    return (
        <div ref={ref} className="relative shrink-0">
            <button
                onClick={() => setOpen(v => !v)}
                className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 px-3 py-0.5 md:py-1.5 text-[12px] md:text-[13px] text-stone-600 hover:bg-stone-100 transition-colors"
            >
                <span className="material-icons-round text-stone-400 text-[12px] md:text-[15px]">sort</span>
                <span>{selected?.label}</span>
                <span className={`material-icons-round text-stone-400 text-[14px] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
                    expand_more
                </span>
            </button>
            {open && (
                <div className="absolute right-0 top-full mt-1.5 bg-white border border-stone-100 shadow-xl py-1 z-30 min-w-[140px] animate-in fade-in zoom-in-95 duration-100">
                    {options.map(o => (
                        <button
                            key={o.value}
                            onClick={() => { onChange(o.value); setOpen(false); }}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-[12px] md:text-[13px] text-left transition-colors hover:bg-stone-50 ${
                                o.value === value ? 'text-primary font-semibold' : 'text-stone-600'
                            }`}
                        >
                            {o.value === value && <span className="material-icons-round text-[13px]">check</span>}
                            <span className={o.value === value ? '' : 'ml-[17px]'}>{o.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// ── FolderPage ────────────────────────────────────────────────────────────────
const FolderPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Folder meta
    const [folder, setFolder]               = useState(null);
    const [folderLoading, setFolderLoading] = useState(true);
    const [folderError, setFolderError]     = useState(null);

    // Tab state
    const [activeTab, setActiveTab] = useState('notes');
    const loadedTabs = useRef(new Set());

    // Notes
    const [notes, setNotes]             = useState([]);
    const [notesLoading, setNotesLoading] = useState(false);
    const [notesMeta, setNotesMeta]     = useState(null);
    const [notesPage, setNotesPage]     = useState(1);
    const [search, setSearch]           = useState('');
    const [sort, setSort]               = useState('updated_at:desc');
    const debounceRef                   = useRef(null);

    // Papers
    const [papers, setPapers]             = useState([]);
    const [papersLoading, setPapersLoading] = useState(false);

    // Flashcards
    const [flashcards, setFlashcards]         = useState([]);
    const [flashcardsLoading, setFlashcardsLoading] = useState(false);

    // Presentations
    const [presentations, setPresentations]         = useState([]);
    const [presentationsLoading, setPresentationsLoading] = useState(false);

    // Delete confirmation — { kind: 'note'|'paper'|'presentation'|'folder', item }
    const [deleteTarget, setDeleteTarget] = useState(null);

    // ── Load folder ───────────────────────────────────────────────────────────
    const loadFolder = useCallback(async () => {
        const key    = `folder:${id}`;
        const cached = cacheGet(key);
        if (cached) { setFolder(cached); setFolderLoading(false); return; }
        setFolderLoading(true);
        setFolderError(null);
        try {
            const res = await folderService.get(id);
            setFolder(res.data);
            cacheSet(key, res.data);
        } catch {
            setFolderError('Could not load folder.');
        } finally {
            setFolderLoading(false);
        }
    }, [id]);

    // ── Load notes ────────────────────────────────────────────────────────────
    const loadNotes = useCallback(async ({ page = 1, q = search, sortVal = sort, append = false } = {}) => {
        const cKey   = `notes:${id}:${sortVal}`;
        const useHit = page === 1 && !q.trim() && !append;
        if (useHit) {
            const cached = cacheGet(cKey);
            if (cached) {
                setNotes(cached.rows);
                setNotesMeta(cached.meta);
                setNotesPage(1);
                setNotesLoading(false);
                return;
            }
        }
        setNotesLoading(true);
        try {
            const qp = [`folder_id=${id}`, `page=${page}`];
            if (q.trim()) qp.push(`searching=${encodeURIComponent(q.trim())}`);
            const [sortField, sortDir] = sortVal.split(':');
            if (sortField === 'updated_at') qp.push(`updated_at=${sortDir}`);
            if (sortField === 'title')      qp.push(`title=${sortDir}`);

            const res  = await noteService.list(qp.join('&'));
            const data = res.data ?? res;
            const rows = data.data ?? [];
            setNotes(append ? prev => [...prev, ...rows] : rows);
            const metaObj = data.current_page != null
                ? { current_page: data.current_page, last_page: data.last_page, total: data.total, per_page: data.per_page }
                : null;
            setNotesMeta(metaObj);
            setNotesPage(page);
            if (useHit) cacheSet(cKey, { rows, meta: metaObj });
        } catch {
            // non-fatal
        } finally {
            setNotesLoading(false);
        }
    }, [id, search, sort]);

    // ── Load papers ───────────────────────────────────────────────────────────
    const loadPapers = useCallback(async () => {
        const key    = `papers:${id}`;
        const cached = cacheGet(key);
        if (cached) { setPapers(cached); return; }
        setPapersLoading(true);
        try {
            const res  = await paperService.list(`folder_id=${id}`);
            const data = res.data ?? res;
            const rows = Array.isArray(data) ? data : (data.data ?? []);
            setPapers(rows);
            cacheSet(key, rows);
        } catch {
            // non-fatal
        } finally {
            setPapersLoading(false);
        }
    }, [id]);

    // ── Load flashcards ───────────────────────────────────────────────────────
    const loadFlashcards = useCallback(async () => {
        const key    = `flashcards:${id}`;
        const cached = cacheGet(key);
        if (cached) { setFlashcards(cached); return; }
        setFlashcardsLoading(true);
        try {
            const res = await flashcardService.list({ folder_id: id });
            const rows = res.data ?? [];
            setFlashcards(rows);
            cacheSet(key, rows);
        } catch {
            // non-fatal
        } finally {
            setFlashcardsLoading(false);
        }
    }, [id]);

    // ── Load presentations ────────────────────────────────────────────────────
    const loadPresentations = useCallback(async () => {
        const key    = `presentations:${id}`;
        const cached = cacheGet(key);
        if (cached) { setPresentations(cached); return; }
        setPresentationsLoading(true);
        try {
            const res  = await presentationService.list(`folder_id=${id}`);
            const data = res.data ?? res;
            const rows = Array.isArray(data) ? data : (data.data ?? []);
            setPresentations(rows);
            cacheSet(key, rows);
        } catch {
            // non-fatal
        } finally {
            setPresentationsLoading(false);
        }
    }, [id]);

    // ── Initial load ──────────────────────────────────────────────────────────
    useEffect(() => {
        loadFolder();
        loadedTabs.current.clear();
        // Always load the first tab eagerly
        loadedTabs.current.add('notes');
        loadNotes({ page: 1, q: '', sortVal: 'updated_at:desc' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // ── Tab switch: lazy load ─────────────────────────────────────────────────
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (loadedTabs.current.has(tab)) return;
        loadedTabs.current.add(tab);
        if (tab === 'papers')        loadPapers();
        if (tab === 'flashcards')    loadFlashcards();
        if (tab === 'presentations') loadPresentations();
    };

    // Notes search/sort
    const handleSortChange = (newSort) => {
        setSort(newSort);
        setNotesPage(1);
        loadNotes({ page: 1, q: search, sortVal: newSort });
    };

    const handleSearchChange = (value) => {
        setSearch(value);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setNotesPage(1);
            loadNotes({ page: 1, q: value, sortVal: sort });
        }, 400);
    };

    const handleLoadMore = () => {
        const nextPage = notesPage + 1;
        loadNotes({ page: nextPage, q: search, sortVal: sort, append: true });
    };

    // ── Delete handling ───────────────────────────────────────────────────────
    const handleConfirmDelete = async () => {
        const { kind, item } = deleteTarget;
        setDeleteTarget(null);
        try {
            if (kind === 'note') {
                await noteService.destroy(item.id);
                workspaceCache.invalidateNotes();
                invalidateFolderCache(id);
                setNotes(prev => prev.filter(n => n.id !== item.id));
                setNotesMeta(m => m ? { ...m, total: Math.max(0, m.total - 1) } : m);
            } else if (kind === 'paper') {
                await paperService.destroy(item.id);
                workspaceCache.invalidatePapers();
                invalidateFolderCache(id);
                setPapers(prev => prev.filter(p => p.id !== item.id));
            } else if (kind === 'presentation') {
                await presentationService.destroy(item.id);
                workspaceCache.invalidatePresentations();
                invalidateFolderCache(id);
                setPresentations(prev => prev.filter(p => p.id !== item.id));
            } else if (kind === 'folder') {
                await folderService.destroy(item.id);
                workspaceCache.invalidateFolders();
                invalidateFolderCache(item.id);
                navigate('/lockedin/library?tab=folders');
            }
        } catch {
            alert(`Could not delete this ${kind}.`);
        }
    };

    const shape = folder?.shape ?? 'squircle';
    const color = folder?.color ?? '#A78BFA';
    const icon  = folder?.icon  ?? 'folder';

    return (
        <div className="flex min-h-screen bg-background-light">
            {deleteTarget && (
                <DeleteConfirmModal
                    title={`Delete this ${deleteTarget.kind}?`}
                    subtitle={deleteTarget.item.title ?? deleteTarget.item.name}
                    warning={deleteTarget.kind === 'folder'
                        ? 'This will also delete all notes, papers and flashcards inside this folder. This action cannot be undone.'
                        : 'This action cannot be undone.'}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
            <Sidebar activePage="/lockedin/library" />

            <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-h-screen flex flex-col">
                {folderLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader size="xl" />
                    </div>
                ) : folderError ? (
                    <div className="flex-1 flex items-center justify-center flex-col gap-3 text-stone-400">
                        <span className="material-icons-round text-[40px]">error_outline</span>
                        <p className="text-sm">{folderError}</p>
                        <button onClick={loadFolder} className="text-primary text-sm font-semibold hover:underline">Retry</button>
                    </div>
                ) : (
                    <>
                        {/* ── Folder header ── */}
                        <div className="relative overflow-hidden px-4 lg:px-8 py-8 border-b border-stone-200 bg-white">
                            <div className="absolute -top-12 -right-12 w-48 h-48 opacity-10 pointer-events-none"
                                style={{ backgroundColor: color, borderRadius: '50%', filter: 'blur(48px)' }} />
                            <div className="relative flex items-center gap-5">
                                <FolderShape shape={shape} color={color} icon={icon} size={64} />
                                <div className="flex-1 min-w-0">
                                    <nav className="flex items-center gap-1 text-[11px] text-stone-400 mb-1">
                                        <Link to="/lockedin/library" className="hover:text-primary transition-colors">Library</Link>
                                        <span className="material-icons-round text-[12px]">chevron_right</span>
                                        <span className="text-stone-600 font-medium">{folder?.name}</span>
                                    </nav>
                                    <h1 className="font-display-serif text-[22px] md:text-[28px] font-semibold tracking-tight text-stone-900 leading-tight">{folder?.name}</h1>
                                    {folder?.description && <p className="text-sm text-stone-500 mt-1">{folder.description}</p>}
                                    {folder?.updated_at && (
                                        <p className="text-xs text-stone-400 mt-1.5">Updated {timeAgo(folder.updated_at)}</p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setDeleteTarget({ kind: 'folder', item: folder })}
                                    title="Delete folder"
                                    className="w-9 h-9  flex items-center justify-center text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <span className="material-icons-round text-[19px]">delete_outline</span>
                                </button>
                                <NotificationIcon />
                            </div>
                        </div>

                        {/* ── Tabs bar ── */}
                        <div className="px-4 lg:px-8 pt-4">
                            <div className="flex items-center gap-1 border-b border-stone-200 overflow-x-auto">
                                {TABS.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`flex items-center gap-2 px-2 md:px-4 py-2.5 text-[10.5px] md:text-[14px] md:font-medium whitespace-nowrap transition-all border-b-2 -mb-px
                                            ${activeTab === tab.id
                                                ? 'border-primary text-primary'
                                                : 'border-transparent text-stone-500 hover:text-stone-800'
                                            }`}
                                    >
                                        <span className="material-icons-round text-[15px] md:text-[17px]">{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── Tab content ── */}
                        <div className="flex-1 p-4 lg:p-8">

                            {/* Notes tab */}
                            {activeTab === 'notes' && (
                                <div>
                                    {/* Search + Sort bar */}
                                    <div className="flex items-center gap-3 mb-6 flex-wrap">
                                        <SearchBar value={search} onChange={handleSearchChange} />
                                        <SortSelect value={sort} options={SORT_OPTIONS} onChange={handleSortChange} />
                                        <button
                                            onClick={() => loadNotes({ page: 1, q: search, sortVal: sort })}
                                            disabled={notesLoading}
                                            title="Refresh"
                                            className="w-9 h-9  flex items-center justify-center bg-stone-50 border border-stone-200 text-stone-400 hover:text-primary hover:border-primary disabled:opacity-40 transition-colors"
                                        >
                                            <span className={`material-icons-round text-[18px] ${notesLoading ? 'animate-spin' : ''}`}>refresh</span>
                                        </button>
                                    </div>

                                    {notesLoading && notes.length === 0 ? (
                                        <div className="flex justify-center py-20">
                                            <Loader size="lg" />
                                        </div>
                                    ) : notes.length === 0 ? (
                                        <EmptyTab icon="edit_note" message={search ? 'No notes match your search' : `No notes in this folder yet`} sub={search ? 'Try a different keyword.' : 'Use the + button to create your first note.'} />
                                    ) : (
                                        <>
                                            <div className="flex items-center justify-between mb-5">
                                                <p className="text-[13px] text-stone-500">
                                                    {search
                                                        ? <><span className="font-semibold text-stone-700">{notesMeta?.total ?? notes.length}</span> result{(notesMeta?.total ?? notes.length) !== 1 ? 's' : ''} for "<span className="text-primary font-medium">{search}</span>"</>
                                                        : <><span className="font-semibold text-stone-700">{notesMeta?.total ?? notes.length}</span> {(notesMeta?.total ?? notes.length) === 1 ? 'note' : 'notes'}</>
                                                    }
                                                </p>
                                                {notesLoading && <Loader size="sm" />}
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                                                {notes.map((note, i) => (
                                                    <FolderNoteCard
                                                        key={note.id}
                                                        note={note}
                                                        index={i}
                                                        onClick={() => navigate(`/lockedin/notes/${note.id}`)}
                                                        onDelete={() => setDeleteTarget({ kind: 'note', item: note })}
                                                    />
                                                ))}
                                            </div>

                                            {notesMeta && notesMeta.current_page < notesMeta.last_page && (
                                                <div className="mt-10 flex justify-center">
                                                    <button
                                                        onClick={handleLoadMore}
                                                        disabled={notesLoading}
                                                        className="flex items-center gap-2 px-6 py-2.5  border border-stone-200 text-sm font-semibold text-stone-600 hover:border-primary hover:text-primary disabled:opacity-40 transition-colors"
                                                    >
                                                        {notesLoading
                                                            ? <><Loader size="xs" /></>
                                                            : <>Load more</>
                                                        }
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Papers tab */}
                            {activeTab === 'papers' && (
                                <div>
                                    {papersLoading ? (
                                        <div className="flex justify-center py-20">
                                            <Loader size="lg" />
                                        </div>
                                    ) : papers.length === 0 ? (
                                        <EmptyTab icon="article" message="No papers in this folder yet" sub="Use the + button to create a new paper." />
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                            {papers.map(paper => (
                                                <PaperCard
                                                    key={paper.id}
                                                    paper={paper}
                                                    onClick={() => navigate(`/lockedin/papers/${paper.id}`)}
                                                    onDelete={() => setDeleteTarget({ kind: 'paper', item: paper })}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Flashcards tab */}
                            {activeTab === 'flashcards' && (
                                <div>
                                    {flashcardsLoading ? (
                                        <div className="flex justify-center py-20">
                                            <Loader size="lg" />
                                        </div>
                                    ) : flashcards.length === 0 ? (
                                        <EmptyTab icon="style" message="No flashcard decks in this folder yet" sub="Use the + button to create a new deck." />
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {flashcards.map(fc => (
                                                <FlashcardPreviewCard
                                                    key={fc.id}
                                                    flashcard={fc}
                                                    onClick={() => navigate(`/lockedin/flashcards/${fc.id}`)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Presentations tab */}
                            {activeTab === 'presentations' && (
                                <div>
                                    {presentationsLoading ? (
                                        <div className="flex justify-center py-20">
                                            <Loader size="lg" />
                                        </div>
                                    ) : presentations.length === 0 ? (
                                        <EmptyTab icon="slideshow" message="No presentations in this folder yet" sub="Use the + button to create new slides." />
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {presentations.map(p => (
                                                <PresentationCard
                                                    key={p.id}
                                                    presentation={p}
                                                    onClick={() => navigate(`/lockedin/presentations/${p.id}`)}
                                                    onDelete={() => setDeleteTarget({ kind: 'presentation', item: p })}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>

            <FloatingAIButton exclude={['New Folder']} folderId={id} />
        </div>
    );
};

export default FolderPage;
