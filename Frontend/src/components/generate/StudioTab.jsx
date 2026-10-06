import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAIKeys } from '../../hooks/useAIKeys';
import { generateWithUserKey, NO_AI_KEY_MESSAGE } from '../../utils/aiRuntime';
import { apiClient } from '../../api/apiClient';
import { flashcardService } from '../../api/flashcardService';
import { quizService } from '../../api/quizService';
import { presentationService } from '../../api/presentationService';
import { TEMPLATES } from '../flashcard/flashcardTemplates';
import { invalidateQuizzesCache } from '../quizzes/Quizzes';

// ── Content source tabs ───────────────────────────────────────────────────────
const SOURCES = [
    { key: 'note',         label: 'Notes',       icon: 'description', endpoint: '/workspace/notes'         },
    { key: 'paper',        label: 'Papers',       icon: 'article',     endpoint: '/workspace/papers'        },
    { key: 'presentation', label: 'Slides',       icon: 'slideshow',   endpoint: '/workspace/presentations' },
    { key: 'flashcard',    label: 'Flashcards',   icon: 'style',       endpoint: '/workspace/flashcards'    },
];

// ── Output types ──────────────────────────────────────────────────────────────
const OUTPUT_TYPES = [
    { id: 'flashcard',    label: 'Flashcard Set', icon: 'style',       color: 'text-primary',   bg: 'bg-primary/10'   },
    { id: 'quiz',         label: 'Quiz',          icon: 'quiz',        color: 'text-rose-600',  bg: 'bg-rose-100'     },
    { id: 'presentation', label: 'Presentation',  icon: 'slideshow',   color: 'text-indigo-600',bg: 'bg-indigo-100'   },
];

// ── Extract readable text from API responses ──────────────────────────────────
const extractText = (type, data) => {
    if (type === 'note' || type === 'paper') {
        try {
            const parsed = JSON.parse(data.content ?? '{}');
            return (parsed.pages ?? []).filter(Boolean).join('\n\n');
        } catch {
            return data.content ?? '';
        }
    }
    if (type === 'flashcard') {
        const cards = data.cards ?? [];
        return cards.map(c => `Q: ${c.front}\nA: ${c.back}`).join('\n\n');
    }
    if (type === 'presentation') {
        const slides = typeof data.slides === 'string' ? JSON.parse(data.slides) : (data.slides ?? []);
        return slides.map(s => [s.title, ...(s.bullets ?? [])].join('\n')).join('\n\n');
    }
    return '';
};

