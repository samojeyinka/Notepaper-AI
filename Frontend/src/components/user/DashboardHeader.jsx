import { useState, useRef, useEffect, useCallback } from "react";
import Loader from '../globals/Loader';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationIcon from "./NotificationIcon";
import { noteService } from "../../api/noteService";
import { paperService } from "../../api/paperService";
import { folderService } from "../../api/folderService";
import { presentationService } from "../../api/presentationService";
import { flashcardService } from "../../api/flashcardService";

// ── Result type config ────────────────────────────────────────────────────────
const TYPES = [
    { key: 'notes',         label: 'Notes',      icon: 'description', color: 'text-plum-600',  bg: 'bg-plum-50',     route: (id) => `/lockedin/notes/${id}` },
    { key: 'papers',        label: 'Papers',     icon: 'article',     color: 'text-plum-600',  bg: 'bg-plum-50',     route: (id) => `/lockedin/papers/${id}` },
    { key: 'folders',       label: 'Folders',    icon: 'folder',      color: 'text-plum-600',  bg: 'bg-plum-50',     route: (id) => `/lockedin/folders/${id}` },
    { key: 'presentations', label: 'Slides',     icon: 'slideshow',   color: 'text-plum-600',  bg: 'bg-plum-50',     route: (id) => `/lockedin/presentations/${id}` },
    { key: 'flashcards',    label: 'Flashcards', icon: 'style',       color: 'text-plum-600',  bg: 'bg-plum-50',     route: (id) => `/lockedin/flashcards/${id}` },
];

// ── Highlight matching text ───────────────────────────────────────────────────
const Highlight = ({ text = '', query = '' }) => {
    if (!query.trim() || !text) return <span>{text}</span>;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return <span>{text}</span>;
    return (
        <span>
            {text.slice(0, idx)}
            <mark className="bg-plum-100 text-plum-800  px-0.5">{text.slice(idx, idx + query.length)}</mark>
            {text.slice(idx + query.length)}
        </span>
    );
};

const dayParts = () => {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
};

const todayLabel = () =>
    new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

