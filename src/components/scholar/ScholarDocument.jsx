import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { scholarService } from '../../api/scholarService';
import DocumentEditor from './DocumentEditor';

// ── CSS injected once for all scholar components ──────────────────────────────
const SCHOLAR_CSS = `
@keyframes scholarShimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}
@keyframes shakespeareBgShift {
    0%,100% { background-position: 0% 50%; }
    50%      { background-position: 100% 50%; }
}
@keyframes shakespeareGlow {
    0%,100% { box-shadow: 0 0 6px 1px rgba(101,65,196,0.55), 0 0 14px 2px rgba(155,89,245,0.35); }
    50%      { box-shadow: 0 0 10px 3px rgba(101,65,196,0.80), 0 0 22px 5px rgba(155,89,245,0.55); }
}
@keyframes shakespeareSparkle {
    0%,100% { transform: scale(1) rotate(0deg);    opacity: 1; }
    30%      { transform: scale(1.25) rotate(12deg); opacity: 0.85; }
    60%      { transform: scale(0.9) rotate(-8deg);  opacity: 1; }
}
.shakespeare-glow-btn {
    animation: shakespeareBgShift 3s ease infinite, shakespeareGlow 2.5s ease-in-out infinite;
}
.shakespeare-glow-btn:hover {
    animation: shakespeareBgShift 1.5s ease infinite, shakespeareGlow 1s ease-in-out infinite;
    filter: brightness(1.15);
}
.shakespeare-sparkle { animation: shakespeareSparkle 2.5s ease-in-out infinite; display: inline-block; }
.scholar-shimmer {
    background: linear-gradient(90deg, #ab8eff 0%, #6541c4 50%, #ab8eff 100%);
    background-size: 200% 100%;
    animation: scholarShimmer 2.5s infinite linear;
}

/* ── Scholar doc typography ── */
.scholar-doc h1 { font-size: 1.75rem; font-weight: 700; color: #1e293b; margin: 2rem 0 1rem; line-height: 1.3; }
.scholar-doc h2 { font-size: 1.4rem; font-weight: 700; color: #1e293b; margin: 2.5rem 0 1rem; line-height: 1.4; border-bottom: 2px solid #f1f5f9; padding-bottom: 0.5rem; }
.scholar-doc h3 { font-size: 1.15rem; font-weight: 600; color: #334155; margin: 1.75rem 0 0.75rem; }
.scholar-doc h4 { font-size: 1rem; font-weight: 600; color: #475569; margin: 1.25rem 0 0.5rem; }
.scholar-doc p  { font-size: 0.9375rem; color: #475569; line-height: 1.8; margin: 0 0 1rem; }
.scholar-doc ul, .scholar-doc ol { padding-left: 1.75rem; margin: 0.75rem 0 1rem; }
.scholar-doc li { font-size: 0.9375rem; color: #475569; line-height: 1.7; margin-bottom: 0.35rem; }
.scholar-doc ul li { list-style-type: disc; }
.scholar-doc ol li { list-style-type: decimal; }
.scholar-doc table { width: 100%; border-collapse: collapse; margin: 1.25rem 0; font-size: 0.875rem; }
.scholar-doc th { background: #f8fafc; color: #334155; font-weight: 600; padding: 0.65rem 1rem; border: 1px solid #e2e8f0; text-align: left; }
.scholar-doc td { padding: 0.6rem 1rem; border: 1px solid #e2e8f0; color: #475569; }
.scholar-doc tr:nth-child(even) td { background: #f8fafc; }
.scholar-doc blockquote { border-left: 3px solid #6541c4; margin: 1.25rem 0; padding: 0.75rem 1.25rem; background: #f8f6ff; color: #4b5563; font-style: italic; border-radius: 0 0.5rem 0.5rem 0; }
.scholar-doc a { color: #6541c4; text-decoration: none; }
.scholar-doc a:hover { text-decoration: underline; }
.scholar-doc strong { color: #1e293b; font-weight: 600; }
.scholar-doc em { font-style: italic; }
.scholar-doc code { font-family: monospace; background: #f1f5f9; padding: 0.15rem 0.4rem; border-radius: 0.25rem; font-size: 0.875em; color: #6541c4; }
.scholar-doc pre { background: #1e293b; color: #e2e8f0; padding: 1.25rem; border-radius: 0.5rem; overflow-x: auto; margin: 1.25rem 0; }
.scholar-doc pre code { background: none; color: inherit; padding: 0; }
.scholar-doc figure.image-placeholder { width: 100%; min-height: 130px; border: 2px dashed #c4b5fd; border-radius: 0.75rem; background: #faf5ff; display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 1.75rem 0; padding: 1.5rem 2rem; gap: 0.5rem; }
.scholar-doc figure.image-placeholder::before { content: 'SUGGESTED IMAGE'; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.15em; color: #6541c4; font-family: system-ui, -apple-system, sans-serif; }
.scholar-doc figure.image-placeholder::after  { content: attr(data-keywords); font-size: 0.875rem; color: #7c3aed; font-style: italic; font-family: system-ui, -apple-system, sans-serif; text-align: center; line-height: 1.5; }
.scholar-doc img.scholar-generated-image { display: block; width: 100%; border-radius: 0.75rem; margin: 1.75rem 0; object-fit: cover; }

/* ── Editor overrides ── */
.scholar-editor-content { outline: none; }
.scholar-editor-content > *:first-child { margin-top: 0; }
.scholar-editor-content .ProseMirror { scroll-margin-top: 96px; }
.scholar-editor-content .ProseMirror > * { scroll-margin-top: 96px; }
.scholar-editor-content table { width: 100%; border-collapse: collapse; margin: 1.25rem 0; font-size: 0.875rem; }
.scholar-editor-content th { background: #f8fafc; color: #334155; font-weight: 600; padding: 0.65rem 1rem; border: 1px solid #e2e8f0; text-align: left; }
.scholar-editor-content td { padding: 0.6rem 1rem; border: 1px solid #e2e8f0; color: #475569; }
.scholar-editor-content .selectedCell { background: rgba(101, 65, 196, 0.08); }
`;

