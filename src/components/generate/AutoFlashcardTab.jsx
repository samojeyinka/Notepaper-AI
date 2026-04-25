import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { usePlan } from '../../hooks/usePlan';
import { flashcardService } from '../../api/flashcardService';
import { TEMPLATES } from '../flashcard/flashcardTemplates';
import GenerateFromContent from './GenerateFromContent';
import LimitBanner from './LimitBanner';

const google = createGoogleGenerativeAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const CARD_COUNTS = [5, 10, 15, 20, 25, 30];
const FREE_MAX   = 30;

// ── Inline colour picker ──────────────────────────────────────────────────────
const ColorSwatch = ({ label, value, onChange }) => (
    <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors" title={label}>
        <div className="w-4 h-4 rounded-full border border-black/10 shadow-sm shrink-0" style={{ background: value }} />
        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">{label}</span>
        <input type="color" value={value} onChange={e => onChange(e.target.value)} className="absolute opacity-0 w-0 h-0" />
    </label>
);

// ── Word counter ──────────────────────────────────────────────────────────────
const countWords = (str) => str.trim().split(/\s+/).filter(Boolean).length;

// ── Generated card preview ────────────────────────────────────────────────────
const CardPreview = ({ card, index, bgColor, textColor, TemplateDecoration }) => (
    <div
        className="relative rounded-xl overflow-hidden shadow-sm border border-white/60 p-3 flex flex-col gap-1.5"
        style={{ backgroundColor: bgColor, color: textColor, minHeight: '90px' }}
    >
        <TemplateDecoration />
        <div className="relative z-10">
            <p className="text-[9px] font-bold uppercase tracking-widest opacity-50 mb-1">#{index + 1}</p>
            <p className="text-[11px] font-semibold leading-snug line-clamp-2">{card.front}</p>
            <div className="h-px bg-current opacity-10 my-1.5" />
            <p className="text-[10px] opacity-70 leading-snug line-clamp-3">{card.back}</p>
        </div>
    </div>
);

