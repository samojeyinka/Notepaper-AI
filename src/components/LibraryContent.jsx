import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { folderService } from '../api/folderService';
import { noteService } from '../api/noteService';
import { paperService } from '../api/paperService';
import { workspaceCache } from '../api/workspaceCache';
import { FolderShape, CreateFolderModal } from './user/FloatingAIButton';

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

const extractSnippet = (raw) => {
    if (!raw) return '';
    try {
        const parsed = JSON.parse(raw);
        const html = (parsed.pages ?? [])[0] ?? '';
        if (!html.trim()) return '';
        const div = document.createElement('div');
        div.innerHTML = html;
        return (div.textContent ?? div.innerText ?? '').trim().slice(0, 120);
    } catch {
        return raw.replace(/<[^>]+>/g, '').trim().slice(0, 120);
    }
};

// ── Search Bar ────────────────────────────────────────────────────────────────
const SearchBar = ({ value, onChange }) => (
    <section className="mb-4">
        <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <span className="material-icons-round text-slate-400 text-[18px]">search</span>
            </div>
            <input
                className="w-full bg-surface-light border border-slate-200 rounded-xl py-2.5 pl-11 pr-10 shadow-sm focus:ring-2 focus:ring-primary focus:border-primary text-[14px] placeholder-slate-400 outline-none transition-all"
                placeholder="Search folders and notes…"
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
            />
            {value && (
                <button onClick={() => onChange('')} className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                    <span className="material-icons-round text-[16px]">close</span>
                </button>
            )}
        </div>
    </section>
);

// ── Folder card (grid) ────────────────────────────────────────────────────────
const FolderGridCard = ({ folder, onClick }) => (
    <button onClick={onClick} className="text-left group focus:outline-none w-full">
        <div className="aspect-square bg-surface-light rounded-2xl p-5 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10 border border-slate-100">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity" style={{ backgroundColor: folder.color ?? '#A78BFA' }} />
            <FolderShape shape={folder.shape ?? 'squircle'} color={folder.color ?? '#A78BFA'} icon={folder.icon ?? 'folder'} size={60} />
            <h3 className="text-[14px] font-semibold text-slate-800 text-center mt-4 leading-tight line-clamp-2">{folder.name}</h3>
            <p className="text-slate-400 text-[11px] mt-1">Updated {timeAgo(folder.updated_at)}</p>
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-icons-round text-[16px]" style={{ color: folder.color ?? '#A78BFA' }}>arrow_forward</span>
            </div>
        </div>
    </button>
);

// ── Folder card (list) ────────────────────────────────────────────────────────
const FolderListRow = ({ folder, onClick }) => (
    <button onClick={onClick} className="w-full text-left group focus:outline-none">
        <div className="bg-surface-light p-3 rounded-2xl border border-slate-100 hover:border-primary/30 hover:shadow-md transition-all flex items-center gap-4">
            <FolderShape shape={folder.shape ?? 'squircle'} color={folder.color ?? '#A78BFA'} icon={folder.icon ?? 'folder'} size={48} />
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[15px] text-slate-800 truncate">{folder.name}</h3>
                {folder.description && <p className="text-slate-400 text-[12px] truncate">{folder.description}</p>}
                <p className="text-slate-400 text-[11px]">Updated {timeAgo(folder.updated_at)}</p>
            </div>
            <span className="material-icons-round text-slate-300 group-hover:text-primary transition-colors text-[20px]">chevron_right</span>
        </div>
    </button>
);