// ── Global Search Dropdown ────────────────────────────────────────────────────
export const DashboardHeader = () => {
    const { user }   = useAuth();
    const navigate   = useNavigate();
    const wrapperRef = useRef(null);
    const inputRef   = useRef(null);
    const debounceRef = useRef(null);

    const [query,   setQuery]   = useState('');
    const [open,    setOpen]    = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState({ notes: [], papers: [], folders: [], presentations: [], flashcards: [] });

    const initials = user?.full_name
        ? user.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
        : '?';

    const first = (user?.full_name ?? '').trim().split(/\s+/)[0] || 'there';

    const totalResults = Object.values(results).reduce((s, arr) => s + arr.length, 0);

    // Close on outside click or Escape
    useEffect(() => {
        const handler = (e) => {
            if (!wrapperRef.current?.contains(e.target)) setOpen(false);
        };
        const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); } };
        document.addEventListener('mousedown', handler);
        document.addEventListener('keydown', onKey);
        return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', onKey); };
    }, []);

    const runSearch = useCallback(async (q) => {
        if (!q.trim()) { setResults({ notes: [], papers: [], folders: [], presentations: [], flashcards: [] }); setLoading(false); return; }
        setLoading(true);
        const qs = encodeURIComponent(q.trim());
        try {
            const [notesRes, papersRes, foldersRes, presRes, fcRes] = await Promise.allSettled([
                noteService.list(`searching=${qs}&page=1`),
                paperService.list(`searching=${qs}&page=1`),
                folderService.list(`searching=${qs}&page=1`),
                presentationService.list(`searching=${qs}&sort=updated_at:desc&page=1`),
                flashcardService.list({ searching: q.trim(), page: 1 }),
            ]);

            const pick = (res) => {
                if (res.status !== 'fulfilled') return [];
                const d = res.value?.data ?? res.value;
                return (d?.data ?? (Array.isArray(d) ? d : [])).slice(0, 4);
            };

            setResults({
                notes:         pick(notesRes),
                papers:        pick(papersRes),
                folders:       pick(foldersRes),
                presentations: pick(presRes),
                flashcards:    pick(fcRes),
            });
        } catch { /* silent */ } finally { setLoading(false); }
    }, []);

    const handleChange = (val) => {
        setQuery(val);
        setOpen(true);
        clearTimeout(debounceRef.current);
        if (!val.trim()) { setResults({ notes: [], papers: [], folders: [], presentations: [], flashcards: [] }); return; }
        setLoading(true);
        debounceRef.current = setTimeout(() => runSearch(val), 350);
    };

    const handleSelect = (route) => {
        setOpen(false);
        setQuery('');
        navigate(route);
    };

    return (
        <header className="dashboard-header flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between mb-8 lg:mb-12">
            {/* Greeting */}
            <div className="dashboard-greeting flex flex-col gap-1">
                <p className="dashboard-date text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-400">
                    {todayLabel()}
                </p>
                <h1 className="text-[30px] md:text-[36px] font-semibold tracking-tight text-stone-900 leading-tight">
                    Good {dayParts()}, <span>{first}</span>
                </h1>
                <p className="text-[13px] md:text-[14px] text-stone-500">
                    A calm page for whatever you want to keep close.
                </p>
            </div>

            {/* Right section */}
            <div className="dashboard-header-tools w-full lg:w-auto flex items-center gap-3 md:gap-4">

                {/* ── Search ── */}
                <div ref={wrapperRef} className="dashboard-search relative w-full lg:w-72 transition-all duration-200">
                    <div className={`dashboard-search-frame flex items-center gap-2 bg-white pl-4 pr-1.5 h-10 ring-1 transition-all duration-200 ${open ? 'ring-stone-900/25 shadow-lg shadow-stone-900/5' : 'ring-stone-200'}`}>
                        {loading
                            ? <Loader size="sm" className="shrink-0" />
                            : <span className="material-icons-round text-stone-400 text-[19px] shrink-0">search</span>
                        }
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={e => handleChange(e.target.value)}
                            onFocus={() => { if (query.trim()) setOpen(true); }}
                            placeholder="Search your notebook…"
                            className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-none text-[13px] text-stone-700 placeholder:text-stone-400 min-w-0"
                            style={{ outline: 'none', boxShadow: 'none' }}
                        />
                        {query && (
                            <button
                                onClick={() => { setQuery(''); setOpen(false); setResults({ notes: [], papers: [], folders: [], presentations: [], flashcards: [] }); }}
                                className="shrink-0 w-7 h-7  flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                                aria-label="Clear search"
                            >
                                <span className="material-icons-round text-[16px]">close</span>
                            </button>
                        )}
                    </div>

                    {/* ── Dropdown ── */}
                    {open && query.trim() && (
                        <>
                            <div className="fixed inset-0 z-40 bg-stone-900/10 md:hidden" onClick={() => setOpen(false)} />

                            <div className="absolute lg:right-0 top-full mt-2 w-full lg:w-[min(420px,90vw)] bg-white  ring-1 ring-stone-200 shadow-xl shadow-stone-900/10 z-50 overflow-hidden">
                                {loading && totalResults === 0 ? (
                                    <div className="flex items-center justify-center py-8 text-stone-400 text-sm">
                                        <Loader size="sm" />
                                    </div>
                                ) : totalResults === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                                        <span className="material-icons-round text-stone-200 text-[40px]">search_off</span>
                                        <p className="text-stone-500 text-sm">
                                            Nothing found for <strong className="text-stone-700">"{query}"</strong>
                                        </p>
                                    </div>
                                ) : (
                                    <div className="max-h-[70vh] overflow-y-auto">
                                        {TYPES.map(type => {
                                            const items = results[type.key];
                                            if (!items?.length) return null;
                                            return (
                                                <div key={type.key}>
                                                    <div className="flex items-center gap-1.5 px-4 pt-3 pb-1">
                                                        <span className={`material-icons-round text-[14px] ${type.color}`}>{type.icon}</span>
                                                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.18em]">{type.label}</span>
                                                    </div>
                                                    {items.map(item => {
                                                        const title = item.title ?? item.name ?? 'Untitled';
                                                        const route = type.route(item.id);
                                                        return (
                                                            <button key={item.id} onClick={() => handleSelect(route)}
                                                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-stone-50 transition-colors text-left group">
                                                                <div className={`w-7 h-7  flex items-center justify-center shrink-0 ${type.bg}`}>
                                                                    <span className={`material-icons-round text-[14px] ${type.color}`}>{type.icon}</span>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-[13px] font-medium text-stone-700 truncate">
                                                                        <Highlight text={title} query={query} />
                                                                    </p>
                                                                    {item.updated_at && (
                                                                        <p className="text-[10px] text-stone-400 mt-0.5">
                                                                            {new Date(item.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <span className="material-icons-round text-[14px] text-stone-300 group-hover:text-plum-600 transition-colors shrink-0">chevron_right</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })}

                                        <div className="px-4 py-3 mt-1 border-t border-stone-100">
                                            <button
                                                onClick={() => handleSelect(`/lockedin/library?tab=notes&q=${encodeURIComponent(query.trim())}`)}
                                                className="w-full flex items-center justify-center gap-1.5 text-[12px] font-semibold text-plum-700 hover:text-plum-600 transition-colors"
                                            >
                                                <span className="material-icons-round text-[14px]">open_in_new</span>
                                                See all results in Library
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-2.5 md:gap-3 shrink-0">
                    <NotificationIcon />
                    <Link
                        to="/lockedin/profile-settings"
                            className="dashboard-avatar w-9 h-9 md:w-10 md:h-10 bg-white ring-1 ring-stone-200 overflow-hidden flex items-center justify-center transition-all"
                        aria-label="Profile settings"
                    >
                        {user?.profile_picture ? (
                            <img alt={user.full_name || 'User Profile'} className="w-full h-full object-cover" src={user.profile_picture} />
                        ) : (
                            <span className="text-[13px] font-semibold text-stone-600">{initials}</span>
                        )}
                    </Link>
                </div>
            </div>
        </header>
    );
};
