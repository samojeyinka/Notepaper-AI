import { useState, useRef, useEffect } from 'react';

// ── Mock / static data ────────────────────────────────────────────────────────

const COMPONENT_META = {
    quiz:        { label: 'Quiz',          icon: 'quiz',                 color: 'text-violet-600', bg: 'bg-violet-100'  },
    concept:     { label: 'Concepts',      icon: 'lightbulb',            color: 'text-amber-600',  bg: 'bg-amber-100'   },
    quickpoints: { label: 'Quick Points',  icon: 'format_list_bulleted', color: 'text-blue-600',   bg: 'bg-blue-100'    },
    reading:     { label: 'Read',          icon: 'auto_stories',         color: 'text-teal-600',   bg: 'bg-teal-100'    },
};

const MOCK_CHALLENGES = [
    { id: 1,  dayLabel: 'Day 1',  date: 'Apr 28', status: 'completed', title: 'Foundation Overview',      description: 'Broad review of cell biology fundamentals and key terminology from your selected materials.',    components: ['concept', 'reading']             },
    { id: 2,  dayLabel: 'Day 2',  date: 'Apr 29', status: 'completed', title: 'Cell Structure Deep Dive', description: 'Focused study on organelles, membranes, and transport mechanisms. Tests recall from Ch. 7.',   components: ['quiz', 'quickpoints']            },
    { id: 3,  dayLabel: 'Day 3',  date: 'Apr 30', status: 'active',    title: 'Metabolism & Energy',      description: 'ATP synthesis, glycolysis, and the Krebs cycle. Covers your Organic Chemistry notes.',         components: ['concept', 'quiz', 'quickpoints'] },
    { id: 4,  dayLabel: 'Day 4',  date: 'May 1',  status: 'ready',     title: 'DNA Replication',          description: 'Mechanisms of DNA copying, proofreading, and common mutation types.',                         components: ['reading', 'quiz']                },
    { id: 5,  dayLabel: 'Day 5',  date: 'May 2',  status: 'ready',     title: 'Protein Synthesis',        description: 'Transcription, translation, codon table, and the genetic code in detail.',                    components: ['concept', 'quickpoints']         },
    { id: 6,  dayLabel: 'Day 6',  date: 'May 3',  status: 'ready',     title: 'Cell Division',            description: 'Mitosis and meiosis: phases, checkpoints, and what goes wrong in cancer.',                   components: ['quiz', 'reading']                },
    { id: 7,  dayLabel: 'Day 7',  date: 'May 4',  status: 'ready',     title: 'Genetics Intro',           description: "Mendel's laws, Punnett squares, and inheritance patterns — linked to your flashcard deck.",   components: ['concept', 'quiz', 'quickpoints'] },
    { id: 8,  dayLabel: 'Day 8',  date: 'May 5',  status: 'locked',    title: 'Coming soon',              description: 'Advanced genetics: gene expression, regulation, and epigenetics.',                            components: []                                 },
    { id: 9,  dayLabel: 'Day 9',  date: 'May 6',  status: 'locked',    title: 'Coming soon',              description: 'Ecology, population dynamics, and environmental biology.',                                    components: []                                 },
    { id: 10, dayLabel: 'Day 10', date: 'May 7',  status: 'locked',    title: 'Coming soon',              description: 'Evolution, natural selection, and speciation.',                                               components: []                                 },
    { id: 11, dayLabel: 'Day 11', date: 'May 8',  status: 'locked',    title: 'Coming soon',              description: 'Human body systems: nervous, endocrine, circulatory overview.',                               components: []                                 },
    { id: 12, dayLabel: 'Day 12', date: 'May 9',  status: 'locked',    title: 'Coming soon',              description: 'Immune system, vaccines, and infectious disease.',                                            components: []                                 },
    { id: 13, dayLabel: 'Day 13', date: 'May 10', status: 'locked',    title: 'Coming soon',              description: 'Targeted revision of your weakest areas based on quiz performance.',                          components: []                                 },
    { id: 14, dayLabel: 'Day 14', date: 'May 11', status: 'locked',    title: 'Grand Finale',             description: 'Full comprehensive mock exam covering everything from your sprint.',                           components: ['quiz']                           },
];