// ── Folders Section ───────────────────────────────────────────────────────────
const FoldersSection = ({ folders, loading, onFolderClick, onCreateFolder, search, sort, sortOptions, onSortChange, meta, onLoadMore, onLoadLess }) => {
    const scrollRef = useRef(null);

    const scroll = (dir) => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({ left: dir * 220, behavior: 'smooth' });
    };

    const hasMore = meta && meta.current_page < meta.last_page;
    const hasLess = meta && meta.current_page > 1;

    return (
        <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-[17px] font-semibold flex items-center gap-3">
                    <span className="w-1 h-5 bg-primary rounded-full" />
                    Folders
                    {meta?.total > 0 && (
                        <span className="text-[12px] font-normal text-slate-400 ml-1">({meta.total})</span>
                    )}
                </h2>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                    <span className="material-icons-round text-slate-400 text-[15px]">sort</span>
                    <select
                        value={sort}
                        onChange={e => onSortChange(e.target.value)}
                        className="bg-transparent text-[13px] text-slate-600 outline-none cursor-pointer"
                    >
                        {sortOptions.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <span className="material-icons-round text-primary text-[30px] animate-spin">sync</span>
                </div>
            ) : folders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                    <span className="material-icons-round text-slate-200 text-[48px]">folder_open</span>
                    <p className="text-sm text-slate-400">
                        {search ? 'No folders match your search.' : 'No folders yet.'}
                    </p>
                    {!search && (
                        <button
                            onClick={onCreateFolder}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all"
                        >
                            <span className="material-icons-round text-[16px]">create_new_folder</span>
                            Create Folder
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <style>{`.folder-scroll::-webkit-scrollbar { display: none; }`}</style>
                    <div className="relative flex items-center gap-2 min-w-0">
                        <button
                            onClick={() => scroll(-1)}
                            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 shadow-sm hover:border-primary hover:text-primary transition-all active:scale-90"
                        >
                            <span className="material-icons-round text-[20px]">chevron_left</span>
                        </button>
                        <div
                            ref={scrollRef}
                            className="folder-scroll flex gap-4 overflow-x-auto pb-1 flex-1"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {folders.map(f => (
                                <div key={f.id} className="shrink-0 w-[150px]">
                                    <FolderGridCard folder={f} onClick={() => onFolderClick(f.id)} />
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => scroll(1)}
                            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 shadow-sm hover:border-primary hover:text-primary transition-all active:scale-90"
                        >
                            <span className="material-icons-round text-[20px]">chevron_right</span>
                        </button>
                    </div>

                    {(hasMore || hasLess) && (
                        <div className="flex items-center justify-center gap-3 mt-3">
                            {hasLess && (
                                <button
                                    onClick={onLoadLess}
                                    disabled={loading}
                                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-500 hover:border-primary hover:text-primary disabled:opacity-40 transition-colors"
                                >
                                    <span className="material-icons-round text-[15px]">expand_less</span>
                                    View less
                                </button>
                            )}
                            {hasMore && (
                                <button
                                    onClick={onLoadMore}
                                    disabled={loading}
                                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-500 hover:border-primary hover:text-primary disabled:opacity-40 transition-colors"
                                >
                                    {loading ? <span className="material-icons-round text-[15px] animate-spin">sync</span> : <span className="material-icons-round text-[15px]">expand_more</span>}
                                    View more
                                </button>
                            )}
                            <span className="text-[11px] text-slate-300">Page {meta.current_page} of {meta.last_page}</span>
                        </div>
                    )}
                </>
            )}
        </section>
    );
};

// ── Note card ─────────────────────────────────────────────────────────────────
const NoteCard = ({ note, onClick }) => {
    const snippet = extractSnippet(note.snippet ?? note.content ?? '');

    return (
        <button onClick={onClick} className="text-left group focus:outline-none w-full">
            <div className="bg-surface-light p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all h-full flex flex-col">
                <div className="flex justify-between items-start mb-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="material-icons-round text-primary text-[18px]">description</span>
                    </div>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">{timeAgo(note.updated_at)}</span>
                </div>
                <h4 className="font-semibold text-[14px] text-slate-800 mb-1.5 line-clamp-1">
                    {note.title || 'Untitled Note'}
                </h4>
                <p className="text-slate-400 text-[12px] line-clamp-3 font-serif italic leading-relaxed flex-1">
                    {snippet || 'No content yet.'}
                </p>
                {note.folder && (
                    <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100">
                        <div className="w-3.5 h-3.5 rounded-sm shrink-0" style={{ backgroundColor: note.folder.color ?? '#A78BFA' }} />
                        <span className="text-[11px] text-slate-400 truncate">{note.folder.name}</span>
                    </div>
                )}
            </div>
        </button>
    );
};

// ── Paper card ────────────────────────────────────────────────────────────────
const PaperCard = ({ paper, onClick }) => {
    const snippet = extractSnippet(paper.snippet ?? paper.content ?? '');
    return (
        <button onClick={onClick} className="text-left group focus:outline-none w-full">
            <div className="bg-surface-light p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all h-full flex flex-col">
                <div className="flex justify-between items-start mb-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                        <span className="material-icons-round text-indigo-500 text-[18px]">article</span>
                    </div>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">{timeAgo(paper.updated_at)}</span>
                </div>
                <h4 className="font-semibold text-[14px] text-slate-800 mb-1.5 line-clamp-1">
                    {paper.title || 'Untitled Paper'}
                </h4>
                <p className="text-slate-400 text-[12px] line-clamp-3 leading-relaxed flex-1">
                    {snippet || 'No content yet.'}
                </p>
                {paper.folder && (
                    <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100">
                        <div className="w-3.5 h-3.5 rounded-sm shrink-0" style={{ backgroundColor: paper.folder.color ?? '#A78BFA' }} />
                        <span className="text-[11px] text-slate-400 truncate">{paper.folder.name}</span>
                    </div>
                )}
            </div>
        </button>
    );
};

// ── Papers Section ────────────────────────────────────────────────────────────
const PapersSection = ({ papers, loading, onPaperClick, onCreatePaper, search, meta, onLoadMore, onLoadLess, sort, sortOptions, onSortChange }) => (
    <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-semibold flex items-center gap-3">
                <span className="w-1 h-5 bg-indigo-400 rounded-full" />
                {search ? 'Papers' : 'Recent Papers'}
                {meta?.total != null && (
                    <span className="text-[12px] font-normal text-slate-400 ml-1">({meta.total})</span>
                )}
            </h2>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                <span className="material-icons-round text-slate-400 text-[15px]">sort</span>
                <select value={sort} onChange={e => onSortChange(e.target.value)}
                    className="bg-transparent text-[13px] text-slate-600 outline-none cursor-pointer">
                    {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </div>
        </div>

        {loading && papers.length === 0 ? (
            <div className="flex justify-center py-10">
                <span className="material-icons-round text-indigo-400 text-[30px] animate-spin">sync</span>
            </div>
        ) : papers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                <span className="material-icons-round text-slate-200 text-[48px]">{search ? 'search_off' : 'article'}</span>
                <p className="text-sm text-slate-400">{search ? 'No papers match your search.' : 'No papers yet.'}</p>
                {!search && (
                    <button onClick={onCreatePaper}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-600 active:scale-95 transition-all">
                        <span className="material-icons-round text-[16px]">add</span>
                        New Paper
                    </button>
                )}
            </div>
        ) : (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                    {papers.map(paper => (
                        <PaperCard key={paper.id} paper={paper} onClick={() => onPaperClick(paper.id)} />
                    ))}
                    {!search && (
                        <button onClick={onCreatePaper}
                            className="border-2 border-dashed border-indigo-100 rounded-xl flex flex-col items-center justify-center text-slate-300 hover:text-indigo-400 hover:border-indigo-300 transition-all cursor-pointer group py-8 gap-2">
                            <span className="material-icons-round text-[30px] group-hover:scale-110 transition-transform">add_circle</span>
                            <span className="text-sm font-semibold">New Paper</span>
                        </button>
                    )}
                </div>
                {meta && meta.last_page > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-6">
                        {meta.current_page > 1 && (
                            <button onClick={onLoadLess} disabled={loading}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-500 hover:border-indigo-300 hover:text-indigo-500 disabled:opacity-40 transition-colors">
                                <span className="material-icons-round text-[15px]">expand_less</span>
                                View less
                            </button>
                        )}
                        {meta.current_page < meta.last_page && (
                            <button onClick={onLoadMore} disabled={loading}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-500 hover:border-indigo-300 hover:text-indigo-500 disabled:opacity-40 transition-colors">
                                {loading ? <span className="material-icons-round text-[15px] animate-spin">sync</span> : <span className="material-icons-round text-[15px]">expand_more</span>}
                                View more
                            </button>
                        )}
                        <span className="text-[11px] text-slate-300">Page {meta.current_page} of {meta.last_page} · {meta.total} total</span>
                    </div>
                )}
            </>
        )}
    </section>
);

