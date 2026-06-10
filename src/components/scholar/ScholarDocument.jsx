import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { scholarService } from '../../api/scholarService';

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
.scholar-doc figure.image-placeholder::after { content: attr(data-keywords); font-size: 0.875rem; color: #7c3aed; font-style: italic; font-family: system-ui, -apple-system, sans-serif; text-align: center; line-height: 1.5; }
.scholar-doc img.scholar-generated-image { display: block; width: 100%; border-radius: 0.75rem; margin: 1.75rem 0; object-fit: cover; }
`;

// Converts <figure class="scholar-generated-image" data-src="URL" data-alt="..."> into a real <img> tag.
// Also handles the legacy <img class="scholar-generated-image"> format already in the DB.
function resolveImages(html) {
    return html.replace(
        /<figure\s+class="scholar-generated-image"\s+data-src="([^"]+)"(?:\s+data-alt="([^"]*)")?\s*><\/figure>/gi,
        (_, src, alt = '') => `<img src="${src}" alt="${alt}" class="scholar-generated-image" onerror="this.style.display='none'" />`
    );
}

const ACTIVE_STATUSES = new Set([
    'pending_outline', 'generating_outline', 'outline_ready',
    'generating_chapter', 'chapter_ready', 'assembling',
]);

// ── Progress panel ────────────────────────────────────────────────────────────
function ProgressPanel({ doc }) {
    const [progress, setProgress] = useState(10);
    const [message, setMessage]   = useState('Starting…');

    useEffect(() => {
        if (!doc) return;
        const s = doc.status;
        if (s === 'pending_outline') {
            setProgress(5);
            setMessage('Queued — waiting for a worker…');
        } else if (s === 'generating_outline' || s === 'outline_ready') {
            setProgress(prev => Math.max(prev, 15));
            setMessage('Researching topic and building document outline…');
        } else if (s === 'generating_chapter' || s === 'chapter_ready') {
            const n     = doc.current_chapter || 1;
            const total = doc.total_chapters  || 1;
            const pct   = Math.round(15 + ((n - 1) / total) * 70);
            setProgress(pct);
            const title = (doc.chapters || []).find(c => c.chapter_number === n)?.title || '';
            setMessage(`Writing Chapter ${n}${title ? ': ' + title : ''}…`);
        } else if (s === 'assembling') {
            setProgress(90);
            setMessage('Assembling your final document…');
        }
    }, [doc?.status, doc?.current_chapter]);

    const totalChapters = doc?.total_chapters || 0;
    const doneChapters  = (doc?.chapters || []).filter(c => c.status === 'approved').length;

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

            {totalChapters > 0 && (
                <p className="text-[12px] text-slate-400 mb-8">{doneChapters} of {totalChapters} chapters written</p>
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

// ── Table of contents ─────────────────────────────────────────────────────────
function TableOfContents({ chapters, outline }) {
    const outlineChapters = outline?.chapters || [];
    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8 print:break-inside-avoid">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span className="material-icons-round text-primary text-[20px]">toc</span>
                Table of Contents
            </h2>
            <ol className="flex flex-col gap-2">
                {chapters.map(ch => {
                    const outlineCh = outlineChapters.find(o => o.chapter_number === ch.chapter_number);
                    return (
                        <li key={ch.id}>
                            <a
                                href={`#chapter-${ch.chapter_number}`}
                                className="flex items-center gap-3 text-[14px] text-slate-600 hover:text-primary transition-colors group"
                            >
                                <span className="w-7 h-7 bg-white border border-slate-200 rounded-full text-[11px] font-bold text-slate-500 flex items-center justify-center shrink-0 group-hover:border-primary/40 group-hover:text-primary transition-colors">
                                    {ch.chapter_number}
                                </span>
                                <span className="group-hover:underline">{ch.title}</span>
                                {outlineCh?.estimated_pages && (
                                    <span className="ml-auto text-[11px] text-slate-400 shrink-0">~{outlineCh.estimated_pages}p</span>
                                )}
                            </a>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}

// ── Bibliography ──────────────────────────────────────────────────────────────
function Bibliography({ citations, style }) {
    if (!citations || citations.length === 0) return null;
    return (
        <section className="mt-10 pt-8 border-t border-slate-200 print:break-before-page">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">References</h2>
            <ol className="flex flex-col gap-3 pl-6">
                {citations.map((cite, i) => (
                    <li key={i} className="text-[13px] text-slate-600 leading-relaxed">
                        {cite.author} ({cite.year}). <em>{cite.title}</em>. {cite.source}.
                        {cite.url && (
                            <a href={cite.url} target="_blank" rel="noreferrer" className="ml-1 text-primary hover:underline break-all">
                                {cite.url}
                            </a>
                        )}
                    </li>
                ))}
            </ol>
        </section>
    );
}