const MOCK_SPRINTS = [
    {
        id: 1, title: 'Biology Finals Sprint', subject: 'Biology',   status: 'active',
        startDate: 'Apr 28', endDate: 'May 11', totalChallenges: 14, completedChallenges: 2,
        challenges: MOCK_CHALLENGES,
    },
    {
        id: 2, title: 'Economics Midterm',     subject: 'Economics', status: 'completed',
        startDate: 'Mar 10', endDate: 'Mar 20', totalChallenges: 10, completedChallenges: 10,
        challenges: [],
    },
];

const MOCK_LIBRARY = {
    Notes:      [{ id: 'n1', title: 'Cell Biology — Chapter 7', sub: '12 pages' }, { id: 'n2', title: 'Macroeconomics Overview', sub: '8 pages' }, { id: 'n3', title: 'Organic Chemistry Basics', sub: '15 pages' }],
    Papers:     [{ id: 'p1', title: 'Climate Change Impact',    sub: '4 pages'  }, { id: 'p2', title: 'Genetics & DNA Research', sub: '7 pages'  }],
    Slides:     [{ id: 's1', title: 'Cell Respiration Slides',  sub: '12 slides'}, { id: 's2', title: 'Macro Policy Overview',   sub: '8 slides' }],
    Flashcards: [{ id: 'f1', title: 'Biology Terms Deck',       sub: '34 cards' }, { id: 'f2', title: 'Economics Vocabulary',    sub: '20 cards' }],
};

const TAB_CONFIG = {
    Notes:      { icon: 'description', color: 'text-violet-600', bg: 'bg-violet-50'  },
    Papers:     { icon: 'article',     color: 'text-blue-600',   bg: 'bg-blue-50'    },
    Slides:     { icon: 'slideshow',   color: 'text-indigo-600', bg: 'bg-indigo-50'  },
    Flashcards: { icon: 'style',       color: 'text-pink-600',   bg: 'bg-pink-50'    },
};

const STATUS_META = {
    active:     { label: 'Active',      badge: 'bg-emerald-50 text-emerald-700'  },
    generating: { label: 'Generating',  badge: 'bg-amber-50 text-amber-700'      },
    completed:  { label: 'Completed',   badge: 'bg-slate-100 text-slate-500'     },
};

// Zigzag positions — cycles every 6 nodes
const ZIGZAG = ['translate-x-0', 'translate-x-14', 'translate-x-14', 'translate-x-0', '-translate-x-14', '-translate-x-14'];

// ── Material Picker Modal ─────────────────────────────────────────────────────