// ── Recent Notes Section ──────────────────────────────────────────────────────
const RecentNotesSection = ({ notes, loading, onNoteClick, onCreateNote, search, meta, onLoadMore, onLoadLess, sort, sortOptions, onSortChange }) => (
    <section>
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-semibold flex items-center gap-3">
                <span className="w-1 h-5 bg-slate-300 rounded-full" />
                {search ? 'Notes' : 'Recent Notes'}
                {meta?.total != null && (
                    <span className="text-[12px] font-normal text-slate-400 ml-1">({meta.total})</span>
                )}
            </h2>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                <span className="material-icons-round text-slate-400 text-[15px]">sort</span>
                <select
                    value={sort}
                    onChange={e => onSortChange(e.target.value)}
                    className="bg-transparent text-[13px] text-slate-600 outline-none cursor-pointer"
                >
                    {sortOptions.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            </div>
        </div>

        {loading && notes.length === 0 ? (
            <div className="flex justify-center py-10">
                <span className="material-icons-round text-primary text-[30px] animate-spin">sync</span>
            </div>
        ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                <span className="material-icons-round text-slate-200 text-[48px]">{search ? 'search_off' : 'note_add'}</span>
                <p className="text-sm text-slate-400">
                    {search ? 'No notes match your search.' : 'No notes yet.'}
                </p>
                {!search && (
                    <button
                        onClick={onCreateNote}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all"
                    >
                        <span className="material-icons-round text-[16px]">note_add</span>
                        New Note
                    </button>
                )}
            </div>
        ) : (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                    {notes.map(note => (
                        <NoteCard key={note.id} note={note} onClick={() => onNoteClick(note.id)} />
                    ))}
                    {!search && (
                        <button
                            onClick={onCreateNote}
                            className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-300 hover:text-primary hover:border-primary transition-all cursor-pointer group py-8 gap-2"
                        >
                            <span className="material-icons-round text-[30px] group-hover:scale-110 transition-transform">add_circle</span>
                            <span className="text-sm font-semibold">New Note</span>
                        </button>
                    )}
                </div>

                {meta && meta.last_page > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-6">
                        {meta.current_page > 1 && (
                            <button
                                onClick={onLoadLess}
                                disabled={loading}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-500 hover:border-primary hover:text-primary disabled:opacity-40 transition-colors"
                            >
                                <span className="material-icons-round text-[15px]">expand_less</span>
                                View less
                            </button>
                        )}
                        {meta.current_page < meta.last_page && (
                            <button
                                onClick={onLoadMore}
                                disabled={loading}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-500 hover:border-primary hover:text-primary disabled:opacity-40 transition-colors"
                            >
                                {loading ? <span className="material-icons-round text-[15px] animate-spin">sync</span> : <span className="material-icons-round text-[15px]">expand_more</span>}
                                View more
                            </button>
                        )}
                        <span className="text-[11px] text-slate-300">Page {meta.current_page} of {meta.last_page} · {meta.total} total</span>
                    </div>
                )}
            </>
        )}
    </section>
);