// ── Content picker ────────────────────────────────────────────────────────────
const ContentPicker = ({ selected, onToggle }) => {
    const [activeSource, setActiveSource]   = useState('note');
    const [items,        setItems]          = useState([]);
    const [page,         setPage]           = useState(1);
    const [lastPage,     setLastPage]       = useState(1);
    const [loadingItems, setLoadingItems]   = useState(false);
    const [search,       setSearch]         = useState('');
    const searchTimer = useRef(null);

    const src = SOURCES.find(s => s.key === activeSource);

    const load = (pg, q) => {
        setLoadingItems(true);
        const qs = new URLSearchParams({ page: pg });
        if (q) qs.set('searching', q);
        apiClient(`${src.endpoint}?${qs}`)
            .then(res => {
                const rows = res.data ?? res;
                setItems(Array.isArray(rows) ? rows : (rows.data ?? []));
                setLastPage(res.last_page ?? 1);
            })
            .catch(() => setItems([]))
            .finally(() => setLoadingItems(false));
    };

    useEffect(() => {
        setPage(1);
        setItems([]);
        load(1, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSource]);

    const handleSearch = (v) => {
        setSearch(v);
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => { setPage(1); load(1, v); }, 350);
    };

    const loadMore = () => {
        const next = page + 1;
        setPage(next);
        setLoadingItems(true);
        const qs = new URLSearchParams({ page: next });
        if (search) qs.set('searching', search);
        apiClient(`${src.endpoint}?${qs}`)
            .then(res => {
                const rows = res.data ?? res;
                setItems(prev => [...prev, ...(Array.isArray(rows) ? rows : (rows.data ?? []))]);
                setLastPage(res.last_page ?? 1);
            })
            .catch(() => {})
            .finally(() => setLoadingItems(false));
    };

    return (
        <div className="flex flex-col gap-3">
            {/* Source tabs */}
            <div className="flex gap-1.5 flex-wrap">
                {SOURCES.map(s => (
                    <button
                        key={s.key}
                        onClick={() => setActiveSource(s.key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5  text-[11px] font-semibold transition-all ${
                            activeSource === s.key
                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                        }`}
                    >
                        <span className="material-icons-round text-[13px]">{s.icon}</span>
                        {s.label}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[16px]">search</span>
                <input
                    type="text"
                    value={search}
                    onChange={e => handleSearch(e.target.value)}
                    placeholder={`Search ${src.label.toLowerCase()}…`}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50  text-[13px] text-stone-700 placeholder-stone-400 border-none outline-none focus:ring-2 focus:ring-primary/25 transition"
                />
            </div>

            {/* Items list */}
            <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto">
                {loadingItems && items.length === 0 && (
                    <div className="flex justify-center py-6">
                        <span className="w-5 h-5 border-2 border-primary/30 border-t-primary  animate-spin" />
                    </div>
                )}
                {!loadingItems && items.length === 0 && (
                    <p className="text-center text-[12px] text-stone-400 py-6">No {src.label.toLowerCase()} found</p>
                )}
                {items.map(item => {
                    const key = `${activeSource}:${item.id}`;
                    const isChecked = selected.some(s => s.key === key);
                    return (
                        <button
                            key={item.id}
                            onClick={() => onToggle({ key, type: activeSource, id: item.id, title: item.title })}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5  text-left transition-all ${
                                isChecked
                                    ? 'bg-primary/8 ring-1 ring-primary/30'
                                    : 'bg-stone-50 hover:bg-stone-100'
                            }`}
                        >
                            <div className={`w-4 h-4  border-2 flex items-center justify-center shrink-0 transition-all ${
                                isChecked ? 'bg-primary border-primary' : 'border-stone-300'
                            }`}>
                                {isChecked && <span className="material-icons-round text-white text-[11px]">check</span>}
                            </div>
                            <span className="material-icons-round text-stone-400 text-[15px]">{src.icon}</span>
                            <span className="text-[13px] text-stone-700 font-medium flex-1 truncate">{item.title ?? 'Untitled'}</span>
                        </button>
                    );
                })}
                {page < lastPage && (
                    <button
                        onClick={loadMore}
                        disabled={loadingItems}
                        className="text-[11px] text-primary font-semibold py-2 hover:underline disabled:opacity-50"
                    >
                        {loadingItems ? 'Loading…' : 'Load more'}
                    </button>
                )}
            </div>
        </div>
    );
};

// ── Output settings ───────────────────────────────────────────────────────────
const CARD_COUNTS    = [5, 10, 15, 20, 25, 30];
const QUESTION_COUNTS = [5, 10, 15, 20];
const SLIDE_COUNTS   = [5, 8, 10, 12, 15, 20];
const DIFFICULTIES   = ['easy', 'medium', 'hard'];

