import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAIKeys } from '../../hooks/useAIKeys';
import { generateWithUserKey, NO_AI_KEY_MESSAGE } from '../../utils/aiRuntime';
import { presentationService } from '../../api/presentationService';
import { generateService } from '../../api/generateService';
import { friendlyAIError } from '../../utils/aiErrors';
import GenerateFromContent from './GenerateFromContent';
import { TAB_CONFIG } from './tabConfig';

const EMPTY_SELECTED = { Notes: [], Papers: [], Slides: [], Flashcards: [] };

const THEMES = [
    { id: 'modern',    label: 'Modern',    gradient: 'from-stone-900 to-stone-700',      accent: '#6366f1' },
    { id: 'minimal',   label: 'Minimal',   gradient: 'from-white to-stone-50',           accent: '#0f172a', dark: true },
    { id: 'academic',  label: 'Academic',  gradient: 'from-blue-900 to-blue-700',        accent: '#60a5fa' },
    { id: 'bold',      label: 'Bold',      gradient: 'from-violet-700 to-fuchsia-600',   accent: '#f0abfc' },
    { id: 'pastel',    label: 'Pastel',    gradient: 'from-pink-100 to-indigo-100',      accent: '#8b5cf6', dark: true },
];

const ALL_SLIDE_COUNTS = [5, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150];

const countWords = (str) => str.trim().split(/\s+/).filter(Boolean).length;

// ── Slide mini-preview ────────────────────────────────────────────────────────
const SlidePreview = ({ slide, theme, index }) => {
    const isTitle   = slide.layout === 'title';
    const isSection = slide.layout === 'section';

    return (
        <div
            className={`relative  overflow-hidden shadow-sm border border-white/10 p-3 flex flex-col gap-1.5 bg-gradient-to-br ${theme.gradient} ${theme.dark ? 'border-stone-200' : ''}`}
            style={{ minHeight: '90px' }}
        >
            <p className="text-[8px] font-bold uppercase tracking-widest opacity-40 text-white" style={{ color: theme.dark ? '#666' : undefined }}>
                #{index + 1} · {slide.layout}
            </p>
            <p
                className={`font-bold leading-snug line-clamp-2 ${isTitle || isSection ? 'text-[12px]' : 'text-[11px]'}`}
                style={{ color: theme.accent }}
            >
                {slide.title}
            </p>
            {slide.bullets?.slice(0, 2).map((b, i) => (
                <p key={i} className="text-[9px] opacity-60 line-clamp-1" style={{ color: theme.dark ? '#444' : '#e2e8f0' }}>
                    • {b}
                </p>
            ))}
        </div>
    );
};

