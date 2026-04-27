import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';
import { sprintService } from '../../api/sprintService';
import Alert from '../globals/Alert';
import Loader from '../globals/Loader';

// ── Constants ────────────────────────────────────────────────────────────────

const TAB_CONFIG = {
    Notes:        { icon: 'description', color: 'text-violet-600', bg: 'bg-violet-50',  type: 'note'         },
    Papers:       { icon: 'article',     color: 'text-blue-600',   bg: 'bg-blue-50',    type: 'paper'        },
    Slides:       { icon: 'slideshow',   color: 'text-indigo-600', bg: 'bg-indigo-50',  type: 'presentation' },
    Flashcards:   { icon: 'style',       color: 'text-pink-600',   bg: 'bg-pink-50',    type: 'flashcard'    },
};

const TABS = Object.keys(TAB_CONFIG);

const LIBRARY_ENDPOINTS = {
    Notes:      '/workspace/notes',
    Papers:     '/workspace/papers',
    Slides:     '/workspace/presentations',
    Flashcards: '/workspace/flashcards',
};

const WIZARD_STEPS = [
    { label: 'Setup',     icon: 'edit_note'     },
    { label: 'Materials', icon: 'library_books' },
    { label: 'Review',    icon: 'check_circle'  },
];

const today = () => new Date().toISOString().split('T')[0];

// ── Material Picker Modal ─────────────────────────────────────────────────────

