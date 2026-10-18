import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import 'react-day-picker/style.css';
import { apiClient } from '../../api/apiClient';
import { sprintService } from '../../api/sprintService';
import { openAIKeyModal } from '../../hooks/useAIKeys';
import Alert from '../globals/Alert';
import Loader from '../globals/Loader';

// ── Constants ────────────────────────────────────────────────────────────────

const TAB_CONFIG = {
    Notes:        { icon: 'description', type: 'note'         },
    Papers:       { icon: 'article',     type: 'paper'        },
    Slides:       { icon: 'slideshow',   type: 'presentation' },
    Flashcards:   { icon: 'style',       type: 'flashcard'    },
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

// ── Date Picker ───────────────────────────────────────────────────────────────

const RDP_CLS = {
    root:             'select-none font-sans',
    month_caption:    'flex justify-between items-center mb-3 px-1',
    caption_label:    'text-[14px] font-semibold text-stone-800',
    nav:              'flex items-center gap-0.5',
    button_previous:  'w-7 h-7 flex items-center justify-center text-stone-400 hover:bg-stone-100 transition-colors',
    button_next:      'w-7 h-7 flex items-center justify-center text-stone-400 hover:bg-stone-100 transition-colors',
    weekday:          'text-center text-[10px] font-semibold text-stone-400 uppercase pb-2 w-9',
    day:              'p-0.5',
    day_button:       'w-9 h-9 text-[13px] font-medium w-full h-full transition-colors hover:bg-plum-50 hover:text-plum-700 focus:outline-none',
    today:            'font-bold text-plum-700',
    selected:         '!bg-plum-600 !text-white hover:!bg-plum-700',
    disabled:         'opacity-30 pointer-events-none',
    outside:          'opacity-30',
};

const toYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const parseYMD = (str) => {
    if (!str) return undefined;
    const d = new Date(str + 'T00:00:00');
    return isNaN(d.getTime()) ? undefined : d;
};

const DatePickerInput = ({ label, value, onChange, minDate, required, alignRight }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const selected = parseYMD(value);
    const minObj   = parseYMD(minDate);

    useEffect(() => {
        if (!open) return;
        const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [open]);

    const handleSelect = (date) => {
        if (!date) return;
        onChange(toYMD(date));
        setOpen(false);
    };

    const display = selected ? format(selected, 'MMM d, yyyy') : null;

    return (
        <div className="space-y-2">
            <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-[0.16em] block">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            <div ref={ref} className="relative">
                <button
                    type="button"
                    onClick={() => setOpen(v => !v)}
                    className={`w-full bg-white border px-4 py-3 text-[14px] text-left flex items-center gap-2 outline-none transition-colors ${
                        open ? 'border-plum-400' : 'border-stone-200 hover:border-stone-300'
                    }`}
                >
                    <span className="material-icons-round text-stone-400 text-[16px]">calendar_today</span>
                    <span className={display ? 'text-stone-800 flex-1' : 'text-stone-400 flex-1'}>
                        {display ?? 'Pick a date'}
                    </span>
                    <span className={`material-icons-round text-stone-300 text-[14px] transition-transform ${open ? 'rotate-180' : ''}`}>
                        expand_more
                    </span>
                </button>

                {open && (
                    <div
                        className={`absolute top-full mt-2 z-50 bg-white border border-stone-200 shadow-xl p-4 ${alignRight ? 'right-0' : 'left-0'}`}
                        style={{ '--rdp-accent-color': '#6C4EA6' }}
                    >
                        <DayPicker
                            mode="single"
                            selected={selected}
                            onSelect={handleSelect}
                            disabled={minObj ? { before: minObj } : undefined}
                            defaultMonth={selected ?? minObj ?? new Date()}
                            classNames={RDP_CLS}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/40 backdrop-blur-sm">
            <div ref={ref} className="bg-white border border-stone-200 w-full sm:max-w-md shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: '85vh' }}>
                <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-stone-200 shrink-0">
                    <h3 className="font-display-serif text-[16px] font-semibold text-stone-900">Add Materials</h3>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors">
                        <span className="material-icons-round text-[18px]">close</span>
                    </button>
                </div>

                <div className="flex gap-1 px-4 pt-3 pb-2 shrink-0 overflow-x-auto">
                    {TABS.map(t => (
                        <button key={t} onClick={() => { setTab(t); setSearch(''); }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold whitespace-nowrap transition-colors ${tab === t ? 'bg-plum-50 text-plum-700' : 'text-stone-400 hover:bg-stone-50'}`}>
                           
                            {t}
                        </button>
                    ))}
                </div>

                <div className="px-4 pb-2 shrink-0">
                    <div className="relative">
                        <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-stone-300 text-[16px]">search</span>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${tab.toLowerCase()}…`}
                            className="w-full bg-white border border-stone-200 pl-9 pr-4 py-2 text-[13px] outline-none focus:border-plum-400 transition-colors" />
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
                                className={`w-full flex items-center gap-3 p-3 border transition-colors text-left ${checked ? 'bg-plum-50 border-plum-200' : 'border-stone-200 hover:bg-stone-50'}`}>
                               
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-semibold text-stone-800 truncate">{item.title}</p>
                                    {item.sub && <p className="text-[11px] text-stone-400">{item.sub}</p>}
                                </div>
                                <div className={`w-5 h-5 border-2 flex items-center justify-center shrink-0 transition-colors ${checked ? 'bg-plum-600 border-plum-600' : 'border-stone-300'}`}>
                                    {checked && <span className="material-icons-round text-white text-[12px]">check</span>}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {libHasMore[tab] && !search && (
                    <div className="px-4 pb-3 shrink-0">
                        <button onClick={() => onLoadMore(tab)} disabled={libLoadingMore[tab]}
                            className="w-full py-2.5 border border-stone-200 text-[13px] font-semibold text-stone-500 hover:bg-stone-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                            {libLoadingMore[tab]
                                ? <><Loader size="sm" /></>
                                : <><span className="material-icons-round text-[16px]">expand_more</span> Load more</>
                            }
                        </button>
                    </div>
                )}

                <div className="px-4 py-3 border-t border-stone-200 shrink-0">
                    <button onClick={onClose} className="w-full py-3 bg-plum-600 hover:bg-plum-700 text-white font-semibold text-[14px] transition-colors active:scale-[0.98]">Done</button>
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
    const [isKeyRequired, setIsKeyRequired] = useState(false);

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
            navigate(`/lockedin/sprints/${res.data.id}`);
        } catch (err) {
            const msg = Object.values(err?.errors ?? {})?.[0]?.[0]
                ?? err?.message
                ?? 'Failed to create sprint. Please try again.';
            const keyRequired = err?.status === 428;
            setSubmitError(msg);
            setIsKeyRequired(keyRequired);
            setSubmitting(false);
        }
    };

    return (
        <div className="flex-1 h-full overflow-y-auto lg:ml-64 pt-16 lg:pt-0 bg-paper font-display text-stone-900">

            {/* Top bar */}
            <div className="sticky top-0 z-20 bg-paper/95 backdrop-blur px-4 md:px-6 py-4 flex items-center justify-between border-b border-stone-200">
                <button onClick={() => navigate('/lockedin/sprints')} className="flex items-center gap-2 text-stone-600 hover:text-stone-900 font-semibold text-[14px] transition-colors">
                    <span className="material-icons-round text-[20px]">arrow_back</span>
                    <span className="hidden sm:inline">Sprints</span>
                </button>

                <div className="flex items-center gap-1.5">
                    {WIZARD_STEPS.map((s, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                            <div className={`w-6 h-6 flex items-center justify-center text-[11px] font-semibold transition-colors ${
                                i + 1 < step  ? 'bg-plum-600 text-white'
                                : i + 1 === step ? 'bg-stone-900 text-white'
                                : 'bg-stone-200 text-stone-500'
                            }`}>
                                {i + 1 < step
                                    ? <span className="material-icons-round text-[12px]">check</span>
                                    : i + 1
                                }
                            </div>
                            <span className={`text-[11px] font-semibold hidden sm:block ${i + 1 === step ? 'text-stone-900' : 'text-stone-400'}`}>{s.label}</span>
                            {i < WIZARD_STEPS.length - 1 && <div className="w-5 h-px bg-stone-300 mx-0.5" />}
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
                            <p className="eyebrow text-plum-700 mb-2">Step 1 of 3</p>
                            <h1 className="font-display-serif text-[30px] md:text-[38px] font-semibold tracking-tight text-stone-900 leading-tight mb-2">Set up your sprint</h1>
                            <p className="text-stone-500 text-[15px]">Give it a name, pick your dates, and tell the AI what you want to achieve.</p>
                        </div>

                        <div className="bg-white border border-stone-200 p-6 md:p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-[0.16em] block">Sprint Name <span className="text-red-400">*</span></label>
                                <input value={name} onChange={e => setName(e.target.value)}
                                    placeholder='e.g. "Finals Week — Biology"'
                                    className="w-full bg-white border border-stone-200 px-4 py-3 text-[15px] text-stone-800 placeholder-stone-400 outline-none focus:border-plum-400 transition-colors" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <DatePickerInput
                                    label="Start Date"
                                    value={startDate}
                                    onChange={setStartDate}
                                    minDate={today()}
                                    required
                                />
                                <DatePickerInput
                                    label="End Date"
                                    value={endDate}
                                    onChange={setEndDate}
                                    minDate={startDate || today()}
                                    required
                                    alignRight
                                />
                            </div>

                            {durationDays && (
                                <div className="flex items-center gap-2 px-4 py-3 bg-plum-50 border border-plum-200">
                                    <span className="material-icons-round text-plum-600 text-[18px]">calendar_month</span>
                                    <p className="text-[13px] text-stone-600">
                                        <span className="font-semibold text-plum-700">{durationDays} day{durationDays !== 1 ? 's' : ''}</span> — the AI will plan your challenges across this period
                                    </p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-[0.16em] block">
                                    Goal &amp; Context <span className="text-stone-400 font-normal normal-case tracking-normal">(optional)</span>
                                </label>
                                <textarea value={goal} onChange={e => setGoal(e.target.value)}
                                    placeholder="Mention specific topics to focus on, an exam date, or what you find hardest…"
                                    rows={3}
                                    className="w-full bg-white border border-stone-200 px-4 py-3 text-[14px] text-stone-800 placeholder-stone-400 outline-none focus:border-plum-400 transition-colors resize-none" />
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Step 2: Materials ── */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div>
                            <p className="eyebrow text-plum-700 mb-2">Step 2 of 3</p>
                            <h1 className="font-display-serif text-[30px] md:text-[38px] font-semibold tracking-tight text-stone-900 leading-tight mb-2">Add your materials</h1>
                            <p className="text-stone-500 text-[15px]">Select from your library or upload files. The AI will study everything you add.</p>
                        </div>

                        {/* Library tiles */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {TABS.map(tab => {
                                const cnt = selectedCount(tab);
                                return (
                                    <button key={tab} onClick={() => { setPickerTab(tab); setPickerSearch(''); setPickerOpen(true); }}
                                        className={`group relative overflow-hidden bg-white p-5 text-left transition-all duration-200 hover:-translate-y-0.5 border ${cnt > 0 ? 'border-plum-300' : 'border-stone-200 hover:border-stone-300'}`}>
                                      
                                        <p className="text-[13px] font-semibold text-stone-800">{tab}</p>
                                        {cnt > 0
                                            ? <p className="text-[11px] font-semibold mt-0.5 text-plum-700">{cnt} selected</p>
                                            : <p className="text-[11px] text-stone-400 mt-0.5">Tap to browse</p>
                                        }
                                        {cnt > 0 && (
                                            <div className="absolute top-3 right-3 min-w-[20px] h-5 px-1 bg-plum-600 flex items-center justify-center text-[10px] font-semibold text-white">{cnt}</div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Selected chips */}
                        {totalSelected > 0 && (
                            <div className="bg-white border border-stone-200 p-5">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-plum-700 mb-3">{totalSelected} item{totalSelected !== 1 ? 's' : ''} selected</p>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(selected).flatMap(([tab, items]) =>
                                        items.map(item => {
                                            return (
                                                <div key={item.id} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold bg-plum-50 text-plum-700 border border-plum-200">
                                                
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
                        <div className="bg-white border border-stone-200 p-5 md:p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 bg-stone-100 flex items-center justify-center">
                                    <span className="material-icons-round text-stone-500 text-[18px]">upload_file</span>
                                </div>
                                <div>
                                    <p className="text-[13px] font-semibold text-stone-800">Upload custom files</p>
                                    <p className="text-[11px] text-stone-400">PDF, DOCX, XLSX, XLS, CSV — up to 20 MB each</p>
                                </div>
                            </div>
                            <div
                                onClick={() => fileRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragEnter={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`w-full border border-dashed py-7 flex flex-col items-center gap-2 cursor-pointer transition-colors select-none
                                    ${isDragging
                                        ? 'border-plum-400 bg-plum-50 text-plum-700'
                                        : 'border-stone-300 text-stone-400 hover:border-plum-300 hover:text-plum-700'
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
                                        <div key={i} className="flex items-center gap-3 px-3 py-2 bg-stone-50 border border-stone-100">
                                            <span className="material-icons-round text-stone-400 text-[16px]">description</span>
                                            <span className="flex-1 text-[12px] font-medium text-stone-700 truncate">{f.name}</span>
                                            <button onClick={() => setUploadedFiles(prev => prev.filter((_, j) => j !== i))} className="text-stone-400 hover:text-red-500 transition-colors">
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
                            <p className="eyebrow text-plum-700 mb-2">Step 3 of 3</p>
                            <h1 className="font-display-serif text-[30px] md:text-[38px] font-semibold tracking-tight text-stone-900 leading-tight mb-2">Review your sprint</h1>
                            <p className="text-stone-500 text-[15px]">Everything looks good? Hit create and the AI will get to work.</p>
                        </div>

                        {submitError && (
                            <div>
                                <Alert type="error" message={submitError} />
                                {isKeyRequired && (
                                    <button onClick={openAIKeyModal} className="inline-flex items-center gap-1.5 mt-2 text-[13px] font-semibold text-plum-700 hover:underline">
                                        <span className="material-icons-round text-[15px]">key</span>
                                        Add your AI API key
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="bg-white border border-stone-200 p-6 md:p-8 space-y-5">
                            <div className="flex items-start gap-4">
                              
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400 mb-0.5">Sprint</p>
                                    <p className="text-[17px] font-semibold text-stone-900">{name}</p>
                                    {goal && <p className="text-[12px] text-stone-500 mt-1 leading-snug">{goal}</p>}
                                </div>
                            </div>
                            <div className="h-px bg-stone-200" />
                            <div className="flex items-center gap-4">
                                <span className="material-icons-round text-stone-400 text-[18px]">date_range</span>
                                <div>
                                    <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-[0.16em]">Duration</p>
                                    <p className="text-[14px] font-semibold text-stone-800">{startDate} → {endDate} · <span className="text-plum-700">{durationDays} day{durationDays !== 1 ? 's' : ''}</span></p>
                                </div>
                            </div>
                            {(totalSelected > 0 || uploadedFiles.length > 0) && (
                                <>
                                    <div className="h-px bg-stone-200" />
                                    <div className="flex items-start gap-4">
                                        <span className="material-icons-round text-stone-400 text-[18px] mt-0.5">library_books</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-[0.16em] mb-2">Materials</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {Object.entries(selected).flatMap(([, items]) =>
                                                    items.map(item => (
                                                        <span key={item.id} className="text-[11px] font-semibold px-2.5 py-1 bg-plum-50 text-plum-700 border border-plum-200">{item.title}</span>
                                                    ))
                                                )}
                                                {uploadedFiles.map((f, i) => (
                                                    <span key={i} className="text-[11px] font-semibold px-2.5 py-1 bg-stone-100 text-stone-600 border border-stone-200">{f.name}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="bg-white border border-stone-200 p-6">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-plum-700 mb-4">What happens next</p>
                            <div className="space-y-3">
                                {[
                                    {   text: 'The AI reads and analyses all your selected materials' },
                                    {    text: `Creates a roadmap of challenges across your ${durationDays ?? '?'} days` },
                                    {     text: 'Each challenge gets a unique mix of quizzes, concepts, and reading tasks' },
                                    {         text: 'First 5 challenges are fully built and ready immediately' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                       
                                        <p className="text-[13px] text-stone-600 leading-snug">{item.text}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-5 flex items-center gap-2 px-4 py-3 bg-stone-50 border border-stone-100">
                                <span className="material-icons-round text-stone-400 text-[16px]">schedule</span>
                                <p className="text-[12px] text-stone-500">Estimated time: <span className="font-semibold text-stone-700">2–4 minutes</span></p>
                            </div>
                        </div>

                    </div>
                )}
            </div>

            {/* Fixed bottom nav */}
            <div className="fixed bottom-0 left-0 lg:left-64 right-0 z-50 flex justify-between items-center px-6 py-4 bg-paper/95 backdrop-blur border-t border-stone-200">
                <button onClick={step > 1 ? () => setStep(s => s - 1) : () => navigate('/lockedin/sprints')}
                    className="flex items-center gap-2 text-stone-600 px-4 py-2.5 font-semibold text-[13px] hover:bg-stone-100 transition-colors active:scale-95">
                    <span className="material-icons-round text-[18px]">arrow_back</span>
                    Back
                </button>
                {step < 3 ? (
                    <button onClick={() => setStep(s => s + 1)} disabled={!canNext}
                        className="flex items-center gap-2 bg-plum-600 text-white px-6 py-2.5 font-semibold text-[13px] hover:bg-plum-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors active:scale-95">
                        Continue
                        <span className="material-icons-round text-[18px]">arrow_forward</span>
                    </button>
                ) : (
                    <button onClick={handleCreate} disabled={submitting}
                        className="flex items-center gap-2 bg-plum-600 text-white px-6 py-2.5 font-semibold text-[13px] hover:bg-plum-700 disabled:opacity-50 transition-colors active:scale-95">
                        {submitting
                            ? <><Loader size="sm" /></>
                            : <>Create Sprint</>
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
