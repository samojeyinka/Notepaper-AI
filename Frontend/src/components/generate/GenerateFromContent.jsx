import { useEffect, useRef, useState } from 'react';
import { apiClient } from '../../api/apiClient';
import { workspaceCache } from '../../api/workspaceCache';
import { TAB_CONFIG } from './tabConfig';
import Loader from '../globals/Loader';
import { createPortal } from 'react-dom';

// ── Constants ─────────────────────────────────────────────────────────────────

const TABS = Object.keys(TAB_CONFIG);

const LIBRARY_ENDPOINTS = {
    Notes:      '/workspace/notes',
    Papers:     '/workspace/papers',
    Slides:     '/workspace/presentations',
    Flashcards: '/workspace/flashcards',
};

const ACCEPTED_EXTS = new Set(['.pdf', '.docx', '.xlsx', '.xls', '.csv']);

// ── Material picker modal ─────────────────────────────────────────────────────

const MaterialPickerModal = ({
    tab, setTab, search, setSearch,
    selected, onToggle, onClose,
    library, libLoading, libLoadingMore, libHasMore, onLoadMore,
}) => {
    const items = (library[tab] ?? []).filter(i =>
        i.title.toLowerCase().includes(search.toLowerCase())
    );

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
            style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
        >
            <div
                className="bg-white w-full sm:max-w-md -[1rem] sm:-[1rem] shadow-2xl flex flex-col overflow-hidden"
                style={{ maxHeight: '85vh' }}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-stone-100 shrink-0">
                    <h3 className="font-semibold text-[15px] text-stone-800">Add Materials</h3>
                    <button onClick={onClose} className="w-8 h-8  flex items-center justify-center text-stone-400 hover:bg-stone-100 transition-colors">
                        <span className="material-icons-round text-[18px]">close</span>
                    </button>
                </div>

                <div className="flex gap-1 px-4 pt-3 pb-2 shrink-0 overflow-x-auto">
                    {TABS.map(t => (
                        <button key={t} onClick={() => { setTab(t); setSearch(''); }}
                            className={`flex items-center gap-1.5 px-3 py-1.5  text-[12px] font-semibold whitespace-nowrap transition-all ${tab === t ? `${TAB_CONFIG[t].bg} ${TAB_CONFIG[t].color}` : 'text-stone-400 hover:bg-stone-50'}`}>
                            <span className="material-icons-round text-[14px]">{TAB_CONFIG[t].icon}</span>
                            {t}
                        </button>
                    ))}
                </div>

                <div className="px-4 pb-2 shrink-0">
                    <div className="relative">
                        <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-stone-300 text-[16px]">search</span>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${tab.toLowerCase()}…`}
                            className="w-full bg-stone-50 border border-stone-200  pl-9 pr-4 py-2 text-[13px] outline-none focus:border-primary/40 transition-colors" />
                    </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 space-y-1.5">
                    {libLoading[tab] && (
                        <div className="py-10 flex flex-col items-center gap-2 text-stone-300">
                            <Loader size="lg" />
                        </div>
                    )}
                    {!libLoading[tab] && items.length === 0 && (
                        <div className="py-10 flex flex-col items-center gap-2 text-stone-300">
                            <span className="material-icons-round text-4xl">search_off</span>
                            <p className="text-[13px]">Nothing found</p>
                        </div>
                    )}
                    {!libLoading[tab] && items.map(item => {
                        const checked = selected[tab]?.some(s => s.id === item.id);
                        return (
                            <button key={item.id} onClick={() => onToggle(tab, item)}
                                className={`w-full flex items-center gap-3 p-3  border transition-all text-left ${checked ? `${TAB_CONFIG[tab].bg} border-primary/20 ring-1 ring-primary/20` : 'border-stone-100 hover:bg-stone-50'}`}>
                                <div className={`w-9 h-9  flex items-center justify-center shrink-0 ${checked ? TAB_CONFIG[tab].bg : 'bg-stone-100'}`}>
                                    <span className={`material-icons-round text-[16px] ${checked ? TAB_CONFIG[tab].color : 'text-stone-400'}`}>{TAB_CONFIG[tab].icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-semibold text-stone-800 truncate">{item.title}</p>
                                </div>
                                <div className={`w-5 h-5  border-2 flex items-center justify-center shrink-0 transition-all ${checked ? 'bg-primary border-primary' : 'border-stone-300'}`}>
                                    {checked && <span className="material-icons-round text-white text-[12px]">check</span>}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {libHasMore[tab] && !search && (
                    <div className="px-4 pb-3 shrink-0">
                        <button onClick={() => onLoadMore(tab)} disabled={libLoadingMore[tab]}
                            className="w-full py-2.5  border border-stone-200 text-[13px] font-semibold text-stone-500 hover:bg-stone-50 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                            {libLoadingMore[tab]
                                ? <><Loader size="sm" /></>
                                : <><span className="material-icons-round text-[16px]">expand_more</span> Load more</>
                            }
                        </button>
                    </div>
                )}

                <div className="px-4 py-3 border-t border-stone-100 shrink-0">
                    <button onClick={onClose} className="w-full py-3 bg-primary hover:bg-primary/90 text-white  font-semibold text-[14px] transition-all active:scale-[0.98]">Done</button>
                </div>
            </div>
        </div>,
        document.body
    );
};

// ── Main component ────────────────────────────────────────────────────────────
// Controlled: parent owns selected + uploadedFiles state.

export default function GenerateFromContent({
    selected,
    onSelectedChange,
    uploadedFiles,
    onUploadedFilesChange,
}) {
    const [open, setOpen] = useState(false);

    // ── Library state ─────────────────────────────────────────────────────────
    const [pickerOpen,     setPickerOpen]     = useState(false);
    const [pickerTab,      setPickerTab]      = useState('Notes');
    const [pickerSearch,   setPickerSearch]   = useState('');
    const [library,        setLibrary]        = useState({ Notes: [], Papers: [], Slides: [], Flashcards: [] });
    const [libLoading,     setLibLoading]     = useState({ Notes: false, Papers: false, Slides: false, Flashcards: false });
    const [libLoadingMore, setLibLoadingMore] = useState({ Notes: false, Papers: false, Slides: false, Flashcards: false });
    const [libPage,        setLibPage]        = useState({ Notes: 1, Papers: 1, Slides: 1, Flashcards: 1 });
    const [libHasMore,     setLibHasMore]     = useState({ Notes: false, Papers: false, Slides: false, Flashcards: false });

    // ── Upload ────────────────────────────────────────────────────────────────
    const [isDragging, setIsDragging] = useState(false);
    const fileRef = useRef(null);

    const totalSelected = Object.values(selected ?? {}).reduce((a, b) => a + b.length, 0);
    const totalFiles    = uploadedFiles?.length ?? 0;
    const hasAny        = totalSelected > 0 || totalFiles > 0;

    const CACHE_GETTERS = {
        Notes:      () => workspaceCache.getNotes(),
        Papers:     () => workspaceCache.getPapers(),
        Slides:     () => workspaceCache.getPresentations(),
        Flashcards: () => null,
    };

    const parseLibRes = (res) => {
        const d        = res.data ?? res;
        const items    = d.data ?? (Array.isArray(d) ? d : []);
        const curPage  = d.current_page ?? 1;
        const lastPage = d.last_page    ?? 1;
        return { items, hasMore: curPage < lastPage };
    };

    const fetchLibTab = (tab, page, append = false) => {
        if (!append && page === 1) {
            const cached = CACHE_GETTERS[tab]?.();
            if (cached?.data?.length) {
                setLibrary(prev => ({
                    ...prev,
                    [tab]: cached.data.map(item => ({ id: item.id, title: item.title ?? 'Untitled' })),
                }));
                const hasMore = (cached.meta?.current_page ?? 1) < (cached.meta?.last_page ?? 1);
                setLibHasMore(prev => ({ ...prev, [tab]: hasMore }));
                return;
            }
        }

        const setLoading = append ? setLibLoadingMore : setLibLoading;
        setLoading(prev => ({ ...prev, [tab]: true }));
        apiClient(`${LIBRARY_ENDPOINTS[tab]}?page=${page}`)
            .then(res => {
                const { items: raw, hasMore } = parseLibRes(res);
                const mapped = raw.map(item => ({ id: item.id, title: item.title ?? 'Untitled' }));
                setLibrary(prev => ({ ...prev, [tab]: append ? [...prev[tab], ...mapped] : mapped }));
                setLibHasMore(prev => ({ ...prev, [tab]: hasMore }));
                setLibPage(prev => ({ ...prev, [tab]: page }));
            })
            .catch(() => {})
            .finally(() => setLoading(prev => ({ ...prev, [tab]: false })));
    };

    useEffect(() => {
        if (!pickerOpen) return;
        TABS.forEach(tab => {
            if (!library[tab].length && !libLoading[tab]) fetchLibTab(tab, 1, false);
        });
    }, [pickerOpen]);

    const openPicker = (tab) => {
        setPickerTab(tab);
        setPickerSearch('');
        setPickerOpen(true);
    };

    const toggleMaterial = (tab, item) => {
        const prev = selected ?? { Notes: [], Papers: [], Slides: [], Flashcards: [] };
        const already = prev[tab].some(s => s.id === item.id);
        onSelectedChange?.({ ...prev, [tab]: already ? prev[tab].filter(s => s.id !== item.id) : [...prev[tab], item] });
    };

    const filterFiles = (fileList) =>
        Array.from(fileList).filter(f => ACCEPTED_EXTS.has('.' + f.name.split('.').pop().toLowerCase()));

    const addFiles = (fileList) => {
        const valid = filterFiles(fileList);
        if (valid.length) onUploadedFilesChange?.([...(uploadedFiles ?? []), ...valid]);
    };

    const removeFile = (i) =>
        onUploadedFilesChange?.((uploadedFiles ?? []).filter((_, j) => j !== i));

    const handleDrop      = (e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); };
    const handleDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false); };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="bg-white  shadow-[0_8px_32px_rgba(0,0,0,0.06)] overflow-hidden">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full p-2.5 md:p-5 flex items-center justify-between text-left transition hover:bg-stone-50"
            >
                <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-sm font-semibold text-stone-700">Generate from your content</p>
                    {hasAny && (
                        <span className="px-2.5 py-1 bg-primary/10 text-primary  text-[9px] font-medium uppercase tracking-wider flex items-center gap-1">
                            <span className="material-icons-round text-[10px]">library_books</span>
                            {totalSelected + totalFiles} source{totalSelected + totalFiles !== 1 ? 's' : ''} added
                        </span>
                    )}
                </div>
                <span className={`material-icons-round text-stone-400 text-[18px] shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
                    expand_more
                </span>
            </button>

            {open && (
                <div className="px-2.5 md:px-5 pb-2.5 md:pb-5 flex flex-col gap-3 border-t border-stone-50">
                    <div className="pt-4 flex flex-col gap-3">
                        <p className="text-[11px] text-stone-500 leading-relaxed">
                            Add sources below — the main Generate button will use them instead of your topic alone.
                        </p>

                            {/* Library tiles */}
                            <div className="grid grid-cols-2 gap-2">
                                {TABS.map(tab => {
                                    const cnt = selected?.[tab]?.length ?? 0;
                                    const cfg = TAB_CONFIG[tab];
                                    return (
                                        <button key={tab} onClick={() => openPicker(tab)}
                                            className={`relative flex items-center gap-2 p-2.5  border text-left transition-all ${cnt > 0 ? `${cfg.bg} border-primary/20` : 'border-stone-100 hover:border-stone-200 hover:bg-stone-50'}`}>
                                            <div className={`w-7 h-7  flex items-center justify-center shrink-0 ${cnt > 0 ? cfg.bg : 'bg-stone-100'}`}>
                                                <span className={`material-icons-round text-[14px] ${cnt > 0 ? cfg.color : 'text-stone-400'}`}>{cfg.icon}</span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className={`text-[11px] font-semibold truncate ${cnt > 0 ? cfg.color : 'text-stone-700'}`}>{tab}</p>
                                                {cnt > 0
                                                    ? <p className={`text-[10px] font-semibold ${cfg.color}`}>{cnt} selected</p>
                                                    : <p className="text-[10px] text-stone-400">Tap to pick</p>
                                                }
                                            </div>
                                            {cnt > 0 && (
                                                <div className="absolute top-1.5 right-1.5 w-4 h-4  bg-primary flex items-center justify-center text-[9px] font-bold text-white">{cnt}</div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Selected material chips */}
                            {totalSelected > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {Object.entries(selected ?? {}).flatMap(([tab, items]) =>
                                        items.map(item => {
                                            const cfg = TAB_CONFIG[tab];
                                            return (
                                                <div key={item.id} className={`flex items-center gap-1 px-2 py-1  text-[11px] font-semibold ${cfg.bg} ${cfg.color}`}>
                                                    <span className="material-icons-round text-[11px]">{cfg.icon}</span>
                                                    <span className="truncate max-w-[100px]">{item.title}</span>
                                                    <button onClick={() => toggleMaterial(tab, item)} className="opacity-60 hover:opacity-100 ml-0.5">
                                                        <span className="material-icons-round text-[11px]">close</span>
                                                    </button>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}

                            {/* File upload */}
                            <div>
                                <div
                                    onClick={() => fileRef.current?.click()}
                                    onDragOver={handleDragOver}
                                    onDragEnter={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`w-full border-2 border-dashed  py-4 flex flex-col items-center gap-1.5 cursor-pointer transition-all select-none text-center ${
                                        isDragging
                                            ? 'border-primary bg-primary/5 text-primary scale-[1.01]'
                                            : 'border-stone-200 text-stone-400 hover:border-primary/40 hover:text-primary'
                                    }`}
                                >
                                    <span className="material-icons-round text-[22px]">{isDragging ? 'file_download' : 'cloud_upload'}</span>
                                    <span className="text-[11px] font-semibold">{isDragging ? 'Drop files here' : 'Upload custom files'}</span>
                                    <span className="text-[10px] opacity-70">PDF, DOCX, XLSX, XLS, CSV</span>
                                </div>
                                <input ref={fileRef} type="file" multiple accept=".pdf,.docx,.xlsx,.xls,.csv"
                                    style={{ display: 'none' }}
                                    onChange={e => { addFiles(e.target.files); e.target.value = ''; }} />
                                {totalFiles > 0 && (
                                    <div className="mt-2 space-y-1.5">
                                        {(uploadedFiles ?? []).map((f, i) => (
                                            <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 bg-stone-50 ">
                                                <span className="material-icons-round text-stone-400 text-[14px]">description</span>
                                                <span className="flex-1 text-[11px] font-medium text-stone-700 truncate">{f.name}</span>
                                                <button onClick={() => removeFile(i)} className="text-stone-400 hover:text-red-500 transition-colors">
                                                    <span className="material-icons-round text-[14px]">close</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {hasAny && (
                                <p className="text-[10px] text-primary font-semibold flex items-center gap-1">
                                    <span className="material-icons-round text-[12px]">info</span>
                                    Generate button will use your content as source material
                                </p>
                            )}
                    </div>
                </div>
            )}

            {pickerOpen && (
                <MaterialPickerModal
                    tab={pickerTab} setTab={setPickerTab}
                    search={pickerSearch} setSearch={setPickerSearch}
                    selected={selected ?? { Notes: [], Papers: [], Slides: [], Flashcards: [] }}
                    onToggle={toggleMaterial}
                    onClose={() => setPickerOpen(false)}
                    library={library} libLoading={libLoading}
                    libLoadingMore={libLoadingMore} libHasMore={libHasMore}
                    onLoadMore={(tab) => fetchLibTab(tab, libPage[tab] + 1, true)}
                />
            )}
        </div>
    );
}
