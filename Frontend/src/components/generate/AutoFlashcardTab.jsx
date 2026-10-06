import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAIKeys } from '../../hooks/useAIKeys';
import { generateWithUserKey, NO_AI_KEY_MESSAGE } from '../../utils/aiRuntime';
import { flashcardService } from '../../api/flashcardService';
import { generateService } from '../../api/generateService';
import { friendlyAIError } from '../../utils/aiErrors';
import { TEMPLATES } from '../flashcard/flashcardTemplates';
import GenerateFromContent from './GenerateFromContent';
import { TAB_CONFIG } from './tabConfig';

const EMPTY_SELECTED = { Notes: [], Papers: [], Slides: [], Flashcards: [] };

const ALL_CARD_COUNTS = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200, 300, 500, 750, 1000];

// ── Inline colour picker ──────────────────────────────────────────────────────
const ColorSwatch = ({ label, value, onChange }) => (
    <label className="flex items-center gap-1.5 px-2.5 py-1.5  bg-stone-100 hover:bg-stone-200 cursor-pointer transition-colors" title={label}>
        <div className="w-4 h-4  border border-black/10 shadow-sm shrink-0" style={{ background: value }} />
        <span className="text-[10px] text-stone-500 font-semibold uppercase tracking-wide">{label}</span>
        <input type="color" value={value} onChange={e => onChange(e.target.value)} className="absolute opacity-0 w-0 h-0" />
    </label>
);

// ── Word counter ──────────────────────────────────────────────────────────────
const countWords = (str) => str.trim().split(/\s+/).filter(Boolean).length;

// ── Generated card preview ────────────────────────────────────────────────────
const CardPreview = (props) => (
    <div
        className="relative  overflow-hidden shadow-sm border border-white/60 p-3 flex flex-col gap-1.5"
        style={{ backgroundColor: props.bgColor, color: props.textColor, minHeight: '90px' }}
    >
        <props.TemplateDecoration />
        <div className="relative z-10">
            <p className="text-[9px] font-bold uppercase tracking-widest opacity-50 mb-1">#{props.index + 1}</p>
            <p className="text-[11px] font-semibold leading-snug line-clamp-2">{props.card.front}</p>
            <div className="h-px bg-current opacity-10 my-1.5" />
            <p className="text-[10px] opacity-70 leading-snug line-clamp-3">{props.card.back}</p>
        </div>
    </div>
);

