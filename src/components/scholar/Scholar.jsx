import { useState, useRef, useEffect, useCallback } from 'react';
import { scholarService } from '../../api/scholarService';
import echo from '../../lib/echo';
import { useAuth } from '../../context/AuthContext';


// ── Shimmer keyframe injected once ────────────────────────────────────────────
const SHIMMER_CSS = `
@keyframes scholarShimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}
.scholar-shimmer {
    background: linear-gradient(90deg, #ab8eff 0%, #6541c4 50%, #ab8eff 100%);
    background-size: 200% 100%;
    animation: scholarShimmer 2.5s infinite linear;
}
`;

// ── Reference upload slot ─────────────────────────────────────────────────────
const ReferenceSlot = ({ index, file, onUpload, onRemove, disabled }) => {
    const inputRef = useRef(null);

    if (file) {
        return (
            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100 flex flex-col gap-2">
                <div className="flex items-start justify-between">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                        <span className="material-icons-round text-primary text-[16px]">description</span>
                    </div>
                    {!disabled && (
                        <button
                            onClick={onRemove}
                            className="p-1 rounded-full hover:bg-slate-100 transition-colors"
                        >
                            <span className="material-icons-round text-slate-300 text-[16px]">close</span>
                        </button>
                    )}
                </div>
                <div>
                    <p className="text-[13px] font-semibold text-slate-700 truncate">{file.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
                <span className="self-start text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                    Uploaded
                </span>
            </div>
        );
    }

    return (
        <button
            onClick={() => !disabled && inputRef.current?.click()}
            disabled={disabled}
            className="aspect-video flex flex-col items-center justify-center p-4 rounded-lg bg-white border border-dashed border-slate-200 hover:border-primary/40 hover:bg-slate-50 transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
        >
            <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
                onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])}
            />
            <span className="material-icons-round text-slate-300 text-3xl group-hover:text-primary/50 transition-colors mb-2">
                upload_file
            </span>
            <p className="text-[12px] text-slate-400 text-center font-medium leading-snug">
                Paste or upload<br />example {index + 1}
            </p>
        </button>
    );
};

// ── Idle right panel ──────────────────────────────────────────────────────────
const IdlePanel = () => (
    <div className="flex-1 bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center justify-center p-10 text-center relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center mb-6">
                <span className="material-icons-round text-slate-200 text-4xl">menu_book</span>
            </div>
            <h4 className="text-lg font-semibold text-slate-700 mb-2">Ready for Research</h4>
            <p className="text-[13px] text-slate-400 max-w-xs leading-relaxed">
                Your report will appear here. Add references and instructions on the left, then hit Generate.
            </p>
            <div className="mt-8">
                <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-slate-300" />
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                        Waiting for input
                    </span>
                </div>
            </div>
        </div>

        {/* Decorative rings */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.035] flex items-center justify-center">
            <div className="w-80 h-80 border-[14px] border-primary rounded-full absolute" />
            <div className="w-56 h-56 border-[7px] border-primary rounded-full absolute" />
        </div>
    </div>
);