const MaterialPickerModal = ({ tab, setTab, search, setSearch, selected, onToggle, onClose, library, libLoading, libLoadingMore, libHasMore, onLoadMore }) => {
    const ref = useRef(null);

    useEffect(() => {
        const h = (e) => { if (!ref.current?.contains(e.target)) onClose(); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [onClose]);

    const items = (library[tab] ?? []).filter(i =>
        i.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
            <div ref={ref} className="bg-white w-full sm:max-w-md rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: '85vh' }}>
                <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 shrink-0">
                    <h3 className="font-semibold text-[15px] text-slate-800">Add Materials</h3>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
                        <span className="material-icons-round text-[18px]">close</span>
                    </button>
                </div>

                <div className="flex gap-1 px-4 pt-3 pb-2 shrink-0 overflow-x-auto">
                    {TABS.map(t => (
                        <button key={t} onClick={() => { setTab(t); setSearch(''); }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold whitespace-nowrap transition-all ${tab === t ? `${TAB_CONFIG[t].bg} ${TAB_CONFIG[t].color}` : 'text-slate-400 hover:bg-slate-50'}`}>
                            <span className="material-icons-round text-[14px]">{TAB_CONFIG[t].icon}</span>
                            {t}
                        </button>
                    ))}
                </div>

                <div className="px-4 pb-2 shrink-0">
                    <div className="relative">
                        <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-[16px]">search</span>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${tab.toLowerCase()}…`}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-[13px] outline-none focus:border-primary/40 transition-colors" />
                    </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 space-y-1.5">
                    {libLoading[tab] && (
                        <div className="py-10 flex flex-col items-center gap-2 text-slate-300">
                            <Loader size="lg" />
                            <p className="text-[13px]">Loading…</p>
                        </div>
                    )}
                    {!libLoading[tab] && items.length === 0 && (
                        <div className="py-10 flex flex-col items-center gap-2 text-slate-300">
                            <span className="material-icons-round text-4xl">search_off</span>
                            <p className="text-[13px]">Nothing found</p>
                        </div>
                    )}
                    {!libLoading[tab] && items.map(item => {
                        const checked = selected[tab]?.some(s => s.id === item.id);
                        return (
                            <button key={item.id} onClick={() => onToggle(tab, item)}
                                className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${checked ? `${TAB_CONFIG[tab].bg} border-primary/20 ring-1 ring-primary/20` : 'border-slate-100 hover:bg-slate-50'}`}>
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${checked ? TAB_CONFIG[tab].bg : 'bg-slate-100'}`}>
                                    <span className={`material-icons-round text-[16px] ${checked ? TAB_CONFIG[tab].color : 'text-slate-400'}`}>{TAB_CONFIG[tab].icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-semibold text-slate-800 truncate">{item.title}</p>
                                    {item.sub && <p className="text-[11px] text-slate-400">{item.sub}</p>}
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${checked ? 'bg-primary border-primary' : 'border-slate-300'}`}>
                                    {checked && <span className="material-icons-round text-white text-[12px]">check</span>}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {libHasMore[tab] && !search && (
                    <div className="px-4 pb-3 shrink-0">
                        <button onClick={() => onLoadMore(tab)} disabled={libLoadingMore[tab]}
                            className="w-full py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                            {libLoadingMore[tab]
                                ? <><Loader size="sm" /> Loading…</>
                                : <><span className="material-icons-round text-[16px]">expand_more</span> Load more</>
                            }
                        </button>
                    </div>
                )}

                <div className="px-4 py-3 border-t border-slate-100 shrink-0">
                    <button onClick={onClose} className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold text-[14px] transition-all active:scale-[0.98]">Done</button>
                </div>
            </div>
        </div>
    );
};

// ── Main wizard ───────────────────────────────────────────────────────────────

const SprintCreate = () => {
    const navigate = useNavigate();
    const [step, setStep]               = useState(1);
    const [submitting,    setSubmitting]    = useState(false);
    const [submitError,   setSubmitError]   = useState(null);
    const [isLimitError,  setIsLimitError]  = useState(false);

    // Step 1
    const [name,      setName]      = useState('');
    const [goal,      setGoal]      = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate,   setEndDate]   = useState('');

    // Step 2 — library items: { id, title, sub, type (backend type) }
    const [selected,      setSelected]      = useState({ Notes: [], Papers: [], Slides: [], Flashcards: [] });
    const [pickerOpen,    setPickerOpen]    = useState(false);
    const [pickerTab,     setPickerTab]     = useState('Notes');
    const [pickerSearch,  setPickerSearch]  = useState('');
    const [library,       setLibrary]       = useState({ Notes: [], Papers: [], Slides: [], Flashcards: [] });
    const [libLoading,    setLibLoading]    = useState({ Notes: false, Papers: false, Slides: false, Flashcards: false });
    const [libLoadingMore,setLibLoadingMore]= useState({ Notes: false, Papers: false, Slides: false, Flashcards: false });
    const [libPage,       setLibPage]       = useState({ Notes: 1, Papers: 1, Slides: 1, Flashcards: 1 });
    const [libHasMore,    setLibHasMore]    = useState({ Notes: false, Papers: false, Slides: false, Flashcards: false });
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isDragging,    setIsDragging]    = useState(false);
    const fileRef = useRef(null);

    const ACCEPTED_EXTS = new Set(['.pdf', '.docx', '.xlsx', '.xls', '.csv']);
    const filterFiles = (fileList) =>
        Array.from(fileList).filter(f => {
            const ext = '.' + f.name.split('.').pop().toLowerCase();
            return ACCEPTED_EXTS.has(ext);
        });

    const addFiles = (fileList) => {
        const valid = filterFiles(fileList);
        if (valid.length) setUploadedFiles(prev => [...prev, ...valid]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        addFiles(e.dataTransfer.files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false);
    };

    const parseLibRes = (res) => {
        const d       = res.data ?? res;
        const items   = d.data ?? (Array.isArray(d) ? d : []);
        const curPage = d.current_page ?? 1;
        const lastPage= d.last_page ?? 1;
        return { items, hasMore: curPage < lastPage };
    };

    const fetchLibTab = (tab, page, append = false) => {
        const setLoading = append ? setLibLoadingMore : setLibLoading;
        setLoading(prev => ({ ...prev, [tab]: true }));
        apiClient(`${LIBRARY_ENDPOINTS[tab]}?page=${page}`)
            .then(res => {
                const { items: raw, hasMore } = parseLibRes(res);
                const mapped = raw.map(item => ({
                    id:    item.id,
                    title: item.title ?? 'Untitled',
                    sub:   null,
                }));
                setLibrary(prev => ({ ...prev, [tab]: append ? [...prev[tab], ...mapped] : mapped }));
                setLibHasMore(prev => ({ ...prev, [tab]: hasMore }));
                setLibPage(prev => ({ ...prev, [tab]: page }));
            })
            .catch(() => {})
            .finally(() => setLoading(prev => ({ ...prev, [tab]: false })));
    };

    // Fetch library data when step 2 is reached
    useEffect(() => {
        if (step !== 2) return;
        TABS.forEach(tab => {
            if (library[tab].length > 0) return;
            fetchLibTab(tab, 1, false);
        });
    }, [step]);

    const totalSelected = Object.values(selected).reduce((a, b) => a + b.length, 0);
    const selectedCount = (tab) => selected[tab]?.length ?? 0;

    const toggleMaterial = (tab, item) =>
        setSelected(prev => {
            const already = prev[tab].some(s => s.id === item.id);
            return {
                ...prev,
                [tab]: already ? prev[tab].filter(s => s.id !== item.id) : [...prev[tab], item],
            };
        });

    const durationDays = startDate && endDate
        ? Math.max(1, Math.round((new Date(endDate) - new Date(startDate)) / 86400000) + 1)
        : null;

    const canNext = step === 1
        ? name.trim() && startDate && endDate && new Date(endDate) >= new Date(startDate)
        : true;

    const handleCreate = async () => {
        setSubmitting(true);
        setSubmitError(null);

        const materialIds = Object.entries(selected).flatMap(([tab, items]) =>
            items.map(item => ({ type: TAB_CONFIG[tab].type, id: item.id }))
        );

        try {
            const res = await sprintService.create({
                title:        name,
                goal:         goal || null,
                start_date:   startDate,
                end_date:     endDate,
                material_ids: materialIds,
                uploads:      uploadedFiles,
            });
            navigate('/lockedin/sprints');
        } catch (err) {
            const msg = Object.values(err?.errors ?? {})?.[0]?.[0]
                ?? err?.message
                ?? 'Failed to create sprint. Please try again.';
            const limitError = !!(err?.errors) || err?.message?.toLowerCase().includes('plan');
            setSubmitError(msg);
            setIsLimitError(limitError);
            setSubmitting(false);
        }
    };

    return (
        <div className="flex-1 h-full overflow-y-auto lg:ml-64 pt-16 lg:pt-0" style={{ background: '#F8F9FA' }}>

            {/* Top bar */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur px-4 md:px-6 py-4 flex items-center justify-between border-b border-slate-100">
                <button onClick={() => navigate('/lockedin/sprints')} className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-semibold text-[14px] transition-colors">
                    <span className="material-icons-round text-[20px]">arrow_back</span>
                    <span className="hidden sm:inline">Sprints</span>
                </button>

                <div className="flex items-center gap-1.5">
                    {WIZARD_STEPS.map((s, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all ${
                                i + 1 < step  ? 'bg-emerald-500 text-white'
                                : i + 1 === step ? 'bg-primary text-white'
                                : 'bg-slate-200 text-slate-500'
                            }`}>
                                {i + 1 < step
                                    ? <span className="material-icons-round text-[12px]">check</span>
                                    : i + 1
                                }
                            </div>
                            <span className={`text-[11px] font-semibold hidden sm:block ${i + 1 === step ? 'text-primary' : 'text-slate-400'}`}>{s.label}</span>
                            {i < WIZARD_STEPS.length - 1 && <div className="w-5 h-px bg-slate-200 mx-0.5" />}
                        </div>
                    ))}
                </div>

                <div className="w-20 hidden sm:block" />
            </div>

            <div className="max-w-3xl mx-auto w-full px-4 md:px-6 py-8 pb-36">

                {/* ── Step 1: Setup ── */}
                {step === 1 && (
                    <div className="space-y-6">
                        <div>
                            <span className="inline-block text-[10px] font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary uppercase tracking-widest mb-3">Step 1 of 3</span>
                            <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 leading-tight mb-2">Set up your sprint</h1>
                            <p className="text-slate-500 text-[15px]">Give it a name, pick your dates, and tell the AI what you want to achieve.</p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 md:p-8 space-y-6" style={{ boxShadow: '0 10px 30px rgba(44,47,50,0.06)' }}>
                            <div className="space-y-2">
                                <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest block">Sprint Name <span className="text-red-400">*</span></label>
                                <input value={name} onChange={e => setName(e.target.value)}
                                    placeholder='e.g. "Finals Week — Biology"'
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[15px] text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Start Date', val: startDate, set: setStartDate, min: today()     },
                                    { label: 'End Date',   val: endDate,   set: setEndDate,   min: startDate || today() },
                                ].map(({ label, val, set, min }) => (
                                    <div key={label} className="space-y-2">
                                        <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest block">{label} <span className="text-red-400">*</span></label>
                                        <input type="date" value={val} min={min} onChange={e => set(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] text-slate-800 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all" />
                                    </div>
                                ))}
                            </div>

                            {durationDays && (
                                <div className="flex items-center gap-2 px-4 py-3 bg-primary/5 rounded-xl border border-primary/10">
                                    <span className="material-icons-round text-primary text-[18px]">calendar_month</span>
                                    <p className="text-[13px] text-slate-600">
                                        <span className="font-semibold text-primary">{durationDays} day{durationDays !== 1 ? 's' : ''}</span> — the AI will plan your challenges across this period
                                    </p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest block">
                                    Goal & Context <span className="text-slate-400 font-normal normal-case tracking-normal">(optional)</span>
                                </label>
                                <textarea value={goal} onChange={e => setGoal(e.target.value)}
                                    placeholder="Mention specific topics to focus on, an exam date, or what you find hardest…"
                                    rows={3}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all resize-none" />
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Step 2: Materials ── */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div>
                            <span className="inline-block text-[10px] font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary uppercase tracking-widest mb-3">Step 2 of 3</span>
                            <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 leading-tight mb-2">Add your materials</h1>
                            <p className="text-slate-500 text-[15px]">Select from your library or upload files. The AI will study everything you add.</p>
                        </div>

                        {/* Library tiles */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {TABS.map(tab => {
                                const cnt = selectedCount(tab);
                                const cfg = TAB_CONFIG[tab];
                                return (
                                    <button key={tab} onClick={() => { setPickerTab(tab); setPickerSearch(''); setPickerOpen(true); }}
                                        className={`group relative overflow-hidden bg-white rounded-2xl p-5 text-left transition-all duration-200 hover:-translate-y-1 active:scale-95 border ${cnt > 0 ? 'border-primary/20' : 'border-transparent hover:border-slate-100'}`}
                                        style={{ boxShadow: '0 10px 30px rgba(44,47,50,0.06)' }}>
                                        <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-slate-100 group-hover:scale-110 transition-transform duration-300 pointer-events-none" />
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${cfg.bg}`}>
                                            <span className={`material-icons-round text-[18px] ${cfg.color}`}>{cfg.icon}</span>
                                        </div>
                                        <p className="text-[13px] font-semibold text-slate-800">{tab}</p>
                                        {cnt > 0
                                            ? <p className={`text-[11px] font-semibold mt-0.5 ${cfg.color}`}>{cnt} selected</p>
                                            : <p className="text-[11px] text-slate-400 mt-0.5">Tap to browse</p>
                                        }
                                        {cnt > 0 && (
                                            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-semibold text-white">{cnt}</div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Selected chips */}
                        {totalSelected > 0 && (
                            <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 10px 30px rgba(44,47,50,0.06)' }}>
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-3">{totalSelected} item{totalSelected !== 1 ? 's' : ''} selected</p>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(selected).flatMap(([tab, items]) =>
                                        items.map(item => {
                                            const cfg = TAB_CONFIG[tab];
                                            return (
                                                <div key={item.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold ${cfg.bg} ${cfg.color}`}>
                                                    <span className="material-icons-round text-[13px]">{cfg.icon}</span>
                                                    <span className="truncate max-w-[120px]">{item.title}</span>
                                                    <button onClick={() => toggleMaterial(tab, item)} className="opacity-60 hover:opacity-100 transition-opacity">
                                                        <span className="material-icons-round text-[13px]">close</span>
                                                    </button>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Upload */}
                        <div className="bg-white rounded-2xl p-5 md:p-6" style={{ boxShadow: '0 10px 30px rgba(44,47,50,0.06)' }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
                                    <span className="material-icons-round text-slate-500 text-[18px]">upload_file</span>
                                </div>
                                <div>
                                    <p className="text-[13px] font-semibold text-slate-800">Upload custom files</p>
                                    <p className="text-[11px] text-slate-400">PDF, DOCX, XLSX, XLS, CSV — up to 20 MB each</p>
                                </div>
                            </div>
                            <div
                                onClick={() => fileRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragEnter={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`w-full border-2 border-dashed rounded-xl py-7 flex flex-col items-center gap-2 cursor-pointer transition-all select-none
                                    ${isDragging
                                        ? 'border-primary bg-primary/5 text-primary scale-[1.01]'
                                        : 'border-slate-200 text-slate-400 hover:border-primary/40 hover:text-primary'
                                    }`}
                            >
                                <span className="material-icons-round text-[30px]">{isDragging ? 'file_download' : 'cloud_upload'}</span>
                                <span className="text-[13px] font-semibold">
                                    {isDragging ? 'Drop files here' : 'Click to upload or drag files here'}
                                </span>
                                <span className="text-[11px] opacity-70">PDF, DOCX, XLSX, XLS, CSV</span>
                            </div>
                            <input ref={fileRef} type="file" multiple accept=".pdf,.docx,.xlsx,.xls,.csv"
                                style={{ display: 'none' }}
                                onChange={e => { addFiles(e.target.files); e.target.value = ''; }} />
                            {uploadedFiles.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {uploadedFiles.map((f, i) => (
                                        <div key={i} className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl">
                                            <span className="material-icons-round text-slate-400 text-[16px]">description</span>
                                            <span className="flex-1 text-[12px] font-medium text-slate-700 truncate">{f.name}</span>
                                            <button onClick={() => setUploadedFiles(prev => prev.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-500 transition-colors">
                                                <span className="material-icons-round text-[16px]">close</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Step 3: Review ── */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div>
                            <span className="inline-block text-[10px] font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary uppercase tracking-widest mb-3">Step 3 of 3</span>
                            <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 leading-tight mb-2">Review your sprint</h1>
                            <p className="text-slate-500 text-[15px]">Everything looks good? Hit create and the AI will get to work.</p>
                        </div>

                        {submitError && (
                            <div>
                                <Alert type="error" message={submitError} />
                                {isLimitError && (
                                    <a href="/lockedin/upgrade" className="inline-flex items-center gap-1.5 mt-2 text-[13px] font-semibold text-primary hover:underline">
                                        <span className="material-icons-round text-[15px]">rocket_launch</span>
                                        Upgrade your plan
                                    </a>
                                )}
                            </div>
                        )}

                        <div className="bg-white rounded-2xl p-6 md:p-8 space-y-5" style={{ boxShadow: '0 10px 30px rgba(44,47,50,0.06)' }}>
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                                    <span className="material-icons-round text-primary text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">Sprint</p>
                                    <p className="text-[17px] font-semibold text-slate-900">{name}</p>
                                    {goal && <p className="text-[12px] text-slate-500 mt-1 leading-snug">{goal}</p>}
                                </div>
                            </div>
                            <div className="h-px bg-slate-100" />
                            <div className="flex items-center gap-4">
                                <span className="material-icons-round text-slate-400 text-[18px]">date_range</span>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Duration</p>
                                    <p className="text-[14px] font-semibold text-slate-800">{startDate} → {endDate} · <span className="text-primary">{durationDays} day{durationDays !== 1 ? 's' : ''}</span></p>
                                </div>
                            </div>
                            {(totalSelected > 0 || uploadedFiles.length > 0) && (
                                <>
                                    <div className="h-px bg-slate-100" />
                                    <div className="flex items-start gap-4">
                                        <span className="material-icons-round text-slate-400 text-[18px] mt-0.5">library_books</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-2">Materials</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {Object.entries(selected).flatMap(([tab, items]) =>
                                                    items.map(item => {
                                                        const cfg = TAB_CONFIG[tab];
                                                        return (
                                                            <span key={item.id} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>{item.title}</span>
                                                        );
                                                    })
                                                )}
                                                {uploadedFiles.map((f, i) => (
                                                    <span key={i} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">{f.name}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 10px 30px rgba(44,47,50,0.06)' }}>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-4">What happens next</p>
                            <div className="space-y-3">
                                {[
                                    { icon: 'psychology',  text: 'The AI reads and analyses all your selected materials' },
                                    { icon: 'map',         text: `Creates a roadmap of challenges across your ${durationDays ?? '?'} days` },
                                    { icon: 'shuffle',     text: 'Each challenge gets a unique mix of quizzes, concepts, and reading tasks' },
                                    { icon: 'bolt',        text: 'First 5 challenges are fully built and ready immediately' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <span className="material-icons-round text-primary text-[14px]">{item.icon}</span>
                                        </div>
                                        <p className="text-[13px] text-slate-600 leading-snug">{item.text}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-5 flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl">
                                <span className="material-icons-round text-slate-400 text-[16px]">schedule</span>
                                <p className="text-[12px] text-slate-500">Estimated time: <span className="font-semibold text-slate-700">2–4 minutes</span></p>
                            </div>
                        </div>

                    </div>
                )}
            </div>

            {/* Fixed bottom nav */}
            <div className="fixed bottom-0 left-0 lg:left-64 right-0 z-50 flex justify-between items-center px-6 py-4 bg-white/95 backdrop-blur border-t border-slate-100">
                <button onClick={step > 1 ? () => setStep(s => s - 1) : () => navigate('/lockedin/sprints')}
                    className="flex items-center gap-2 text-slate-600 px-4 py-2.5 rounded-xl font-semibold text-[13px] hover:bg-slate-100 transition-all active:scale-95">
                    <span className="material-icons-round text-[18px]">arrow_back</span>
                    Back
                </button>
                {step < 3 ? (
                    <button onClick={() => setStep(s => s + 1)} disabled={!canNext}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-semibold text-[13px] shadow-md shadow-primary/20 hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95">
                        Continue
                        <span className="material-icons-round text-[18px]">arrow_forward</span>
                    </button>
                ) : (
                    <button onClick={handleCreate} disabled={submitting}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-semibold text-[13px] shadow-md shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-95">
                        {submitting
                            ? <><Loader size="sm" /> Creating…</>
                            : <><span className="material-icons-round text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span> Create Sprint</>
                        }
                    </button>
                )}
            </div>

            {pickerOpen && (
                <MaterialPickerModal
                    tab={pickerTab} setTab={setPickerTab}
                    search={pickerSearch} setSearch={setPickerSearch}
                    selected={selected} onToggle={toggleMaterial}
                    onClose={() => setPickerOpen(false)}
                    library={library} libLoading={libLoading}
                    libLoadingMore={libLoadingMore} libHasMore={libHasMore}
                    onLoadMore={(tab) => fetchLibTab(tab, libPage[tab] + 1, true)}
                />
            )}
        </div>
    );
};

export default SprintCreate;
