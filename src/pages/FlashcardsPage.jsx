import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { flashcardService } from '../api/flashcardService';
import { TEMPLATES } from '../components/flashcard/flashcardTemplates';
import { Sidebar } from '../components/user/Sidebar';

// ── Module-level cache (persists across re-mounts, cleared on page refresh) ──
const _cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const cacheKey  = (folderId) => `fc:${folderId ?? ''}`;
const readCache = (folderId) => {
    const entry = _cache.get(cacheKey(folderId));
    if (!entry) return null;
    if (Date.now() - entry.ts > CACHE_TTL) { _cache.delete(cacheKey(folderId)); return null; }
    return entry;
};
const writeCache = (folderId, payload) =>
    _cache.set(cacheKey(folderId), { ...payload, ts: Date.now() });

export const invalidateFlashcardCache = (folderId) => _cache.delete(cacheKey(folderId));

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

// ── Flashcard preview card ────────────────────────────────────────────────────
export const FlashcardPreviewCard = ({ flashcard, onClick }) => {
    const tpl = TEMPLATES[flashcard.template] ?? TEMPLATES.girlies;
    const Decoration = tpl.Decoration;
    const count     = flashcard.cards_count ?? flashcard.card_count ?? flashcard.cards?.length ?? 0;
    const firstCard = flashcard.cards?.[0];

    return (
        <button onClick={onClick} className="text-left group w-full focus:outline-none">
            <div
                className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 border border-white/60"
                style={{ backgroundColor: flashcard.bg_color || tpl.defaultBg, minHeight: 160 }}
            >
                <Decoration />
                <div
                    className="absolute inset-0 flex flex-col p-4 z-10"
                    style={{ color: flashcard.text_color || tpl.defaultText }}
                >
                    {/* Title row */}
                    <div className="flex items-start justify-between gap-2 mb-auto">
                        <h3 className="font-semibold text-[14px] line-clamp-2 leading-tight flex-1">
                            {flashcard.title}
                        </h3>
                        <span
                            className="text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded-full shrink-0"
                            style={{ background: 'rgba(0,0,0,0.12)' }}
                        >
                            {count} {count === 1 ? 'card' : 'cards'}
                        </span>
                    </div>

                    {/* First card preview */}
                    {firstCard?.front ? (
                        <div className="mt-2 rounded-xl p-2.5 text-left" style={{ background: 'rgba(0,0,0,0.12)' }}>
                            <p className="text-[12px] font-medium line-clamp-1 leading-snug">{firstCard.front}</p>
                            {firstCard.back && (
                                <p className="text-[11px] opacity-75 line-clamp-1 leading-snug mt-1">{firstCard.back}</p>
                            )}
                        </div>
                    ) : (
                        <p className="text-[11px] mt-2 opacity-50 italic">No cards yet</p>
                    )}
                </div>
            </div>
            <div className="mt-2 px-1 flex justify-between items-center">
                <p className="text-[11px] text-slate-400">{timeAgo(flashcard.updated_at)}</p>
                {flashcard.folder && (
                    <span className="text-[10px] text-slate-400 truncate max-w-[100px]">{flashcard.folder.name}</span>
                )}
            </div>
        </button>
    );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const FlashcardsContent = () => {
    const navigate            = useNavigate();
    const [searchParams]      = useSearchParams();
    const folderId            = searchParams.get('folder_id');

    const [flashcards, setFlashcards] = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [page,       setPage]       = useState(1);
    const [lastPage,   setLastPage]   = useState(1);
    const [creating,   setCreating]   = useState(false);

    const load = useCallback(async (p = 1) => {
        // Serve from cache instantly on first page
        if (p === 1) {
            const cached = readCache(folderId);
            if (cached) {
                setFlashcards(cached.flashcards);
                setPage(cached.page);
                setLastPage(cached.lastPage);
                setLoading(false);
                return;
            }
        }
        setLoading(true);
        try {
            const res = await flashcardService.list({ page: p, folder_id: folderId });
            setFlashcards(p === 1 ? res.data : prev => [...prev, ...res.data]);
            setPage(res.meta.current_page);
            setLastPage(res.meta.last_page);
            if (p === 1) {
                writeCache(folderId, {
                    flashcards: res.data,
                    page: res.meta.current_page,
                    lastPage: res.meta.last_page,
                });
            }
        } finally {
            setLoading(false);
        }
    }, [folderId]);

    useEffect(() => { load(1); }, [load]);

    const handleCreate = async () => {
        setCreating(true);
        try {
            const res = await flashcardService.create({
                title: 'Untitled Flashcard',
                ...(folderId && { folder_id: folderId }),
            });
            invalidateFlashcardCache(folderId); // stale after adding a new deck
            navigate(`/lockedin/flashcards/${res.data.id}`);
        } finally {
            setCreating(false);
        }
    };

    return (
        <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 min-h-screen">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <header className="flex items-end justify-between mb-8">
                    <div>
                        <h1 className="text-xl font-semibold text-slate-900 font-display">Flashcards</h1>
                        <p className="font-handwriting text-[15px] text-slate-500 italic mt-1">
                            Study smarter, not harder…
                        </p>
                    </div>
                    <button
                        onClick={handleCreate}
                        disabled={creating}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary text-white text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60"
                    >
                        {creating
                            ? <span className="material-icons-round text-[18px] animate-spin">sync</span>
                            : <span className="material-icons-round text-[18px]">add</span>
                        }
                        New Deck
                    </button>
                </header>

                {/* Grid */}
                {loading && flashcards.length === 0 ? (
                    <div className="flex justify-center py-20">
                        <span className="material-icons-round text-primary text-[40px] animate-spin">sync</span>
                    </div>
                ) : flashcards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <span className="material-icons-round text-slate-300 text-[64px]">style</span>
                        <p className="text-slate-400 text-sm">No flashcard decks yet.</p>
                        <button
                            onClick={handleCreate}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white text-sm font-semibold shadow-sm hover:bg-primary/90 transition-all"
                        >
                            <span className="material-icons-round text-[17px]">add</span>
                            Create your first deck
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {flashcards.map(fc => (
                                <FlashcardPreviewCard
                                    key={fc.id}
                                    flashcard={fc}
                                    onClick={() => navigate(`/lockedin/flashcards/${fc.id}`)}
                                />
                            ))}
                        </div>

                        {page < lastPage && (
                            <div className="flex justify-center mt-8">
                                <button
                                    onClick={() => load(page + 1)}
                                    disabled={loading}
                                    className="text-sm text-slate-500 hover:text-slate-800 disabled:opacity-50 flex items-center gap-2 transition-colors"
                                >
                                    <span className="material-icons-round text-[18px]">expand_more</span>
                                    {loading ? 'Loading…' : 'Load more'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
};

const FlashcardsPage = () => (
    <div className="flex min-h-screen">
        <Sidebar activePage="/lockedin/flashcards" />
        <FlashcardsContent />
    </div>
);

export default FlashcardsPage;
