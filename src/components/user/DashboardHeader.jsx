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
    { key: 'notes',         label: 'Notes',      icon: 'description', color: 'text-violet-500', bg: 'bg-violet-50',  route: (id) => `/lockedin/notes/${id}` },
    { key: 'papers',        label: 'Papers',     icon: 'article',     color: 'text-indigo-500', bg: 'bg-indigo-50',  route: (id) => `/lockedin/papers/${id}` },
    { key: 'folders',       label: 'Folders',    icon: 'folder',      color: 'text-amber-500',  bg: 'bg-amber-50',   route: (id) => `/lockedin/folders/${id}` },
    { key: 'presentations', label: 'Slides',     icon: 'slideshow',   color: 'text-emerald-500',bg: 'bg-emerald-50', route: (id) => `/lockedin/presentations/${id}` },
    { key: 'flashcards',    label: 'Flashcards', icon: 'style',       color: 'text-rose-500',   bg: 'bg-rose-50',    route: (id) => `/lockedin/flashcards/${id}` },
];

// ── Highlight matching text ───────────────────────────────────────────────────
const Highlight = ({ text = '', query = '' }) => {
    if (!query.trim() || !text) return <span>{text}</span>;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return <span>{text}</span>;
    return (
        <span>
            {text.slice(0, idx)}
            <mark className="bg-primary/20 text-primary rounded-sm px-0.5">{text.slice(idx, idx + query.length)}</mark>
            {text.slice(idx + query.length)}
        </span>
    );
};

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
    const [results, setResults] = useState({ notes:[], papers:[], folders:[], presentations:[], flashcards:[] });

    const initials = user?.full_name
        ? user.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
        : '?';

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
        if (!q.trim()) { setResults({ notes:[], papers:[], folders:[], presentations:[], flashcards:[] }); setLoading(false); return; }
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
        if (!val.trim()) { setResults({ notes:[], papers:[], folders:[], presentations:[], flashcards:[] }); return; }
        setLoading(true);
        debounceRef.current = setTimeout(() => runSearch(val), 350);
    };

    const handleSelect = (route) => {
        setOpen(false);
        setQuery('');
        navigate(route);
    };

    return (
        <header className="flex justify-between items-center mb-5 md:mb-10">
            {/* Title */}
            <div className="hidden md:flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-slate-900 text-nowrap">Creative Hub</h1>
                <p className="text-slate-500 text-[13px] mt-1 text-nowrap">Your artistic space for digital thoughts.</p>
            </div>

            {/* Right section */}
            <div className="w-full flex items-center space-x-4 justify-between md:justify-end">

                {/* ── Search ── */}
                <div ref={wrapperRef} className="relative">
                    {/* Input */}
                    <div className={`flex items-center gap-2 bg-white rounded-xl md:rounded-2xl px-1.5 md:px-3 py-1 md:py-2 transition-all duration-200 outline-none focus-within:outline-none focus-within:ring-0 ${open ? 'shadow-md shadow-primary/10 w-72 md:w-96' : 'w-52 md:w-64'}`}>
                        {loading
                            ? <Loader size="sm" className="shrink-0" />
                            : <span className="material-icons-round text-slate-400 text-[16px] shrink-0">search</span>
                        }
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={e => handleChange(e.target.value)}
                            onFocus={() => { if (query.trim()) setOpen(true); }}
                            placeholder="Search everything…"
                            className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-none text-[12px] md:text-[14px] text-slate-700 placeholder-slate-400 min-w-0"
                            style={{ outline: 'none', boxShadow: 'none' }}
                          
                        />
                        {query && (
                            <button onClick={() => { setQuery(''); setOpen(false); setResults({ notes:[], papers:[], folders:[], presentations:[], flashcards:[] }); }}
                                className="shrink-0 text-slate-400 hover:text-slate-600">
                                <span className="material-icons-round text-[15px]">close</span>
                            </button>
                        )}
                    </div>

                    {/* ── Dropdown ── */}
                    {open && query.trim() && (
                        <>
                            {/* Backdrop blur on mobile */}
                            <div className="fixed inset-0 z-40 bg-black/10 md:hidden" onClick={() => setOpen(false)} />

                            <div className="absolute left md:right-0 top-full mt-2 w-[min(420px,90vw)] bg-white rounded-xl shadow-md shadow-slate-200/80 border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">

                                {loading && totalResults === 0 ? (
                                    <div className="flex items-center justify-center gap-2 py-8 text-slate-400 text-sm">
                                        <Loader size="sm" />
                                        Searching…
                                    </div>
                                ) : totalResults === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                                        <span className="material-icons-round text-slate-200 text-[40px]">search_off</span>
                                        <p className="text-slate-400 text-sm">No results for <strong className="text-slate-600">"{query}"</strong></p>
                                    </div>
                                ) : (
                                    <div className="max-h-[70vh] overflow-y-auto divide-y divide-slate-50">
                                        {TYPES.map(type => {
                                            const items = results[type.key];
                                            if (!items?.length) return null;
                                            return (
                                                <div key={type.key} className="py-2">
                                                    {/* Section header */}
                                                    <div className="flex items-center gap-1.5 px-4 py-1 mb-1">
                                                        <span className={`material-icons-round text-[13px] ${type.color}`}>{type.icon}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{type.label}</span>
                                                    </div>

                                                    {items.map(item => {
                                                        const title  = item.title ?? item.name ?? 'Untitled';
                                                        const route  = type.route(item.id);
                                                        return (
                                                            <button key={item.id} onClick={() => handleSelect(route)}
                                                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors text-left group">
                                                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${type.bg}`}>
                                                                    <span className={`material-icons-round text-[14px] ${type.color}`}>{type.icon}</span>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-[11.5px] md:text-[13px] md:font-medium text-slate-700 truncate group-hover:text-slate-900">
                                                                        <Highlight text={title} query={query} />
                                                                    </p>
                                                                    {item.updated_at && (
                                                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                                                            {new Date(item.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <span className="material-icons-round text-[14px] text-slate-300 group-hover:text-primary transition-colors shrink-0">chevron_right</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })}

                                        {/* Footer — view all in library */}
                                        <div className="px-4 py-3 bg-slate-50/60">
                                            <button
                                                onClick={() => handleSelect(`/lockedin/library?tab=notes&q=${encodeURIComponent(query.trim())}`)}
                                                className="w-full flex items-center justify-center gap-1.5 text-[12px] font-semibold text-primary hover:text-primary/80 transition-colors">
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

                <div className="flex items-center gap-6 md:gap-10">
                    <NotificationIcon />
                    <Link to="/lockedin/profile-settings" className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-purple-500 flex items-center justify-center">
                        {user?.profile_picture ? (
                            <img alt={user.full_name || 'User Profile'} className="w-full h-full object-cover" src={user.profile_picture} />
                        ) : (
                            <span className="text-sm font-bold text-slate-600">{initials}</span>
                        )}
                    </Link>
                </div>
            </div>
        </header>
    );
};
