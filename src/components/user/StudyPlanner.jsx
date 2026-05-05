import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';
import { studyPlanService } from '../../api/studyPlanService';
import { useStudyPlanChannel } from '../../hooks/useStudyPlanChannel';

// ── Status helpers ────────────────────────────────────────────────────────────
const STATUS_META = {
    active:    { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Active'      },
    upcoming:  { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-400',   label: 'Upcoming'    },
    completed: { bg: 'bg-slate-100',   text: 'text-slate-500',   dot: 'bg-slate-400',   label: 'Completed'   },
    pending:   { bg: 'bg-blue-100',    text: 'text-blue-700',    dot: 'bg-blue-400',    label: 'Generating'  },
    failed:    { bg: 'bg-red-100',     text: 'text-red-600',     dot: 'bg-red-400',     label: 'Failed'      },
};

const planStatus = (plan) => {
    if (plan.status === 'pending' || plan.status === 'generating') return 'pending';
    if (plan.status === 'failed') return 'failed';
    const today = new Date().toISOString().split('T')[0];
    const total = plan.schedule?.flatMap(d => d.tasks).length ?? 0;
    const done  = plan.schedule?.flatMap(d => d.tasks).filter(t => t.done).length ?? 0;
    if (total > 0 && done === total) return 'completed';
    if (plan.exam_date < today)      return 'completed';
    if (plan.start_date <= today)    return 'active';
    return 'upcoming';
};

const planProgress = (plan) => {
    const tasks = plan.schedule?.flatMap(d => d.tasks) ?? [];
    if (!tasks.length) return 0;
    return Math.round((tasks.filter(t => t.done).length / tasks.length) * 100);
};

const daysLeft = (examDate) => {
    const diff = Math.ceil((new Date(examDate) - new Date()) / 86400000);
    return Math.max(0, diff);
};

// ── Real API library endpoints ────────────────────────────────────────────────
const LIBRARY_ENDPOINTS = {
    Notes:      '/workspace/notes',
    Papers:     '/workspace/papers',
    Slides:     '/workspace/presentations',
    Flashcards: '/workspace/flashcards',
};
const TAB_ICONS  = { Notes: 'description', Papers: 'article', Slides: 'present_to_all', Flashcards: 'style' };
const TAB_COLORS = { Notes: 'text-violet-600', Papers: 'text-blue-600', Slides: 'text-indigo-600', Flashcards: 'text-pink-600' };
const TAB_BG     = { Notes: 'bg-violet-50',    Papers: 'bg-blue-50',    Slides: 'bg-indigo-50',    Flashcards: 'bg-pink-50'   };

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const ACTIVITY_TYPES = [
    { id: 'review',    label: 'Topic Review',   icon: 'menu_book',             desc: 'Read and understand core material' },
    { id: 'quiz',      label: 'Practice Quiz',  icon: 'quiz',                  desc: 'Test recall with targeted questions' },
    { id: 'summary',   label: 'Make Summary',   icon: 'format_list_bulleted',  desc: 'Write key points in your own words' },
    { id: 'flashcard', label: 'Flash Review',   icon: 'style',                 desc: 'Rapid card-based recall drills' },
];

const ACTIVITY_COLORS = {
    review:    { bg: 'bg-violet-50',   text: 'text-violet-600',  icon: 'text-violet-500'  },
    quiz:      { bg: 'bg-emerald-50',  text: 'text-emerald-700', icon: 'text-emerald-500' },
    summary:   { bg: 'bg-amber-50',    text: 'text-amber-700',   icon: 'text-amber-500'   },
    flashcard: { bg: 'bg-pink-50',     text: 'text-pink-700',    icon: 'text-pink-500'    },
};

// ── Toggle ────────────────────────────────────────────────────────────────────
const Toggle = ({ on, onChange }) => (
    <button onClick={() => onChange(!on)}
        className={`relative flex items-center w-11 h-6 rounded-full transition-colors shrink-0 ${on ? 'bg-primary' : 'bg-slate-200'}`}>
        <div className={`absolute w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${on ? 'right-1' : 'left-1'}`} />
    </button>
);

// ── Material Picker Modal ─────────────────────────────────────────────────────
const MaterialPickerModal = ({ tab, setTab, search, setSearch, selected, onToggle, onClose }) => {
    const [library, setLibrary] = useState({ Notes: [], Papers: [], Slides: [], Flashcards: [] });
    const [loading, setLoading] = useState({ Notes: false, Papers: false, Slides: false, Flashcards: false });
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (!ref.current?.contains(e.target)) onClose(); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [onClose]);

    useEffect(() => {
        Object.keys(LIBRARY_ENDPOINTS).forEach(t => {
            if (library[t].length || loading[t]) return;
            setLoading(prev => ({ ...prev, [t]: true }));
            apiClient(LIBRARY_ENDPOINTS[t])
                .then(res => {
                    const d = res.data ?? res;
                    const items = (d.data ?? (Array.isArray(d) ? d : [])).map(i => ({ id: i.id, title: i.title ?? 'Untitled' }));
                    setLibrary(prev => ({ ...prev, [t]: items }));
                })
                .catch(() => {})
                .finally(() => setLoading(prev => ({ ...prev, [t]: false })));
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const items = (library[tab] ?? []).filter(i => i.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
            <div ref={ref}
                className="bg-white w-full sm:max-w-md rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden"
                style={{ maxHeight: '85vh' }}>

                <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 shrink-0">
                    <h3 className="font-semibold text-[15px] text-slate-800">Add Materials</h3>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
                        <span className="material-icons-round text-[18px]">close</span>
                    </button>
                </div>

                <div className="flex gap-1 px-4 pt-3 pb-2 shrink-0 overflow-x-auto">
                    {Object.keys(LIBRARY_ENDPOINTS).map(t => (
                        <button key={t} onClick={() => { setTab(t); setSearch(''); }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold whitespace-nowrap transition-all ${tab === t ? `${TAB_BG[t]} ${TAB_COLORS[t]}` : 'text-slate-400 hover:bg-slate-50'}`}>
                            <span className="material-icons-round text-[14px]">{TAB_ICONS[t]}</span>
                            {t}
                        </button>
                    ))}
                </div>

                <div className="px-4 pb-2 shrink-0">
                    <div className="relative">
                        <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-[16px]">search</span>
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder={`Search ${tab.toLowerCase()}…`}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-[13px] outline-none focus:border-primary/40 transition-colors" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1.5 min-h-0">
                    {loading[tab] && (
                        <div className="py-10 flex flex-col items-center gap-2 text-slate-300">
                            <span className="w-6 h-6 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
                            <p className="text-[13px]">Loading…</p>
                        </div>
                    )}
                    {!loading[tab] && items.length === 0 && (
                        <div className="py-10 flex flex-col items-center gap-2 text-slate-300">
                            <span className="material-icons-round text-4xl">search_off</span>
                            <p className="text-[13px]">Nothing found</p>
                        </div>
                    )}
                    {!loading[tab] && items.map(item => {
                        const checked = selected[tab]?.some(s => s.id === item.id);
                        return (
                            <button key={item.id} onClick={() => onToggle(tab, item)}
                                className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${checked ? `${TAB_BG[tab]} border-primary/20` : 'border-slate-100 hover:bg-slate-50'}`}>
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${checked ? TAB_BG[tab] : 'bg-slate-100'}`}>
                                    <span className={`material-icons-round text-[16px] ${checked ? TAB_COLORS[tab] : 'text-slate-400'}`}>{TAB_ICONS[tab]}</span>
                                </div>
                                <p className="flex-1 text-[13px] font-semibold text-slate-800 truncate">{item.title}</p>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${checked ? 'bg-primary border-primary' : 'border-slate-300'}`}>
                                    {checked && <span className="material-icons-round text-white text-[12px]">check</span>}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="px-4 py-3 border-t border-slate-100 shrink-0">
                    <button onClick={onClose}
                        className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold text-[14px] transition-all active:scale-[0.98]">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Step dots ─────────────────────────────────────────────────────────────────
const StepDots = ({ current, total }) => (
    <div className="flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
            <div key={i} className={`rounded-full transition-all duration-300 ${i + 1 === current ? 'w-5 h-2 bg-primary' : i + 1 < current ? 'w-2 h-2 bg-primary/40' : 'w-2 h-2 bg-slate-200'}`} />
        ))}
    </div>
);

// ── Create Study Plan (4 steps) ───────────────────────────────────────────────
const CreateStudyPlanScreen = ({ onBack, onCreated, initialName = '', initialDate = '', initialSource = null }) => {
    const [step, setStep]       = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [genError, setGenError]     = useState(null);

    const [name, setName]               = useState(initialName);

    const EMPTY_SEL = { Notes: [], Papers: [], Slides: [], Flashcards: [] };
    const [selected, setSelected] = useState(() => {
        if (!initialSource) return EMPTY_SEL;
        const tab = initialSource.type === 'note' ? 'Notes' : 'Papers';
        return { ...EMPTY_SEL, [tab]: [{ id: initialSource.id, title: initialSource.title }] };
    });
    const [pickerOpen,   setPickerOpen]   = useState(false);
    const [pickerTab,    setPickerTab]    = useState('Notes');
    const [pickerSearch, setPickerSearch] = useState('');

    const toggleMaterial = (tab, item) => {
        setSelected(prev => {
            const already = prev[tab].some(s => s.id === item.id);
            return { ...prev, [tab]: already ? prev[tab].filter(s => s.id !== item.id) : [...prev[tab], item] };
        });
    };

    const [startDate,  setStartDate]  = useState(new Date().toISOString().split('T')[0]);
    const [endDate,    setEndDate]    = useState(initialDate || '');
    const [activeDays, setActiveDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    const [studyFrom,  setStudyFrom]  = useState('19:00');
    const [studyTo,    setStudyTo]    = useState('22:00');
    const toggleDay = d => setActiveDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

    const [enabledActs, setEnabledActs] = useState({ review: true, quiz: true, summary: false, flashcard: false });
    const toggleAct = id => setEnabledActs(prev => ({ ...prev, [id]: !prev[id] }));

    const totalSelected = Object.values(selected).reduce((a, b) => a + b.length, 0);
    const canNext = step === 1 ? name.trim().length > 0 : step === 3 ? endDate.length > 0 : true;
    const isLast  = step === 4;

    const TAB_TYPE_MAP = { Notes: 'note', Papers: 'paper', Slides: 'presentation', Flashcards: 'flashcard' };

    const handleGenerate = async () => {
        setSubmitting(true);
        setGenError(null);

        const materialIds = Object.entries(selected).flatMap(([tab, items]) =>
            items.map(i => ({ type: TAB_TYPE_MAP[tab], id: i.id }))
        );

        const enabledActivityNames = Object.entries(enabledActs)
            .filter(([, v]) => v)
            .map(([k]) => k);

        try {
            const res = await studyPlanService.create({
                name,
                exam_date:           endDate,
                start_date:          startDate,
                study_from:          studyFrom,
                study_to:            studyTo,
                active_days:         activeDays,
                enabled_activities:  enabledActivityNames,
                material_ids:        materialIds,
            });

            const plan = res?.data ?? res;
            onCreated(plan);
        } catch (err) {
            setGenError(err?.message ?? 'Failed to create plan. Please try again.');
            setSubmitting(false);
        }
    };

    if (submitting) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-6 bg-slate-50 lg:ml-64 pt-20 lg:pt-0 min-h-screen">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="material-icons-round text-primary text-[28px]">event_note</span>
                    </div>
                </div>
                <div className="text-center max-w-xs">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Queuing your plan…</h3>
                    <p className="text-sm text-slate-500">Schola will build your schedule in the background. You can track progress on the next screen.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 h-full overflow-y-auto bg-slate-50 lg:ml-64 pt-16 lg:pt-0">

            <div className="sticky top-0 z-20 bg-slate-50/90 backdrop-blur px-6 py-4 flex items-center justify-between border-b border-slate-200/60">
                <button onClick={step > 1 ? () => setStep(s => s - 1) : onBack}
                    className="flex items-center gap-2 text-slate-700 hover:text-primary font-semibold text-[14px] transition-colors">
                    <span className="material-icons-round text-[20px]">arrow_back</span>
                    <span className="hidden sm:inline">{step > 1 ? 'Back' : 'Study Planner'}</span>
                </button>
                <div className="flex items-center gap-3">
                    <StepDots current={step} total={4} />
                    <span className="text-[13px] font-bold text-primary">Step {step} of 4</span>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 pb-32">

                {/* ── Step 1: Basics ── */}
                {step === 1 && (
                    <div className="space-y-6">
                        <div>
                            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-primary/10 text-primary mb-3">Step 1 of 4</span>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">Name your goal.</h1>
                            <p className="text-slate-500 text-[15px] mt-2">What are you preparing for?</p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-[0_10px_30px_rgba(44,47,50,0.06)] space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-slate-700">Plan name <span className="text-red-400">*</span></label>
                                <input value={name} onChange={e => setName(e.target.value)}
                                    placeholder="e.g. Physics Final Exam"
                                    className="w-full bg-slate-50 rounded-xl px-4 py-3 text-[15px] font-medium text-slate-800 outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Step 2: Materials ── */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div>
                            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-primary/10 text-primary mb-3">Step 2 of 4</span>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">Add your materials.</h1>
                            <p className="text-slate-500 text-[15px] mt-2">Schola will read your notes, papers, and more to build relevant sessions.</p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-[0_10px_30px_rgba(44,47,50,0.06)]">
                            <button onClick={() => setPickerOpen(true)}
                                className="w-full flex items-center justify-between p-4 border-2 border-dashed border-slate-200 rounded-2xl hover:border-primary/40 hover:bg-primary/5 transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                        <span className="material-icons-round text-primary text-[20px]">add</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-slate-700 text-[14px]">Add from library</p>
                                        <p className="text-slate-400 text-[12px]">{totalSelected} item{totalSelected !== 1 ? 's' : ''} selected</p>
                                    </div>
                                </div>
                                <span className="material-icons-round text-slate-300 text-[20px]">chevron_right</span>
                            </button>

                            {totalSelected > 0 && (
                                <div className="mt-4 space-y-1.5">
                                    {Object.entries(selected).flatMap(([tab, items]) =>
                                        items.map(item => (
                                            <div key={item.id} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl">
                                                <span className={`material-icons-round text-[14px] ${TAB_COLORS[tab]}`}>{TAB_ICONS[tab]}</span>
                                                <p className="flex-1 text-[13px] font-medium text-slate-700 truncate">{item.title}</p>
                                                <button onClick={() => toggleMaterial(tab, item)} className="text-slate-300 hover:text-red-400 transition-colors">
                                                    <span className="material-icons-round text-[16px]">close</span>
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            <p className="text-[11px] text-slate-400 mt-4 text-center">
                                No materials? Schola will generate a general plan based on your exam name.
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Step 3: Schedule ── */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div>
                            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-primary/10 text-primary mb-3">Step 3 of 4</span>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">Define your schedule.</h1>
                            <p className="text-slate-500 text-[15px] mt-2">Set your start & exam date and when you study each day.</p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-[0_10px_30px_rgba(44,47,50,0.06)] space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-slate-700">Start Date</label>
                                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full bg-slate-50 rounded-xl px-4 py-3 text-[14px] font-medium text-slate-800 outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-slate-700">Exam Date <span className="text-red-400">*</span></label>
                                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                                        min={startDate}
                                        className="w-full bg-slate-50 rounded-xl px-4 py-3 text-[14px] font-medium text-slate-800 outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-slate-700">Study From</label>
                                    <input type="time" value={studyFrom} onChange={e => setStudyFrom(e.target.value)}
                                        className="w-full bg-slate-50 rounded-xl px-4 py-3 text-[14px] font-medium text-slate-800 outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-slate-700">Study To</label>
                                    <input type="time" value={studyTo} onChange={e => setStudyTo(e.target.value)}
                                        className="w-full bg-slate-50 rounded-xl px-4 py-3 text-[14px] font-medium text-slate-800 outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3">Active Study Days</label>
                                <div className="flex gap-2">
                                    {DAYS_OF_WEEK.map(d => {
                                        const on = activeDays.includes(d);
                                        return (
                                            <button key={d} onClick={() => toggleDay(d)}
                                                className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all ${on ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                                                {d.slice(0, 1)}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            {endDate && startDate && (
                                <div className="bg-primary/5 rounded-xl px-4 py-3 flex items-center gap-2">
                                    <span className="material-icons-round text-primary text-[18px]">info</span>
                                    <p className="text-[13px] text-primary font-medium">
                                        {daysLeft(endDate)} days until exam · Schola will distribute sessions across active days
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Step 4: Activities ── */}
                {step === 4 && (
                    <div className="space-y-6">
                        <div>
                            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-primary/10 text-primary mb-3">Step 4 of 4</span>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">Choose activities.</h1>
                            <p className="text-slate-500 text-[15px] mt-2">Select what types of sessions Schola schedules for you.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {ACTIVITY_TYPES.map(act => {
                                const on  = enabledActs[act.id];
                                const col = ACTIVITY_COLORS[act.id];
                                return (
                                    <div key={act.id}
                                        className={`bg-white rounded-2xl p-5 shadow-[0_10px_30px_rgba(44,47,50,0.06)] flex items-start gap-4 transition-all ${!on ? 'opacity-50' : ''}`}>
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${col.bg}`}>
                                            <span className={`material-icons-round text-[22px] ${col.icon}`}>{act.icon}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="font-bold text-slate-800">{act.label}</p>
                                                <Toggle on={on} onChange={() => toggleAct(act.id)} />
                                            </div>
                                            <p className="text-[12px] text-slate-500">{act.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {genError && (
                            <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3 flex items-center gap-2">
                                <span className="material-icons-round text-[16px]">error_outline</span>
                                {genError}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Fixed bottom nav */}
            <div className="fixed bottom-0 left-0 lg:left-64 right-0 z-50 flex justify-between items-center px-6 py-4 bg-white/90 backdrop-blur-xl border-t border-slate-100 shadow-[0_-4px_20px_rgba(44,47,50,0.08)]">
                <button onClick={step > 1 ? () => setStep(s => s - 1) : onBack}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-600 font-semibold text-[14px] hover:bg-slate-100 transition-all">
                    <span className="material-icons-round text-[18px]">arrow_back</span>
                    Back
                </button>
                {!isLast ? (
                    <button onClick={() => setStep(s => s + 1)} disabled={!canNext}
                        className="flex items-center gap-2 px-7 py-2.5 bg-primary text-white rounded-xl font-bold text-[14px] shadow-lg shadow-primary/25 hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                        Continue
                        <span className="material-icons-round text-[18px]">arrow_forward</span>
                    </button>
                ) : (
                    <button onClick={handleGenerate} disabled={submitting}
                        className="flex items-center gap-2 px-7 py-2.5 bg-primary text-white rounded-xl font-bold text-[14px] shadow-lg shadow-primary/25 hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-40">
                        <span className="material-icons-round text-[18px]">auto_awesome</span>
                        Generate Plan
                    </button>
                )}
            </div>

            {pickerOpen && (
                <MaterialPickerModal
                    tab={pickerTab} setTab={setPickerTab}
                    search={pickerSearch} setSearch={setPickerSearch}
                    selected={selected}
                    onToggle={toggleMaterial}
                    onClose={() => setPickerOpen(false)}
                />
            )}
        </div>
    );
};

// ── Generating overlay (shown in PlanDetailScreen while status is pending) ────
const GeneratingOverlay = ({ plan, onReady, onFailed }) => {
    const [msg, setMsg]           = useState('Schola is building your schedule…');
    const [progress, setProgress] = useState(10);

    useStudyPlanChannel(plan?.id, {
        onProgress: (e) => { setMsg(e.message); setProgress(e.progress); },
        onReady:    (e) => onReady(e.schedule),
        onFailed:   ()  => onFailed(),
    });

    return (
        <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur flex flex-col items-center justify-center gap-6 rounded-2xl">
            <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-icons-round text-primary text-[24px]">event_note</span>
                </div>
            </div>
            <div className="text-center max-w-xs px-4">
                <h3 className="text-lg font-bold text-slate-800 mb-1">Building your plan…</h3>
                <p className="text-sm text-slate-500 mb-4">{msg}</p>
                <div className="h-2 w-48 bg-slate-100 rounded-full overflow-hidden mx-auto">
                    <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
                </div>
            </div>
        </div>
    );
};

// ── Plan Detail Screen ────────────────────────────────────────────────────────
const PlanDetailScreen = ({ plan: initialPlan, onBack, onPlanUpdate }) => {
    const [plan, setPlan]   = useState(initialPlan);
    const [filter, setFilter] = useState('all');
    const today = new Date().toISOString().split('T')[0];

    const isGenerating = plan.status === 'pending' || plan.status === 'generating';
    const isFailed     = plan.status === 'failed';

    const handleScheduleReady = useCallback((schedule) => {
        const updated = { ...plan, status: 'active', schedule };
        setPlan(updated);
        onPlanUpdate?.(updated);
    }, [plan, onPlanUpdate]);

    const handleFailed = useCallback(() => {
        const updated = { ...plan, status: 'failed' };
        setPlan(updated);
        onPlanUpdate?.(updated);
    }, [plan, onPlanUpdate]);

    const toggleTask = async (date, taskId) => {
        const optimistic = {
            ...plan,
            schedule: plan.schedule.map(day =>
                day.date !== date ? day : {
                    ...day,
                    tasks: day.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t),
                }
            ),
        };
        setPlan(optimistic);
        onPlanUpdate?.(optimistic);
        try {
            await studyPlanService.toggleTask(plan.id, date, taskId);
        } catch {
            setPlan(plan);
        }
    };

    const progress   = planProgress(plan);
    const status     = planStatus(plan);
    const sm         = STATUS_META[status] ?? STATUS_META.upcoming;
    const days_left  = daysLeft(plan.exam_date);

    const filteredDays = (plan.schedule ?? []).filter(day => {
        if (filter === 'today')   return day.date === today;
        if (filter === 'pending') return day.tasks.some(t => !t.done);
        if (filter === 'done')    return day.tasks.every(t => t.done);
        return true;
    });

    const formatDate = (d) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    return (
        <main className="relative flex-1 overflow-y-auto bg-slate-50 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 pb-12">

            {isGenerating && (
                <GeneratingOverlay
                    plan={plan}
                    onReady={handleScheduleReady}
                    onFailed={handleFailed}
                />
            )}

            {/* Header */}
            <div className="flex items-start gap-3 mb-6">
                <button onClick={onBack}
                    className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors shadow-sm shrink-0 mt-0.5">
                    <span className="material-icons-round text-[20px]">arrow_back</span>
                </button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 truncate">{plan.name}</h1>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${sm.bg} ${sm.text}`}>{sm.label}</span>
                        <span className="text-[12px] text-slate-400 flex items-center gap-1">
                            <span className="material-icons-round text-[14px]">event</span>
                            Exam: {formatDate(plan.exam_date)}
                        </span>
                        {days_left > 0 && (
                            <span className="text-[12px] text-slate-400">{days_left} day{days_left !== 1 ? 's' : ''} left</span>
                        )}
                    </div>
                </div>
            </div>

            {isFailed && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 flex items-center gap-3">
                    <span className="material-icons-round text-red-500 text-[24px]">error_outline</span>
                    <div>
                        <p className="font-semibold text-red-700">Generation failed</p>
                        <p className="text-[13px] text-red-500 mt-0.5">Schola couldn't build your plan. Go back and try again.</p>
                    </div>
                </div>
            )}

            {/* Progress bar */}
            <div className="bg-white rounded-2xl p-5 shadow-[0_10px_30px_rgba(44,47,50,0.04)] mb-6">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Overall Progress</p>
                    <p className="text-2xl font-extrabold text-primary">{progress}%</p>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                    <span>{(plan.schedule ?? []).flatMap(d => d.tasks).filter(t => t.done).length} tasks done</span>
                    <span>{(plan.schedule ?? []).flatMap(d => d.tasks).length} total</span>
                </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 mb-5 overflow-x-auto">
                {[['all', 'All Days'], ['today', 'Today'], ['pending', 'Pending'], ['done', 'Completed']].map(([id, label]) => (
                    <button key={id} onClick={() => setFilter(id)}
                        className={`px-4 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all ${filter === id ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-white text-slate-500 border border-slate-200 hover:border-primary/30'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Schedule */}
            {!isGenerating && filteredDays.length === 0 ? (
                <div className="py-16 flex flex-col items-center text-center text-slate-300">
                    <span className="material-icons-round text-5xl mb-3">event_busy</span>
                    <p className="font-semibold text-slate-400">Nothing here for this filter</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredDays.map(day => {
                        const isToday = day.date === today;
                        const allDone = day.tasks.every(t => t.done);
                        const doneCnt = day.tasks.filter(t => t.done).length;
                        return (
                            <div key={day.date}
                                className={`bg-white rounded-2xl shadow-[0_4px_20px_rgba(44,47,50,0.04)] overflow-hidden ${isToday ? 'ring-2 ring-primary/30' : ''}`}>
                                <div className={`px-5 py-3 flex items-center justify-between border-b border-slate-50 ${isToday ? 'bg-primary/5' : ''}`}>
                                    <div className="flex items-center gap-2">
                                        {isToday && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                                        <p className={`font-bold text-[13px] ${isToday ? 'text-primary' : 'text-slate-700'}`}>
                                            {isToday ? 'Today — ' : ''}{formatDate(day.date)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] text-slate-400">{doneCnt}/{day.tasks.length}</span>
                                        {allDone && <span className="material-icons-round text-emerald-500 text-[16px]">check_circle</span>}
                                    </div>
                                </div>
                                <div className="divide-y divide-slate-50">
                                    {day.tasks.map(task => {
                                        const col = ACTIVITY_COLORS[task.type] ?? ACTIVITY_COLORS.review;
                                        return (
                                            <button key={task.id}
                                                onClick={() => toggleTask(day.date, task.id)}
                                                className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-slate-50 ${task.done ? 'opacity-50' : ''}`}>
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${col.bg}`}>
                                                    <span className={`material-icons-round text-[15px] ${col.icon}`}>
                                                        {ACTIVITY_TYPES.find(a => a.id === task.type)?.icon ?? 'menu_book'}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-[13px] font-semibold text-slate-800 ${task.done ? 'line-through text-slate-400' : ''}`}>
                                                        {task.title}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400">
                                                        {task.material} · {task.duration_min} min
                                                    </p>
                                                </div>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${task.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                                                    {task.done && <span className="material-icons-round text-white text-[12px]">check</span>}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
    );
};

// ── Plans Landing Screen ──────────────────────────────────────────────────────
const PlansLandingScreen = ({ onOpen, onGenerate }) => {
    const [plans, setPlans]   = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        studyPlanService.list()
            .then(res => setPlans(res?.data ?? res ?? []))
            .catch(() => setPlans([]))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id) => {
        setPlans(prev => prev.filter(p => p.id !== id));
        try {
            await studyPlanService.delete(id);
        } catch {
            // optimistic delete — ignore error
        }
    };

    if (loading) {
        return (
            <main className="flex-1 overflow-y-auto bg-slate-50 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 flex items-center justify-center">
                <span className="w-8 h-8 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
            </main>
        );
    }

    return (
        <main className="flex-1 overflow-y-auto bg-slate-50 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8">

            <div className="flex items-end justify-between mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">Study Planner</h1>
                    <p className="text-[15px] text-slate-500 font-medium mt-1">AI-optimized schedules anchored to your deadlines.</p>
                </div>
                <button onClick={onGenerate}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-[13px] text-white shadow-xl bg-primary hover:bg-primary/90 active:scale-95 transition-all">
                    <span className="material-icons-round text-[18px]">auto_awesome</span>
                    <span className="hidden sm:inline">New Plan</span>
                </button>
            </div>

            {plans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-5">
                        <span className="material-icons-round text-primary text-[40px]">event_note</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No study plans yet</h3>
                    <p className="text-slate-400 text-[14px] max-w-xs leading-relaxed mb-6">
                        Create your first AI-powered study plan anchored to your exam date.
                    </p>
                    <button onClick={onGenerate}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold text-[14px] shadow-lg shadow-primary/25 hover:bg-primary/90 active:scale-95 transition-all">
                        <span className="material-icons-round text-[18px]">auto_awesome</span>
                        Create My First Plan
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {plans.map(plan => {
                        const progress   = planProgress(plan);
                        const status     = planStatus(plan);
                        const sm         = STATUS_META[status] ?? STATUS_META.upcoming;
                        const days       = daysLeft(plan.exam_date);
                        const doneTasks  = (plan.schedule ?? []).flatMap(d => d.tasks).filter(t => t.done).length;
                        const totalTasks = (plan.schedule ?? []).flatMap(d => d.tasks).length;
                        return (
                            <div key={plan.id}
                                className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(44,47,50,0.06)] p-6 flex flex-col md:flex-row md:items-center gap-5 hover:-translate-y-0.5 transition-transform">
                                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onOpen(plan)}>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <h3 className="text-[16px] font-bold text-slate-800 truncate">{plan.name}</h3>
                                        <span className={`shrink-0 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${sm.bg} ${sm.text}`}>{sm.label}</span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                                        </div>
                                        <span className="text-[12px] font-bold text-slate-500 shrink-0">{progress}%</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-2">
                                        {doneTasks}/{totalTasks} tasks · Exam {new Date(plan.exam_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        {days > 0 ? ` · ${days}d left` : ' · Exam passed'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button onClick={() => onOpen(plan)}
                                        className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-[12px] font-bold hover:bg-primary hover:text-white transition-all active:scale-95">
                                        Open
                                    </button>
                                    <button onClick={() => handleDelete(plan.id)}
                                        className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                                        <span className="material-icons-round text-[18px]">delete_outline</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    <button onClick={onGenerate}
                        className="w-full bg-white rounded-2xl border-2 border-dashed border-slate-200 p-8 flex items-center justify-center gap-3 text-slate-400 hover:border-primary/40 hover:text-primary transition-all">
                        <span className="material-icons-round text-[22px]">add_circle</span>
                        <span className="font-semibold text-[14px]">Create another plan</span>
                    </button>
                </div>
            )}
        </main>
    );
};

// ── Main orchestrator ─────────────────────────────────────────────────────────
export const StudyPlannerContent = () => {
    const location = useLocation();
    const state    = location.state ?? {};

    const [screen,     setScreen]     = useState(() => state.startCreate ? 'create' : 'list');
    const [activePlan, setActivePlan] = useState(null);

    const initialSource = (state.sourceId && state.sourceType)
        ? { id: state.sourceId, type: state.sourceType, title: state.sourceTitle ?? '' }
        : null;

    const handleCreated = (plan) => {
        setActivePlan(plan);
        setScreen('detail');
    };

    if (screen === 'create') {
        return (
            <CreateStudyPlanScreen
                onBack={() => setScreen('list')}
                onCreated={handleCreated}
                initialName={state.planName ?? ''}
                initialDate={state.examDate ?? ''}
                initialSource={initialSource}
            />
        );
    }

    if (screen === 'detail' && activePlan) {
        return (
            <PlanDetailScreen
                plan={activePlan}
                onBack={() => setScreen('list')}
                onPlanUpdate={setActivePlan}
            />
        );
    }

    return (
        <PlansLandingScreen
            onOpen={plan => { setActivePlan(plan); setScreen('detail'); }}
            onGenerate={() => setScreen('create')}
        />
    );
};