const ACTIVE_STATUSES = new Set([
    'pending_outline', 'generating_outline', 'outline_ready',
    'generating_chapter', 'chapter_ready', 'assembling',
]);

// ── Progress panel ────────────────────────────────────────────────────────────
function ProgressPanel({ doc }) {
    const [progress, setProgress] = useState(10);
    const [message,  setMessage]  = useState('Starting…');

    useEffect(() => {
        if (!doc) return;
        const s = doc.status;
        if (s === 'pending_outline') {
            setProgress(5); setMessage('Queued — waiting for a worker…');
        } else if (s === 'generating_outline' || s === 'outline_ready') {
            setProgress(prev => Math.max(prev, 15));
            setMessage('Researching topic and building document page plan…');
        } else if (s === 'generating_chapter' || s === 'chapter_ready') {
            const n     = doc.current_page || 1;
            const total = doc.total_pages  || 1;
            setProgress(Math.round(15 + ((n - 1) / total) * 70));
            const title = (doc.pages || []).find(c => c.page_number === n)?.title || '';
            setMessage(`Writing Page ${n}${title ? ': ' + title : ''}…`);
        } else if (s === 'assembling') {
            setProgress(90); setMessage('Assembling your final document…');
        }
    }, [doc?.status, doc?.current_page]);

    const totalPages = doc?.total_pages || 0;
    const donePages  = (doc?.pages || []).filter(c => c.status === 'approved').length;

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-8 animate-pulse">
                <span className="material-icons-round text-primary text-3xl">auto_awesome</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Scholar is writing your document</h2>
            <p className="text-[14px] text-slate-500 mb-8 leading-relaxed max-w-sm">{message}</p>

            <div className="w-full max-w-sm mb-3">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                    <span>Progress</span>
                    <span>{progress}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full scholar-shimmer rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
                </div>
            </div>

            {totalPages > 0 && (
                <p className="text-[12px] text-slate-400 mb-8">{donePages} of {totalPages} pages written</p>
            )}

            <div className="flex flex-col items-center gap-2 mt-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                    <span className="material-icons-round text-emerald-500 text-[14px]">check_circle</span>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">You can close this tab safely</p>
                </div>
                <p className="text-[11px] text-slate-300">Polls every 4 seconds</p>
            </div>
        </div>
    );
}