// ── Main component ────────────────────────────────────────────────────────────
export default function AutoPresentationTab() {
    const navigate = useNavigate();
    const { hasKeys, openModal, loaded } = useAIKeys();

    const [topic,      setTopic]      = useState('');
    const [details,    setDetails]    = useState('');
    const [slideCount, setSlideCount] = useState(10);
    const [theme,      setTheme]      = useState('modern');

    const [status,       setStatus]       = useState('idle'); // idle | generating | saving | done | error
    const [slides,       setSlides]       = useState([]);
    const [progress,     setProgress]     = useState('');
    const [error,        setError]        = useState(null);
    const [saveError,    setSaveError]    = useState(null);
    const [mobilePreview, setMobilePreview] = useState(false);

    // Content sources
    const [selected,      setSelected]      = useState(EMPTY_SELECTED);
    const [uploadedFiles, setUploadedFiles] = useState([]);

    const totalSelected = Object.values(selected).reduce((a, b) => a + b.length, 0);
    const hasContent    = totalSelected > 0 || uploadedFiles.length > 0;

    const maxDetails        = 200;
    const detailsWords      = countWords(details);
    const detailsOver       = detailsWords > maxDetails;
    const activeTheme       = THEMES.find(t => t.id === theme) ?? THEMES[0];
    const SLIDE_COUNT_OPTIONS = ALL_SLIDE_COUNTS;

    const handleGenerate = async () => {
        if ((!topic.trim() && !hasContent) || detailsOver) return;
        setError(null);
        setSlides([]);
        setStatus('generating');
        setProgress('Crafting slides…');
        setMobilePreview(true);

        // ── Backend: generate from selected content ───────────────────────────
        if (hasContent) {
            const materialIds = Object.entries(selected).flatMap(([tab, items]) =>
                items.map(item => ({ type: TAB_CONFIG[tab].type, id: item.id }))
            );
            try {
                const topicWithDetails = [topic.trim(), details.trim()].filter(Boolean).join(' — ') || undefined;
                const res = await generateService.presentation({
                    materialIds,
                    uploads:     uploadedFiles,
                    slide_count: slideCount,
                    topic:       topicWithDetails,
                });
                const result = res?.data?.slides ?? res?.slides ?? [];
                setSlides(result);
                setStatus('done');
            } catch (err) {
                const msg = Object.values(err?.errors ?? {})?.[0]?.[0] ?? err?.message ?? 'Generation failed. Please try again.';
                setError(msg);
                setStatus('error');
            }
            return;
        }

        // ── Frontend: generate from topic only ────────────────────────────────
        const detailsClause = details.trim() ? `\n\nAdditional context: ${details.trim()}` : '';

        const systemPrompt = `You are a presentation slide generator.
Given a topic, generate exactly ${slideCount} presentation slides in JSON format.

STRICT RULES:
- Return ONLY a valid JSON array, nothing else — no markdown fences, no explanation
- Each slide must have: { "slide": number, "layout": "title"|"content"|"section"|"closing", "title": string, "bullets": string[], "speaker_notes": string }
- The first slide must be layout "title" with a title and subtitle in bullets
- The last slide must be layout "closing" (e.g. "Thank You" / "Questions?")
- Every slide title: max 8 words
- Every bullet point: max 15 words
- Total words across title + bullets on a single slide: STRICTLY max 70 words
- Bullets per slide: 2–5 points
- speaker_notes: 1–2 sentences (not counted toward word limit)
- Spread content evenly across all ${slideCount} slides
- Use section slides (layout: "section") to separate major topics
- Be clear, professional, and educational`;

        const userPrompt = `Generate ${slideCount} slides for a presentation titled "${topic.trim()}"${detailsClause}`;

        try {
            if (!hasKeys) {
                openModal();
                setError(NO_AI_KEY_MESSAGE);
                setStatus('error');
                return;
            }

            const { text } = await generateWithUserKey({ system: systemPrompt, prompt: userPrompt });

            setProgress('Processing slides…');

            let raw = text.trim();
            if (raw.startsWith('```')) raw = raw.replace(/^```[a-z]*\n?/, '').replace(/```$/, '').trim();

            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Invalid slide data');

            setSlides(parsed);
            setStatus('done');
        } catch (err) {
            console.error('[AutoPresentation]', err);
            setError(err.message?.includes('JSON') ? 'AI returned unexpected format — try again.' : friendlyAIError(err, 'Generation failed. Please try again.'));
            setStatus('error');
        }
    };

    const handleSave = async () => {
        if (!slides.length) return;
        setSaveError(null);
        setStatus('saving');
        try {
            const res = await presentationService.create({
                title:       topic.trim() || 'AI Presentation',
                slides:      JSON.stringify(slides),
                theme,
                slide_count: slides.length,
            });
            navigate(`/lockedin/presentations/${res.data.id}`);
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
                            <h2 className="font-display-serif text-[17px] font-semibold text-stone-900 leading-tight">Slide studio</h2>
                            <p className="text-[10px] text-stone-400">Decks, built from your notes</p>
                        </div>
                    </div>

                    {/* Topic */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Topic / Title *</label>
                        <input
                            type="text"
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            disabled={isGenerating || isSaving}
                            placeholder="e.g. Climate Change, Machine Learning Basics…"
                            className="w-full placeholder:text-[12px] text-[12px] md:text-[15px]   md: bg-stone-50 border-none px-2 md:px-4 py-1.5 md:py-3 text-stone-700 placeholder-stone-400 outline-none focus:ring-2 focus:ring-plum-200 transition disabled:opacity-50"
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
                            placeholder="Audience, key points to cover, tone, level of detail…"
                            className={`w-full resize-none placeholder:text-[12px] text-[12px] md:text-[15px]   md: bg-stone-50 border-none md:px-4 py-1.5 md:py-3 text-stone-700 placeholder-stone-400 outline-none focus:ring-2 transition disabled:opacity-50 ${
                                detailsOver ? 'ring-2 ring-red-300 focus:ring-red-400' : 'focus:ring-plum-200'
                            }`}
                        />
                        {detailsOver && (
                            <p className="text-[10px] text-red-500">Please keep additional details under {maxDetails} words.</p>
                        )}
                    </div>

                    {/* Slide count */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                            Number of Slides
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {SLIDE_COUNT_OPTIONS.map(n => (
                                <button
                                    key={n}
                                    onClick={() => setSlideCount(n)}
                                    disabled={isGenerating || isSaving}
                                    className={`p-2  text-[8px] md:text-[10px] md:font-medium transition-all disabled:opacity-50
                                        ${slideCount === n
                                            ? 'bg-stone-900 text-white'
                                            : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                                        }`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Theme */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Design Theme</label>
                        <div className="grid grid-cols-5 gap-2">
                            {THEMES.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setTheme(t.id)}
                                    disabled={isGenerating || isSaving}
                                    className={`flex flex-col items-center gap-1.5 p-2  border transition-all disabled:opacity-50 ${
                                        theme === t.id ? 'border-plum-600 bg-plum-50/70' : 'border-stone-100 hover:border-stone-200'
                                    }`}
                                >
                                    <div className={`w-full h-7  bg-gradient-to-br ${t.gradient} ${t.dark ? 'border border-stone-200' : ''}`} />
                                    <span className={`text-[9px] font-semibold ${theme === t.id ? 'text-plum-700' : 'text-stone-400'}`}>{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Generate button */}
                    {isGenerating ? (
                        <div className="flex flex-col items-center gap-3 py-4 bg-plum-50/70 ">
                            <span className="w-5 h-5 border-2 border-plum-600/30 border-t-primary  animate-spin" />
                            <div className="text-center">
                                <p className="text-sm font-semibold text-plum-700">Generating {slideCount} slides…</p>
                                <p className="text-[10px] text-stone-400 mt-0.5">{progress}</p>
                            </div>
                            <div className="w-full px-4">
                                <div className="h-1.5 bg-stone-200  overflow-hidden">
                                    <div className="h-full bg-primary  animate-pulse" style={{ width: '60%' }} />
                                </div>
                            </div>
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
                    description="Generate slides directly from your Notepaper content."
                    sources={[
                        { icon: 'article',     label: 'From a Paper' },
                        { icon: 'description', label: 'From a Note' },
                        { icon: 'folder_open', label: 'From a Folder' },
                        { icon: 'style',       label: 'From a Flashcard set' },
                    ]}
                    selected={selected}
                    onSelectedChange={setSelected}
                    uploadedFiles={uploadedFiles}
                    onUploadedFilesChange={setUploadedFiles}
                />
            </section>

            {/* ── Right — slide preview workspace ───────────────────────── */}
            <section className="hidden md:block md:col-span-8">
                <div className="bg-white ring-1 ring-stone-200/70 flex flex-col overflow-hidden relative" style={{ minHeight: '600px' }}>

                    {/* Header */}
                    <div className="px-6 py-4 flex items-center justify-between border-b border-stone-50 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                            </div>
                            <span className="text-xs font-bold text-stone-400 tracking-wide">Slide Preview</span>
                            {isDone && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700  text-[10px] font-bold">
                                    {slides.length} slides ready
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8">

                        {/* Empty state */}
                        {status === 'idle' && (
                            <div className="h-full flex flex-col items-center justify-center gap-6 text-center py-10">
                                <div className="relative">
                                    <div className="absolute inset-0 " />
                                    <div className="relative w-28 h-28 bg-stone-50  flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
                                        <span className="material-icons-round text-plum-700 text-5xl">slideshow</span>
                                    </div>
                
                                </div>
                                <div>
                                    <h3 className="font-display-serif text-[22px] font-semibold text-stone-900 mb-2 tracking-tight">Turn notes into slides</h3>
                                    <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
                                        Enter a topic and hit <strong className="text-stone-600">Generate Slides</strong> to build a polished deck instantly.
                                    </p>
                                </div>
                                <div className="grid grid-cols-3 gap-2 w-full max-w-xs opacity-20 pointer-events-none select-none mt-2">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="h-16  bg-stone-100" />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Generating skeleton */}
                        {isGenerating && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 animate-pulse">
                                {[...Array(slideCount > 9 ? 9 : slideCount)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-24  bg-gradient-to-br from-stone-100 to-stone-200"
                                        style={{ opacity: 1 - i * 0.08 }}
                                    />
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

                        {/* Generated slides grid */}
                        {isDone && slides.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {slides.map((slide, i) => (
                                    <SlidePreview
                                        key={i}
                                        slide={slide}
                                        theme={activeTheme}
                                        index={i}
                                    />
                                ))}
                            </div>
                        )}

                        {saveError && (
                            <p className="mt-3 text-xs text-red-500 text-center">{saveError}</p>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="shrink-0 px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-3">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                            {isDone ? `${slides.length} slides · ${activeTheme.label} theme` : isGenerating ? 'Generating…' : 'Status: Idle'}
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
                                    Save Presentation
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
                <div className="relative mt-auto bg-white flex flex-col shadow-[0_-12px_36px_rgba(28,25,23,0.18)] max-h-[85vh]">

                    <div className="px-4 pt-3 pb-3 flex items-center justify-between border-b border-stone-100 shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-1 bg-stone-200  absolute left-1/2 -translate-x-1/2 top-2" />
                            <span className="text-sm font-semibold text-stone-700 mt-1">Slide Preview</span>
                            {isGenerating && (
                                <span className="flex items-center gap-1 text-[11px] text-plum-700 font-medium animate-pulse">
                                    <span className="w-1.5 h-1.5  bg-primary" />
                                    Generating {slideCount} slides…
                                </span>
                            )}
                            {isDone && slides.length > 0 && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700  text-[10px] font-bold">{slides.length} slides ready</span>
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
                                {[...Array(Math.min(slideCount, 6))].map((_, i) => (
                                    <div key={i} className="h-20  bg-stone-100" style={{ opacity: 1 - i * 0.1 }} />
                                ))}
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="flex items-center gap-2 text-red-500 text-sm mt-4">
                                <span className="material-icons-round text-[18px]">error_outline</span>
                                {error}
                            </div>
                        )}
                        {isDone && slides.length > 0 && (
                            <div className="grid grid-cols-2 gap-3">
                                {slides.map((slide, i) => (
                                    <SlidePreview key={i} slide={slide} theme={activeTheme} index={i} />
                                ))}
                            </div>
                        )}
                        {saveError && <p className="mt-3 text-xs text-red-500 text-center">{saveError}</p>}
                    </div>

                    {isDone && slides.length > 0 && (
                        <div className="shrink-0 px-4 pb-6 pt-3 border-t border-stone-100 flex gap-2">
                            <button onClick={() => setMobilePreview(false)} className="flex-1 py-2.5  border border-stone-200 text-stone-500 text-sm font-semibold">
                                Back
                            </button>
                            <button onClick={handleSave} disabled={isSaving} className="flex-1 py-2.5  bg-stone-900 text-white text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40">
                                {isSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white  animate-spin" /> : <><span className="material-icons-round text-[16px]">save</span>Save Presentation</>}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}
        </>
    );
}