const OutputSettings = ({ outputType, settings, onChange }) => {
    const set = (k, v) => onChange({ ...settings, [k]: v });

    if (outputType === 'flashcard') return (
        <div className="space-y-3">
            <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2">Number of cards</label>
                <div className="flex flex-wrap gap-2">
                    {CARD_COUNTS.map(n => (
                        <button key={n} onClick={() => set('count', n)}
                            className={`px-3 py-1.5  text-[11px] font-bold transition-all ${
                                settings.count === n ? 'bg-primary/15 text-primary' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                            }`}>{n}</button>
                    ))}
                </div>
            </div>
            <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2">Theme</label>
                <div className="flex gap-2 flex-wrap">
                    {Object.entries(TEMPLATES).map(([key, tpl]) => (
                        <button key={key} onClick={() => set('template', key)} title={tpl.label}
                            className={`w-7 h-7  border-2 transition-all hover:scale-110 ${
                                settings.template === key ? 'border-primary scale-110 shadow-md' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: tpl.preview }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );

    if (outputType === 'quiz') return (
        <div className="space-y-3">
            <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2">Questions</label>
                <div className="flex gap-2">
                    {QUESTION_COUNTS.map(n => (
                        <button key={n} onClick={() => set('count', n)}
                            className={`flex-1 py-2  text-[11px] font-bold transition-all ${
                                settings.count === n ? 'bg-rose-100 text-rose-600' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                            }`}>{n}</button>
                    ))}
                </div>
            </div>
            <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2">Difficulty</label>
                <div className="flex gap-2">
                    {DIFFICULTIES.map(d => (
                        <button key={d} onClick={() => set('difficulty', d)}
                            className={`flex-1 py-1.5  text-[11px] font-semibold capitalize transition-all ${
                                settings.difficulty === d
                                    ? d === 'easy' ? 'bg-emerald-500 text-white' : d === 'medium' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
                                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                            }`}>{d}</button>
                    ))}
                </div>
            </div>
            <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2">Type</label>
                <div className="flex gap-2">
                    {[{id:'multiple',label:'Multiple choice'},{id:'input',label:'Short answer'},{id:'both',label:'Mixed'}].map(t => (
                        <button key={t.id} onClick={() => set('qType', t.id)}
                            className={`flex-1 py-1.5  text-[10px] font-semibold transition-all ${
                                settings.qType === t.id ? 'bg-primary/10 text-primary ring-1 ring-primary/30' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                            }`}>{t.label}</button>
                    ))}
                </div>
            </div>
        </div>
    );

    if (outputType === 'presentation') return (
        <div className="space-y-3">
            <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2">Slide count</label>
                <div className="flex flex-wrap gap-2">
                    {SLIDE_COUNTS.map(n => (
                        <button key={n} onClick={() => set('count', n)}
                            className={`px-3 py-1.5  text-[11px] font-bold transition-all ${
                                settings.count === n ? 'bg-indigo-100 text-indigo-600' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                            }`}>{n}</button>
                    ))}
                </div>
            </div>
            <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2">Theme</label>
                <div className="flex gap-2 flex-wrap">
                    {['modern','minimal','academic','bold','pastel'].map(t => (
                        <button key={t} onClick={() => set('theme', t)}
                            className={`px-3 py-1.5  text-[11px] font-semibold capitalize transition-all ${
                                settings.theme === t ? 'bg-indigo-100 text-indigo-600 ring-1 ring-indigo-300' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                            }`}>{t}</button>
                    ))}
                </div>
            </div>
        </div>
    );

    return null;
};

// ── Main ──────────────────────────────────────────────────────────────────────
export default function StudioTab() {
    const navigate  = useNavigate();
    const { hasKeys, openModal, loaded } = useAIKeys();

    // Step: 'source' | 'settings' | 'generating' | 'done' | 'saving'
    const [step,       setStep]       = useState('source');
    const [selected,   setSelected]   = useState([]);  // {key, type, id, title}
    const [pasteText,  setPasteText]  = useState('');
    const [outputType, setOutputType] = useState('flashcard');
    const [settings,   setSettings]   = useState({ count: 10, template: 'girlies', difficulty: 'medium', qType: 'multiple', theme: 'modern' });
    const [result,     setResult]     = useState(null);
    const [error,      setError]      = useState(null);
    const [saveError,  setSaveError]  = useState(null);

    const hasContent = selected.length > 0 || pasteText.trim().length > 0;

    const toggleItem = (item) => {
        setSelected(prev =>
            prev.some(s => s.key === item.key)
                ? prev.filter(s => s.key !== item.key)
                : [...prev, item]
        );
    };

    const fetchAllContent = async () => {
        const parts = [];

        for (const item of selected) {
            try {
                const endpoint =
                    item.type === 'flashcard'    ? `/workspace/flashcards/${item.id}` :
                    item.type === 'presentation' ? `/workspace/presentations/${item.id}` :
                    item.type === 'paper'        ? `/workspace/papers/${item.id}` :
                    `/workspace/notes/${item.id}`;

                const res  = await apiClient(endpoint);
                const data = res.data ?? res;
                const text = extractText(item.type, data);
                if (text.trim()) parts.push(`--- ${item.title} ---\n${text}`);
            } catch {
                // skip item if fetch fails
            }
        }

        if (pasteText.trim()) parts.push(`--- Pasted text ---\n${pasteText.trim()}`);
        return parts.join('\n\n');
    };

    const buildPrompt = (contentText) => {
        const { count, difficulty, qType } = settings;

        if (outputType === 'flashcard') {
            return `Based on the following source material, generate exactly ${count} flashcards.

SOURCE MATERIAL:
${contentText}

Return ONLY a valid JSON array, no markdown, no explanation:
[{"front":"question or term","back":"answer or definition"},...]

Rules:
- front: concise question/term, max 15 words
- back: clear answer/explanation, max 50 words
- Cover the key concepts from the source material
- Never repeat cards`;
        }

        if (outputType === 'quiz') {
            const typeInstr =
                qType === 'multiple' ? 'All questions must be multiple choice with exactly 4 options.' :
                qType === 'input'    ? 'All questions must be short-answer (no options).' :
                                       'Mix multiple choice and short-answer roughly 50/50.';
            return `Based on the following source material, generate exactly ${count} quiz questions.
Difficulty: ${difficulty}. ${typeInstr}

SOURCE MATERIAL:
${contentText}

Return ONLY a valid JSON array, no markdown, no explanation:
[
  {"type":"multiple","question":"...","options":["A","B","C","D"],"correct":0,"explanation":"..."},
  {"type":"input","question":"...","correct":"exact answer","explanation":"..."}
]

Rules:
- "correct" for multiple choice is the 0-based index of the right option
- "explanation" is 1-2 sentences
- Base questions strictly on the provided material`;
        }

        if (outputType === 'presentation') {
            return `Based on the following source material, generate exactly ${settings.count} presentation slides.

SOURCE MATERIAL:
${contentText}

Return ONLY a valid JSON array, no markdown, no explanation:
[{"slide":1,"layout":"title"|"content"|"section"|"closing","title":"string","bullets":["string"],"speaker_notes":"string"},...]

Rules:
- First slide must be layout "title"
- Last slide must be layout "closing"
- Every slide title: max 8 words
- Every bullet: max 15 words
- 2-5 bullets per slide
- speaker_notes: 1-2 sentences
- Summarise and structure the source material across all ${settings.count} slides`;
        }

        return '';
    };

    const handleGenerate = async () => {
        setError(null);
        setSaveError(null);
        setResult(null);
        setStep('generating');

        try {
            if (!hasKeys) {
                openModal();
                setError(NO_AI_KEY_MESSAGE);
                setStep('settings');
                return;
            }

            const contentText = await fetchAllContent();
            if (!contentText.trim()) throw new Error('Could not extract content from your selections.');

            const prompt = buildPrompt(contentText);
            let { text: raw } = await generateWithUserKey({ prompt });
            raw = raw.trim();
            if (raw.startsWith('```')) raw = raw.replace(/^```[a-z]*\n?/, '').replace(/```$/, '').trim();

            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Invalid AI response');

            setResult(parsed);
            setStep('done');
        } catch (err) {
            setError(err.message?.includes('JSON') ? 'AI returned unexpected format — try again.' : (err.message || 'Generation failed.'));
            setStep('settings');
        }
    };

    const handleSave = async () => {
        if (!result?.length) return;
        setSaveError(null);
        setStep('saving');

        const title = selected.length > 0
            ? selected.map(s => s.title).join(', ').slice(0, 60)
            : 'AI Studio — ' + outputType;

        try {
            if (outputType === 'flashcard') {
                const tpl = TEMPLATES[settings.template] ?? TEMPLATES.girlies;
                const res = await flashcardService.create({
                    title,
                    cards: result,
                    template:    settings.template,
                    bg_color:    tpl.defaultBg,
                    text_color:  tpl.defaultText,
                    font_family: 'sans',
                    font_size:   18,
                    is_bold:     false,
                    is_italic:   false,
                });
                navigate(`/lockedin/flashcards/${res.data.id}`);
            } else if (outputType === 'quiz') {
                const res = await quizService.create({
                    title,
                    subject:        'auto',
                    difficulty:     settings.difficulty,
                    question_type:  settings.qType,
                    question_count: result.length,
                    questions:      result,
                });
                invalidateQuizzesCache();
                navigate(`/lockedin/quizzes/${res?.data?.id ?? res?.id}/play`);
            } else if (outputType === 'presentation') {
                const res = await presentationService.create({
                    title,
                    slides:      JSON.stringify(result),
                    theme:       settings.theme,
                    slide_count: result.length,
                });
                navigate(`/lockedin/presentations/${res.data.id}`);
            }
        } catch {
            setSaveError('Could not save. Please try again.');
            setStep('done');
        }
    };

    // ── Generating state ──────────────────────────────────────────────────────
    if (step === 'generating') {
        return (
            <div className="flex flex-col items-center justify-center h-full py-24 gap-5">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 bg-primary/10  animate-pulse" />
                    <div className="absolute inset-2 bg-primary/20  animate-ping" />
                    <div className="relative w-full h-full flex items-center justify-center">
                        <span className="material-icons-round text-primary text-[36px]">auto_awesome</span>
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-[15px] font-semibold text-stone-800">Generating…</p>
                    <p className="text-[12px] text-stone-400 mt-1">Reading your content and building {outputType === 'flashcard' ? 'flashcards' : outputType === 'quiz' ? 'quiz questions' : 'slides'}</p>
                </div>
            </div>
        );
    }

    // ── Done state — result summary ───────────────────────────────────────────
    if (step === 'done' || step === 'saving') {
        const isSaving = step === 'saving';
        const count = result?.length ?? 0;
        const meta = OUTPUT_TYPES.find(o => o.id === outputType);

        return (
            <div className="flex flex-col items-center justify-center h-full py-16 gap-6 px-4">
                <div className={`w-20 h-20 ${meta.bg}  flex items-center justify-center`}>
                    <span className={`material-icons-round text-[40px] ${meta.color}`}>{meta.icon}</span>
                </div>
                <div className="text-center">
                    <p className="text-[13px] font-semibold text-stone-400 uppercase tracking-widest">{meta.label} ready</p>
                    <p className="text-4xl font-bold text-stone-900 mt-1">{count}</p>
                    <p className="text-[13px] text-stone-500 mt-0.5">
                        {outputType === 'flashcard' ? 'cards' : outputType === 'quiz' ? 'questions' : 'slides'} generated
                    </p>
                </div>
                <div className="flex flex-col items-center gap-2 max-w-xs w-full">
                    {saveError && <p className="text-[12px] text-red-500">{saveError}</p>}
                    <button onClick={handleSave} disabled={isSaving}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white  font-semibold text-[14px] hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-[0.98] shadow-md shadow-primary/20">
                        {isSaving
                            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white  animate-spin" />
                            : <><span className="material-icons-round text-[18px]">save</span> Save to Library</>
                        }
                    </button>
                    <button onClick={() => { setStep('source'); setResult(null); setSelected([]); setPasteText(''); }}
                        disabled={isSaving}
                        className="w-full py-2.5 border border-stone-200 text-stone-500  text-[13px] font-semibold hover:bg-stone-50 transition-all disabled:opacity-40">
                        Start over
                    </button>
                </div>
            </div>
        );
    }

    // ── Main wizard (source + settings) ──────────────────────────────────────
    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 max-w-2xl mx-auto w-full">

            {/* Step 1: Select content */}
            <div className="bg-white  shadow-[0_8px_32px_rgba(0,0,0,0.06)] p-5 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8  bg-primary text-white flex items-center justify-center text-[12px] font-bold shrink-0">1</div>
                    <div>
                        <h3 className="text-[14px] font-semibold text-stone-800">Select your source content</h3>
                        <p className="text-[11px] text-stone-400">Pick items from your workspace or paste text below</p>
                    </div>
                </div>

                <ContentPicker selected={selected} onToggle={toggleItem} />

                {/* Selected chips */}
                {selected.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {selected.map(s => (
                            <span key={s.key} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary  text-[11px] font-semibold">
                                {s.title.slice(0, 28)}{s.title.length > 28 ? '…' : ''}
                                <button onClick={() => toggleItem(s)} className="hover:text-primary/60">
                                    <span className="material-icons-round text-[13px]">close</span>
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                {/* Paste text */}
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="material-icons-round text-[13px]">edit_note</span>
                        Or paste your own text
                    </label>
                    <textarea
                        rows={4}
                        value={pasteText}
                        onChange={e => setPasteText(e.target.value)}
                        placeholder="Paste notes, articles, textbook passages, or any text here…"
                        className="w-full resize-none  bg-stone-50 border-none px-4 py-3 text-[13px] text-stone-700 placeholder-stone-400 outline-none focus:ring-2 focus:ring-primary/25 transition"
                    />
                </div>
            </div>

            {/* Step 2: Output type + settings */}
            <div className="bg-white  shadow-[0_8px_32px_rgba(0,0,0,0.06)] p-5 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8  bg-primary text-white flex items-center justify-center text-[12px] font-bold shrink-0">2</div>
                    <div>
                        <h3 className="text-[14px] font-semibold text-stone-800">Choose what to generate</h3>
                        <p className="text-[11px] text-stone-400">Pick an output type and configure the settings</p>
                    </div>
                </div>

                {/* Output type buttons */}
                <div className="grid grid-cols-3 gap-2">
                    {OUTPUT_TYPES.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setOutputType(t.id)}
                            className={`flex flex-col items-center gap-2 py-3 px-2  border-2 transition-all ${
                                outputType === t.id
                                    ? `${t.bg} border-current/20 ring-1 ring-current/20`
                                    : 'bg-stone-50 border-transparent hover:bg-stone-100'
                            }`}
                        >
                            <span className={`material-icons-round text-[22px] ${outputType === t.id ? t.color : 'text-stone-400'}`}>{t.icon}</span>
                            <span className={`text-[10px] font-bold leading-tight text-center ${outputType === t.id ? t.color : 'text-stone-500'}`}>{t.label}</span>
                        </button>
                    ))}
                </div>

                <OutputSettings outputType={outputType} settings={settings} onChange={setSettings} />
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 text-red-500 text-[12px] bg-red-50 px-4 py-3 ">
                    <span className="material-icons-round text-[16px]">error_outline</span>
                    {error}
                </div>
            )}

            {/* Generate button */}
            <button
                onClick={handleGenerate}
                disabled={!hasContent || !loaded}
                className="w-full py-4 bg-primary text-white  font-semibold text-[15px] flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(101,65,196,0.3)] hover:scale-[0.99] active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none transition-all"
            >
                {!loaded
                    ? <span className="w-5 h-5 border-2 border-white/30 border-t-white  animate-spin" />
                    : <><span className="material-icons-round text-[20px]">auto_awesome</span> Generate</>
                }
            </button>
        </div>
    );
}
