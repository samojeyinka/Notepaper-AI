import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Sidebar } from "../components/user/Sidebar";
import { FloatingAIButton, FolderShape } from "../components/user/FloatingAIButton";
import { folderService } from "../api/folderService";
import { noteService } from "../api/noteService";
import { PolaroidCard } from "../components/user/RecentNotesSection";

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

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyNotes = ({ folderId, folderName, navigate, isFiltered }) => (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <span className="material-icons-round text-slate-300 text-[32px]">
                {isFiltered ? 'search_off' : 'note_add'}
            </span>
        </div>
        <div>
            <p className="text-sm font-semibold text-slate-700">
                {isFiltered ? 'No notes match your search' : `No notes in ${folderName} yet`}
            </p>
            <p className="text-xs text-slate-400 mt-1">
                {isFiltered ? 'Try a different keyword or clear the search.' : 'Create your first note and it\'ll land right here.'}
            </p>
        </div>
        {!isFiltered && (
            <button
                onClick={() => navigate(`/lockedin/notes/new?folder=${folderId}`)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all"
            >
                <span className="material-icons-round text-[17px]">note_add</span>
                New Note
            </button>
        )}
    </div>
);

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

// ── FolderPage ────────────────────────────────────────────────────────────────
const FolderPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [folder, setFolder]         = useState(null);
    const [notes, setNotes]           = useState([]);
    const [folderLoading, setFolderLoading] = useState(true);
    const [notesLoading, setNotesLoading]   = useState(true);
    const [folderError, setFolderError]     = useState(null);
    const [meta, setMeta]             = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Search & sort state
    const [search, setSearch]   = useState('');
    const [sort, setSort]       = useState('updated_at:desc');
    const debounceRef = useRef(null);

    // ── Load folder ───────────────────────────────────────────────────────────
    const loadFolder = useCallback(async () => {
        setFolderLoading(true);
        setFolderError(null);
        try {
            const res = await folderService.get(id);
            setFolder(res.data);
        } catch {
            setFolderError('Could not load folder.');
        } finally {
            setFolderLoading(false);
        }
    }, [id]);

    // ── Load notes (page, search, sort) ──────────────────────────────────────
    const loadNotes = useCallback(async ({ page = 1, q = search, sortVal = sort, append = false } = {}) => {
        setNotesLoading(true);
        try {
            const [sortField, sortDir] = sortVal.split(':');
            const params = new URLSearchParams({
                folder_id: id,
                page,
                ...(q.trim() && { searching: q.trim() }),
                ...(sortField === 'title' ? { title: sortField } : {}),
                updated_at: sortDir === 'asc' || sortField === 'updated_at' ? sortDir : undefined,
            });

            // Build clean query string
            const qp = [`folder_id=${id}`, `page=${page}`];
            if (q.trim()) qp.push(`searching=${encodeURIComponent(q.trim())}`);
            if (sortField === 'updated_at') qp.push(`updated_at=${sortDir}`);
            if (sortField === 'title')      qp.push(`title=${sortDir}`);

            const res = await noteService.list(qp.join('&'));
            const data = res.data ?? res;
            const rows = data.data ?? [];
            setNotes(append ? prev => [...prev, ...rows] : rows);
            setMeta(data.current_page != null ? { current_page: data.current_page, last_page: data.last_page, total: data.total, per_page: data.per_page } : null);
            setCurrentPage(page);
        } catch {
            // non-fatal
        } finally {
            setNotesLoading(false);
        }
    }, [id, search, sort]);

    // Initial load
    useEffect(() => {
        loadFolder();
        loadNotes({ page: 1, q: '', sortVal: 'updated_at:desc' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Re-fetch when sort changes immediately
    const handleSortChange = (newSort) => {
        setSort(newSort);
        setCurrentPage(1);
        loadNotes({ page: 1, q: search, sortVal: newSort });
    };

    // Re-fetch when search changes — debounced 400ms
    const handleSearchChange = (value) => {
        setSearch(value);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setCurrentPage(1);
            loadNotes({ page: 1, q: value, sortVal: sort });
        }, 400);
    };

    const handleLoadMore = () => {
        const nextPage = currentPage + 1;
        loadNotes({ page: nextPage, q: search, sortVal: sort, append: true });
    };

    const handleRefresh = () => loadNotes({ page: 1, q: search, sortVal: sort });

    const shape = folder?.shape ?? 'squircle';
    const color = folder?.color ?? '#A78BFA';
    const icon  = folder?.icon  ?? 'folder';
    const isFiltered = search.trim().length > 0;

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
                                    <p className="text-xs text-slate-400 mt-1.5">
                                        {meta?.total ?? notes.length} {(meta?.total ?? notes.length) === 1 ? 'note' : 'notes'}
                                        {folder?.updated_at && <> · Updated {timeAgo(folder.updated_at)}</>}
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate(`/lockedin/notes/new?folder=${id}`)}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all shrink-0"
                                >
                                    <span className="material-icons-round text-[17px]">note_add</span>
                                    New Note
                                </button>
                            </div>
                        </div>

                        {/* ── Search + Sort bar ── */}
                        <div className="px-8 py-4 bg-white border-b border-slate-100 flex items-center gap-3 flex-wrap">
                            {/* Search */}
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

                            {/* Sort */}
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-primary transition-colors">
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

                            {/* Refresh */}
                            <button
                                onClick={handleRefresh}
                                disabled={notesLoading}
                                title="Refresh"
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-primary hover:border-primary disabled:opacity-40 transition-colors"
                            >
                                <span className={`material-icons-round text-[18px] ${notesLoading ? 'animate-spin' : ''}`}>refresh</span>
                            </button>
                        </div>

                        {/* ── Notes grid ── */}
                        <div className="flex-1 px-8 py-8">
                            {notesLoading && notes.length === 0 ? (
                                <div className="flex justify-center py-20">
                                    <span className="material-icons-round text-primary text-[36px] animate-spin">sync</span>
                                </div>
                            ) : notes.length === 0 ? (
                                <EmptyNotes folderId={id} folderName={folder?.name ?? 'this folder'} navigate={navigate} isFiltered={isFiltered} />
                            ) : (
                                <>
                                    {/* Result count */}
                                    <div className="flex items-center justify-between mb-6">
                                        <p className="text-[13px] text-slate-500">
                                            {isFiltered
                                                ? <><span className="font-semibold text-slate-700">{meta?.total ?? notes.length}</span> result{(meta?.total ?? notes.length) !== 1 ? 's' : ''} for "<span className="text-primary font-medium">{search}</span>"</>
                                                : <><span className="font-semibold text-slate-700">{meta?.total ?? notes.length}</span> {(meta?.total ?? notes.length) === 1 ? 'note' : 'notes'}</>
                                            }
                                        </p>
                                        {notesLoading && (
                                            <span className="material-icons-round text-primary text-[18px] animate-spin">sync</span>
                                        )}
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

                                    {/* Pagination */}
                                    {meta && meta.last_page > 1 && (
                                        <div className="mt-10 flex flex-col items-center gap-3">
                                            {/* Load more button */}
                                            {meta.current_page < meta.last_page && (
                                                <button
                                                    onClick={handleLoadMore}
                                                    disabled={notesLoading}
                                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:border-primary hover:text-primary disabled:opacity-40 transition-colors"
                                                >
                                                    {notesLoading
                                                        ? <><span className="material-icons-round text-[15px] animate-spin">sync</span> Loading…</>
                                                        : <>Load more</>
                                                    }
                                                </button>
                                            )}
                                            {/* Page indicator */}
                                            <p className="text-[11px] text-slate-400">
                                                Page {meta.current_page} of {meta.last_page} · {meta.total} total
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </>
                )}
            </main>

            <FloatingAIButton />
        </div>
    );
};

export default FolderPage;
