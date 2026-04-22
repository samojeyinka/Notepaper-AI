import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Sidebar } from "../components/user/Sidebar";
import { FloatingAIButton, FolderShape } from "../components/user/FloatingAIButton";
import { folderService } from "../api/folderService";
import { noteService } from "../api/noteService";
import { flashcardService } from "../api/flashcardService";
import { paperService } from "../api/paperService";
import { presentationService } from "../api/presentationService";
import { PolaroidCard } from "../components/user/RecentNotesSection";
import { FlashcardPreviewCard } from "./FlashcardsPage";

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
    { id: 'papers',        label: 'Papers',         icon: 'article' },
    { id: 'flashcards',    label: 'Flashcards',     icon: 'style' },
    { id: 'presentations', label: 'Presentations',  icon: 'slideshow' },
];

// ── Note card ─────────────────────────────────────────────────────────────────
const FolderNoteCard = ({ note, index, onClick }) => {
    const snippet = (() => {
        const raw = (note.snippet ?? '').trim();
        if (!raw) return 'No content yet.';
        try {
            const parsed = JSON.parse(raw);
            const html = (parsed.pages ?? [])[0] ?? '';
            if (!html.trim()) return 'No content yet.';
            const div = document.createElement('div');
            div.innerHTML = html;
            const text = (div.textContent ?? div.innerText ?? '').trim();
            return text.slice(0, 100) || 'No content yet.';
        } catch {
            const text = raw.replace(/<[^>]+>/g, '').trim();
            return text.slice(0, 100) || 'No content yet.';
        }
    })();

    return (
        <button onClick={onClick} className="text-left w-full focus:outline-none group">
            <PolaroidCard
                title={note.title ?? 'Untitled Note'}
                content={snippet}
                date={timeAgo(note.updated_at)}
                rotation={ROTATIONS[index % ROTATIONS.length]}
            />
        </button>
    );
};

// ── Paper card ────────────────────────────────────────────────────────────────
const PaperCard = ({ paper, onClick }) => (
    <button onClick={onClick} className="text-left group w-full focus:outline-none">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <span className="material-icons-round text-indigo-400 text-[18px]">article</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{paper.title || 'Untitled Paper'}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{timeAgo(paper.updated_at)}</p>
                </div>
            </div>
        </div>
    </button>
);

// ── Presentation card ─────────────────────────────────────────────────────────
const THEME_BG = {
    modern:   '#0f172a', minimal: '#d1fae5', academic: '#1e3a5f',
    bold:     'linear-gradient(135deg,#6d28d9,#c026d3)',
    pastel:   'linear-gradient(135deg,#fce7f3,#e0e7ff)',
};