const MaterialPickerModal = ({ tab, setTab, search, setSearch, selected, onToggle, onClose }) => {
    const ref = useRef(null);
    useEffect(() => {
        const h = (e) => { if (!ref.current?.contains(e.target)) onClose(); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [onClose]);

    const items = (MOCK_LIBRARY[tab] ?? []).filter(i => i.title.toLowerCase().includes(search.toLowerCase()));

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
                    {Object.keys(MOCK_LIBRARY).map(t => (
                        <button key={t} onClick={() => setTab(t)}
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
                <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1.5">
                    {items.length === 0 && (
                        <div className="py-10 flex flex-col items-center gap-2 text-slate-300">
                            <span className="material-icons-round text-4xl">search_off</span>
                            <p className="text-[13px]">Nothing found</p>
                        </div>
                    )}
                    {items.map(item => {
                        const checked = selected[tab]?.includes(item.id);
                        return (
                            <button key={item.id} onClick={() => onToggle(tab, item.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${checked ? `${TAB_CONFIG[tab].bg} border-primary/20 ring-1 ring-primary/20` : 'border-slate-100 hover:bg-slate-50'}`}>
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${checked ? TAB_CONFIG[tab].bg : 'bg-slate-100'}`}>
                                    <span className={`material-icons-round text-[16px] ${checked ? TAB_CONFIG[tab].color : 'text-slate-400'}`}>{TAB_CONFIG[tab].icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-semibold text-slate-800 truncate">{item.title}</p>
                                    <p className="text-[11px] text-slate-400">{item.sub}</p>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${checked ? 'bg-primary border-primary' : 'border-slate-300'}`}>
                                    {checked && <span className="material-icons-round text-white text-[12px]">check</span>}
                                </div>
                            </button>
                        );
                    })}
                </div>
                <div className="px-4 py-3 border-t border-slate-100 shrink-0">
                    <button onClick={onClose} className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold text-[14px] transition-all active:scale-[0.98]">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Sprint card (landing list) ────────────────────────────────────────────────

const SprintCard = ({ sprint, onOpen }) => {
    const pct  = sprint.totalChallenges > 0 ? Math.round((sprint.completedChallenges / sprint.totalChallenges) * 100) : 0;
    const meta = STATUS_META[sprint.status] ?? STATUS_META.active;
    return (
        <div onClick={() => onOpen(sprint)}
            className="group bg-white rounded-2xl p-5 cursor-pointer border border-transparent hover:border-primary/10 hover:-translate-y-1 transition-all duration-200"
            style={{ boxShadow: '0 10px 30px rgba(44,47,50,0.06)' }}>
            <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-icons-round text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                </div>
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide ${meta.badge}`}>{meta.label}</span>
            </div>
            <h3 className="text-[15px] font-semibold text-slate-900 leading-snug mb-1 group-hover:text-primary transition-colors">{sprint.title}</h3>
            <p className="text-[11px] text-slate-400 mb-4">{sprint.startDate} – {sprint.endDate} · {sprint.totalChallenges} challenges</p>
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Progress</span>
                    <span className="text-[10px] font-semibold text-primary">{sprint.completedChallenges}/{sprint.totalChallenges}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                </div>
            </div>
        </div>
    );
};

// ── Sprints landing ───────────────────────────────────────────────────────────

const SprintsLanding = ({ sprints, onCreate, onOpen }) => {
    const active    = sprints.filter(s => s.status === 'active');
    const completed = sprints.filter(s => s.status === 'completed');
    const totalDone = sprints.reduce((s, x) => s + x.completedChallenges, 0);

    return (
        <div className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 min-w-0 overflow-x-hidden pb-28" style={{ background: '#F8F9FA' }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-[15px] md:text-2xl font-semibold text-slate-900 mb-1">Sprints</h1>
                    <p className="text-[10px] md:text-[11px] text-slate-400 uppercase tracking-widest font-semibold">AI-powered learning challenges</p>
                </div>
                <button onClick={onCreate}
                    className="flex items-center gap-2 px-3 md:px-5 py-2 md:py-3 rounded-full bg-primary text-white text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">
                    <span className="material-icons-round text-[16px]">add_circle</span>
                    <span className="hidden sm:inline">New Sprint</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 md:gap-6 mb-8">
                {[
                    { label: 'Active Sprints',     value: active.length,    icon: 'bolt',          bg: 'bg-violet-100',  text: 'text-violet-600'  },
                    { label: 'Completed',           value: completed.length, icon: 'military_tech', bg: 'bg-emerald-100', text: 'text-emerald-600' },
                    { label: 'Challenges Done',     value: totalDone,        icon: 'check_circle',  bg: 'bg-amber-100',   text: 'text-amber-600'   },
                ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-md md:rounded-2xl p-3 md:p-5 flex flex-col md:flex-row md:items-center gap-2 md:gap-4" style={{ boxShadow: '0 10px 30px rgba(44,47,50,0.06)' }}>
                        <div className={`w-8 h-8 md:w-12 md:h-12 ${stat.bg} rounded-xl flex items-center justify-center shrink-0`}>
                            <span className={`material-icons-round text-[16px] md:text-[22px] ${stat.text}`}>{stat.icon}</span>
                        </div>
                        <div>
                            <p className="text-[8px] md:text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-xl md:text-2xl font-semibold text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty state */}
            {sprints.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-4">
                        <span className="material-icons-round text-primary text-[40px]">bolt</span>
                    </div>
                    <h3 className="text-slate-800 font-semibold text-xl mb-2">No sprints yet</h3>
                    <p className="text-slate-400 text-sm max-w-xs leading-relaxed mb-6">Create your first AI-powered sprint and start a structured learning journey.</p>
                    <button onClick={onCreate} className="flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-white text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">
                        <span className="material-icons-round text-[16px]">add_circle</span>
                        Create Sprint
                    </button>
                </div>
            )}

            {active.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-4">Active</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {active.map(s => <SprintCard key={s.id} sprint={s} onOpen={onOpen} />)}
                    </div>
                </div>
            )}

            {completed.length > 0 && (
                <div>
                    <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-4">Completed</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {completed.map(s => <SprintCard key={s.id} sprint={s} onOpen={onOpen} />)}
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Sprint creation wizard ────────────────────────────────────────────────────

const WIZARD_STEPS = [
    { label: 'Setup',     icon: 'edit_note'     },
    { label: 'Materials', icon: 'library_books' },
    { label: 'Review',    icon: 'check_circle'  },
];

const SprintCreateWizard = ({ onBack, onCreated }) => {
    const [step, setStep] = useState(1);

    // Step 1
    const [name,      setName]      = useState('');
    const [goal,      setGoal]      = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate,   setEndDate]   = useState('');

    // Step 2
    const [selected,      setSelected]      = useState({ Notes: [], Papers: [], Slides: [], Flashcards: [] });
    const [pickerOpen,    setPickerOpen]    = useState(false);
    const [pickerTab,     setPickerTab]     = useState('Notes');
    const [pickerSearch,  setPickerSearch]  = useState('');
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const fileRef = useRef(null);

    const totalSelected = Object.values(selected).reduce((a, b) => a + b.length, 0);
    const selectedCount = (tab) => selected[tab]?.length ?? 0;
    const toggleMaterial = (tab, id) =>
        setSelected(prev => ({ ...prev, [tab]: prev[tab].includes(id) ? prev[tab].filter(x => x !== id) : [...prev[tab], id] }));

    const durationDays = startDate && endDate
        ? Math.max(1, Math.round((new Date(endDate) - new Date(startDate)) / 86400000) + 1)
        : null;

    const canNext = step === 1
        ? name.trim() && startDate && endDate && new Date(endDate) >= new Date(startDate)
        : true;

    return (
        <div className="flex-1 h-full overflow-y-auto lg:ml-64 pt-16 lg:pt-0" style={{ background: '#F8F9FA' }}>

            {/* Top bar */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur px-4 md:px-6 py-4 flex items-center justify-between border-b border-slate-100">
                <button onClick={onBack} className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-semibold text-[14px] transition-colors">
                    <span className="material-icons-round text-[20px]">arrow_back</span>
                    <span className="hidden sm:inline">Sprints</span>
                </button>

                {/* Step indicators */}
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
                                    { label: 'Start Date', val: startDate, set: setStartDate, min: ''        },
                                    { label: 'End Date',   val: endDate,   set: setEndDate,   min: startDate },
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
                                    placeholder="Mention specific topics to focus on, an exam date, or what you find hardest..."
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
                            <p className="text-slate-500 text-[15px]">Select content from your library or upload custom files. The AI will study everything you add.</p>
                        </div>

                        {/* Library grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(TAB_CONFIG).map(([tab, cfg]) => {
                                const cnt = selectedCount(tab);
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
                                    {Object.entries(selected).flatMap(([tab, ids]) =>
                                        ids.map(id => {
                                            const item = MOCK_LIBRARY[tab]?.find(i => i.id === id);
                                            if (!item) return null;
                                            return (
                                                <div key={id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold ${TAB_CONFIG[tab].bg} ${TAB_CONFIG[tab].color}`}>
                                                    <span className="material-icons-round text-[13px]">{TAB_CONFIG[tab].icon}</span>
                                                    <span className="truncate max-w-[120px]">{item.title}</span>
                                                    <button onClick={() => toggleMaterial(tab, id)} className="opacity-60 hover:opacity-100 transition-opacity">
                                                        <span className="material-icons-round text-[13px]">close</span>
                                                    </button>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Upload custom files */}
                        <div className="bg-white rounded-2xl p-5 md:p-6" style={{ boxShadow: '0 10px 30px rgba(44,47,50,0.06)' }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
                                    <span className="material-icons-round text-slate-500 text-[18px]">upload_file</span>
                                </div>
                                <div>
                                    <p className="text-[13px] font-semibold text-slate-800">Upload custom files</p>
                                    <p className="text-[11px] text-slate-400">PDF, DOCX, TXT — up to 10 MB each</p>
                                </div>
                            </div>
                            <button onClick={() => fileRef.current?.click()}
                                className="w-full border-2 border-dashed border-slate-200 rounded-xl py-7 flex flex-col items-center gap-2 text-slate-400 hover:border-primary/40 hover:text-primary transition-all">
                                <span className="material-icons-round text-[30px]">cloud_upload</span>
                                <span className="text-[13px] font-semibold">Click to upload or drag files here</span>
                            </button>
                            <input ref={fileRef} type="file" multiple accept=".pdf,.docx,.txt" className="hidden"
                                onChange={e => { setUploadedFiles(prev => [...prev, ...Array.from(e.target.files)]); e.target.value = ''; }} />
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

                        {/* Plan limit notice */}
                        <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 rounded-xl border border-amber-100">
                            <span className="material-icons-round text-amber-500 text-[18px] mt-0.5">info</span>
                            <p className="text-[12px] text-amber-800 leading-relaxed">
                                <span className="font-semibold">Starter plan:</span> up to 30 pages of content per sprint. Upgrade to Pro for 100+ pages.
                            </p>
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

                        {/* Summary */}
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
                                                {Object.entries(selected).flatMap(([tab, ids]) => ids.map(id => {
                                                    const item = MOCK_LIBRARY[tab]?.find(i => i.id === id);
                                                    return item ? (
                                                        <span key={id} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${TAB_CONFIG[tab].bg} ${TAB_CONFIG[tab].color}`}>{item.title}</span>
                                                    ) : null;
                                                }))}
                                                {uploadedFiles.map((f, i) => (
                                                    <span key={i} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">{f.name}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* What happens next */}
                        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 10px 30px rgba(44,47,50,0.06)' }}>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-4">What happens next</p>
                            <div className="space-y-3">
                                {[
                                    { icon: 'psychology',        text: 'The AI reads and analyses all your selected materials' },
                                    { icon: 'map',               text: `Creates a roadmap of challenges across your ${durationDays ?? '?'} days` },
                                    { icon: 'shuffle',           text: 'Each challenge gets a unique mix of quizzes, concepts, and reading tasks' },
                                    { icon: 'bolt',              text: 'First 5 challenges are fully built and ready immediately' },
                                    { icon: 'mark_email_unread', text: "You'll get an email when your sprint is ready to begin" },
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
                                <p className="text-[12px] text-slate-500">Estimated generation time: <span className="font-semibold text-slate-700">2–4 minutes</span></p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Fixed bottom nav */}
            <div className="fixed bottom-0 left-0 lg:left-64 right-0 z-50 flex justify-between items-center px-6 py-4 bg-white/95 backdrop-blur border-t border-slate-100">
                <button onClick={step > 1 ? () => setStep(s => s - 1) : onBack}
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
                    <button onClick={() => onCreated({ name, goal, startDate, endDate })}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-semibold text-[13px] shadow-md shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">
                        <span className="material-icons-round text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                        Create Sprint
                    </button>
                )}
            </div>

            {pickerOpen && (
                <MaterialPickerModal tab={pickerTab} setTab={setPickerTab} search={pickerSearch} setSearch={setPickerSearch}
                    selected={selected} onToggle={toggleMaterial} onClose={() => setPickerOpen(false)} />
            )}
        </div>
    );
};

// ── Generating screen ─────────────────────────────────────────────────────────

const GENERATING_PHASES = [
    'Reading your materials...',
    'Analysing key concepts...',
    'Planning your challenge roadmap...',
    'Building the first 5 challenges...',
    'Almost done...',
];

const SprintGenerating = ({ sprintName, onDone, onLeave }) => {
    const [phase,   setPhase]   = useState(0);
    const [seconds, setSeconds] = useState(180);

    useEffect(() => {
        const t = setInterval(() => setPhase(p => Math.min(p + 1, GENERATING_PHASES.length - 1)), 36000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const t = setInterval(() => {
            setSeconds(s => {
                if (s <= 1) { clearInterval(t); return 0; }
                return s - 1;
            });
        }, 1000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => { if (seconds === 0) onDone(); }, [seconds, onDone]);

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const pct  = Math.round(((180 - seconds) / 180) * 100);

    return (
        <div className="flex-1 lg:ml-64 min-h-screen flex flex-col items-center justify-center p-6" style={{ background: '#F8F9FA' }}>
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/8 rounded-full blur-3xl" />
                <div className="absolute bottom-10 -left-10 w-60 h-60 bg-indigo-400/8 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-md text-center">
                <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                    <div className="relative w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                        <span className="material-icons-round text-white text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                    </div>
                </div>

                <h2 className="text-2xl font-semibold text-slate-900 mb-1">Building your sprint</h2>
                <p className="text-[14px] text-slate-500 mb-1">{sprintName}</p>
                <p className="text-[13px] text-primary font-semibold mb-8">{GENERATING_PHASES[phase]}</p>

                <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-[12px] text-slate-400 mb-8">
                    ~{mins}:{String(secs).padStart(2, '0')} remaining
                </p>

                <div className="bg-white rounded-2xl p-6 text-left space-y-4" style={{ boxShadow: '0 10px 30px rgba(44,47,50,0.06)' }}>
                    <p className="text-[13px] text-slate-600 leading-relaxed">
                        This usually takes <span className="font-semibold text-slate-800">2–4 minutes</span>. You can safely close this tab — we'll send you an email when your sprint is ready.
                    </p>
                    <div className="flex gap-3">
                        <button onClick={onLeave}
                            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-[13px] hover:bg-slate-50 transition-all active:scale-95">
                            Leave &amp; get email
                        </button>
                        <button onClick={onDone}
                            className="flex-1 py-2.5 rounded-xl bg-primary text-white font-semibold text-[13px] hover:bg-primary/90 transition-all active:scale-95">
                            Wait here
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Duolingo roadmap ──────────────────────────────────────────────────────────

const SprintRoadmap = ({ sprint, onBack }) => {
    const [selectedId, setSelectedId] = useState(null);
    const pct = sprint.totalChallenges > 0
        ? Math.round((sprint.completedChallenges / sprint.totalChallenges) * 100) : 0;

    const selected = sprint.challenges.find(c => c.id === selectedId) ?? null;

    const toggleSelect = (id) => setSelectedId(prev => prev === id ? null : id);

    return (
        <div className="flex-1 lg:ml-64 min-w-0 flex flex-col" style={{ background: '#F8F9FA', minHeight: '100vh' }}>

            {/* Header */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-100 px-4 md:px-8 pt-16 lg:pt-4 pb-4">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors shrink-0">
                        <span className="material-icons-round text-[18px]">arrow_back</span>
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-[15px] md:text-lg font-semibold text-slate-900 truncate">{sprint.title}</h1>
                        <p className="text-[11px] text-slate-400">{sprint.startDate} – {sprint.endDate} · {sprint.completedChallenges}/{sprint.totalChallenges} challenges done</p>
                    </div>
                    <span className="text-[12px] font-semibold text-primary shrink-0">{pct}%</span>
                </div>
                <div className="mt-3 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary via-indigo-400 to-primary rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                </div>
            </div>

            <div className="flex flex-1 min-h-0">

                {/* ── Roadmap path ── */}
                <div className="flex-1 overflow-y-auto p-4 pt-10 pb-32">
                    <div className="relative flex flex-col items-center" style={{ maxWidth: 320, margin: '0 auto' }}>

                        {/* Continuous background path line */}
                        <div className="absolute top-8 bottom-8 left-1/2 w-0.5 -translate-x-1/2 bg-slate-200 rounded-full" />

                        {sprint.challenges.map((challenge, idx) => {
                            const isAccessible = challenge.status !== 'locked';
                            const isSelected   = selectedId === challenge.id;
                            const zigzag       = ZIGZAG[idx % ZIGZAG.length];

                            // Node visual config
                            const nodeCfg = {
                                completed: { ring: 'ring-emerald-400',  bg: 'bg-emerald-500', textColor: 'text-white',       pulse: false },
                                active:    { ring: 'ring-primary',      bg: 'bg-primary',     textColor: 'text-white',       pulse: true  },
                                ready:     { ring: 'ring-primary/40',   bg: 'bg-white',       textColor: 'text-primary',     pulse: false },
                                locked:    { ring: 'ring-slate-200',    bg: 'bg-slate-100',   textColor: 'text-slate-400',   pulse: false },
                            }[challenge.status] ?? { ring: 'ring-slate-200', bg: 'bg-slate-100', textColor: 'text-slate-400', pulse: false };

                            return (
                                <div key={challenge.id} className="relative z-10 w-full flex flex-col items-center">
                                    {idx > 0 && (
                                        <div className={`w-1.5 h-1.5 rounded-full my-1 transition-colors ${isAccessible ? 'bg-primary/40' : 'bg-slate-200'}`} />
                                    )}

                                    {/* Node + label */}
                                    <div className={`transform ${zigzag} transition-transform duration-300`}>
                                        <div className="flex flex-col items-center">
                                            <button
                                                onClick={() => isAccessible && toggleSelect(challenge.id)}
                                                disabled={!isAccessible}
                                                className={`relative w-16 h-16 rounded-full ring-4 ${nodeCfg.ring} ${nodeCfg.bg} flex items-center justify-center transition-all duration-200
                                                    ${isAccessible ? 'cursor-pointer hover:scale-110 active:scale-95 shadow-lg' : 'cursor-default opacity-60'}
                                                    ${isSelected ? 'scale-110 shadow-xl shadow-primary/30' : ''}
                                                `}
                                            >
                                                {nodeCfg.pulse && <div className="absolute inset-0 rounded-full bg-primary/25 animate-ping" />}

                                                {challenge.status === 'completed' && <span className="material-icons-round text-white text-[22px]">check</span>}
                                                {challenge.status === 'active'    && <span className="material-icons-round text-white text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>}
                                                {challenge.status === 'ready'     && <span className={`font-semibold text-[15px] ${nodeCfg.textColor}`}>{challenge.id}</span>}
                                                {challenge.status === 'locked'    && <span className="material-icons-round text-slate-400 text-[18px]">lock</span>}
                                            </button>

                                            <p className={`text-[10px] font-semibold mt-1.5 ${challenge.status === 'locked' ? 'text-slate-300' : 'text-slate-500'}`}>
                                                {challenge.date}
                                            </p>
                                            <p className={`text-[9px] mt-0.5 text-center max-w-[80px] leading-snug ${challenge.status === 'locked' ? 'text-slate-300' : 'text-slate-400'}`}>
                                                {challenge.dayLabel}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Inline expanded panel (mobile) */}
                                    {isSelected && (
                                        <div className="lg:hidden mt-3 w-72 bg-white rounded-2xl p-5 shadow-lg border border-slate-100 text-left z-20 animate-[fadeIn_0.15s_ease]">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-0.5">{challenge.dayLabel}</p>
                                                    <h3 className="text-[15px] font-semibold text-slate-900">{challenge.title}</h3>
                                                </div>
                                                <button onClick={() => setSelectedId(null)} className="text-slate-400 hover:text-slate-600 transition-colors ml-2 mt-0.5 shrink-0">
                                                    <span className="material-icons-round text-[18px]">close</span>
                                                </button>
                                            </div>
                                            <p className="text-[12px] text-slate-500 leading-relaxed mb-4">{challenge.description}</p>
                                            {challenge.components.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {challenge.components.map(type => {
                                                        const m = COMPONENT_META[type];
                                                        return (
                                                            <span key={type} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${m.bg} ${m.color}`}>
                                                                <span className="material-icons-round text-[12px]">{m.icon}</span>
                                                                {m.label}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            <button className="w-full py-2.5 bg-primary text-white rounded-xl font-semibold text-[13px] hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-2">
                                                <span className="material-icons-round text-[16px]">play_arrow</span>
                                                {challenge.status === 'completed' ? 'Review' : challenge.status === 'active' ? 'Continue' : 'Start Challenge'}
                                            </button>
                                        </div>
                                    )}

                                    <div className="h-2" />
                                </div>
                            );
                        })}

                        {/* Finish flag */}
                        <div className="relative z-10 mt-2 flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-white border-4 border-slate-200 flex items-center justify-center shadow-sm">
                                <span className="material-icons-round text-slate-300 text-[20px]">flag</span>
                            </div>
                            <p className="text-[10px] text-slate-300 font-semibold mt-1.5">{sprint.endDate}</p>
                        </div>
                    </div>
                </div>

                {/* ── Desktop right panel ── */}
                <div className="hidden lg:flex w-88 xl:w-96 border-l border-slate-100 flex-col p-6 overflow-y-auto shrink-0" style={{ background: '#fff', width: 360 }}>
                    {selected ? (
                        <>
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-0.5">{selected.dayLabel}</p>
                                    <h2 className="text-[18px] font-semibold text-slate-900 leading-snug">{selected.title}</h2>
                                </div>
                                <button onClick={() => setSelectedId(null)} className="text-slate-400 hover:text-slate-600 transition-colors mt-0.5 shrink-0 ml-3">
                                    <span className="material-icons-round text-[20px]">close</span>
                                </button>
                            </div>

                            <p className="text-[13px] text-slate-500 leading-relaxed mb-6">{selected.description}</p>

                            {selected.components.length > 0 && (
                                <div className="space-y-2.5 mb-6">
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">This challenge includes</p>
                                    {selected.components.map(type => {
                                        const m = COMPONENT_META[type];
                                        return (
                                            <div key={type} className={`flex items-center gap-3 p-3 rounded-xl ${m.bg}`}>
                                                <span className={`material-icons-round text-[18px] ${m.color}`}>{m.icon}</span>
                                                <span className={`text-[13px] font-semibold ${m.color}`}>{m.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <button className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-[14px] hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md shadow-primary/20 mt-auto">
                                <span className="material-icons-round text-[18px]">play_arrow</span>
                                {selected.status === 'completed' ? 'Review Challenge' : selected.status === 'active' ? 'Continue Challenge' : 'Start Challenge'}
                            </button>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                                <span className="material-icons-round text-primary text-[28px]">touch_app</span>
                            </div>
                            <p className="text-[14px] font-semibold text-slate-700 mb-1">Select a challenge</p>
                            <p className="text-[12px] text-slate-400 leading-relaxed">Tap any unlocked node on the roadmap to see what's inside</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

// ── Main orchestrator ─────────────────────────────────────────────────────────

export default function Sprint() {
    const [screen,       setScreen]       = useState('list');
    const [activeSprint, setActiveSprint] = useState(null);
    const [pendingName,  setPendingName]  = useState('');

    if (screen === 'create') {
        return (
            <SprintCreateWizard
                onBack={() => setScreen('list')}
                onCreated={(data) => { setPendingName(data.name); setScreen('generating'); }}
            />
        );
    }

    if (screen === 'generating') {
        return (
            <SprintGenerating
                sprintName={pendingName}
                onDone={() => { setActiveSprint(MOCK_SPRINTS[0]); setScreen('roadmap'); }}
                onLeave={() => setScreen('list')}
            />
        );
    }

    if (screen === 'roadmap' && activeSprint) {
        return <SprintRoadmap sprint={activeSprint} onBack={() => setScreen('list')} />;
    }

    return (
        <SprintsLanding
            sprints={MOCK_SPRINTS}
            onCreate={() => setScreen('create')}
            onOpen={(sprint) => { setActiveSprint(sprint); setScreen('roadmap'); }}
        />
    );
}