// ── Main component ────────────────────────────────────────────────────────────
export default function AutoFlashcardTab() {
    const navigate = useNavigate();
    const { hasKeys, openModal, loaded } = useAIKeys();

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

    // Content sources
    const [selected,      setSelected]      = useState(EMPTY_SELECTED);
    const [uploadedFiles, setUploadedFiles] = useState([]);

    const totalSelected  = Object.values(selected).reduce((a, b) => a + b.length, 0);
    const hasContent     = totalSelected > 0 || uploadedFiles.length > 0;

    const maxDetails    = 200;
    const detailsWords  = countWords(details);
    const detailsOver   = detailsWords > maxDetails;
    const CARD_COUNTS   = ALL_CARD_COUNTS;
    const tpl           = TEMPLATES[template] ?? TEMPLATES.girlies;
    const Decoration    = tpl.Decoration;

    const handleTemplateChange = (key) => {
        setTemplate(key);
        setBgColor(TEMPLATES[key].defaultBg);
        setTextColor(TEMPLATES[key].defaultText);
    };

    const handleGenerate = async () => {
        if ((!topic.trim() && !hasContent) || detailsOver) return;
        setError(null);
        setCards([]);
        setStatus('generating');
        setMobilePreview(true);

        // ── Backend: generate from selected content ───────────────────────────
        if (hasContent) {
            const materialIds = Object.entries(selected).flatMap(([tab, items]) =>
                items.map(item => ({ type: TAB_CONFIG[tab].type, id: item.id }))
            );
            try {
                const topicWithDetails = [topic.trim(), details.trim()].filter(Boolean).join(' — ') || undefined;
                const res = await generateService.flashcards({
                    materialIds,
                    uploads: uploadedFiles,
                    count:   cardCount,
                    topic:   topicWithDetails,
                });
                const result = res?.data?.cards ?? res?.cards ?? [];
                setCards(result);
                setStatus('done');
            } catch (err) {
                const msg = Object.values(err?.errors ?? {})?.[0]?.[0] ?? err?.message ?? 'Generation failed. Please try again.';
                setError(msg);
                setStatus('error');
            }
            return;
        }

        // ── Frontend: generate from topic only ────────────────────────────────
        const detailsClause = details.trim() ? `\nAdditional context: ${details.trim()}` : '';
        const prompt = `Generate exactly ${cardCount} flashcards on this topic: "${topic.trim()}"${detailsClause}

Return ONLY a valid JSON array, no markdown fences, no explanation:
[{"front": "question or term", "back": "answer or definition"}, ...]

Rules:
- front: concise question or term, max 15 words
- back: clear answer or explanation, max 50 words
- Cover distinct aspects of the topic, vary from basic to advanced
- Never repeat the same card`;

        try {
            if (!hasKeys) {
                openModal();
                setError(NO_AI_KEY_MESSAGE);
                setStatus('error');
                return;
            }

            const { text } = await generateWithUserKey({ prompt });

            let raw = text.trim();
            if (raw.startsWith('```')) raw = raw.replace(/^```[a-z]*\n?/, '').replace(/```$/, '').trim();

            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Invalid response');

            setCards(parsed.slice(0, cardCount));
            setStatus('done');
        } catch (err) {
            console.error('[AutoFlashcard]', err);
            setError(err.message?.includes('JSON') ? 'AI returned unexpected format — try again.' : friendlyAIError(err, 'Generation failed. Please try again.'));
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

                <div className="bg-white ring-1 ring-stone-200/70 p-6 flex flex-col gap-5">

                    <div className="flex items-center gap-3">
                      
                        <div>
                            <h2 className="font-display-serif text-[17px] font-semibold text-stone-900 leading-tight">Flashcard studio</h2>
                            <p className="text-[10px] text-stone-400">Study cards, made from any topic</p>
                        </div>
                    </div>

                    {/* Topic */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Topic *</label>
                        <input
                            type="text"
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            disabled={isGenerating || isSaving}
                            placeholder="e.g. Photosynthesis, World War II..."
                            className="w-full placeholder:text-[12px] text-[12px] md:text-[15px]  bg-stone-50 border-none px-2 md:px-4 py-1.5 md:py-3 text-sm text-stone-700 placeholder-stone-400 outline-none focus:ring-2 focus:ring-plum-200 transition disabled:opacity-50"
                        />
                    </div>

                    {/* Details */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Additional Details</label>
                            <span className={`text-[10px] font-medium ${detailsOver ? 'text-red-500' : 'text-stone-400'}`}>
                                {detailsWords}/{maxDetails} words
                            </span>
                        </div>
                        <textarea
                            rows={3}
                            value={details}
                            onChange={e => setDetails(e.target.value)}
                            disabled={isGenerating || isSaving}
                            placeholder="Narrow the focus, specify difficulty, add key terms to include…"
                            className={`w-full placeholder:text-[12px] text-[12px] md:text-[15px] resize-none  bg-stone-50 border-none px-2 py-1.5 md:px-4 md:py-3 text-sm text-stone-700 placeholder-stone-400 outline-none focus:ring-2 transition disabled:opacity-50 ${
                                detailsOver ? 'ring-2 ring-red-300 focus:ring-red-400' : 'focus:ring-plum-200'
                            }`}
                        />
                        {detailsOver && (
                            <p className="text-[10px] text-red-500">Please keep additional details under {maxDetails} words.</p>
                        )}
                    </div>

                    {/* Card count */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                            Number of Cards
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {CARD_COUNTS.map(n => (
                                <button
                                    key={n}
                                    onClick={() => setCardCount(n)}
                                    disabled={isGenerating || isSaving}
                                    className={`px-2 md:px-3.5 py-1 md:py-2  text-[8px] md:text-[10px] md:font-bold transition-all disabled:opacity-50
                                        ${cardCount === n
                                            ? 'bg-stone-900 text-white'
                                            : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                                        }`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Template picker */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Theme</label>
                        <div className="flex items-center gap-2 flex-wrap">
                            {Object.entries(TEMPLATES).map(([key, tplItem]) => (
                                <button
                                    key={key}
                                    onClick={() => handleTemplateChange(key)}
                                    title={tplItem.label}
                                    disabled={isGenerating || isSaving}
                                    className={`w-7 h-7  border-2 transition-all hover:scale-110 disabled:opacity-50 ${
                                        template === key ? 'border-plum-600 scale-110 shadow-md' : 'border-transparent'
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

                    {/* Generate button */}
                    {isGenerating ? (
                        <div className="flex items-center justify-center gap-1.5 md:gap-3 py-2 md:py-4 bg-plum-50/70 ">
                            <span className="w-5 h-5 border-2 border-plum-600/30 border-t-primary  animate-spin" />
                            <span className="text-sm font-medium md:font-semibold text-plum-700">Generating {cardCount} cards…</span>
                        </div>
                    ) : (
                        <button
                            onClick={handleGenerate}
                            disabled={(!topic.trim() && !hasContent) || detailsOver || !loaded || isSaving}
                            className="w-full py-2 md:py-4 bg-stone-900 text-white  font-semibold text-sm flex items-center justify-center gap-2 hover:scale-[0.98] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
                        >
                            {!loaded ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white  animate-spin" />
                            ) : (
                                <>
                                    
                                    {isDone ? 'Regenerate' : hasContent ? 'Generate from Content' : 'Generate'}
                                </>
                            )}
                        </button>
                    )}
                </div>

                <GenerateFromContent
                    description="Generate cards from your existing Notepaper content."
                    sources={[
                        { icon: 'description', label: 'From a Note' },
                        { icon: 'article',     label: 'From a Paper' },
                        { icon: 'folder_open', label: 'From a Folder' },
                        { icon: 'slideshow',   label: 'From a Presentation' },
                        { icon: 'style',       label: 'From another Flashcard set' },
                    ]}
                    selected={selected}
                    onSelectedChange={setSelected}
                    uploadedFiles={uploadedFiles}
                    onUploadedFilesChange={setUploadedFiles}
                />
            </section>

            {/* ── Right — preview workspace ──────────────────────────────── */}
            <section className="hidden md:block md:col-span-8">
                <div className="bg-white ring-1 ring-stone-200/70 flex flex-col overflow-hidden relative" style={{ minHeight: '600px' }}>

                    {/* Header */}
                    <div className="px-6 py-4 flex items-center justify-between border-b border-stone-50 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                            </div>
                            <span className="text-xs font-bold text-stone-400 tracking-wide">Card Preview</span>
                            {isDone && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700  text-[10px] font-bold">
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
                                    <div className="absolute inset-0 " />
                                    <div className="relative w-28 h-28 bg-stone-50  flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
                                        <span className="material-icons-round text-plum-700 text-5xl">style</span>
                                    </div>
                                 
                                </div>
                                <div>
                                    <h3 className="font-display-serif text-[22px] font-semibold text-stone-900 mb-2 tracking-tight">Turn a topic into cards</h3>
                                    <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
                                        Enter a topic on the left and hit <strong className="text-stone-600">Generate Flashcards</strong> to build your study deck instantly.
                                    </p>
                                </div>
                                <div className="grid grid-cols-3 gap-2 w-full max-w-xs opacity-20 pointer-events-none select-none mt-2">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="h-12 bg-stone-100  border-2 border-dashed border-stone-200" />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Generating skeleton */}
                        {isGenerating && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 animate-pulse">
                                {[...Array(cardCount > 9 ? 9 : cardCount)].map((_, i) => (
                                    <div key={i} className="h-24  bg-stone-100" style={{ opacity: 1 - i * 0.08 }} />
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
                    <div className="shrink-0 px-3 md:px-6 py-2 md:py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-3">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                            {isDone ? `${cards.length} cards · ${template} theme` : 'Status: Idle'}
                        </span>
                        <button
                            onClick={handleSave}
                            disabled={!isDone || isSaving}
                            className="flex items-center gap-2 px-5 py-2.5  bg-stone-900 text-white text-xs font-bold hover:scale-[0.98] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition "
                        >
                            {isSaving ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white  animate-spin" />
                            ) : (
                                <>
                                    <span className="material-icons-round text-[16px]">save</span>
                                    Save to Library
                                </>
                            )}
                        </button>
                    </div>

                </div>
            </section>
        </div>

        {/* ── Mobile bottom-sheet ── */}
        {mobilePreview && (
            <div className="md:hidden fixed inset-0 z-50 flex flex-col">
                <div className="absolute inset-0 bg-black/40" onClick={() => !isGenerating && !isSaving && setMobilePreview(false)} />
                <div className="relative mt-auto bg-white flex flex-col shadow-[0_-12px_36px_rgba(28,25,23,0.18)] max-h-[80vh]">

                    <div className="px-4 pt-3 pb-3 flex items-center justify-between border-b border-stone-100 shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-1 bg-stone-200  absolute left-1/2 -translate-x-1/2 top-2" />
                            <span className="text-sm font-semibold text-stone-700 mt-1">Card Preview</span>
                            {isGenerating && (
                                <span className="flex items-center gap-1 text-[11px] text-plum-700 font-medium animate-pulse">
                                    <span className="w-1.5 h-1.5  bg-primary" />
                                    Generating {cardCount} cards…
                                </span>
                            )}
                            {isDone && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700  text-[10px] font-bold">{cards.length} cards ready</span>
                            )}
                        </div>
                        {!isGenerating && !isSaving && (
                            <button onClick={() => setMobilePreview(false)} className="p-1.5  text-stone-400 hover:text-stone-600 transition-colors">
                                <span className="material-icons-round text-[20px]">close</span>
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        {isGenerating && (
                            <div className="grid grid-cols-2 gap-3 animate-pulse">
                                {[...Array(Math.min(cardCount, 6))].map((_, i) => (
                                    <div key={i} className="h-24  bg-stone-100" style={{ opacity: 1 - i * 0.1 }} />
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
                        <div className="shrink-0 px-4 pb-6 pt-3 border-t border-stone-100 flex gap-2">
                            <button onClick={() => setMobilePreview(false)} className="flex-1 py-2.5  border border-stone-200 text-stone-500 text-sm font-semibold">
                                Back
                            </button>
                            <button onClick={handleSave} disabled={isSaving} className="flex-1 py-2.5  bg-stone-900 text-white text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40">
                                {isSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white  animate-spin" /> : <><span className="material-icons-round text-[16px]">save</span>Save to Library</>}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}
        </>
    );
}
