import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { usePlan } from '../../hooks/usePlan';
import { presentationService } from '../../api/presentationService';
import GenerateFromContent from './GenerateFromContent';
import LimitBanner from './LimitBanner';

const google = createGoogleGenerativeAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const THEMES = [
    { id: 'modern',    label: 'Modern',    gradient: 'from-slate-900 to-slate-700',      accent: '#6366f1' },
    { id: 'minimal',   label: 'Minimal',   gradient: 'from-white to-slate-50',           accent: '#0f172a', dark: true },
    { id: 'academic',  label: 'Academic',  gradient: 'from-blue-900 to-blue-700',        accent: '#60a5fa' },
    { id: 'bold',      label: 'Bold',      gradient: 'from-violet-700 to-fuchsia-600',   accent: '#f0abfc' },
    { id: 'pastel',    label: 'Pastel',    gradient: 'from-pink-100 to-indigo-100',      accent: '#8b5cf6', dark: true },
];

const SLIDE_COUNT_OPTIONS = [5, 8, 10, 12, 15, 20];

const countWords = (str) => str.trim().split(/\s+/).filter(Boolean).length;

// ── Slide mini-preview ────────────────────────────────────────────────────────
const SlidePreview = ({ slide, theme, index }) => {
    const isTitle   = slide.layout === 'title';
    const isSection = slide.layout === 'section';
    const isClosing = slide.layout === 'closing';

    return (
        <div
            className={`relative rounded-xl overflow-hidden shadow-sm border border-white/10 p-3 flex flex-col gap-1.5 bg-gradient-to-br ${theme.gradient} ${theme.dark ? 'border-slate-200' : ''}`}
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
    const { canUseAI, increment, loaded } = usePlan();

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

    const limitReached = loaded && !canUseAI('ai_presentation');
    const detailsWords = countWords(details);
    const detailsOver  = detailsWords > 50;
    const activeTheme  = THEMES.find(t => t.id === theme) ?? THEMES[0];

    const handleGenerate = async () => {
        if (!topic.trim() || detailsOver) return;
        setError(null);
        setSlides([]);
        setStatus('generating');
        setProgress('Crafting slides…');
        setMobilePreview(true);

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
            const { text } = await generateText({
                model: google('gemini-2.5-flash-lite'),
                system: systemPrompt,
                prompt: userPrompt,
            });

            setProgress('Processing slides…');

            let raw = text.trim();
            if (raw.startsWith('```')) raw = raw.replace(/^```[a-z]*\n?/, '').replace(/```$/, '').trim();

            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Invalid slide data');

            setSlides(parsed);
            setStatus('done');
            increment('ai_presentation');
        } catch (err) {
            console.error('[AutoPresentation]', err);
            setError(err.message?.includes('JSON') ? 'AI returned unexpected format — try again.' : 'Generation failed. Please try again.');
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

                <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] p-6 flex flex-col gap-5">

                    <div className="flex items-center gap-3">
                        <div className="p-1.5 md:p-2.5 bg-indigo-50 rounded-md md:rounded-xl shrink-0">
                            <span className="material-icons-round text-indigo-500 text-[20px]">slideshow</span>
                        </div>
                        <div>
                            <h2 className="text-[15px] md:text-base font-medium md:font-semibold text-slate-800 leading-tight">Presentation Generator</h2>
                            <p className="text-[10px] text-slate-400">AI builds slides from your topic</p>
                        </div>
                    </div>

                    {/* Topic */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Topic / Title *</label>
                        <input
                            type="text"
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            disabled={isGenerating || isSaving}
                            placeholder="e.g. Climate Change, Machine Learning Basics…"
                            className="w-full placeholder:text-[12px] text-[12px] md:text-[15px]  rounded-lg md:rounded-xl bg-slate-50 border-none px-2 md:px-4 py-1.5 md:py-3 text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/25 transition disabled:opacity-50"
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
                            placeholder="Audience, key points to cover, tone, level of detail…"
                            className={`w-full resize-none placeholder:text-[12px] text-[12px] md:text-[15px]  rounded-lg md:rounded-xl bg-slate-50 border-none md:px-4 py-1.5 md:py-3 text-slate-700 placeholder-slate-400 outline-none focus:ring-2 transition disabled:opacity-50 ${
                                detailsOver ? 'ring-2 ring-red-300 focus:ring-red-400' : 'focus:ring-primary/25'
                            }`}
                        />
                        {detailsOver && (
                            <p className="text-[10px] text-red-500">Please keep additional details under 50 words.</p>
                        )}
                    </div>

                    {/* Slide count */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Number of Slides</label>
                        <div className="flex flex-wrap gap-2">
                            {SLIDE_COUNT_OPTIONS.map(n => (
                                <button
                                    key={n}
                                    onClick={() => setSlideCount(n)}
                                    disabled={isGenerating || isSaving}
                                    className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all disabled:opacity-50
                                        ${slideCount === n
                                            ? 'bg-primary/15 text-primary'
                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                        }`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Theme */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Design Theme</label>
                        <div className="grid grid-cols-5 gap-2">
                            {THEMES.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setTheme(t.id)}
                                    disabled={isGenerating || isSaving}
                                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all disabled:opacity-50 ${
                                        theme === t.id ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'
                                    }`}
                                >
                                    <div className={`w-full h-7 rounded-lg bg-gradient-to-br ${t.gradient} ${t.dark ? 'border border-slate-200' : ''}`} />
                                    <span className={`text-[9px] font-semibold ${theme === t.id ? 'text-primary' : 'text-slate-400'}`}>{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {limitReached && <LimitBanner message="Daily AI presentation limit reached. Upgrade for more." />}

                    {/* Generate button */}
                    {isGenerating ? (
                        <div className="flex flex-col items-center gap-3 py-4 bg-primary/5 rounded-2xl">
                            <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            <div className="text-center">
                                <p className="text-sm font-semibold text-primary">Generating {slideCount} slides…</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{progress}</p>
                            </div>
                            <div className="w-full px-4">
                                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full animate-pulse" style={{ width: '60%' }} />
                                </div>
                            </div>
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
                    description="Upgrade to generate slides directly from your Notepaper content."
                    sources={[
                        { icon: 'article',     label: 'From a Paper' },
                        { icon: 'description', label: 'From a Note' },
                        { icon: 'folder_open', label: 'From a Folder' },
                        { icon: 'style',       label: 'From a Flashcard set' },
                    ]}
                />
            </section>

            {/* ── Right — slide preview workspace ───────────────────────── */}
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
                            <span className="text-xs font-bold text-slate-400 tracking-wide">Slide Preview</span>
                            {isDone && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">
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
                                    <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full scale-150 animate-pulse pointer-events-none" />
                                    <div className="relative w-28 h-28 bg-slate-50 rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
                                        <span className="material-icons-round text-indigo-500 text-5xl">slideshow</span>
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-indigo-50 p-2 rounded-full shadow-sm">
                                        <span className="material-icons-round text-indigo-400 text-[15px]">auto_awesome</span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-medium md:font-semibold text-slate-800 mb-2 tracking-tight">AI Presentation Builder</h3>
                                    <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                                        Enter a topic and hit <strong className="text-slate-600">Generate Slides</strong> to build a polished deck instantly.
                                    </p>
                                </div>
                                <div className="grid grid-cols-3 gap-2 w-full max-w-xs opacity-20 pointer-events-none select-none mt-2">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className={`h-16 rounded-xl bg-gradient-to-br ${i % 2 === 0 ? 'from-slate-200 to-slate-300' : 'from-indigo-100 to-indigo-200'}`} />
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
                                        className="h-24 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200"
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
                    <div className="shrink-0 px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {isDone ? `${slides.length} slides · ${activeTheme.label} theme` : isGenerating ? 'Generating…' : 'Status: Idle'}
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
                            {isSaving ? 'Saving…' : 'Save Presentation'}
                        </button>
                    </div>

                    <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                </div>
            </section>
        </div>

        {/* ── Mobile bottom-sheet ── */}
        {mobilePreview && (
            <div className="md:hidden fixed inset-0 z-50 flex flex-col">
                <div className="absolute inset-0 bg-black/40" onClick={() => !isGenerating && !isSaving && setMobilePreview(false)} />
                <div className="relative mt-auto bg-white rounded-t-2xl flex flex-col shadow-2xl max-h-[85vh]">

                    <div className="px-4 pt-3 pb-3 flex items-center justify-between border-b border-slate-100 shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-1 bg-slate-200 rounded-full absolute left-1/2 -translate-x-1/2 top-2" />
                            <span className="text-sm font-semibold text-slate-700 mt-1">Slide Preview</span>
                            {isGenerating && (
                                <span className="flex items-center gap-1 text-[11px] text-primary font-medium animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    Generating {slideCount} slides…
                                </span>
                            )}
                            {isDone && slides.length > 0 && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">{slides.length} slides ready</span>
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
                                {[...Array(Math.min(slideCount, 6))].map((_, i) => (
                                    <div key={i} className="h-20 rounded-xl bg-slate-100" style={{ opacity: 1 - i * 0.1 }} />
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
                        <div className="shrink-0 px-4 pb-6 pt-3 border-t border-slate-100 flex gap-2">
                            <button onClick={() => setMobilePreview(false)} className="flex-1 py-2.5 rounded-full border border-slate-200 text-slate-500 text-sm font-semibold">
                                Back
                            </button>
                            <button onClick={handleSave} disabled={isSaving} className="flex-1 py-2.5 rounded-full bg-primary text-white text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40">
                                {isSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span className="material-icons-round text-[16px]">save</span>}
                                {isSaving ? 'Saving…' : 'Save Presentation'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}
        </>
    );
}