// ── Outline review panel ──────────────────────────────────────────────────────
const OutlineReviewPanel = ({ document, onApprove, loading }) => (
    <div className="flex-1 flex flex-col gap-5">
        <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <span className="material-icons-round text-primary text-[18px]">list_alt</span>
                </div>
                <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Document Outline Ready</p>
                    <p className="text-[14px] font-semibold text-slate-800">{document.title}</p>
                </div>
            </div>

            <div className="flex flex-col gap-2 mb-5">
                {(document.outline?.chapters || []).map(ch => (
                    <div key={ch.chapter_number} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="w-6 h-6 bg-primary/10 text-primary rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {ch.chapter_number}
                        </span>
                        <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-slate-700 leading-snug">{ch.title}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{ch.description}</p>
                        </div>
                        <span className="shrink-0 text-[10px] text-slate-400 font-medium ml-auto">~{ch.estimated_pages}p</span>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="text-[12px] text-slate-500 flex-1">
                    {document.toc_enabled && <span className="inline-flex items-center gap-1 mr-3"><span className="material-icons-round text-[13px] text-emerald-500">check</span>TOC</span>}
                    {document.bibliography_enabled && <span className="inline-flex items-center gap-1"><span className="material-icons-round text-[13px] text-emerald-500">check</span>Bibliography</span>}
                </div>
                <button
                    onClick={onApprove}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-[13px] font-semibold shadow-sm hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                >
                    {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span className="material-icons-round text-[16px]">play_arrow</span>}
                    Start Writing
                </button>
            </div>
        </div>
    </div>
);

// ── Chapter review panel ──────────────────────────────────────────────────────
const ChapterReviewPanel = ({ chapter, totalChapters, onUpdate, onApprove, onRetry, loading, isFailed }) => {
    const [content, setContent] = useState(chapter.content || '');
    const [isDirty, setIsDirty] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => { setContent(chapter.content || ''); setIsDirty(false); }, [chapter.id]);

    const handleSave = async () => {
        setSaving(true);
        try { await onUpdate(content); setIsDirty(false); } finally { setSaving(false); }
    };

    return (
        <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-primary/10 text-primary rounded-full text-[12px] font-bold flex items-center justify-center">
                        {chapter.chapter_number}
                    </span>
                    <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                            Chapter {chapter.chapter_number} of {totalChapters}
                        </p>
                        <p className="text-[14px] font-semibold text-slate-800">{chapter.title}</p>
                    </div>
                </div>
                <span className="text-[11px] text-slate-400">{chapter.word_count?.toLocaleString()} words</span>
            </div>

            {isFailed ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-red-50 rounded-lg border border-red-100 p-8">
                    <span className="material-icons-round text-red-400 text-4xl">error_outline</span>
                    <p className="text-[14px] text-red-600 font-semibold">Generation failed for this chapter.</p>
                    <button onClick={onRetry} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white text-[13px] font-semibold hover:bg-red-700 transition-colors">
                        <span className="material-icons-round text-[16px]">refresh</span>
                        Retry Chapter
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex-1 relative">
                        <textarea
                            value={content}
                            onChange={e => { setContent(e.target.value); setIsDirty(true); }}
                            className="w-full h-full min-h-[340px] bg-white border border-slate-200 rounded-lg p-4 text-[13px] text-slate-700 font-mono resize-none outline-none focus:ring-2 focus:ring-primary/20 shadow-sm leading-relaxed"
                            placeholder="Chapter content will appear here…"
                        />
                        {isDirty && (
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="absolute top-3 right-3 text-[11px] font-semibold text-primary bg-primary/8 hover:bg-primary/12 px-3 py-1.5 rounded-full border border-primary/15 transition-colors"
                            >
                                {saving ? 'Saving…' : 'Save edits'}
                            </button>
                        )}
                    </div>

                    {chapter.citations?.length > 0 && (
                        <details className="bg-slate-50 rounded-lg border border-slate-100 p-3">
                            <summary className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest cursor-pointer">
                                {chapter.citations.length} citations used
                            </summary>
                            <ol className="mt-3 flex flex-col gap-1.5 pl-4">
                                {chapter.citations.map((c, i) => (
                                    <li key={i} className="text-[11px] text-slate-500 leading-relaxed">
                                        {c.author} ({c.year}). <em>{c.title}</em>. {c.source}.
                                    </li>
                                ))}
                            </ol>
                        </details>
                    )}

                    <button
                        onClick={onApprove}
                        disabled={loading || isDirty}
                        className="w-full py-3 rounded-lg bg-primary text-white text-[13px] font-semibold flex items-center justify-center gap-2 shadow-sm hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span className="material-icons-round text-[16px]">check</span>}
                        {isDirty ? 'Save edits before approving' : chapter.chapter_number < totalChapters ? 'Approve & Generate Next Chapter' : 'Approve & Assemble Document'}
                    </button>
                </>
            )}
        </div>
    );
};

// ── Progress panel (outline generating / chapter generating / assembling) ─────
const ProgressPanel = ({ message, progress }) => (
    <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-100 flex flex-col items-center justify-center p-10 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-8 animate-pulse">
            <span className="material-icons-round text-primary text-3xl">hourglass_empty</span>
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Working…</h3>
        <p className="text-[14px] text-slate-500 mb-8 leading-relaxed max-w-xs">{message || 'Gemini is researching and writing…'}</p>
        <div className="w-full h-1.5 bg-slate-100 rounded-full mb-3 overflow-hidden">
            <div
                className="h-full scholar-shimmer rounded-full transition-all duration-500"
                style={{ width: progress > 0 ? `${progress}%` : '30%' }}
            />
        </div>
        {progress > 0 && <p className="text-[11px] font-semibold text-slate-400">{progress}%</p>}
        <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full">
            <span className="material-icons-round text-emerald-500 text-[14px]">check_circle</span>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">You can close this tab safely</p>
        </div>
    </div>
);

// ── Main Scholar component ────────────────────────────────────────────────────
export default function Scholar() {
    const { user }   = useAuth(); 

    // Core state
    const [phase, setPhase]           = useState('idle');
    const [refs, setRefs]             = useState([null, null]);
    const [instructions, setInstructions] = useState('');
    const [exportFormat, setExportFormat] = useState('pdf');
    const [document, setDocument]     = useState(null);
    const [activeChapter, setActiveChapter] = useState(null);
    const [progressMsg, setProgressMsg]   = useState('');
    const [progress, setProgress]     = useState(0);
    const [error, setError]           = useState('');
    const [loading, setLoading]       = useState(false);

    const echoChannel = useRef(null);

    // ── Subscribe to broadcast channel when we have a document ───────────────
    useEffect(() => {
        if (!user?.id || !document?.id) return;

        const channel = echo.private(`scholar.${user.id}`);
        echoChannel.current = channel;

        channel.listen('ScholarProgressEvent', (event) => {
            if (event.document_ulid !== document.id) return;

            setProgressMsg(event.message);
            setProgress(event.progress);

            const data = event.data || {};

            if (data.status === 'failed') {
                setPhase('failed');
                return;
            }

            if (event.type === 'outline' && data.status === 'outline_ready') {
                scholarService.show(document.id).then(res => {
                    setDocument(res.data);
                    setPhase('outline_review');
                });
            }

            if (event.type === 'chapter' && data.status === 'chapter_ready') {
                scholarService.show(document.id).then(res => {
                    const doc = res.data;
                    setDocument(doc);
                    const readyChapter = (doc.chapters || []).find(c => c.chapter_number === data.chapter_number);
                    setActiveChapter(readyChapter || null);
                    setPhase('chapter_review');
                });
            }

            if (event.type === 'assembly' && data.status === 'complete') {
                scholarService.show(document.id).then(res => {
                    setDocument(res.data);
                    setPhase('complete');
                });
            }
        });

        return () => {
            echo.leave(`scholar.${user.id}`);
            echoChannel.current = null;
        };
    }, [user?.id, document?.id]);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleUpload   = (i, file) => setRefs(prev => prev.map((r, idx) => idx === i ? file : r));
    const handleRemove   = (i)       => setRefs(prev => prev.map((r, idx) => idx === i ? null : r));

    const handleGenerate = useCallback(async () => {
        if (!instructions.trim()) return;
        setError('');
        setLoading(true);
        try {
            const res = await scholarService.create({
                prompt: instructions.trim(),
                exportFormat,
                uploads: refs.filter(Boolean),
            });
            setDocument(res.data);
            setPhase('generating_outline');
            setProgressMsg('Analysing your prompt and researching the topic…');
            setProgress(10);
        } catch (err) {
            setError(err?.message || err?.errors?.prompt?.[0] || err?.errors?.plan?.[0] || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    }, [instructions, exportFormat, refs]);

    const handleApproveOutline = useCallback(async () => {
        setLoading(true);
        try {
            await scholarService.approveOutline(document.id);
            setPhase('generating_chapter');
            setProgressMsg('Writing Chapter 1…');
            setProgress(5);
        } catch (err) {
            setError(err?.message || 'Failed to start writing.');
        } finally {
            setLoading(false);
        }
    }, [document]);

    const handleUpdateChapter = useCallback(async (content) => {
        await scholarService.updateChapter(document.id, activeChapter.id, content);
        setActiveChapter(prev => ({ ...prev, content }));
    }, [document, activeChapter]);

    const handleApproveChapter = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await scholarService.approveChapter(document.id, activeChapter.id);
            const updatedDoc = res.data;
            setDocument(updatedDoc);

            const allApproved = (updatedDoc.chapters || []).every(c => c.status === 'approved');
            if (allApproved) {
                setPhase('assembling');
                setProgressMsg('Assembling your final document…');
                setProgress(80);
            } else {
                setPhase('generating_chapter');
                setProgressMsg(`Writing Chapter ${activeChapter.chapter_number + 1}…`);
                setProgress(Math.round((activeChapter.chapter_number / updatedDoc.total_chapters) * 100));
            }
        } catch (err) {
            setError(err?.message || 'Failed to approve chapter.');
        } finally {
            setLoading(false);
        }
    }, [document, activeChapter]);

    const handleRetryChapter = useCallback(async () => {
        setLoading(true);
        try {
            await scholarService.retryChapter(document.id, activeChapter.id);
            setPhase('generating_chapter');
            setProgressMsg(`Retrying Chapter ${activeChapter.chapter_number}…`);
        } catch (err) {
            setError(err?.message || 'Retry failed.');
        } finally {
            setLoading(false);
        }
    }, [document, activeChapter]);

    const handleReset = () => {
        setPhase('idle');
        setRefs([null, null]);
        setInstructions('');
        setDocument(null);
        setActiveChapter(null);
        setError('');
        setProgress(0);
        setProgressMsg('');
    };

    const handleExport = (format) => {
        const url = scholarService.exportUrl(document.id) + (format ? `?format=${format}` : '');
        window.open(url, '_blank');
    };

    const isLocked  = ['generating_outline', 'generating_chapter', 'assembling'].includes(phase);
    const isDone    = phase === 'complete';
    const canSubmit = instructions.trim().length >= 20 && !loading && !isLocked;

    // ── Right panel ───────────────────────────────────────────────────────────
    const renderRight = () => {
        if (phase === 'idle')              return <IdlePanel />;
        if (phase === 'generating_outline' || phase === 'generating_chapter' || phase === 'assembling')
            return <ProgressPanel message={progressMsg} progress={progress} />;
        if (phase === 'outline_review')
            return <OutlineReviewPanel document={document} onApprove={handleApproveOutline} loading={loading} />;
        if (phase === 'chapter_review' || phase === 'failed')
            return activeChapter
                ? <ChapterReviewPanel
                    chapter={activeChapter}
                    totalChapters={document?.total_chapters || 1}
                    onUpdate={handleUpdateChapter}
                    onApprove={handleApproveChapter}
                    onRetry={handleRetryChapter}
                    loading={loading}
                    isFailed={phase === 'failed'}
                  />
                : <ProgressPanel message="Loading chapter…" progress={0} />;
        if (isDone)
            return <DonePanel
                title={document?.title}
                wordCount={document?.word_count}
                citationCount={document?.citation_count}
                onExport={handleExport}
            />;
        return <IdlePanel />;
    };

    return (
        <>
            <style>{SHIMMER_CSS}</style>
            <main className="flex-1 h-full overflow-y-auto bg-slate-50 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8">
                <div className="max-w-6xl mx-auto grid grid-cols-12 gap-6 lg:gap-8 min-h-full">

                    {/* ── Left column — controls ── */}
                    <section className="col-span-12 lg:col-span-5 flex flex-col gap-6">

                        {/* Page header */}
                        <div>
                            <h1 className="text-3xl font-semibold text-slate-800 tracking-tight font-serif-elegant mb-1">
                                Scholar
                            </h1>
                            <p className="text-[14px] text-slate-400">Deep work, done right.</p>
                        </div>

                        {/* Reference examples */}
                        <div className="flex flex-col gap-3">
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <span className="material-icons-round text-primary text-[15px]">attachment</span>
                                Reference Files
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                {refs.map((file, i) => (
                                    <ReferenceSlot
                                        key={i}
                                        index={i}
                                        file={file}
                                        disabled={isLocked || isDone}
                                        onUpload={f => handleUpload(i, f)}
                                        onRemove={() => handleRemove(i)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Export format */}
                        {!isLocked && !isDone && (
                            <div className="flex flex-col gap-2">
                                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Output Format</p>
                                <div className="flex gap-2">
                                    {['pdf', 'docx', 'html'].map(f => (
                                        <button
                                            key={f}
                                            onClick={() => setExportFormat(f)}
                                            className={`px-4 py-2 rounded-lg text-[12px] font-semibold border transition-all ${exportFormat === f ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-primary/40'}`}
                                        >
                                            {f.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Instructions textarea */}
                        <div className="flex flex-col gap-3 flex-1">
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <span className="material-icons-round text-primary text-[15px]">draw</span>
                                Your Instructions
                            </p>
                            <div className="relative flex-1 min-h-[200px]">
                                <textarea
                                    value={instructions}
                                    onChange={e => setInstructions(e.target.value)}
                                    disabled={isLocked || isDone}
                                    placeholder="Describe what you want: topic, depth, format, audience…"
                                    className="w-full h-full min-h-[200px] bg-white border border-slate-100 rounded-lg p-5 text-[14px] text-slate-700 placeholder-slate-300 resize-none outline-none focus:ring-2 focus:ring-primary/20 shadow-sm hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                                <span className="material-icons-round text-red-400 text-[16px] mt-0.5">error_outline</span>
                                <p className="text-[13px] text-red-600">{error}</p>
                            </div>
                        )}

                        {/* CTA */}
                        {isDone ? (
                            <button
                                onClick={handleReset}
                                className="w-full py-4 rounded-lg bg-slate-100 text-slate-600 text-[14px] font-semibold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors active:scale-95"
                            >
                                <span className="material-icons-round text-[18px]">refresh</span>
                                Start New Document
                            </button>
                        ) : (
                            <button
                                onClick={handleGenerate}
                                disabled={!canSubmit}
                                className="w-full py-4 rounded-lg bg-primary text-white text-[14px] font-semibold flex items-center justify-center gap-2 shadow-lg hover:bg-primary/90 hover:shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                            >
                                {loading ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <span className="material-icons-round text-[18px]">auto_awesome</span>
                                )}
                                {isLocked ? 'Generating…' : 'Generate Document'}
                            </button>
                        )}
                    </section>

                    {/* ── Right column — dynamic panel ── */}
                    <section className="col-span-12 lg:col-span-7 flex flex-col min-h-[420px] pb-8">
                        {renderRight()}
                    </section>

                </div>
            </main>
        </>
    );
}

// ── Done panel (updated to accept real data) ──────────────────────────────────
function DonePanel({ title, wordCount, citationCount, onExport }) {
    const readMins = Math.ceil((wordCount || 0) / 200);
    return (
        <div className="flex-1 flex flex-col gap-5">
            <div className="bg-white rounded-lg shadow-lg border border-slate-100 p-6 flex flex-col gap-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-8 -mt-8" />

                <span className="inline-flex self-start items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-semibold">
                    <span className="material-icons-round text-[13px]">check_circle</span>
                    Research Complete
                </span>

                <div>
                    <h3 className="text-lg font-semibold text-slate-800 leading-snug mb-3">{title || 'Your Research Document'}</h3>
                    <div className="flex items-center gap-4 text-slate-400">
                        <div className="flex items-center gap-1.5">
                            <span className="material-icons-round text-[15px]">format_align_left</span>
                            <span className="text-[13px] font-medium">{(wordCount || 0).toLocaleString()} words</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="material-icons-round text-[15px]">schedule</span>
                            <span className="text-[13px] font-medium">{readMins} min read</span>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <div className="flex items-center gap-4">
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-widest">Citations</p>
                            <p className="text-[13px] font-semibold text-slate-700 mt-0.5">{citationCount || 0} Sources</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200" />
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-widest">Format</p>
                            <p className="text-[13px] font-semibold text-slate-700 mt-0.5">APA</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-3 gap-2">
                        {['pdf', 'docx', 'html'].map(fmt => (
                            <button
                                key={fmt}
                                onClick={() => onExport(fmt)}
                                className="flex items-center justify-center gap-1.5 py-3 rounded-lg bg-primary text-white text-[12px] font-semibold shadow-sm hover:bg-primary/90 transition-all active:scale-95"
                            >
                                <span className="material-icons-round text-[15px]">download</span>
                                {fmt.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-100 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                        <span className="material-icons-round text-amber-500 text-[18px]">auto_awesome</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">AI Research Agent</p>
                        <p className="text-[13px] font-semibold text-slate-700">Gemini 2.5 Flash — Complete</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
