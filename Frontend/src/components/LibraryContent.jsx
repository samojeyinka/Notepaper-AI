import { useState, useEffect, useCallback, useRef } from 'react';
import Loader from './globals/Loader';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { folderService } from '../api/folderService';
import { noteService } from '../api/noteService';
import { paperService } from '../api/paperService';
import { presentationService } from '../api/presentationService';
import { flashcardService } from '../api/flashcardService';
import { workspaceCache } from '../api/workspaceCache';
import { FolderShape, CreateFolderModal } from './user/FloatingAIButton';
import NotificationIcon from './user/NotificationIcon';
import { CardMenu, DeleteConfirmModal } from './globals/DeleteConfirm';

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
        const cleaned = raw.replace(/<[^>]+>/g, ' ');
        const quoted = cleaned.match(/"((?:[^"\\]|\\.)*)"/);
        if (quoted && quoted[1].trim()) return quoted[1].trim().slice(0, 120);
        return cleaned.replace(/[{}\[\]\\"]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120);
    }
};

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
    { id: 'notes',         label: 'Notes',         icon: 'description', accent: '#6C4EA6' },
    { id: 'papers',        label: 'Papers',        icon: 'article',     accent: '#6C4EA6' },
    { id: 'folders',       label: 'Folders',       icon: 'folder',      accent: '#6C4EA6' },
    { id: 'presentations', label: 'Slides',        icon: 'slideshow',   accent: '#6C4EA6' },
    { id: 'flashcards',    label: 'Flashcards',    icon: 'style',       accent: '#6C4EA6' },
];

// ── Sort options ──────────────────────────────────────────────────────────────
// All tabs use the unified `sort=field:direction` format fed directly to the API.
// Notes/Papers use SortFilter (sortable: updated_at, title).
// Folders use FolderFilter (sortable: updated_at, name).
// Presentations & Flashcards parse the `sort` query param in their controllers.
const SORT_OPTIONS = {
    notes:         [{ v:'sort=updated_at:desc',label:'Last updated'},{ v:'sort=updated_at:asc',label:'Oldest first'},{ v:'sort=title:asc',label:'A → Z'},{ v:'sort=title:desc',label:'Z → A'}],
    papers:        [{ v:'sort=updated_at:desc',label:'Last updated'},{ v:'sort=updated_at:asc',label:'Oldest first'},{ v:'sort=title:asc',label:'A → Z'},{ v:'sort=title:desc',label:'Z → A'}],
    folders:       [{ v:'sort=updated_at:desc',label:'Last updated'},{ v:'sort=updated_at:asc',label:'Oldest first'},{ v:'sort=name:asc',label:'A → Z'},{ v:'sort=name:desc',label:'Z → A'}],
    presentations: [{ v:'sort=updated_at:desc',label:'Last updated'},{ v:'sort=updated_at:asc',label:'Oldest first'},{ v:'sort=title:asc',label:'A → Z'},{ v:'sort=title:desc',label:'Z → A'}],
    flashcards:    [{ v:'sort=updated_at:desc',label:'Last updated'},{ v:'sort=updated_at:asc',label:'Oldest first'},{ v:'sort=title:asc',label:'A → Z'},{ v:'sort=title:desc',label:'Z → A'}],
};

// ── Presentation theme preview ────────────────────────────────────────────────
const THEME_BG = {
    modern:   '#0f172a', minimal: '#d1fae5', academic: '#1e3a5f',
    bold:     'linear-gradient(135deg,#6d28d9,#c026d3)',
    pastel:   'linear-gradient(135deg,#fce7f3,#e0e7ff)',
};

