import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { presentationService } from "../../api/presentationService";
import Loader from "../globals/Loader";
import ShakespeareModal from "../note/ShakespeareModal";
import { SlideEditor } from "./presentation/SlideEditor";
import { SlideToolbar } from "./presentation/SlideToolbar";
import { Thumbnail } from "./presentation/Thumbnail";
import { getCanvasBg } from "./presentation/canvasBg";
import { exportAsPPTX } from "./presentation/pptx";

// ── Main Presentation viewer ──────────────────────────────────────────────────
export const Presentation = () => {
    const { id }   = useParams();
    const navigate = useNavigate();


    const [presentation, setPresentation] = useState(null);
    const [slides, setSlides]             = useState([]);
    const [idx, setIdx]                   = useState(0);
    const [themeId, setThemeId]           = useState('modern');
    const [showNotes, setShowNotes]             = useState(false);
    const [isShakespeareOpen, setIsShakespeareOpen] = useState(false);
    const [isFullscreen, setIsFullscreen]       = useState(false);
    const [loading, setLoading]           = useState(true);
    const [saving, setSaving]             = useState(false);
    const [saveMsg, setSaveMsg]           = useState('');
    const [exporting, setExporting]         = useState(false);
    const [exportingPdf, setExportingPdf]   = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [error, setError]               = useState(null);
    const [title, setTitle]               = useState('');
    const titleSaveTimer                  = useRef(null);
    const slideAreaRef  = useRef(null);
    const slideRef      = useRef(null);
    const exportMenuRef = useRef(null);
    const saveTimer     = useRef(null);
    const slidesRef     = useRef(slides);
    const imgInputRef   = useRef(null);
    slidesRef.current   = slides;

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        presentationService.get(id)
            .then(res => {
                const p = res.data;
                setPresentation(p);
                setTitle(p.title ?? '');
                setThemeId(p.theme ?? 'modern');
                try {
                    const raw = p.slides;
                    setSlides(Array.isArray(raw) ? raw : JSON.parse(raw ?? '[]'));
                } catch { setSlides([]); }
            })
            .catch(() => setError('Could not load presentation.'))
            .finally(() => setLoading(false));
    }, [id]);

    // Debounced auto-save
    useEffect(() => {
        if (!id || loading) return;
        clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(async () => {
            setSaving(true); setSaveMsg('');
            try {
                await presentationService.update(id, { slides: JSON.stringify(slidesRef.current) });
                setSaveMsg('saved');
                setTimeout(() => setSaveMsg(''), 2500);
            } catch { setSaveMsg('error'); }
            finally { setSaving(false); }
        }, 1000);
        return () => clearTimeout(saveTimer.current);
    }, [slides, id, loading]);

    const goTo   = useCallback((i) => setIdx(Math.max(0, Math.min(slides.length-1, i))), [slides.length]);
    const goPrev = useCallback(() => goTo(idx-1), [idx, goTo]);
    const goNext = useCallback(() => goTo(idx+1), [idx, goTo]);

    useEffect(() => {
        const h = (e) => {
            const tag = document.activeElement?.tagName;
            if (tag==='INPUT'||tag==='TEXTAREA') return;
            if (e.key==='ArrowRight'||e.key==='ArrowDown') { e.preventDefault(); goNext(); }
            if (e.key==='ArrowLeft' ||e.key==='ArrowUp')   { e.preventDefault(); goPrev(); }
            if (e.key==='Escape' && isFullscreen) document.exitFullscreen?.();
        };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [goNext, goPrev, isFullscreen]);

    const toggleFS = () => {
        if (!document.fullscreenElement) { slideAreaRef.current?.requestFullscreen?.(); setIsFullscreen(true); }
        else { document.exitFullscreen?.(); setIsFullscreen(false); }
    };
    useEffect(() => {
        const h = () => { if (!document.fullscreenElement) setIsFullscreen(false); };
        document.addEventListener('fullscreenchange', h);
        return () => document.removeEventListener('fullscreenchange', h);
    }, []);

    const updateSlide = useCallback((i, s) => setSlides(p => { const n=[...p]; n[i]=s; return n; }), []);
    const deleteSlide = useCallback((i) => {
        if (slides.length <= 1) return;
        setSlides(p => p.filter((_,j) => j!==i));
        setIdx(c => Math.min(c, slides.length-2));
    }, [slides.length]);
    const moveSlide = useCallback((i, dir) => {
        const j = i+dir; if (j<0||j>=slides.length) return;
        setSlides(p => { const n=[...p]; [n[i],n[j]]=[n[j],n[i]]; return n; });
        setIdx(j);
    }, [slides.length]);
    const addSlide = useCallback(() => {
        const blank = { slide:slides.length+1, layout:'content', title:'', bullets:[''], speaker_notes:'', listStyle:'bullet' };
        setSlides(p => { const n=[...p]; n.splice(idx+1, 0, blank); return n; });
        setIdx(idx+1);
    }, [idx, slides.length]);

    const handleTitleChange = (val) => {
        setTitle(val);
        clearTimeout(titleSaveTimer.current);
        titleSaveTimer.current = setTimeout(async () => {
            if (!id) return;
            try { await presentationService.update(id, { title: val }); } catch { /* best-effort title save */ }
        }, 800);
    };

    const handleTitleKeyDown = (e) => {
        if (e.key === 'Enter') e.target.blur();
    };

    const handleThemeChange = useCallback(async (t) => {
        setThemeId(t);
        if (!id) return;
        try { await presentationService.update(id, { theme:t }); } catch { /* best-effort theme save */ }
    }, [id]);

    const handleShakespeareInsert = useCallback((text) => {
        setIsShakespeareOpen(false);
        const s = slidesRef.current[idx];
        if (!s) return;
        if (s.layout === 'section') {
            updateSlide(idx, { ...s, title: text.trim().split('\n')[0] ?? s.title });
            return;
        }
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        const existing = (s.bullets ?? []).filter(b => b.trim());
        const combined = [...existing, ...lines].slice(0, 7);
        updateSlide(idx, { ...s, bullets: combined.length ? combined : [''] });
    }, [idx, updateSlide]);

    // Close export menu on outside click
    useEffect(() => {
        if (!showExportMenu) return;
        const h = (e) => { if (!exportMenuRef.current?.contains(e.target)) setShowExportMenu(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [showExportMenu]);

    const handleExportPDF = async () => {
        if (!slideRef.current) return;
        setShowExportMenu(false);
        setExportingPdf(true);
        const originalIdx = idx;
        try {
            const { toPng }  = await import('html-to-image');
            const { jsPDF }  = await import('jspdf');
            // 16:9 page in mm
            const W = 267.75, H = 150.57;
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [W, H] });
            const nextFrame = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

            for (let i = 0; i < slides.length; i++) {
                setIdx(i);
                await nextFrame();
                const dataUrl = await toPng(slideRef.current, {
                    pixelRatio: 2,
                    cacheBust: true,
                    filter: (node) => !node.dataset?.pdfHide,
                });
                if (i > 0) pdf.addPage([W, H], 'landscape');

                // Add watermark to the image before adding to PDF
                // We do this by drawing on a temporary canvas or using jsPDF text
                // Since we already have the dataUrl (screenshot), we can just draw text over it in PDF
                pdf.addImage(dataUrl, 'PNG', 0, 0, W, H);

                // PDF Watermark
                pdf.setFontSize(8);
                pdf.setTextColor(148, 163, 184); // stone-400
                pdf.text('NotepaperAI', W - 10, H - 8, { align: 'right' });
            }
            pdf.save(`${(title || 'presentation').replace(/\s+/g, '-').toLowerCase()}.pdf`);
        } catch (e) {
            console.error(e);
            alert('PDF export failed.');
        } finally {
            setIdx(originalIdx);
            setExportingPdf(false);
        }
    };

    const handleImageUpload = useCallback((e) => {
        const file = e.target.files?.[0]; e.target.value = '';
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const url = ev.target?.result;
            if (url) updateSlide(idx, { ...slidesRef.current[idx], image:{url, position:'right'} });
        };
        reader.readAsDataURL(file);
    }, [idx, updateSlide]);

    const handleExportPPTX = async () => {
        if (!presentation) return;
        setExporting(true);
        try { await exportAsPPTX(slides, themeId, title); }
        catch (e) { console.error(e); alert('Export failed.'); }
        finally { setExporting(false); }
    };

    const current = slides[idx];
    const pct     = slides.length > 1 ? (idx/(slides.length-1))*100 : 0;

    if (loading) return (
        <div className="flex flex-col flex-1 h-screen items-center justify-center bg-paper lg:ml-64">
            <Loader size="xl" />
        </div>
    );
    if (error || !presentation) return (
        <div className="flex flex-col flex-1 h-screen items-center justify-center bg-paper lg:ml-64">
            <span className="material-icons-round text-stone-300 text-[56px]">broken_image</span>
            <p className="text-stone-500 mt-3 text-sm">{error ?? 'Presentation not found.'}</p>
            <button onClick={() => navigate(-1)} className="mt-4 px-5 py-2.5 bg-plum-600 hover:bg-plum-700 text-white text-sm font-medium">Go back</button>
        </div>
    );

    return (
        <div className="flex flex-col flex-1 h-screen overflow-hidden bg-paper font-display text-stone-900 lg:ml-64 pt-16 lg:pt-0">
            {/* Hidden image input */}
            <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

            {/* App header */}
            <div className="flex items-center justify-between px-2.5 md:px-5 py-1.5 md:py-3 bg-paper/95 backdrop-blur border-b border-stone-200 shrink-0 z-10 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    {/* <button onClick={() => navigate(-1)} className="w-8 h-8  flex items-center justify-center text-stone-400 hover:bg-stone-100 transition-colors shrink-0">
                        <span className="material-icons-round text-[20px]">arrow_back</span>
                    </button> */}
                    <div className="min-w-0">
                        <input
                            value={title}
                            onChange={e => handleTitleChange(e.target.value)}
                            onKeyDown={handleTitleKeyDown}
                            placeholder="Untitled Presentation"
                            className="text-stone-900 font-medium md:font-semibold text-[12px] md:text-sm bg-transparent outline-none border-none transition-colors w-full truncate placeholder-stone-400"
                        />
                        <p className="text-stone-400 text-[8px] md:text-[10px]">{slides.length} slides · {themeId}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {saving && <span className="flex items-center gap-1 text-[11px] text-plum-600"><Loader size="xs" /></span>}
                    {!saving && saveMsg==='saved' && <span className="flex items-center gap-1 text-[11px] text-emerald-600"><span className="material-icons-round text-[13px]">check</span>Saved</span>}
                    <button onClick={() => setIsShakespeareOpen(true)}
                        className="flex items-center gap-1 md:gap-1.5 px-1.5 py-1 md:px-3 md:py-1.5  text-[11px] md:text-xs font-medium md:font-semibold transition-colors bg-plum-50 text-plum-700 hover:bg-plum-100"
                        title="Shakespeare Assist — AI writing">
                   
                        <span className="hidden sm:inline">Shakespeare</span>
                    </button>
                    <button onClick={() => setShowNotes(v=>!v)}
                        className={`flex items-center gap-1 md:gap-1.5 px-1.5 py-1 md:px-3 md:py-1.5  text-[11px] md:text-xs font-medium md:font-semibold transition-colors border ${showNotes?'bg-plum-50 text-plum-700 border-plum-200':'text-stone-500 hover:bg-stone-100 border-transparent'}`}>
                        <span className="material-icons-round text-[11px] md:text-[15px]">speaker_notes</span>Notes
                    </button>
                    <button onClick={toggleFS} className="w-5 h-5 md:w-8 md:h-8   flex items-center justify-center text-stone-500 hover:bg-stone-100 transition-all">
                        <span className="material-icons-round text-[18px]">{isFullscreen?'fullscreen_exit':'fullscreen'}</span>
                    </button>
                    {/* Export dropdown */}
                    <div ref={exportMenuRef} className="relative">
                        <button
                            onClick={() => setShowExportMenu(v => !v)}
                            disabled={exporting || exportingPdf}
                            className="flex items-center gap-1 md:gap-1.5 px-2 md:px-4 py-1 md:py-1.5   text-[9px] md:text-xs font-normal md:font-semibold bg-plum-600 text-white hover:bg-plum-700 active:scale-95 transition-colors disabled:opacity-60"
                        >
                            {(exporting || exportingPdf)
                                ? <Loader size="xs" />
                                : <><span className="material-icons-round text-[14px]">download</span>Export<span className="material-icons-round text-[14px] ml-0.5">expand_more</span></>}
                        </button>
                        {showExportMenu && (
                            <div className="absolute right-0 top-9 bg-white   shadow-xl border border-stone-200 py-1.5 w-44 z-50 animate-in fade-in zoom-in-95 duration-100">
                                <button
                                    onClick={() => { setShowExportMenu(false); handleExportPPTX(); }}
                                    className="w-full flex items-center gap-1.5 md:gap-3 px-2 md:px-4 py-1.5 md:py-2.5 text-[12px] md:text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                                >
                                    <span className="material-icons-round text-[13px] md:text-[17px] text-plum-600">slideshow</span>
                                    Export PPTX
                                </button>
                                <button
                                    onClick={handleExportPDF}
                                    className="w-full flex items-center gap-1.5 md:gap-3 px-2 md:px-4 py-1.5 md:py-2.5 text-[12px] md:text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                                >
                                    <span className="material-icons-round text-[13px] md:text-[17px] text-stone-500">picture_as_pdf</span>
                                    Export PDF
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Slide toolbar */}
            {current && (
                <SlideToolbar
                    slide={current} onChange={s => updateSlide(idx, s)}
                    onAddSlide={addSlide}
                    onMoveUp={() => moveSlide(idx,-1)} onMoveDown={() => moveSlide(idx,1)}
                    canMoveUp={idx>0} canMoveDown={idx<slides.length-1}
                    slideNum={idx+1} total={slides.length}
                    themeId={themeId} onThemeChange={handleThemeChange}
                    onImageUpload={() => imgInputRef.current?.click()}
                />
            )}

            <div className="flex flex-1 overflow-hidden">
                {/* Thumbnails */}
                <div className="w-44 border-r border-stone-200 overflow-y-auto custom-scrollbar shrink-0 hidden md:flex flex-col" style={{ background: getCanvasBg(current, themeId), transition: 'background 0.6s ease' }}>
                    <p className="px-3 pt-3 pb-2 text-[9px] font-bold text-stone-400 uppercase tracking-widest">Slides</p>
                    <div className="flex flex-col gap-1.5 px-2 pb-3">
                        {slides.map((s,i) => (
                            <div key={i} className="relative group/thumb">
                                <button onClick={() => goTo(i)}
                                    className={`w-full text-left  p-1.5 transition-all ${i===idx?'ring-2 ring-plum-400 bg-plum-50':'hover:bg-stone-100'}`}>
                                    <Thumbnail slide={s} themeId={themeId} />
                                    <p className={`text-[9px] font-medium truncate mt-1 ${i===idx?'text-plum-700':'text-stone-500'}`}>{i+1}. {s.title||'Untitled'}</p>
                                </button>
                                {slides.length > 1 && (
                                    <button onClick={(e) => { e.stopPropagation(); deleteSlide(i); }}
                                        className="absolute top-2 right-2 opacity-0 group-hover/thumb:opacity-100 w-5 h-5  bg-red-500 text-white flex items-center justify-center transition-all shadow"
                                        title="Delete slide">
                                        <span className="material-icons-round text-[11px]">delete</span>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Slide canvas */}
                <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                    <div ref={slideAreaRef} className="flex-1 flex items-center justify-center p-4 md:p-6 relative" style={{ background: getCanvasBg(current, themeId), transition: 'background 0.6s ease' }}>
                        <div ref={slideRef} className="w-full max-w-4xl" style={{ aspectRatio:'16/9', boxShadow:'0 10px 30px rgba(28,25,23,0.14)', borderRadius:0, overflow:'hidden', position:'relative' }}>
                            {current && (
                                <SlideEditor
                                    slide={current} themeId={themeId}
                                    onChange={s => updateSlide(idx, s)}
                                    onDelete={() => deleteSlide(idx)}
                                    canDelete={slides.length > 1}
                                />
                            )}
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-0.5 bg-stone-200 shrink-0">
                        <div className="h-full bg-plum-600 transition-all duration-300" style={{ width:`${pct}%` }} />
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between px-5 py-2.5 bg-paper/95 border-t border-stone-200 shrink-0">
                        <button onClick={goPrev} disabled={idx===0}
                            className="flex items-center gap-1.5 px-3 py-1.5  text-[12px] md:text-sm md:font-medium text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                            <span className="material-icons-round text-[15px] md:text-[18px]">chevron_left</span>Prev
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="text-[12px] font-semibold text-stone-700 tabular-nums">{idx+1}</span>
                            <span className="text-[11px] text-stone-400">of {slides.length}</span>
                        </div>
                        <button onClick={goNext} disabled={idx===slides.length-1}
                            className="flex items-center gap-1.5 px-3 py-1.5  text-[12px] md:text-sm md:font-medium text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                            Next<span className="material-icons-round text-[15px] md:text-[18px]">chevron_right</span>
                        </button>
                    </div>

                    {/* Speaker notes */}
                    {showNotes && current && (
                        <div className="border-t border-stone-200 bg-white px-5 py-3 shrink-0">
                            <p className="text-[9px] font-semibold text-plum-700 uppercase tracking-[0.16em] mb-1.5">Speaker Notes</p>
                            <p className="text-[12px] text-stone-600 leading-relaxed">{current.speaker_notes || <span className="opacity-40 italic">No notes for this slide.</span>}</p>
                        </div>
                    )}
                </div>
            </div>

            {isShakespeareOpen && (
                <ShakespeareModal
                    onClose={() => setIsShakespeareOpen(false)}
                    onInsert={handleShakespeareInsert}
                />
            )}
        </div>
    );
};