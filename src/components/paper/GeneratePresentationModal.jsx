import React, { useState } from "react";
import { createPortal } from "react-dom";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { presentationService } from "../../api/presentationService";
import { usePlan } from "../../hooks/usePlan";

const google = createGoogleGenerativeAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const THEMES = [
    { id: 'modern',    label: 'Modern',    gradient: 'from-slate-900 to-slate-700', accent: '#6366f1' },
    { id: 'minimal',   label: 'Minimal',   gradient: 'from-white to-slate-50',      accent: '#0f172a', dark: true },
    { id: 'academic',  label: 'Academic',  gradient: 'from-blue-900 to-blue-700',   accent: '#60a5fa' },
    { id: 'bold',      label: 'Bold',      gradient: 'from-violet-700 to-fuchsia-600', accent: '#f0abfc' },
    { id: 'pastel',    label: 'Pastel',    gradient: 'from-pink-100 to-indigo-100', accent: '#8b5cf6', dark: true },
];

const SLIDE_COUNT_OPTIONS = [5, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150];

function stripHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}

export const GeneratePresentationModal = ({ onClose, paperId, scholarDocumentId, paperTitle, pages, onGenerated }) => {
    const { canUseAI, increment, loaded, planLimit } = usePlan();
    const maxSlides = planLimit('max_slide_count') ?? 20;
    const [slideCount, setSlideCount] = useState(Math.min(10, maxSlides));
    const [theme, setTheme]           = useState('modern');
    const [status, setStatus]         = useState('idle'); // idle | generating | saving | done | error
    const [error, setError]           = useState(null);
    const [progress, setProgress]     = useState('');

    const limitReached = loaded && !canUseAI('ai_presentation');

    const handleGenerate = async () => {
        setStatus('generating');
        setError(null);

        const fullText = pages.map(p => stripHtml(p)).join('\n\n').trim();

        if (!fullText || fullText.length < 50) {
            setError('Your paper needs more content before generating slides. Write at least a few paragraphs first.');
            setStatus('error');
            return;
        }

        const systemPrompt = `You are a presentation slide generator.
Given the text of a document, generate exactly ${slideCount} presentation slides in JSON format.

STRICT RULES:
- Return ONLY a valid JSON array, nothing else — no markdown fences, no explanation
- Each slide must have: { "slide": number, "layout": "title"|"content"|"section"|"closing", "title": string, "bullets": string[], "speaker_notes": string }
- The first slide must be layout "title" with just a title and subtitle in bullets
- The last slide must be layout "closing" (e.g. "Thank You" / "Questions?")
- Every slide title: max 8 words
- Every bullet point: max 15 words
- Total words across title + bullets on a single slide: STRICTLY max 70 words
- Bullets per slide: 2–5 points
- speaker_notes: 1–2 sentences expanding on the slide (not counted toward the 70-word limit)
- Spread content evenly across all ${slideCount} slides
- Use section slides (layout: "section") to separate major topics
- Be clear, professional, and educational`;

        const userPrompt = `Generate ${slideCount} slides from this document titled "${paperTitle || 'Untitled Paper'}":\n\n${fullText.slice(0, 12000)}`;

        try {
            setProgress('Analyzing document content…');

            const { text } = await generateText({
                model: google('gemini-2.5-flash-lite'),
                system: systemPrompt,
                prompt: userPrompt,
            });

            setProgress('Processing slides…');

            // Parse JSON — handle possible markdown fences
            let raw = text.trim();
            if (raw.startsWith('```')) raw = raw.replace(/^```[a-z]*\n?/, '').replace(/```$/, '').trim();

            const slides = JSON.parse(raw);

            if (!Array.isArray(slides) || slides.length === 0) throw new Error('Invalid slide data returned');

            setStatus('saving');
            setProgress('Saving presentation…');

            const res = await presentationService.create({
                paper_id:             paperId ?? null,
                scholar_document_id:  scholarDocumentId ?? null,
                title:                `${paperTitle || 'Untitled'} — Presentation`,
                slides:               JSON.stringify(slides),
                theme,
                slide_count:          slides.length,
            });

            const saved = res.data;
            setStatus('done');
            increment('ai_presentation');
            onGenerated(saved);
        } catch (err) {
            console.error('[GeneratePresentation] error', err);
            setError(err.message?.includes('JSON') ? 'AI returned unexpected format. Please try again.' : 'Failed to generate. Please try again.');
            setStatus('error');
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-md md:rounded-xl bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center shadow-sm">
                            <span className="material-icons-round text-white text-[14px] md:text-[18px]">slideshow</span>
                        </div>
                        <div>
                            <h2 className="font-display font-medium md:font-semibold text-slate-900 text-[13px] md:text-base leading-tight">Generate Presentation</h2>
                            <p className="text-[9px] md:text-[11px] text-slate-400">AI will create slides from your paper — max 70 words per slide</p>
                        </div>
                    </div>
                    <button onClick={onClose} disabled={status === 'generating' || status === 'saving'}
                        className="w-6 h-6 md:w-8 md:h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors disabled:opacity-30">
                        <span className="material-icons-round text-[18px]">close</span>
                    </button>
                </div>

                <div className="p-3 md:p-6 flex flex-col gap-5">
                    {status === 'idle' || status === 'error' ? (
                        <>
                            {/* Slide count */}
                            <div>
                                <p className="text-[10px] md:text-[11px] font-medium md:font-bold text-slate-500 uppercase tracking-widest mb-3">Number of Slides</p>
                                <div className="flex flex-wrap gap-2">
                                    {SLIDE_COUNT_OPTIONS.filter(n => n <= maxSlides).map(n => (
                                        <button key={n} onClick={() => setSlideCount(n)}
                                            className={`px-2 py-1 md:px-4 md:py-2 rounded-md md:rounded-xl text-[12px] md:text-sm font-medium md:font-semibold transition-all border ${slideCount===n?'bg-primary text-white border-primary shadow-lg shadow-primary/20':'bg-slate-50 text-slate-600 border-slate-100 hover:border-slate-200'}`}>
                                            {n}
                                        </button>
                                    ))}
                                    <input type="number" min={3} max={maxSlides} value={slideCount} onChange={(e) => setSlideCount(Math.min(maxSlides, Math.max(3, Number(e.target.value))))}
                                        className="w-16 md:w-20 px-3 py-2 rounded-xl text-sm font-semibold text-center border border-slate-200 bg-slate-50 text-slate-600 outline-none focus:border-primary"
                                        placeholder="Custom" />
                                </div>
                            </div>

                            {/* Theme */}
                            <div>
                                <p className="text-[10px] md:text-[11px] font-medium md:font-bold text-slate-500 uppercase tracking-widest mb-3">Design Theme</p>
                                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                                    {THEMES.map(t => (
                                        <button key={t.id} onClick={() => setTheme(t.id)}
                                            className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all ${theme===t.id?'border-primary bg-primary/5':'border-slate-100 hover:border-slate-200'}`}>
                                            <div className={`w-full h-7 md:h-10 rounded-lg bg-gradient-to-br ${t.gradient} ${t.dark?'border border-slate-200':''}`} />
                                            <span className={`text-[10px] font-medium md:font-semibold ${theme===t.id?'text-primary':'text-slate-500'}`}>{t.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {limitReached && (
                                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-md md:rounded-xl border border-amber-100">
                                    <span className="material-icons-round text-amber-500 text-[13px] md:text-[16px] mt-0.5">workspace_premium</span>
                                    <p className="text-[9px] md:text-xs text-amber-700">Daily AI presentation limit reached. Upgrade to Pro for unlimited generations.</p>
                                </div>
                            )}

                            {error && (
                                <div className="flex items-start gap-2 p-3 bg-red-50 rounded-md md:rounded-xl border border-red-100">
                                    <span className="material-icons-round text-red-500 text-[13px] md:text-[16px] mt-0.5">error_outline</span>
                                    <p className="text-[9px] md:text-xs text-red-600">{error}</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-0.5 md:pt-1">
                                <button onClick={onClose} className="flex-1 py-1.5 md:py-3 rounded-md md:rounded-xl text-[12px] md:text-sm font-medium md:font-semibold text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200">
                                    Cancel
                                </button>
                                <button onClick={handleGenerate} disabled={limitReached || !loaded}
                                    className="flex-1 bg-gradient-to-r from-primary to-indigo-500 text-white py-1.5 md:py-3 rounded-md md:rounded-xl text-[12px] md:text-sm font-medium md:font-semibold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                                    {!loaded ? (
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <span className="material-icons-round text-[18px]">auto_awesome</span>
                                            Generate {slideCount} Slides
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    ) : status === 'generating' || status === 'saving' ? (
                        <div className="flex flex-col items-center gap-5 py-8">
                           
                            <div className="text-center">
                                <p className="text-xs text-slate-400 mt-1">{progress}</p>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full animate-pulse" style={{ width: status==='saving'?'90%':'60%', transition:'width 0.5s ease' }} />
                            </div>
                            <p className="text-[10px] text-slate-400">Using Gemini Flash 2.5 · max 70 words per slide</p>
                        </div>
                    ) : (
                        // done
                        <div className="flex flex-col items-center gap-4 py-6">
                            <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center shadow-xl shadow-green-500/30">
                                <span className="material-icons-round text-white text-[28px]">check</span>
                            </div>
                            <div className="text-center">
                                <p className="font-display font-semibold text-slate-900">Presentation ready!</p>
                                <p className="text-xs text-slate-400 mt-1">{slideCount} slides generated and saved</p>
                            </div>
                            <button onClick={onClose}
                                className="w-full py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/20">
                                View Presentation
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export { THEMES };
