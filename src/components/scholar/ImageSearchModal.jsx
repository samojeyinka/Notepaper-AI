import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { apiClient } from '../../api/apiClient';

const IMAGE_TYPES = [
    { label: 'Photos',        value: 'photo' },
    { label: 'Illustrations', value: 'illustration' },
    { label: 'Vectors',       value: 'vector' },
    { label: 'All',           value: 'all' },
];
const PER_PAGE = 20;

export default function ImageSearchModal({ onClose, onInsert }) {
    const [query, setQuery]       = useState('');
    const [imageType, setType]    = useState('photo');
    const [status, setStatus]     = useState('idle');
    const [results, setResults]   = useState([]);
    const [total, setTotal]       = useState(0);
    const [page, setPage]         = useState(1);
    const [errorMsg, setError]    = useState('');
    const [hoveredId, setHovered] = useState(null);
    const inputRef                = useRef(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    useEffect(() => {
        const h = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', h);
        return () => document.removeEventListener('keydown', h);
    }, [onClose]);

    const doSearch = async (p = 1) => {
        if (!query.trim()) return;
        setStatus('loading');
        setError('');
        try {
            const res = await apiClient(
                `/ai/images/search?q=${encodeURIComponent(query.trim())}&page=${p}&image_type=${imageType}`,
            );
            setResults(res.hits);
            setTotal(res.total);
            setPage(p);
            setStatus(res.hits.length ? 'done' : 'empty');
        } catch (err) {
            setError(err?.message || 'Search failed. Please try again.');
            setStatus('error');
        }
    };

    const handleDownload = async (url, id) => {
        try {
            const r = await fetch(url);
            const blob = await r.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `pixabay-${id}.jpg`;
            a.click();
            URL.revokeObjectURL(blobUrl);
        } catch {
            window.open(url, '_blank');
        }
    };

    const totalPages = Math.ceil(total / PER_PAGE);

    return createPortal(
        <>
            <div className="fixed inset-0 z-[99] bg-black/20 backdrop-blur-sm" onClick={onClose} />

            <div
                className="fixed z-[100] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] md:w-[640px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
                style={{ maxHeight: '85vh' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center shadow-sm shrink-0">
                            <span className="material-icons-round text-white text-[15px]">image_search</span>
                        </div>
                        <div>
                            <p className="font-semibold text-[13px] text-slate-800 leading-tight">Image Search</p>
                            <p className="text-[10px] text-slate-400">Powered by Pixabay</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
                    >
                        <span className="material-icons-round text-[16px]">close</span>
                    </button>
                </div>

                {/* Search bar + type filter */}
                <div className="px-4 pt-3 pb-2.5 border-b border-slate-100 shrink-0">
                    <div className="flex gap-2">
                        <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 focus-within:border-primary transition-colors">
                            <span className="material-icons-round text-slate-400 text-[17px]">search</span>
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') doSearch(1); }}
                                placeholder="Search millions of free images…"
                                className="flex-1 bg-transparent py-2.5 text-[12px] text-slate-700 placeholder-slate-400 outline-none"
                            />
                            {query && (
                                <button
                                    onClick={() => { setQuery(''); setResults([]); setStatus('idle'); }}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    <span className="material-icons-round text-[15px]">close</span>
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => doSearch(1)}
                            disabled={!query.trim() || status === 'loading'}
                            className="px-4 py-2 rounded-xl bg-primary text-white text-[12px] font-semibold hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow shadow-primary/20"
                        >
                            Search
                        </button>
                    </div>

                    <div className="flex gap-1.5 mt-2.5">
                        {IMAGE_TYPES.map((t) => (
                            <button
                                key={t.value}
                                onClick={() => setType(t.value)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                                    imageType === t.value
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-4 py-3">
                    {status === 'idle' && (
                        <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400">
                            <span className="material-icons-round text-[44px]">image_search</span>
                            <p className="text-[12px]">Search for images to insert into your document</p>
                        </div>
                    )}

                    {status === 'loading' && (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="w-10 h-10 rounded-full border-4 border-slate-100 border-t-primary animate-spin" />
                            <p className="text-[12px] text-slate-400">Searching Pixabay…</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                            <span className="material-icons-round text-red-400 text-[15px]">error_outline</span>
                            <p className="text-[12px] text-red-600">{errorMsg}</p>
                        </div>
                    )}

                    {status === 'empty' && (
                        <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400">
                            <span className="material-icons-round text-[44px]">image_not_supported</span>
                            <p className="text-[13px] font-medium">No images found for "{query}"</p>
                            <p className="text-[11px]">Try different keywords</p>
                        </div>
                    )}

                    {status === 'done' && results.length > 0 && (
                        <>
                            <p className="text-[10px] text-slate-400 mb-2">{total.toLocaleString()} results</p>
                            <div className="grid grid-cols-3 gap-2">
                                {results.map((img) => (
                                    <div
                                        key={img.id}
                                        className="relative group rounded-xl overflow-hidden bg-slate-100 aspect-square"
                                        onMouseEnter={() => setHovered(img.id)}
                                        onMouseLeave={() => setHovered(null)}
                                    >
                                        <img
                                            src={img.preview}
                                            alt={img.tags}
                                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        <div
                                            className={`absolute inset-0 bg-black/45 flex flex-col items-center justify-center gap-1.5 transition-opacity duration-150 ${
                                                hoveredId === img.id ? 'opacity-100' : 'opacity-0'
                                            }`}
                                        >
                                            <button
                                                onClick={() => onInsert(img.web)}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-slate-800 text-[11px] font-semibold hover:bg-primary hover:text-white transition-colors shadow"
                                            >
                                                <span className="material-icons-round text-[13px]">add_photo_alternate</span>
                                                Insert
                                            </button>
                                            <button
                                                onClick={() => handleDownload(img.large, img.id)}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/90 text-slate-700 text-[11px] font-semibold hover:bg-white transition-colors shadow"
                                            >
                                                <span className="material-icons-round text-[13px]">download</span>
                                                Download
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-3 mt-4">
                                    <button
                                        onClick={() => doSearch(page - 1)}
                                        disabled={page <= 1 || status === 'loading'}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <span className="material-icons-round text-[14px]">chevron_left</span>
                                        Prev
                                    </button>
                                    <span className="text-[11px] text-slate-400">Page {page} of {totalPages}</span>
                                    <button
                                        onClick={() => doSearch(page + 1)}
                                        disabled={page >= totalPages || status === 'loading'}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                        <span className="material-icons-round text-[14px]">chevron_right</span>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-slate-100 shrink-0">
                    <p className="text-[10px] text-slate-400 text-center">
                        Images from{' '}
                        <a href="https://pixabay.com" target="_blank" rel="noreferrer" className="underline hover:text-slate-600">
                            Pixabay
                        </a>{' '}
                        — Free for commercial use
                    </p>
                </div>
            </div>
        </>,
        document.body,
    );
}