const PresentationCard = ({ presentation: pres, onClick }) => (
    <button onClick={onClick} className="text-left group focus:outline-none w-full">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all overflow-hidden h-full flex flex-col">
            <div className="w-full aspect-video flex items-center justify-center relative"
                style={{ background: THEME_BG[pres.theme] ?? '#0f172a' }}>
                <span className="material-icons-round text-white/20 text-[40px]">slideshow</span>
                <span className="absolute bottom-2 right-3 text-[10px] text-white/50 font-medium">{pres.slide_count ?? 0} slides</span>
                {pres.theme && (
                    <span className="absolute top-2 left-2 text-[9px] bg-black/30 text-white/70 px-1.5 py-0.5 rounded capitalize">{pres.theme}</span>
                )}
            </div>
            <div className="p-3 flex-1 flex flex-col">
                <h4 className="font-semibold text-[14px] text-slate-800 line-clamp-1 mb-1">{pres.title || 'Untitled Presentation'}</h4>
                <p className="text-[11px] text-slate-400 mt-auto">{timeAgo(pres.updated_at)}</p>
                {pres.paper && (
                    <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-100">
                        <span className="material-icons-round text-[12px] text-indigo-400">article</span>
                        <span className="text-[11px] text-slate-400 truncate">{pres.paper.title}</span>
                    </div>
                )}
            </div>
        </div>
    </button>
);

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyTab = ({ icon, message, sub }) => (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <span className="material-icons-round text-slate-300 text-[56px]">{icon}</span>
        <p className="text-slate-500 text-sm font-semibold">{message}</p>
        {sub && <p className="text-slate-400 text-xs">{sub}</p>}
    </div>
);

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

    const shape = folder?.shape ?? 'squircle';
    const color = folder?.color ?? '#A78BFA';
    const icon  = folder?.icon  ?? 'folder';

    return (
        <div className="flex min-h-screen bg-background-light">
            <Sidebar activePage="/lockedin/library" />

            <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-h-screen flex flex-col">
                {folderLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <span className="material-icons-round text-primary text-[40px] animate-spin">sync</span>
                    </div>
                ) : folderError ? (
                    <div className="flex-1 flex items-center justify-center flex-col gap-3 text-slate-400">
                        <span className="material-icons-round text-[40px]">error_outline</span>
                        <p className="text-sm">{folderError}</p>
                        <button onClick={loadFolder} className="text-primary text-sm font-semibold hover:underline">Retry</button>
                    </div>
                ) : (
                    <>
                        {/* ── Folder header ── */}
                        <div className="relative overflow-hidden px-8 py-8 border-b border-slate-200 bg-white">
                            <div className="absolute -top-12 -right-12 w-48 h-48 opacity-10 pointer-events-none"
                                style={{ backgroundColor: color, borderRadius: '50%', filter: 'blur(48px)' }} />
                            <div className="relative flex items-center gap-5">
                                <FolderShape shape={shape} color={color} icon={icon} size={64} />
                                <div className="flex-1 min-w-0">
                                    <nav className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
                                        <Link to="/lockedin/library" className="hover:text-primary transition-colors">Library</Link>
                                        <span className="material-icons-round text-[12px]">chevron_right</span>
                                        <span className="text-slate-600 font-medium">{folder?.name}</span>
                                    </nav>
                                    <h1 className="font-display font-bold text-2xl text-slate-900 leading-tight">{folder?.name}</h1>
                                    {folder?.description && <p className="text-sm text-slate-500 mt-1">{folder.description}</p>}
                                    {folder?.updated_at && (
                                        <p className="text-xs text-slate-400 mt-1.5">Updated {timeAgo(folder.updated_at)}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── Tabs bar ── */}
                        <div className="bg-white border-b border-slate-100 px-8">
                            <div className="flex gap-1">
                                {TABS.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap
                                            ${activeTab === tab.id
                                                ? 'border-primary text-primary'
                                                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                                            }`}
                                    >
                                        <span className="material-icons-round text-[16px]">{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── Tab content ── */}
                        <div className="flex-1 p-8">

                            {/* Notes tab */}
                            {activeTab === 'notes' && (
                                <div>
                                    {/* Search + Sort bar */}
                                    <div className="flex items-center gap-3 mb-6 flex-wrap">
                                        <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-primary transition-colors">
                                            <span className="material-icons-round text-slate-400 text-[18px]">search</span>
                                            <input
                                                type="text"
                                                value={search}
                                                onChange={e => handleSearchChange(e.target.value)}
                                                placeholder="Search notes…"
                                                className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
                                            />
                                            {search && (
                                                <button onClick={() => handleSearchChange('')} className="text-slate-400 hover:text-slate-600 transition-colors">
                                                    <span className="material-icons-round text-[16px]">close</span>
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                                            <span className="material-icons-round text-slate-400 text-[16px]">sort</span>
                                            <select
                                                value={sort}
                                                onChange={e => handleSortChange(e.target.value)}
                                                className="bg-transparent text-sm text-slate-600 outline-none cursor-pointer pr-1"
                                            >
                                                {SORT_OPTIONS.map(o => (
                                                    <option key={o.value} value={o.value}>{o.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <button
                                            onClick={() => loadNotes({ page: 1, q: search, sortVal: sort })}
                                            disabled={notesLoading}
                                            title="Refresh"
                                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-primary hover:border-primary disabled:opacity-40 transition-colors"
                                        >
                                            <span className={`material-icons-round text-[18px] ${notesLoading ? 'animate-spin' : ''}`}>refresh</span>
                                        </button>
                                    </div>

                                    {notesLoading && notes.length === 0 ? (
                                        <div className="flex justify-center py-20">
                                            <span className="material-icons-round text-primary text-[36px] animate-spin">sync</span>
                                        </div>
                                    ) : notes.length === 0 ? (
                                        <EmptyTab icon="edit_note" message={search ? 'No notes match your search' : `No notes in this folder yet`} sub={search ? 'Try a different keyword.' : 'Use the + button to create your first note.'} />
                                    ) : (
                                        <>
                                            <div className="flex items-center justify-between mb-5">
                                                <p className="text-[13px] text-slate-500">
                                                    {search
                                                        ? <><span className="font-semibold text-slate-700">{notesMeta?.total ?? notes.length}</span> result{(notesMeta?.total ?? notes.length) !== 1 ? 's' : ''} for "<span className="text-primary font-medium">{search}</span>"</>
                                                        : <><span className="font-semibold text-slate-700">{notesMeta?.total ?? notes.length}</span> {(notesMeta?.total ?? notes.length) === 1 ? 'note' : 'notes'}</>
                                                    }
                                                </p>
                                                {notesLoading && <span className="material-icons-round text-primary text-[18px] animate-spin">sync</span>}
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                                {notes.map((note, i) => (
                                                    <FolderNoteCard
                                                        key={note.id}
                                                        note={note}
                                                        index={i}
                                                        onClick={() => navigate(`/lockedin/notes/${note.id}`)}
                                                    />
                                                ))}
                                            </div>

                                            {notesMeta && notesMeta.current_page < notesMeta.last_page && (
                                                <div className="mt-10 flex justify-center">
                                                    <button
                                                        onClick={handleLoadMore}
                                                        disabled={notesLoading}
                                                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:border-primary hover:text-primary disabled:opacity-40 transition-colors"
                                                    >
                                                        {notesLoading
                                                            ? <><span className="material-icons-round text-[15px] animate-spin">sync</span>Loading…</>
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
                                            <span className="material-icons-round text-primary text-[36px] animate-spin">sync</span>
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
                                            <span className="material-icons-round text-primary text-[36px] animate-spin">sync</span>
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
                                            <span className="material-icons-round text-primary text-[36px] animate-spin">sync</span>
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