const PAPER_SORT_OPTIONS = [
    { value: 'updated_at:desc', label: 'Last updated' },
    { value: 'updated_at:asc',  label: 'Oldest first' },
    { value: 'title:asc',       label: 'Title A → Z' },
    { value: 'title:desc',      label: 'Title Z → A' },
];

const FOLDER_SORT_OPTIONS = [
    { value: 'sort=updated_at:desc', label: 'Last updated' },
    { value: 'sort=updated_at:asc',  label: 'Oldest first' },
    { value: 'sort=name:asc',        label: 'Name A → Z' },
    { value: 'sort=name:desc',       label: 'Name Z → A' },
];

const NOTE_SORT_OPTIONS = [
    { value: 'updated_at:desc', label: 'Last updated' },
    { value: 'updated_at:asc',  label: 'Oldest first' },
    { value: 'title:asc',       label: 'Title A → Z' },
    { value: 'title:desc',      label: 'Title Z → A' },
];

// ── Main Library Content ──────────────────────────────────────────────────────
export const LibraryContent = () => {
    const navigate = useNavigate();

    // Data
    const [folders, setFolders]           = useState([]);
    const [notes, setNotes]               = useState([]);
    const [papers, setPapers]             = useState([]);
    const [foldersMeta, setFoldersMeta]   = useState(null);
    const [foldersPage, setFoldersPage]   = useState(1);
    const [notesMeta, setNotesMeta]       = useState(null);
    const [notesPage, setNotesPage]       = useState(1);
    const [papersMeta, setPapersMeta]     = useState(null);
    const [papersPage, setPapersPage]     = useState(1);

    // Loading
    const [foldersLoading, setFoldersLoading] = useState(true);
    const [notesLoading, setNotesLoading]     = useState(true);
    const [papersLoading, setPapersLoading]   = useState(true);

    // Sort & search
    const [search, setSearch]           = useState('');
    const [folderSort, setFolderSort]   = useState(FOLDER_SORT_OPTIONS[0].value);
    const [noteSort, setNoteSort]       = useState(NOTE_SORT_OPTIONS[0].value);
    const [paperSort, setPaperSort]     = useState(PAPER_SORT_OPTIONS[0].value);
    const [showCreateFolder, setShowCreateFolder] = useState(false);
    const debounceRef = useRef(null);

    // ── Fetch folders ─────────────────────────────────────────────────────────
    const loadFolders = useCallback(async ({ page = 1, q = '', sortVal = FOLDER_SORT_OPTIONS[0].value, append = false, force = false } = {}) => {
        // Use cache only for the default first page
        if (!force && !q.trim() && page === 1 && sortVal === FOLDER_SORT_OPTIONS[0].value) {
            const cached = workspaceCache.getFolders();
            if (cached) { setFolders(cached.data); setFoldersMeta(cached.meta); setFoldersPage(1); setFoldersLoading(false); return; }
        }
        setFoldersLoading(true);
        try {
            const qp = [sortVal, `page=${page}`];
            if (q.trim()) qp.push(`searching=${encodeURIComponent(q.trim())}`);
            const res = await folderService.list(qp.join('&'));
            const data = res.data ?? res;
            const rows = data.data ?? [];
            const meta = data.current_page != null ? { current_page: data.current_page, last_page: data.last_page, total: data.total, per_page: data.per_page } : null;
            setFolders(append ? prev => [...prev, ...rows] : rows);
            setFoldersMeta(meta);
            setFoldersPage(page);
            if (!q.trim() && page === 1 && sortVal === FOLDER_SORT_OPTIONS[0].value) {
                workspaceCache.setFolders({ data: rows, meta });
            }
        } catch {
            // non-fatal
        } finally {
            setFoldersLoading(false);
        }
    }, []);

    // ── Fetch notes ───────────────────────────────────────────────────────────
    const loadNotes = useCallback(async ({ page = 1, q = '', sortVal = NOTE_SORT_OPTIONS[0].value, append = false, force = false } = {}) => {
        // Use cache for the default first page only
        if (!force && !q.trim() && page === 1 && sortVal === NOTE_SORT_OPTIONS[0].value) {
            const cached = workspaceCache.getNotes();
            if (cached) { setNotes(cached.data); setNotesMeta(cached.meta); setNotesPage(1); setNotesLoading(false); return; }
        }
        setNotesLoading(true);
        try {
            const [sortField, sortDir] = sortVal.split(':');
            const qp = [`page=${page}`];
            if (q.trim()) qp.push(`searching=${encodeURIComponent(q.trim())}`);
            if (sortField === 'updated_at') qp.push(`updated_at=${sortDir}`);
            if (sortField === 'title')      qp.push(`title=${sortDir}`);
            const res = await noteService.list(qp.join('&'));
            const data = res.data ?? res;
            const rows = data.data ?? [];
            const meta = data.current_page != null ? { current_page: data.current_page, last_page: data.last_page, total: data.total, per_page: data.per_page } : null;
            setNotes(append ? prev => [...prev, ...rows] : rows);
            setNotesMeta(meta);
            setNotesPage(page);
            // Only cache the default (unfiltered, page 1) result
            if (!q.trim() && page === 1 && sortVal === NOTE_SORT_OPTIONS[0].value) {
                workspaceCache.setNotes(rows, meta);
            }
        } catch {
            // non-fatal
        } finally {
            setNotesLoading(false);
        }
    }, []);

    // ── Fetch papers ──────────────────────────────────────────────────────────
    const loadPapers = useCallback(async ({ page = 1, q = '', sortVal = PAPER_SORT_OPTIONS[0].value, append = false } = {}) => {
        setPapersLoading(true);
        try {
            const [sortField, sortDir] = sortVal.split(':');
            const qp = [`page=${page}`];
            if (q.trim()) qp.push(`searching=${encodeURIComponent(q.trim())}`);
            if (sortField === 'updated_at') qp.push(`updated_at=${sortDir}`);
            if (sortField === 'title')      qp.push(`title=${sortDir}`);
            const res = await paperService.list(qp.join('&'));
            const data = res.data ?? res;
            const rows = data.data ?? [];
            const meta = data.current_page != null ? { current_page: data.current_page, last_page: data.last_page, total: data.total, per_page: data.per_page } : null;
            setPapers(append ? prev => [...prev, ...rows] : rows);
            setPapersMeta(meta);
            setPapersPage(page);
        } catch {
            // non-fatal
        } finally {
            setPapersLoading(false);
        }
    }, []);

    // Initial load — reads from cache instantly if available
    useEffect(() => {
        loadFolders({});
        loadNotes({});
        loadPapers({});
    }, [loadFolders, loadNotes, loadPapers]);

    // Search — debounced 400ms
    const handleSearchChange = (value) => {
        setSearch(value);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            loadFolders({ page: 1, q: value, sortVal: folderSort });
            loadNotes({ page: 1, q: value, sortVal: noteSort });
            loadPapers({ page: 1, q: value, sortVal: paperSort });
        }, 400);
    };

    const handleFolderSortChange = (val) => {
        setFolderSort(val);
        loadFolders({ page: 1, q: search, sortVal: val });
    };

    const handleNoteSortChange = (val) => {
        setNoteSort(val);
        loadNotes({ page: 1, q: search, sortVal: val });
    };

    const handleLoadMoreFolders = () => loadFolders({ page: foldersPage + 1, q: search, sortVal: folderSort, append: true });
    const handleLoadLessFolders = () => loadFolders({ page: 1, q: search, sortVal: folderSort });

    const handleLoadMoreNotes = () => loadNotes({ page: notesPage + 1, q: search, sortVal: noteSort, append: true });
    const handleLoadLessNotes = () => loadNotes({ page: 1, q: search, sortVal: noteSort });

    const handlePaperSortChange = (val) => { setPaperSort(val); loadPapers({ page: 1, q: search, sortVal: val }); };
    const handleLoadMorePapers  = () => loadPapers({ page: papersPage + 1, q: search, sortVal: paperSort, append: true });
    const handleLoadLessPapers  = () => loadPapers({ page: 1, q: search, sortVal: paperSort });

    const handleFolderCreated = (folder) => {
        setShowCreateFolder(false);
        workspaceCache.invalidateFolders();
        navigate(`/lockedin/folders/${folder.id}`);
    };

    return (
        <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 min-w-0 overflow-x-hidden">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight mb-1">Library & Folders</h1>
                    <p className="text-slate-500 text-[14px]">Manage your creative knowledge base.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/lockedin/notes/new')}
                        className="flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-2 rounded-xl text-[14px] font-medium transition-all hover:bg-slate-200 active:scale-95"
                    >
                        <span className="material-icons-round text-[17px]">note_add</span>
                        New Note
                    </button>
                    <button
                        onClick={() => navigate('/lockedin/papers/new')}
                        className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-2 rounded-xl text-[14px] font-medium transition-all hover:bg-indigo-100 active:scale-95"
                    >
                        <span className="material-icons-round text-[17px]">article</span>
                        New Paper
                    </button>
                    <button
                        onClick={() => setShowCreateFolder(true)}
                        className="flex items-center gap-2 bg-primary text-white px-3 py-2 rounded-xl text-[14px] font-medium transition-all shadow-lg shadow-primary/25 hover:bg-primary/90 active:scale-95"
                    >
                        <span className="material-icons-round text-[17px]">create_new_folder</span>
                        New Folder
                    </button>
                </div>
            </header>

            {/* Search */}
            <SearchBar value={search} onChange={handleSearchChange} />

            {/* Folders */}
            <FoldersSection
                folders={folders}
                loading={foldersLoading}
                meta={foldersMeta}
                sort={folderSort}
                sortOptions={FOLDER_SORT_OPTIONS}
                onSortChange={handleFolderSortChange}
                onFolderClick={(id) => navigate(`/lockedin/folders/${id}`)}
                onCreateFolder={() => setShowCreateFolder(true)}
                onLoadMore={handleLoadMoreFolders}
                onLoadLess={handleLoadLessFolders}
                search={search}
            />

            {/* Papers */}
            <PapersSection
                papers={papers}
                loading={papersLoading}
                meta={papersMeta}
                sort={paperSort}
                sortOptions={PAPER_SORT_OPTIONS}
                onSortChange={handlePaperSortChange}
                onPaperClick={(id) => navigate(`/lockedin/papers/${id}`)}
                onCreatePaper={() => navigate('/lockedin/papers/new')}
                onLoadMore={handleLoadMorePapers}
                onLoadLess={handleLoadLessPapers}
                search={search}
            />

            {/* Notes */}
            <RecentNotesSection
                notes={notes}
                loading={notesLoading}
                meta={notesMeta}
                sort={noteSort}
                sortOptions={NOTE_SORT_OPTIONS}
                onSortChange={handleNoteSortChange}
                onNoteClick={(id) => navigate(`/lockedin/notes/${id}`)}
                onCreateNote={() => navigate('/lockedin/notes/new')}
                onLoadMore={handleLoadMoreNotes}
                onLoadLess={handleLoadLessNotes}
                search={search}
            />

            {/* Flashcards shortcut */}
            <section className="mt-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Flashcards</h2>
                        <div className="h-px flex-1 w-16 bg-slate-200" />
                    </div>
                    <button
                        onClick={() => navigate('/lockedin/flashcards')}
                        className="flex items-center gap-1.5 text-[12px] text-primary font-medium hover:underline"
                    >
                        View all
                        <span className="material-icons-round text-[14px]">arrow_forward</span>
                    </button>
                </div>
                <button
                    onClick={() => navigate('/lockedin/flashcards')}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-violet-50 border border-violet-100 hover:border-violet-300 hover:shadow-md transition-all group"
                >
                    <div className="w-10 h-10 rounded-xl bg-violet-500 flex items-center justify-center shrink-0 shadow-sm">
                        <span className="material-icons-round text-white text-[20px]">style</span>
                    </div>
                    <div className="text-left">
                        <p className="font-semibold text-slate-800 text-[14px]">Flashcard Decks</p>
                        <p className="text-slate-400 text-[12px]">Create &amp; study flashcard decks with templates</p>
                    </div>
                    <span className="material-icons-round text-slate-300 group-hover:text-violet-400 transition-colors ml-auto text-[20px]">chevron_right</span>
                </button>
            </section>

            {/* Create Folder Modal */}
            {showCreateFolder && (
                <CreateFolderModal
                    onClose={() => setShowCreateFolder(false)}
                    onCreated={handleFolderCreated}
                />
            )}
        </main>
    );
};