// ── Search Bar ────────────────────────────────────────────────────────────────
const SearchBar = ({ value, onChange, placeholder }) => (
    <div className="relative max-w-2xl">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <span className="material-icons-round text-stone-400 text-[18px]">search</span>
        </div>
        <input
            className="w-full bg-white border border-stone-200 py-2 pl-11 pr-10 shadow-sm focus:ring-2 focus:ring-plum-200 focus:border-plum-400 text-[13px] md:text-sm placeholder-stone-400 outline-none transition-all"
            placeholder={placeholder ?? 'Search…'}
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
    const selected = options.find(o => o.v === value);

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
                className="flex items-center gap-1.5 bg-stone-50 border border-stone-200  md: px-3 py-0.5 md:py-1.5 text-[12px] md:text-[13px] text-stone-600 hover:bg-stone-100 transition-colors"
            >
                <span className="material-icons-round text-stone-400 text-[12px] md:text-[15px]">sort</span>
                <span>{selected?.label}</span>
                <span className={`material-icons-round text-stone-400 text-[14px] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
                    expand_more
                </span>
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1.5 bg-white border border-stone-100  shadow-xl py-1 z-30 min-w-[140px] animate-in fade-in zoom-in-95 duration-100">
                    {options.map(o => (
                        <button
                            key={o.v}
                            onClick={() => { onChange(o.v); setOpen(false); }}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-[12px] md:text-[13px] text-left transition-colors hover:bg-stone-50 ${
                                o.v === value ? 'text-primary font-semibold' : 'text-stone-600'
                            }`}
                        >
                            {o.v === value && <span className="material-icons-round text-[13px]">check</span>}
                            <span className={o.v === value ? '' : 'ml-[17px]'}>{o.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// ── Shared card wrapper (div, not button — lets us nest the card menu button) ──
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

// ── Folder card (grid) ────────────────────────────────────────────────────────
const FolderGridCard = ({ folder, onClick, onDelete }) => (
    <CardShell onClick={onClick}>
        <div className="bg-white ring-1 ring-stone-200/70 p-5 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:ring-plum-200 aspect-square">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity" style={{ backgroundColor: folder.color ?? '#6C4EA6' }} />
            {onDelete && (
                <div className="absolute top-2 right-2 z-10">
                    <CardMenu onDelete={onDelete} />
                </div>
            )}
            <FolderShape shape={folder.shape ?? 'squircle'} color={folder.color ?? '#6C4EA6'} icon={folder.icon ?? 'folder'} size={56} />
            <h3 className="text-[13px] font-semibold text-stone-800 text-center mt-3 leading-tight line-clamp-2">{folder.name}</h3>
            <p className="text-stone-400 text-[11px] mt-1">{timeAgo(folder.updated_at)}</p>
        </div>
    </CardShell>
);

// ── Note card ─────────────────────────────────────────────────────────────────
const NoteCard = ({ note, onClick, onDelete }) => {
    const snippet = extractSnippet(note.snippet ?? note.content ?? '');
    return (
        <CardShell onClick={onClick}>
            <div className="bg-white ring-1 ring-stone-200/70 p-4 hover:ring-plum-200 transition-all h-full flex flex-col">
                <div className="flex justify-between items-start mb-3">
                    <div className="w-9 h-9 bg-plum-50 flex items-center justify-center shrink-0">
                        <span className="material-icons-round text-plum-700 text-[18px]">description</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 ">{timeAgo(note.updated_at)}</span>
                        {onDelete && <CardMenu onDelete={onDelete} />}
                    </div>
                </div>
                <h4 className="font-semibold text-[14px] text-stone-800 mb-1.5 line-clamp-1">{note.title || 'Untitled Note'}</h4>
                <p className="text-stone-400 text-[12px] line-clamp-3 font-serif italic leading-relaxed flex-1">{snippet || 'No content yet.'}</p>
                {note.folder && (
                    <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-stone-100">
                        <div className="w-3.5 h-3.5  shrink-0" style={{ backgroundColor: note.folder.color ?? '#6C4EA6' }} />
                        <span className="text-[11px] text-stone-400 truncate">{note.folder.name}</span>
                    </div>
                )}
            </div>
        </CardShell>
    );
};

// ── Paper card ────────────────────────────────────────────────────────────────
const PaperCard = ({ paper, onClick, onDelete }) => {
    const snippet = extractSnippet(paper.snippet ?? paper.content ?? '');
    return (
        <CardShell onClick={onClick}>
            <div className="bg-white ring-1 ring-stone-200/70 p-4 hover:ring-plum-200 transition-all h-full flex flex-col">
                <div className="flex justify-between items-start mb-3">
                    <div className="w-9 h-9 bg-plum-50 flex items-center justify-center shrink-0">
                        <span className="material-icons-round text-plum-700 text-[18px]">article</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 ">{timeAgo(paper.updated_at)}</span>
                        {onDelete && <CardMenu onDelete={onDelete} />}
                    </div>
                </div>
                <h4 className="font-semibold text-[14px] text-stone-800 mb-1.5 line-clamp-1">{paper.title || 'Untitled Paper'}</h4>
                <p className="text-stone-400 text-[12px] line-clamp-3 leading-relaxed flex-1">{snippet || 'No content yet.'}</p>
                {paper.folder && (
                    <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-stone-100">
                        <div className="w-3.5 h-3.5  shrink-0" style={{ backgroundColor: paper.folder.color ?? '#6C4EA6' }} />
                        <span className="text-[11px] text-stone-400 truncate">{paper.folder.name}</span>
                    </div>
                )}
            </div>
        </CardShell>
    );
};

// ── Presentation card ─────────────────────────────────────────────────────────
const PresentationCard = ({ pres, onClick, onDelete }) => (
    <CardShell onClick={onClick}>
        <div className="bg-white ring-1 ring-stone-200/70 hover:ring-plum-200 transition-all overflow-hidden h-full flex flex-col">
            <div className="w-full aspect-video flex items-center justify-center relative"
                style={{ background: THEME_BG[pres.theme] ?? '#0f172a' }}>
                <span className="material-icons-round text-white/20 text-[40px]">slideshow</span>
                <span className="absolute bottom-2 right-3 text-[10px] text-white/50 font-medium">{pres.slide_count ?? 0} slides</span>
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

// ── Flashcard card ────────────────────────────────────────────────────────────
const FlashcardCard = ({ deck, onClick }) => {
    const count     = deck.cards_count ?? deck.card_count ?? deck.cards?.length ?? 0;
    const firstCard = deck.cards?.[0];
    return (
        <button onClick={onClick} className="text-left group focus:outline-none w-full">
            <div className="bg-white ring-1 ring-stone-200/70 p-4 hover:ring-plum-200 transition-all h-full flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <div className="w-9 h-9 bg-plum-50 flex items-center justify-center shrink-0">
                        <span className="material-icons-round text-plum-700 text-[18px]">style</span>
                    </div>
                    <span className="text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 ">{timeAgo(deck.updated_at)}</span>
                </div>
                <h4 className="font-semibold text-[14px] text-stone-800 mb-1 line-clamp-1">{deck.title || 'Untitled Deck'}</h4>
                <p className="text-[11px] text-plum-600 font-medium mb-2">{count} {count === 1 ? 'card' : 'cards'}</p>
                {firstCard?.front && (
                    <div className="mt-auto pt-2 border-t border-stone-100">
                        <p className="text-[12px] text-stone-600 line-clamp-1">{firstCard.front}</p>
                        {firstCard.back && (
                            <p className="text-[11px] text-stone-400 line-clamp-1 italic mt-0.5">{firstCard.back}</p>
                        )}
                    </div>
                )}
            </div>
        </button>
    );
};

// ── List row (shared across tabs) ─────────────────────────────────────────────
const ListRow = ({ icon, iconBg, iconText, title, sub, meta, date, onClick, onDelete }) => (
    <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
        className="w-full grid grid-cols-1 md:grid-cols-12 items-center gap-3 px-5 py-3.5 border-b border-stone-100 last:border-0 hover:bg-stone-50/60 transition-colors text-left cursor-pointer"
    >
        <div className="col-span-6 flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9  ${iconBg} flex items-center justify-center shrink-0`}>
                <span className={`material-icons-round text-[17px] ${iconText}`}>{icon}</span>
            </div>
            <div className="min-w-0">
                <p className="text-[13px] font-semibold text-stone-800 truncate">{title}</p>
                {sub && <p className="text-[11px] text-stone-400 truncate mt-0.5">{sub}</p>}
            </div>
        </div>
        <div className="col-span-3 text-[12px] text-stone-400 truncate">{meta}</div>
        <div className="col-span-2 text-[12px] text-stone-400 text-right">{date}</div>
        <div className="col-span-1 flex justify-end">
            {onDelete && <CardMenu onDelete={onDelete} />}
        </div>
    </div>
);

const ListHeader = ({ cols }) => (
    <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-2.5 border-b border-stone-100 bg-stone-50/60">
        {cols.map(({ label, cls }) => (
            <div key={label} className={`text-[10px] font-semibold text-stone-400 uppercase tracking-widest ${cls}`}>{label}</div>
        ))}
    </div>
);

const LIST_HEADER_COLS = [
    { label: 'Name',    cls: 'col-span-6' },
    { label: 'Details', cls: 'col-span-3' },
    { label: 'Updated', cls: 'col-span-2 text-right' },
    { label: '',        cls: 'col-span-1' },
];

// ── Pagination controls ───────────────────────────────────────────────────────
const Pagination = ({ meta, loading, onMore, onLess }) => {
    if (!meta || meta.last_page <= 1) return null;
    return (
        <div className="flex items-center justify-center gap-3 mt-6">
            {meta.current_page > 1 && (
                <button onClick={onLess} disabled={loading}
                    className="flex items-center gap-1.5 px-2 md:px-4 md:py-1.5 py-1  md: border border-stone-200 text-[13px] font-medium text-stone-500 hover:border-primary hover:text-primary disabled:opacity-40 transition-colors">
                    <span className="material-icons-round text-[15px]">expand_less</span>View less
                </button>
            )}
            {meta.current_page < meta.last_page && (
                <button onClick={onMore} disabled={loading}
                    className="flex items-center gap-1.5 px-1 md:px-4 py-1 md:py-1.5  md: border border-stone-200 text-[12px] md:text-[13px] font-medium text-stone-500 hover:border-primary hover:text-primary disabled:opacity-40 transition-colors">
                    {loading ? <Loader size="xs" /> : <span className="material-icons-round text-[15px]">expand_more</span>}
                    View more
                </button>
            )}
            <span className="text-[10px] md:text-[11px] text-stone-300">Page {meta.current_page} of {meta.last_page} · {meta.total} total</span>
        </div>
    );
};

// ── Floating Action Button ────────────────────────────────────────────────────
const FAB = ({ onNote, onPaper, onFolder, onPresentation, onFlashcard }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const items = [
        { icon: 'note_add',           label: 'New Note',         color: '#6C4EA6', onClick: onNote },
        { icon: 'article',            label: 'New Paper',        color: '#6C4EA6', onClick: onPaper },
        { icon: 'create_new_folder',  label: 'New Folder',       color: '#6C4EA6', onClick: onFolder },
        { icon: 'slideshow',          label: 'New Slides',       color: '#6C4EA6', onClick: onPresentation },
        { icon: 'style',              label: 'New Flashcards',   color: '#6C4EA6', onClick: onFlashcard },
    ];

    return (
        <div ref={ref} className="fixed bottom-8 right-8 z-50 flex flex-col-reverse items-end gap-3">
            {open && items.map((item, i) => (
                <div key={i} className="flex items-center gap-3"
                    style={{ animation: `slideUpFade 0.18s ease both`, animationDelay: `${i * 40}ms` }}>
                    <span className="text-[11px] md:text-[12px] md:font-medium text-stone-700 bg-white ring-1 ring-stone-200 shadow-md px-2.5 py-1 whitespace-nowrap select-none">
                        {item.label}
                    </span>
                    <button
                        onClick={() => { item.onClick(); setOpen(false); }}
                        className="w-8 h-8 md:w-12 md:h-12  md: shadow-lg flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95"
                        style={{ backgroundColor: item.color }}>
                        <span className="material-icons-round text-[18px] md:text-[22px]">{item.icon}</span>
                    </button>
                </div>
            ))}
            <button
                onClick={() => setOpen(v => !v)}
                className={`w-8 h-8 md:w-14 md:h-14  md: shadow-xl flex items-center justify-center text-white transition-all duration-200 active:scale-95
                    ${open ? 'bg-stone-700 rotate-45' : 'bg-stone-900 hover:bg-stone-700 hover:scale-105'}`}
                style={{ transform: open ? 'rotate(45deg)' : undefined }}>
                <span className="material-icons-round text-[18px] md:text-[26px]">add</span>
            </button>
            <style>{`@keyframes slideUpFade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
        </div>
    );
};

// ── Main Library Content ──────────────────────────────────────────────────────
export const LibraryContent = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'notes';
    const setTab = (tab) => setSearchParams({ tab }, { replace: true });

    // Pre-populate search from URL ?q= param (set by the dashboard global search bar)
    const urlQ = searchParams.get('q') || '';

    // Per-tab state
    const [data,    setData]    = useState({ notes:[], papers:[], folders:[], presentations:[], flashcards:[] });
    const [meta,    setMeta]    = useState({ notes:null, papers:null, folders:null, presentations:null, flashcards:null });
    const [page,    setPage]    = useState({ notes:1, papers:1, folders:1, presentations:1, flashcards:1 });
    const [loading, setLoading] = useState({ notes:false, papers:false, folders:false, presentations:false, flashcards:false });
    const [sort,    setSort]    = useState({
        notes:  SORT_OPTIONS.notes[0].v,
        papers: SORT_OPTIONS.papers[0].v,
        folders:SORT_OPTIONS.folders[0].v,
        presentations: SORT_OPTIONS.presentations[0].v,
        flashcards: SORT_OPTIONS.flashcards[0].v,
    });
    const [search, setSearch] = useState(urlQ);
    const [view,   setView]   = useState(() => localStorage.getItem('library_view') ?? 'grid');
    const [showCreateFolder, setShowCreateFolder] = useState(false);
    const [creatingPresentation, setCreatingPresentation] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null); // { tab, item }

    const loadedTabs = useRef(new Set());
    const debounceRef = useRef(null);

    const setTabData    = (tab, rows) => setData(d => ({ ...d, [tab]: rows }));
    const setTabMeta    = (tab, m)    => setMeta(d => ({ ...d, [tab]: m }));
    const setTabPage    = (tab, p)    => setPage(d => ({ ...d, [tab]: p }));
    const setTabLoading = (tab, v)    => setLoading(d => ({ ...d, [tab]: v }));

    // ── Loaders ───────────────────────────────────────────────────────────────
    const loadNotes = useCallback(async ({ p = 1, q = '', sortVal, append = false, force = false } = {}) => {
        const sv = sortVal ?? sort.notes;
        if (!force && !q.trim() && p === 1 && sv === SORT_OPTIONS.notes[0].v) {
            const cached = workspaceCache.getNotes();
            if (cached) { setTabData('notes', cached.data); setTabMeta('notes', cached.meta); setTabPage('notes', 1); setTabLoading('notes', false); return; }
        }
        setTabLoading('notes', true);
        try {
            const qp = [`page=${p}`, sv];
            if (q.trim()) qp.push(`searching=${encodeURIComponent(q.trim())}`);
            const res = await noteService.list(qp.join('&'));
            const d = res.data ?? res; const rows = d.data ?? [];
            const m = d.current_page != null ? { current_page:d.current_page, last_page:d.last_page, total:d.total, per_page:d.per_page } : null;
            setTabData('notes', append ? [...data.notes, ...rows] : rows);
            setTabMeta('notes', m); setTabPage('notes', p);
            if (!q.trim() && p === 1 && sv === SORT_OPTIONS.notes[0].v) workspaceCache.setNotes(rows, m);
        } catch {} finally { setTabLoading('notes', false); }
    }, [sort.notes, data.notes]);

    const loadPapers = useCallback(async ({ p = 1, q = '', sortVal, append = false, force = false } = {}) => {
        const sv = sortVal ?? sort.papers;
        if (!force && !q.trim() && p === 1 && sv === SORT_OPTIONS.papers[0].v) {
            const cached = workspaceCache.getPapers();
            if (cached) { setTabData('papers', cached.data); setTabMeta('papers', cached.meta); setTabPage('papers', 1); setTabLoading('papers', false); return; }
        }
        setTabLoading('papers', true);
        try {
            const qp = [`page=${p}`, sv];
            if (q.trim()) qp.push(`searching=${encodeURIComponent(q.trim())}`);
            const res = await paperService.list(qp.join('&'));
            const d = res.data ?? res; const rows = d.data ?? [];
            const m = d.current_page != null ? { current_page:d.current_page, last_page:d.last_page, total:d.total, per_page:d.per_page } : null;
            setTabData('papers', append ? [...data.papers, ...rows] : rows);
            setTabMeta('papers', m); setTabPage('papers', p);
            if (!q.trim() && p === 1 && sv === SORT_OPTIONS.papers[0].v) workspaceCache.setPapers(rows, m);
        } catch {} finally { setTabLoading('papers', false); }
    }, [sort.papers, data.papers]);

    const loadFolders = useCallback(async ({ p = 1, q = '', sortVal, append = false, force = false } = {}) => {
        const sv = sortVal ?? sort.folders;
        if (!force && !q.trim() && p === 1 && sv === SORT_OPTIONS.folders[0].v) {
            const cached = workspaceCache.getFolders();
            if (cached) { setTabData('folders', cached.data); setTabMeta('folders', cached.meta); setTabPage('folders', 1); setTabLoading('folders', false); return; }
        }
        setTabLoading('folders', true);
        try {
            const qp = [sv, `page=${p}`];
            if (q.trim()) qp.push(`searching=${encodeURIComponent(q.trim())}`);
            const res = await folderService.list(qp.join('&'));
            const d = res.data ?? res; const rows = d.data ?? [];
            const m = d.current_page != null ? { current_page:d.current_page, last_page:d.last_page, total:d.total, per_page:d.per_page } : null;
            setTabData('folders', append ? [...data.folders, ...rows] : rows);
            setTabMeta('folders', m); setTabPage('folders', p);
            if (!q.trim() && p === 1 && sv === SORT_OPTIONS.folders[0].v) workspaceCache.setFolders({ data: rows, meta: m });
        } catch {} finally { setTabLoading('folders', false); }
    }, [sort.folders, data.folders]);

    const loadPresentations = useCallback(async ({ p = 1, q = '', sortVal, append = false, force = false } = {}) => {
        const sv = sortVal ?? sort.presentations;
        if (!force && !q.trim() && p === 1 && sv === SORT_OPTIONS.presentations[0].v) {
            const cached = workspaceCache.getPresentations();
            if (cached) { setTabData('presentations', cached.data); setTabMeta('presentations', cached.meta); setTabPage('presentations', 1); setTabLoading('presentations', false); return; }
        }
        setTabLoading('presentations', true);
        try {
            const sortParam = sv.replace('sort=', '');
            const qp = [`page=${p}`, `sort=${sortParam}`];
            if (q.trim()) qp.push(`searching=${encodeURIComponent(q.trim())}`);
            const res = await presentationService.list(qp.join('&'));
            const d = res.data ?? res;
            const rows = d.data ?? (Array.isArray(d) ? d : []);
            const m = d.current_page != null ? { current_page:d.current_page, last_page:d.last_page, total:d.total, per_page:d.per_page } : null;
            setTabData('presentations', append ? [...data.presentations, ...rows] : rows);
            setTabMeta('presentations', m); setTabPage('presentations', p);
            if (!q.trim() && p === 1 && sv === SORT_OPTIONS.presentations[0].v) workspaceCache.setPresentations(rows, m);
        } catch {} finally { setTabLoading('presentations', false); }
    }, [sort.presentations, data.presentations]);

    const loadFlashcards = useCallback(async ({ p = 1, q = '', sortVal, append = false } = {}) => {
        const sv = sortVal ?? sort.flashcards;
        setTabLoading('flashcards', true);
        try {
            // sv is e.g. 'sort=updated_at:desc' — extract just the field:direction part
            const sortParam = sv.replace('sort=', '');
            const res = await flashcardService.list({ page: p, sort: sortParam, searching: q.trim() || undefined });
            const d = res.data ?? res;
            const rows = d.data ?? (Array.isArray(d) ? d : []);
            const m = d.current_page != null ? { current_page:d.current_page, last_page:d.last_page, total:d.total, per_page:d.per_page } : null;
            setTabData('flashcards', append ? [...data.flashcards, ...rows] : rows);
            setTabMeta('flashcards', m); setTabPage('flashcards', p);
        } catch {} finally { setTabLoading('flashcards', false); }
    }, [sort.flashcards, data.flashcards]);

    const LOADERS = { notes: loadNotes, papers: loadPapers, folders: loadFolders, presentations: loadPresentations, flashcards: loadFlashcards };

    // Load tab on first visit (pass URL ?q= if present)
    useEffect(() => {
        if (!loadedTabs.current.has(activeTab)) {
            loadedTabs.current.add(activeTab);
            LOADERS[activeTab]?.({ q: urlQ });
        }
    }, [activeTab]);

    // Debounced search (current tab only)
    const handleSearch = (val) => {
        setSearch(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            LOADERS[activeTab]?.({ p:1, q:val });
        }, 400);
    };

    const toggleView = (v) => { setView(v); localStorage.setItem('library_view', v); };

    const handleSortChange = (tab, val) => {
        setSort(s => ({ ...s, [tab]: val }));
        LOADERS[tab]?.({ p:1, q:search, sortVal:val });
    };

    // ── Create handlers ───────────────────────────────────────────────────────
    const handleCreateFlashcard = () => navigate('/lockedin/flashcards/new');

    const handleCreatePresentation = async () => {
        setCreatingPresentation(true);
        try {
            const blank = {
                title: 'Untitled Presentation',
                slides: JSON.stringify([{ slide:1, layout:'title', title:'', bullets:[''], speaker_notes:'', listStyle:'bullet' }]),
                theme: 'modern',
                slide_count: 1,
            };
            const res = await presentationService.create(blank);
            const id = res.data?.id ?? res.id;
            workspaceCache.invalidatePresentations();
            navigate(`/lockedin/presentations/${id}`);
        } catch { alert('Could not create presentation.'); }
        finally { setCreatingPresentation(false); }
    };

    const handleFolderCreated = (folder) => {
        setShowCreateFolder(false);
        workspaceCache.invalidateFolders();
        navigate(`/lockedin/folders/${folder.id}`);
    };

    // ── Delete handling ───────────────────────────────────────────────────────
    const DELETE_SERVICE = { notes: noteService, papers: paperService, folders: folderService, presentations: presentationService };
    const DELETE_INVALIDATE = {
        notes: workspaceCache.invalidateNotes,
        papers: workspaceCache.invalidatePapers,
        folders: workspaceCache.invalidateFolders,
        presentations: workspaceCache.invalidatePresentations,
    };
    const DELETE_LABEL = { notes: 'note', papers: 'paper', folders: 'folder', presentations: 'presentation' };

    const handleConfirmDelete = async () => {
        const { tab, item } = deleteTarget;
        setDeleteTarget(null);
        try {
            await DELETE_SERVICE[tab].destroy(item.id);
            DELETE_INVALIDATE[tab]();
            setData(d => ({ ...d, [tab]: d[tab].filter(x => x.id !== item.id) }));
            setMeta(m => m[tab] ? { ...m, [tab]: { ...m[tab], total: Math.max(0, m[tab].total - 1) } } : m);
        } catch {
            alert(`Could not delete this ${DELETE_LABEL[tab]}.`);
        }
    };

    // ── Render helpers ────────────────────────────────────────────────────────
    const renderEmpty = (tab, onCreate) => (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="w-16 h-16 bg-plum-50 text-plum-600 flex items-center justify-center">
                <span className="material-icons-round text-[30px]">{TABS.find(t=>t.id===tab)?.icon}</span>
            </div>
            <p className="text-sm text-stone-500">{search ? `No ${tab} match your search.` : `No ${tab} yet.`}</p>
            {!search && onCreate && (
                <button onClick={onCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white text-sm font-semibold hover:bg-stone-700 active:scale-95 transition-all">
                    <span className="material-icons-round text-[16px]">add</span>
                    Create one
                </button>
            )}
        </div>
    );

    const tabData    = data[activeTab]    ?? [];
    const tabMeta    = meta[activeTab]    ?? null;
    const tabPage    = page[activeTab]    ?? 1;
    const tabLoading = loading[activeTab] ?? false;
    const tabSort    = sort[activeTab]    ?? SORT_OPTIONS[activeTab]?.[0]?.v;
    const sortOpts   = SORT_OPTIONS[activeTab] ?? [];

    return (
        <>
        {deleteTarget && (
            <DeleteConfirmModal
                title={`Delete this ${DELETE_LABEL[deleteTarget.tab]}?`}
                subtitle={deleteTarget.item.title ?? deleteTarget.item.name}
                warning={deleteTarget.tab === 'folders'
                    ? 'This will also delete all notes, papers and flashcards inside this folder. This action cannot be undone.'
                    : 'This action cannot be undone.'}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        )}
        <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 min-w-0 overflow-x-hidden pb-28">
            {/* Header */}
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-plum-700 mb-1.5">Your workspace</p>
                    <h1 className="font-display-serif text-[28px] md:text-[34px] font-semibold tracking-tight text-stone-900 leading-tight">Library</h1>
                    <p className="text-stone-500 text-[13px] md:text-sm mt-1.5">Everything you've written, in one place.</p>
                </div>
                <NotificationIcon/>
            </header>

            {/* Tabs */}
            <div className="flex items-center gap-1 mb-3 md:mb-6 border-b border-stone-200 overflow-x-auto">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setTab(tab.id)}
                        className={`flex items-center gap-2 px-2 md:px-4 py-2.5 text-[10.5px] md:text-[14px] md:font-medium whitespace-nowrap transition-all border-b-2 -mb-px
                            ${activeTab === tab.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-stone-500 hover:text-stone-800'}`}
                    >
                        <span className="material-icons-round text-[15px] md:text-[17px]">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Search + Sort row */}
            <div className="flex items-center gap-3 mb-3 md:mb-6 flex-wrap">
                <div className="flex-1 min-w-0">
                    <SearchBar value={search} onChange={handleSearch} placeholder={`Search ${activeTab}…`} />
                </div>
                {sortOpts.length > 0 && (
                    <SortSelect value={tabSort} options={sortOpts} onChange={val => handleSortChange(activeTab, val)} />
                )}
                <div className="flex items-center bg-stone-100  p-0.5 shrink-0">
                    {[
                        { v: 'grid', icon: 'grid_view'  },
                        { v: 'list', icon: 'view_list'  },
                    ].map(({ v, icon }) => (
                        <button
                            key={v}
                            onClick={() => toggleView(v)}
                            className={`w-7 h-7  flex items-center justify-center transition-all ${view === v ? 'bg-white shadow-sm text-primary' : 'text-stone-400 hover:text-stone-600'}`}
                        >
                            <span className="material-icons-round text-[17px]">{icon}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {tabLoading && tabData.length === 0 ? (
                <div className="flex justify-center py-16">
                    <Loader size="lg" />
                </div>
            ) : tabData.length === 0 ? (
                <>
                    {activeTab === 'notes'         && renderEmpty('notes',         () => navigate('/lockedin/notes/new'))}
                    {activeTab === 'papers'        && renderEmpty('papers',        () => navigate('/lockedin/papers/new'))}
                    {activeTab === 'folders'       && renderEmpty('folders',       () => setShowCreateFolder(true))}
                    {activeTab === 'presentations' && renderEmpty('presentations', handleCreatePresentation)}
                    {activeTab === 'flashcards'    && renderEmpty('flashcards',    handleCreateFlashcard)}
                </>
            ) : (
                <>
                    {/* ── Grid view ── */}
                    {view === 'grid' && (
                        <>
                            {activeTab === 'notes' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                                    {tabData.map(note => (
                                        <NoteCard key={note.id} note={note} onClick={() => navigate(`/lockedin/notes/${note.id}`)} onDelete={() => setDeleteTarget({ tab: 'notes', item: note })} />
                                    ))}
                                    {!search && (
                                        <button onClick={() => navigate('/lockedin/notes/new')}
                                            className="border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-300 hover:text-plum-600 hover:border-plum-400 transition-all group py-8 gap-2">
                                            <span className="material-icons-round text-[20px] md:text-[30px] group-hover:scale-110 transition-transform">add_circle</span>
                                            <span className="text-sm medium md:font-semibold">New Note</span>
                                        </button>
                                    )}
                                </div>
                            )}
                            {activeTab === 'papers' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                                    {tabData.map(paper => (
                                        <PaperCard key={paper.id} paper={paper} onClick={() => navigate(`/lockedin/papers/${paper.id}`)} onDelete={() => setDeleteTarget({ tab: 'papers', item: paper })} />
                                    ))}
                                    {!search && (
                                        <button onClick={() => navigate('/lockedin/papers/new')}
                                            className="border-2 border-dashed border-plum-200 flex flex-col items-center justify-center text-stone-300 hover:text-plum-600 hover:border-plum-400 transition-all group py-8 gap-2">
                                            <span className="material-icons-round text-[20px] md:text-[30px] group-hover:scale-110 transition-transform">add_circle</span>
                                            <span className="text-sm medium md:font-semibold">New Paper</span>
                                        </button>
                                    )}
                                </div>
                            )}
                            {activeTab === 'folders' && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {tabData.map(f => (
                                        <FolderGridCard key={f.id} folder={f} onClick={() => navigate(`/lockedin/folders/${f.id}`)} onDelete={() => setDeleteTarget({ tab: 'folders', item: f })} />
                                    ))}
                                    {!search && (
                                        <button onClick={() => setShowCreateFolder(true)}
                                            className="border-2 border-dashed border-plum-200 flex flex-col items-center justify-center text-stone-300 hover:text-plum-600 hover:border-plum-400 transition-all group aspect-square gap-2">
                                            <span className="material-icons-round text-[20px] md:text-[30px] group-hover:scale-110 transition-transform">create_new_folder</span>
                                            <span className="text-sm medium md:font-semibold">New Folder</span>
                                        </button>
                                    )}
                                </div>
                            )}
                            {activeTab === 'presentations' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                                    {tabData.map(pres => (
                                        <PresentationCard key={pres.id} pres={pres} onClick={() => navigate(`/lockedin/presentations/${pres.id}`)} onDelete={() => setDeleteTarget({ tab: 'presentations', item: pres })} />
                                    ))}
                                    {!search && (
                                        <button onClick={handleCreatePresentation} disabled={creatingPresentation}
                                            className="border-2 border-dashed border-plum-200 flex flex-col items-center justify-center text-stone-300 hover:text-plum-600 hover:border-plum-400 transition-all group aspect-video gap-2 disabled:opacity-60">
                                            {creatingPresentation ? <Loader size="md" /> : <span className="material-icons-round text-[20px] md:text-[30px] group-hover:scale-110 transition-transform">add_circle</span>}
                                            <span className="text-sm medium md:font-semibold">New Slides</span>
                                        </button>
                                    )}
                                </div>
                            )}
                            {activeTab === 'flashcards' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                                    {tabData.map(deck => (
                                        <FlashcardCard key={deck.id} deck={deck} onClick={() => navigate(`/lockedin/flashcards/${deck.id}`)} />
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* ── List view ── */}
                    {view === 'list' && (
                        <div className="bg-white ring-1 ring-stone-200/70 overflow-hidden" style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.03)' }}>
                            <ListHeader cols={LIST_HEADER_COLS} />

                            {activeTab === 'notes' && tabData.map(note => (
                                <ListRow key={note.id}
                                    icon="description" iconBg="bg-plum-50" iconText="text-plum-700"
                                    title={note.title || 'Untitled Note'}
                                    sub={extractSnippet(note.snippet ?? note.content ?? '')}
                                    meta={note.folder?.name ?? '—'}
                                    date={timeAgo(note.updated_at)}
                                    onClick={() => navigate(`/lockedin/notes/${note.id}`)}
                                    onDelete={() => setDeleteTarget({ tab: 'notes', item: note })}
                                />
                            ))}

                            {activeTab === 'papers' && tabData.map(paper => (
                                <ListRow key={paper.id}
                                    icon="article" iconBg="bg-plum-50" iconText="text-plum-700"
                                    title={paper.title || 'Untitled Paper'}
                                    sub={extractSnippet(paper.snippet ?? paper.content ?? '')}
                                    meta={paper.folder?.name ?? '—'}
                                    date={timeAgo(paper.updated_at)}
                                    onClick={() => navigate(`/lockedin/papers/${paper.id}`)}
                                    onDelete={() => setDeleteTarget({ tab: 'papers', item: paper })}
                                />
                            ))}

                            {activeTab === 'folders' && tabData.map(f => (
                                <ListRow key={f.id}
                                    icon={f.icon ?? 'folder'} iconBg="bg-plum-50" iconText="text-plum-700"
                                    title={f.name}
                                    sub={null}
                                    meta={null}
                                    date={timeAgo(f.updated_at)}
                                    onClick={() => navigate(`/lockedin/folders/${f.id}`)}
                                    onDelete={() => setDeleteTarget({ tab: 'folders', item: f })}
                                />
                            ))}

                            {activeTab === 'presentations' && tabData.map(pres => (
                                <ListRow key={pres.id}
                                    icon="slideshow" iconBg="bg-plum-50" iconText="text-plum-700"
                                    title={pres.title || 'Untitled Presentation'}
                                    sub={pres.theme ? `Theme: ${pres.theme}` : null}
                                    meta={`${pres.slide_count ?? 0} slides`}
                                    date={timeAgo(pres.updated_at)}
                                    onClick={() => navigate(`/lockedin/presentations/${pres.id}`)}
                                    onDelete={() => setDeleteTarget({ tab: 'presentations', item: pres })}
                                />
                            ))}

                            {activeTab === 'flashcards' && tabData.map(deck => (
                                <ListRow key={deck.id}
                                    icon="style" iconBg="bg-plum-50" iconText="text-plum-700"
                                    title={deck.title || 'Untitled Deck'}
                                    sub={deck.cards?.[0]?.front ?? null}
                                    meta={`${deck.cards_count ?? deck.card_count ?? deck.cards?.length ?? 0} cards`}
                                    date={timeAgo(deck.updated_at)}
                                    onClick={() => navigate(`/lockedin/flashcards/${deck.id}`)}
                                />
                            ))}
                        </div>
                    )}

                    <Pagination
                        meta={tabMeta}
                        loading={tabLoading}
                        onMore={() => LOADERS[activeTab]?.({ p: tabPage + 1, q: search, append: true })}
                        onLess={() => LOADERS[activeTab]?.({ p: 1, q: search })}
                    />
                </>
            )}

            {/* FAB */}
            <FAB
                onNote={()   => navigate('/lockedin/notes/new')}
                onPaper={()  => navigate('/lockedin/papers/new')}
                onFolder={()  => setShowCreateFolder(true)}
                onPresentation={handleCreatePresentation}
                onFlashcard={handleCreateFlashcard}
            />

            {/* Create folder modal */}
            {showCreateFolder && (
                <CreateFolderModal onClose={() => setShowCreateFolder(false)} onCreated={handleFolderCreated} />
            )}
        </main>
        </>
    );
};