// ── Full document viewer ──────────────────────────────────────────────────────
function DocumentViewer({ doc, onExport }) {
    const chapters    = doc.chapters || [];
    const allCitations = doc.meta?.all_citations || chapters.flatMap(c => c.citations || []);

    return (
        <div>
            {/* Floating export toolbar */}
            <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-slate-100 px-0 py-3 mb-8 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Scholar Document</p>
                    <p className="text-[14px] font-semibold text-slate-800 leading-snug">{doc.title}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[12px] text-slate-400 mr-1">Export:</span>
                    {['pdf', 'docx', 'html'].map(fmt => (
                        <button
                            key={fmt}
                            onClick={() => onExport(fmt)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-[12px] font-semibold hover:bg-primary/90 transition-all active:scale-95"
                        >
                            <span className="material-icons-round text-[14px]">download</span>
                            {fmt.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Document title page */}
            <div className="text-center py-12 border-b border-slate-100 mb-8">
                <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-4">{doc.title}</h1>
                <div className="flex items-center justify-center gap-6 text-[13px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                        <span className="material-icons-round text-[15px]">format_align_left</span>
                        {(doc.word_count || 0).toLocaleString()} words
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="material-icons-round text-[15px]">menu_book</span>
                        {chapters.length} chapters
                    </span>
                    {allCitations.length > 0 && (
                        <span className="flex items-center gap-1.5">
                            <span className="material-icons-round text-[15px]">format_quote</span>
                            {allCitations.length} sources
                        </span>
                    )}
                    <span className="flex items-center gap-1.5">
                        <span className="material-icons-round text-[15px]">calendar_today</span>
                        {new Date(doc.completed_at || doc.created_at).toLocaleDateString()}
                    </span>
                </div>
            </div>

            {/* Table of contents */}
            {doc.toc_enabled && chapters.length > 0 && (
                <TableOfContents chapters={chapters} outline={doc.outline} />
            )}

            {/* Chapter content */}
            <div className="flex flex-col gap-10">
                {chapters.map(ch => (
                    <section
                        key={ch.id}
                        id={`chapter-${ch.chapter_number}`}
                        className="scroll-mt-20"
                    >
                        <div
                            className="scholar-doc"
                            dangerouslySetInnerHTML={{ __html: resolveImages(ch.content || '') }}
                        />
                    </section>
                ))}
            </div>

            {/* Bibliography */}
            {doc.bibliography_enabled && (
                <Bibliography citations={allCitations} style={doc.citation_style} />
            )}
        </div>
    );
}

// ── Failed panel ──────────────────────────────────────────────────────────────
function FailedPanel({ doc, onRetry }) {
    const failedChapter = (doc?.chapters || []).find(c => c.status === 'generating' || c.status === 'pending');
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <span className="material-icons-round text-red-400 text-3xl">error_outline</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Generation failed</h2>
            <p className="text-[14px] text-slate-500 mb-2 max-w-sm">
                {doc?.meta?.error || 'An unexpected error occurred during document generation.'}
            </p>
            {failedChapter && (
                <p className="text-[12px] text-slate-400 mb-8">Failed on: Chapter {failedChapter.chapter_number} — {failedChapter.title}</p>
            )}
            {failedChapter && (
                <button
                    onClick={() => onRetry(doc, failedChapter)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-[13px] font-semibold shadow-sm hover:bg-primary/90 transition-all active:scale-95"
                >
                    <span className="material-icons-round text-[16px]">refresh</span>
                    Retry Chapter {failedChapter.chapter_number}
                </button>
            )}
        </div>
    );
}

// ── Main ScholarDocument page ─────────────────────────────────────────────────
export default function ScholarDocument() {
    const { id }     = useParams();
    const navigate   = useNavigate();
    const [doc, setDoc]     = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState('');
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

    const handleExport = (fmt) => {
        window.open(scholarService.exportUrl(id) + `?format=${fmt}`, '_blank');
    };

    const handleRetry = async (document, chapter) => {
        try {
            await scholarService.retryChapter(document.id, chapter.id);
            setDoc(prev => ({ ...prev, status: 'generating_chapter' }));
            startPolling(id);
        } catch (err) {
            setError(err?.message || 'Retry failed.');
        }
    };

    return (
        <>
            <style>{SHIMMER_CSS}</style>
            <main className="flex-1 h-full overflow-y-auto bg-white lg:ml-64 p-4 lg:p-10 pt-20 lg:pt-8">
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
                                <DocumentViewer doc={doc} onExport={handleExport} />
                            )}
                            {doc.status === 'failed' && (
                                <FailedPanel doc={doc} onRetry={handleRetry} />
                            )}
                        </>
                    )}
                </div>
            </main>
        </>
    );
}