// ── Main component ────────────────────────────────────────────────────────────
export default function AutoFlashcardTab() {
    const navigate = useNavigate();
    const { canUseAI, increment, loaded } = usePlan();

    const [topic,     setTopic]     = useState('');
    const [details,   setDetails]   = useState('');
    const [cardCount, setCardCount] = useState(10);
    const [template,  setTemplate]  = useState('girlies');
    const [bgColor,   setBgColor]   = useState(TEMPLATES.girlies.defaultBg);
    const [textColor, setTextColor] = useState(TEMPLATES.girlies.defaultText);

    const [status,        setStatus]        = useState('idle'); // idle | generating | saving | done | error
    const [cards,         setCards]         = useState([]);
    const [error,         setError]         = useState(null);
    const [saveError,     setSaveError]     = useState(null);
    const [mobilePreview, setMobilePreview] = useState(false);

    const limitReached  = loaded && !canUseAI('ai_flashcard');
    const detailsWords  = countWords(details);
    const detailsOver   = detailsWords > 50;
    const tpl           = TEMPLATES[template] ?? TEMPLATES.girlies;
    const Decoration    = tpl.Decoration;

    const handleTemplateChange = (key) => {
        setTemplate(key);
        setBgColor(TEMPLATES[key].defaultBg);
        setTextColor(TEMPLATES[key].defaultText);
    };

    const handleGenerate = async () => {
        if (!topic.trim() || detailsOver) return;
        setError(null);
        setCards([]);
        setStatus('generating');
        setMobilePreview(true);

        const detailsClause = details.trim()
            ? `\nAdditional context: ${details.trim()}`
            : '';

        const prompt = `Generate exactly ${cardCount} flashcards on this topic: "${topic.trim()}"${detailsClause}

Return ONLY a valid JSON array, no markdown fences, no explanation:
[{"front": "question or term", "back": "answer or definition"}, ...]

Rules:
- front: concise question or term, max 15 words
- back: clear answer or explanation, max 50 words
- Cover distinct aspects of the topic, vary from basic to advanced
- Never repeat the same card`;

        try {
            const { text } = await generateText({
                model:  google('gemini-2.5-flash-lite'),
                prompt,
            });

            let raw = text.trim();
            if (raw.startsWith('```')) raw = raw.replace(/^```[a-z]*\n?/, '').replace(/```$/, '').trim();

            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Invalid response');

            setCards(parsed.slice(0, cardCount));
            setStatus('done');
            increment('ai_flashcard');
        } catch (err) {
            console.error('[AutoFlashcard]', err);
            setError(err.message?.includes('JSON') ? 'AI returned unexpected format — try again.' : 'Generation failed. Please try again.');
            setStatus('error');
        }
    };

    const handleSave = async () => {
        if (!cards.length) return;
        setSaveError(null);
        setStatus('saving');
        try {
            const res = await flashcardService.create({
                title:       topic.trim() || 'AI Flashcards',
                cards,
                template,
                bg_color:    bgColor,
                text_color:  textColor,
                font_family: 'sans',
                font_size:   18,
                is_bold:     false,
                is_italic:   false,
            });
            navigate(`/lockedin/flashcards/${res.data.id}`);
        } catch {
            setSaveError('Could not save. Please try again.');
            setStatus('done');
        }
    };

    const isGenerating = status === 'generating';
    const isSaving     = status === 'saving';
    const isDone       = status === 'done';

    return (
        <>
        <div className="flex-1 p-4 md:p-6 grid grid-cols-12 gap-4 md:gap-6 items-start w-full">

            {/* ── Left — config ──────────────────────────────────────────── */}
            <section className="col-span-12 md:col-span-4 flex flex-col gap-4">

                <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] p-6 flex flex-col gap-5">

                    <div className="flex items-center gap-3">
                        <div className="p-1.5 md:p-2.5 bg-primary/10 rounded-md md:rounded-xl shrink-0">
                            <span className="material-icons-round text-primary text-[15px] md:text-[20px]">style</span>
                        </div>
                        <div>
                            <h2 className="text-[15px] md:text-base font-medium md:font-semibold text-slate-800 leading-tight">Flashcard Generator</h2>
                            <p className="text-[10px] text-slate-400">AI builds your deck from a topic</p>
                        </div>
                    </div>

                    {/* Topic */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Topic *</label>
                        <input
                            type="text"
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            disabled={isGenerating || isSaving}
                            placeholder="e.g. Photosynthesis, World War II..."
                            className="w-full placeholder:text-[12px] text-[12px] md:text-[15px] rounded-lg bg-slate-50 border-none px-2 md:px-4 py-1.5 md:py-3 text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/25 transition disabled:opacity-50"
                        />
                    </div>

                    {/* Details */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Additional Details</label>
                            <span className={`text-[10px] font-medium ${detailsOver ? 'text-red-500' : 'text-slate-400'}`}>
                                {detailsWords}/50 words
                            </span>
                        </div>
                        <textarea
                            rows={3}
                            value={details}
                            onChange={e => setDetails(e.target.value)}
                            disabled={isGenerating || isSaving}
                            placeholder="Narrow the focus, specify difficulty, add key terms to include…"
                            className={`w-full placeholder:text-[12px] text-[12px] md:text-[15px] resize-none rounded-lg bg-slate-50 border-none px-2 py-1.5 md:px-4 md:py-3 text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 transition disabled:opacity-50 ${
                                detailsOver ? 'ring-2 ring-red-300 focus:ring-red-400' : 'focus:ring-primary/25'
                            }`}
                        />
                        {detailsOver && (
                            <p className="text-[10px] text-red-500">Please keep additional details under 50 words.</p>
                        )}
                    </div>

                    {/* Card count */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Number of Cards
                            <span className="ml-1 normal-case font-normal text-slate-300">(max {FREE_MAX} on free)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {CARD_COUNTS.map(n => (
                                <button
                                    key={n}
                                    onClick={() => setCardCount(n)}
                                    disabled={isGenerating || isSaving}
                                    className={`px-2 md:px-3.5 py-1 md:py-2 rounded-full text-xs font-bold transition-all disabled:opacity-50
                                        ${cardCount === n
                                            ? 'bg-primary/15 text-primary'
                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                        }`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Template picker */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Theme</label>
                        <div className="flex items-center gap-2 flex-wrap">
                            {Object.entries(TEMPLATES).map(([key, tplItem]) => (
                                <button
                                    key={key}
                                    onClick={() => handleTemplateChange(key)}
                                    title={tplItem.label}
                                    disabled={isGenerating || isSaving}
                                    className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 disabled:opacity-50 ${
                                        template === key ? 'border-primary scale-110 shadow-md' : 'border-transparent'
                                    }`}
                                    style={{ backgroundColor: tplItem.preview }}
                                />
                            ))}
                            <div className="flex items-center gap-1.5 ml-1">
                                <ColorSwatch label="BG"   value={bgColor}   onChange={setBgColor}   />
                                <ColorSwatch label="Text" value={textColor} onChange={setTextColor} />
                            </div>
                        </div>
                    </div>

                    {limitReached && <LimitBanner message="Free plan allows 1 AI generation per day. Upgrade for more." />}

                    {/* Generate button */}
                    {isGenerating ? (
                        <div className="flex items-center justify-center gap-1.5 md:gap-3 py-2 md:py-4 bg-primary/5 rounded-lg">
                            <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            <span className="text-sm font-medium md:font-semibold text-primary">Generating {cardCount} cards…</span>
                        </div>
                    ) : (
                        <button
                            onClick={handleGenerate}
                            disabled={!topic.trim() || detailsOver || limitReached || !loaded || isSaving}
                            className="w-full py-2 md:py-4 bg-primary text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(101,65,196,0.3)] hover:scale-[0.98] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
                        >
                            {!loaded ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                   
                                    {isDone ? 'Regenerate' : 'Generate'}
                                </>
                            )}
                        </button>
                    )}
                </div>

                <GenerateFromContent
                    description="Upgrade to generate cards from your existing Notepaper content."
                    sources={[
                        { icon: 'description', label: 'From a Note' },
                        { icon: 'article',     label: 'From a Paper' },
                        { icon: 'folder_open', label: 'From a Folder' },
                        { icon: 'slideshow',   label: 'From a Presentation' },
                        { icon: 'style',       label: 'From another Flashcard set' },
                    ]}
                />
            </section>

            {/* ── Right — preview workspace ──────────────────────────────── */}
            <section className="hidden md:block md:col-span-8">
                <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] flex flex-col overflow-hidden relative" style={{ minHeight: '600px' }}>

                    {/* Header */}
                    <div className="px-6 py-4 flex items-center justify-between border-b border-slate-50 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-amber-400" />
                                <div className="w-3 h-3 rounded-full bg-green-400" />
                            </div>
                            <span className="text-xs font-bold text-slate-400 tracking-wide">Card Preview</span>
                            {isDone && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">
                                    {cards.length} cards ready
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8">

                        {/* Empty state */}
                        {status === 'idle' && (
                            <div className="h-full flex flex-col items-center justify-center gap-6 text-center py-5">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150 animate-pulse pointer-events-none" />
                                    <div className="relative w-28 h-28 bg-slate-50 rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
                                        <span className="material-icons-round text-primary text-5xl">style</span>
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-primary/10 p-2 rounded-full shadow-sm">
                                        <span className="material-icons-round text-primary text-[15px]">auto_awesome</span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-semibold text-slate-800 mb-2 tracking-tight">AI Flashcard Generator</h3>
                                    <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                                        Enter a topic on the left and hit <strong className="text-slate-600">Generate Flashcards</strong> to build your study deck instantly.
                                    </p>
                                </div>
                                <div className="grid grid-cols-3 gap-2 w-full max-w-xs opacity-20 pointer-events-none select-none mt-2">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="h-12 bg-slate-100 rounded-xl border-2 border-dashed border-slate-200" />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Generating skeleton */}
                        {isGenerating && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 animate-pulse">
                                {[...Array(cardCount > 9 ? 9 : cardCount)].map((_, i) => (
                                    <div key={i} className="h-24 rounded-xl bg-slate-100" style={{ opacity: 1 - i * 0.08 }} />
                                ))}
                            </div>
                        )}

                        {/* Error */}
                        {status === 'error' && (
                            <div className="flex items-center gap-2 text-red-500 text-sm mt-4">
                                <span className="material-icons-round text-[18px]">error_outline</span>
                                {error}
                            </div>
                        )}

                        {/* Generated cards grid */}
                        {isDone && cards.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {cards.map((card, i) => (
                                    <CardPreview
                                        key={i}
                                        card={card}
                                        index={i}
                                        bgColor={bgColor}
                                        textColor={textColor}
                                        TemplateDecoration={Decoration}
                                    />
                                ))}
                            </div>
                        )}

                        {saveError && (
                            <p className="mt-3 text-xs text-red-500 text-center">{saveError}</p>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="shrink-0 px-3 md:px-6 py-2 md:py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {isDone ? `${cards.length} cards · ${template} theme` : 'Status: Idle'}
                        </span>
                        <button
                            onClick={handleSave}
                            disabled={!isDone || isSaving}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-xs font-bold hover:scale-[0.98] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-[0_4px_12px_rgba(101,65,196,0.3)]"
                        >
                            {isSaving ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <span className="material-icons-round text-[16px]">save</span>
                            )}
                            {isSaving ? 'Saving…' : 'Save to Library'}
                        </button>
                    </div>

                    {/* Decorative glow */}
                    <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                </div>
            </section>
        </div>

        {/* ── Mobile bottom-sheet ── */}
        {mobilePreview && (
            <div className="md:hidden fixed inset-0 z-50 flex flex-col">
                <div className="absolute inset-0 bg-black/40" onClick={() => !isGenerating && !isSaving && setMobilePreview(false)} />
                <div className="relative mt-auto bg-white rounded-t-2xl flex flex-col shadow-2xl max-h-[80vh]">

                    <div className="px-4 pt-3 pb-3 flex items-center justify-between border-b border-slate-100 shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-1 bg-slate-200 rounded-full absolute left-1/2 -translate-x-1/2 top-2" />
                            <span className="text-sm font-semibold text-slate-700 mt-1">Card Preview</span>
                            {isGenerating && (
                                <span className="flex items-center gap-1 text-[11px] text-primary font-medium animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    Generating {cardCount} cards…
                                </span>
                            )}
                            {isDone && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">{cards.length} cards ready</span>
                            )}
                        </div>
                        {!isGenerating && !isSaving && (
                            <button onClick={() => setMobilePreview(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-icons-round text-[20px]">close</span>
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        {isGenerating && (
                            <div className="grid grid-cols-2 gap-3 animate-pulse">
                                {[...Array(Math.min(cardCount, 6))].map((_, i) => (
                                    <div key={i} className="h-24 rounded-xl bg-slate-100" style={{ opacity: 1 - i * 0.1 }} />
                                ))}
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="flex items-center gap-2 text-red-500 text-sm mt-4">
                                <span className="material-icons-round text-[18px]">error_outline</span>
                                {error}
                            </div>
                        )}
                        {isDone && cards.length > 0 && (
                            <div className="grid grid-cols-2 gap-3">
                                {cards.map((card, i) => (
                                    <CardPreview key={i} card={card} index={i} bgColor={bgColor} textColor={textColor} TemplateDecoration={Decoration} />
                                ))}
                            </div>
                        )}
                        {saveError && <p className="mt-3 text-xs text-red-500 text-center">{saveError}</p>}
                    </div>

                    {isDone && (
                        <div className="shrink-0 px-4 pb-6 pt-3 border-t border-slate-100 flex gap-2">
                            <button onClick={() => setMobilePreview(false)} className="flex-1 py-2.5 rounded-full border border-slate-200 text-slate-500 text-sm font-semibold">
                                Back
                            </button>
                            <button onClick={handleSave} disabled={isSaving} className="flex-1 py-2.5 rounded-full bg-primary text-white text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40">
                                {isSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span className="material-icons-round text-[16px]">save</span>}
                                {isSaving ? 'Saving…' : 'Save to Library'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}
        </>
    );
}