// ── Failed panel ──────────────────────────────────────────────────────────────
function FailedPanel({ doc, onRetryPage, onRetryOutline }) {
    const pages         = doc?.pages || [];
    const outlineFailed = pages.length === 0;
    const failedPage    = !outlineFailed
        ? pages.find(c => c.status === 'pending' || c.status === 'generating')
        : null;
    const approvedCount = pages.filter(c => c.status === 'approved').length;

    return (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                <span className="material-icons-round text-red-400 text-[30px]">error_outline</span>
            </div>
            <div>
                <h2 className="text-[18px] font-semibold text-slate-800 mb-1">Generation failed</h2>
                <p className="text-[13px] text-slate-500 max-w-sm">
                    {doc?.meta?.error || 'An unexpected error occurred during document generation.'}
                </p>
            </div>

            {outlineFailed ? (
                <p className="text-[12px] text-slate-400">Failed while generating the document outline.</p>
            ) : failedPage ? (
                <p className="text-[12px] text-slate-400">
                    Failed on Page {failedPage.page_number} — {failedPage.title}
                    {approvedCount > 0 && ` · ${approvedCount} of ${pages.length} pages completed`}
                </p>
            ) : (
                <p className="text-[12px] text-slate-400">{approvedCount} of {pages.length} pages completed before failure.</p>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
                {outlineFailed ? (
                    <button onClick={onRetryOutline} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-[13px] font-semibold shadow-sm hover:bg-primary/90 transition-all active:scale-95">
                        <span className="material-icons-round text-[16px]">refresh</span>
                        Retry outline generation
                    </button>
                ) : failedPage ? (
                    <>
                        <button onClick={() => onRetryPage(doc, failedPage)} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-[13px] font-semibold shadow-sm hover:bg-primary/90 transition-all active:scale-95">
                            <span className="material-icons-round text-[16px]">play_arrow</span>
                            Continue from Page {failedPage.page_number}
                        </button>
                        <button onClick={onRetryOutline} className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-[13px] font-semibold hover:bg-slate-50 transition-all active:scale-95">
                            <span className="material-icons-round text-[16px]">restart_alt</span>
                            Restart from scratch
                        </button>
                    </>
                ) : (
                    <button onClick={onRetryOutline} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-[13px] font-semibold shadow-sm hover:bg-primary/90 transition-all active:scale-95">
                        <span className="material-icons-round text-[16px]">restart_alt</span>
                        Restart from scratch
                    </button>
                )}
            </div>
        </div>
    );
}

// ── Main ScholarDocument page ─────────────────────────────────────────────────
export default function ScholarDocument() {
    const { id }     = useParams();
    const navigate   = useNavigate();
    const [doc,     setDoc]     = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState('');
    const pollingRef = useRef(null);

    const isActive = (d) => d && ACTIVE_STATUSES.has(d.status);

    const startPolling = (docId) => {
        stopPolling();
        pollingRef.current = setInterval(async () => {
            try {
                const res = await scholarService.show(docId);
                const fresh = res.data;
                setDoc(fresh);
                if (!isActive(fresh)) stopPolling();
            } catch { /* ignore */ }
        }, 4000);
    };

    const stopPolling = () => {
        if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
    };

    useEffect(() => {
        scholarService.show(id)
            .then(res => {
                const d = res.data;
                setDoc(d);
                if (isActive(d)) startPolling(id);
            })
            .catch(() => setError('Could not load this document.'))
            .finally(() => setLoading(false));

        return () => stopPolling();
    }, [id]);

    const handleExport = (fmt, formatting = {}) => {
        const params = new URLSearchParams({ format: fmt, ...formatting });
        window.open(`${scholarService.exportUrl(id)}?${params}`, '_blank');
    };

    const handleCoverSaved = (updatedCover) => {
        setDoc(prev => ({ ...prev, meta: { ...(prev.meta ?? {}), cover: updatedCover } }));
    };

    const handleTocStyleSaved = (tocStyle) => {
        setDoc(prev => ({ ...prev, meta: { ...(prev.meta ?? {}), toc_style: tocStyle } }));
    };

    const handleRetryPage = async (document, page) => {
        try {
            await scholarService.retryPage(document.id, page.id);
            setDoc(prev => ({ ...prev, status: 'generating_chapter' }));
            startPolling(id);
        } catch (err) {
            setError(err?.message || 'Retry failed.');
        }
    };

    const handleRetryOutline = async () => {
        try {
            setError('');
            await scholarService.retryOutline(id);
            setDoc(prev => ({ ...prev, status: 'pending_outline', pages: [] }));
            startPolling(id);
        } catch (err) {
            setError(err?.errors?.plan?.[0] || err?.message || 'Could not restart generation.');
        }
    };

    return (
        <>
            <style>{SCHOLAR_CSS}</style>
            <main className="flex-1 h-full overflow-y-auto bg-white lg:ml-64 p-4 lg:p-10 pt-20 lg:pt-8" style={{ scrollPaddingTop: '96px' }}>
                <div className="max-w-4xl mx-auto">

                    {/* Back nav */}
                    <button
                        onClick={() => navigate('/lockedin/scholar')}
                        className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-400 hover:text-primary transition-colors mb-6"
                    >
                        <span className="material-icons-round text-[16px]">arrow_back</span>
                        My Documents
                    </button>

                    {/* Error */}
                    {error && (
                        <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-6">
                            <span className="material-icons-round text-red-400 text-[16px] mt-0.5">error_outline</span>
                            <p className="text-[13px] text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Loading skeleton */}
                    {loading && (
                        <div className="animate-pulse flex flex-col gap-4">
                            <div className="h-6 bg-slate-100 rounded w-1/2" />
                            <div className="h-4 bg-slate-100 rounded w-1/3" />
                            <div className="h-40 bg-slate-100 rounded" />
                        </div>
                    )}

                    {/* Content */}
                    {!loading && doc && (
                        <>
                            {isActive(doc) && <ProgressPanel doc={doc} />}
                            {doc.status === 'complete' && (
                                <DocumentEditor
                                    doc={doc}
                                    onExport={handleExport}
                                    onCoverSaved={handleCoverSaved}
                                    onTocStyleSaved={handleTocStyleSaved}
                                />
                            )}
                            {doc.status === 'failed' && (
                                <FailedPanel
                                    doc={doc}
                                    onRetryPage={handleRetryPage}
                                    onRetryOutline={handleRetryOutline}
                                />
                            )}
                        </>
                    )}
                </div>
            </main>
        </>
    );
}
