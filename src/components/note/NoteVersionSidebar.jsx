import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { noteService } from "../../api/noteService";

// ─── helpers ────────────────────────────────────────────────────────────────

const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const parseVersionContent = (raw) => {
    if (!raw) return { pages: [''], fontSize: 18, lineSpacing: 32 };
    try {
        const parsed = JSON.parse(raw);
        return {
            pages: parsed.pages ?? [''],
            fontSize: parsed.fontSize ?? 18,
            lineSpacing: parsed.lineSpacing ?? 32,
        };
    } catch {
        return { pages: [raw], fontSize: 18, lineSpacing: 32 };
    }
};

const fontFamilyCSS = (id) => {
    const map = {
        sans:        'Inter, ui-sans-serif, sans-serif',
        handwriting: 'Kalam, cursive',
        casual:      'Caveat, cursive',
        fun:         '"Indie Flower", cursive',
        shadows:     '"Shadows Into Light", cursive',
        dancing:     '"Dancing Script", cursive',
    };
    return map[id] || 'Inter, ui-sans-serif, sans-serif';
};

// ─── Static page renderer (read-only, no canvas) ────────────────────────────

const PAGE_W = 816;
const PAGE_H = 1056;

const StaticPage = ({ content, paperStyle, paperColor, lineColor, lineSpacing, fontSize, fontFamily, textColor }) => {
    const lineMargin = lineSpacing * 2;

    const linesStyle = (() => {
        if (paperStyle === 'ruled') return {
            backgroundImage: `linear-gradient(${lineColor} 1px, transparent 1px)`,
            backgroundSize: `100% ${lineSpacing}px`,
        };
        if (paperStyle === 'grid') return {
            backgroundImage: `linear-gradient(${lineColor} 1px, transparent 1px), linear-gradient(90deg, ${lineColor} 1px, transparent 1px)`,
            backgroundSize: `${lineSpacing}px ${lineSpacing}px`,
        };
        if (paperStyle === 'dotted') return {
            backgroundImage: `radial-gradient(circle, ${lineColor} 1.5px, transparent 1.5px)`,
            backgroundSize: `${lineSpacing}px ${lineSpacing}px`,
        };
        return null;
    })();

    return (
        <div
            style={{
                position: 'relative',
                width: `${PAGE_W}px`,
                height: `${PAGE_H}px`,
                flexShrink: 0,
                backgroundColor: paperColor,
                boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
                borderRadius: '2px',
            }}
        >
            {/* Lines layer */}
            {linesStyle && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '2px',
                        pointerEvents: 'none',
                        ...linesStyle,
                        backgroundClip: 'content-box',
                        padding: `${lineMargin}px 0`,
                        boxSizing: 'border-box',
                    }}
                />
            )}
            {/* Ruled margin */}
            {paperStyle === 'ruled' && (
                <div style={{
                    position: 'absolute',
                    left: '72px',
                    top: `${lineMargin}px`,
                    bottom: `${lineMargin}px`,
                    width: '1px',
                    backgroundColor: '#fca5a5',
                    opacity: 0.5,
                    pointerEvents: 'none',
                }} />
            )}
            {/* Content */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    padding: '72px 80px',
                    fontSize: `${fontSize}px`,
                    lineHeight: `${lineSpacing}px`,
                    color: textColor,
                    fontFamily: fontFamilyCSS(fontFamily),
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                    userSelect: 'none',
                    pointerEvents: 'none',
                }}
                className="prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: content ?? '' }}
            />
        </div>
    );
};

// ─── Preview Modal ───────────────────────────────────────────────────────────

const VersionPreviewModal = ({
    versions,
    selectedIdx,
    onSelectIdx,
    onClose,
    onRevert,
    reverting,
    noteStyles,
}) => {
    const version = versions[selectedIdx];
    const { pages, fontSize, lineSpacing } = parseVersionContent(version?.content);
    const [pageIdx, setPageIdx] = useState(0);
    const previewAreaRef = useRef(null);
    const [scale, setScale] = useState(0.6);

    // Reset page index when version changes
    useEffect(() => { setPageIdx(0); }, [selectedIdx]);

    // Compute scale to fit the page in the preview area
    useEffect(() => {
        const measure = () => {
            if (!previewAreaRef.current) return;
            const { width, height } = previewAreaRef.current.getBoundingClientRect();
            const sx = (width - 48) / PAGE_W;
            const sy = (height - 48) / PAGE_H;
            setScale(Math.min(sx, sy, 1));
        };
        measure();
        const ro = new ResizeObserver(measure);
        if (previewAreaRef.current) ro.observe(previewAreaRef.current);
        return () => ro.disconnect();
    }, []);

    const isFirst = selectedIdx === 0;
    const label = isFirst ? 'Latest snapshot' : `Version ${versions.length - selectedIdx}`;

    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-stretch justify-center"
            style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}
        >
            <div
                className="relative flex flex-col bg-white rounded-none md:rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                style={{ width: '100%', maxWidth: '1100px', margin: 'auto', height: '95vh' }}
            >
                {/* ── Top bar ── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="material-icons-round text-primary text-[22px]">history</span>
                        <div>
                            <h2 className="font-display font-bold text-slate-900 text-base leading-tight">Version History</h2>
                            <p className="text-[11px] text-slate-400 mt-0.5">Preview a version, then restore it if it's the one you want.</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
                    >
                        <span className="material-icons-round text-[20px]">close</span>
                    </button>
                </div>

                {/* ── Body ── */}
                <div className="flex flex-1 overflow-hidden">

                    {/* Left: version list */}
                    <div className="w-56 border-r border-slate-100 flex flex-col shrink-0 overflow-y-auto custom-scrollbar bg-slate-50/60">
                        <p className="px-4 pt-4 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Snapshots</p>
                        <div className="flex flex-col gap-0.5 px-2 pb-4">
                            {versions.map((v, i) => {
                                const isActive = i === selectedIdx;
                                const isLatest = i === 0;
                                return (
                                    <button
                                        key={v.id}
                                        onClick={() => onSelectIdx(i)}
                                        className={`w-full text-left rounded-xl px-3 py-3 transition-all duration-150 flex items-start gap-2.5
                                            ${isActive
                                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                                : 'hover:bg-white hover:shadow-sm text-slate-700'}`}
                                    >
                                        {/* timeline dot */}
                                        <div className="mt-0.5 flex flex-col items-center shrink-0">
                                            <div className={`w-2 h-2 rounded-full border-2 shrink-0 ${isActive ? 'border-white bg-white' : isLatest ? 'border-primary bg-primary' : 'border-slate-300 bg-white'}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-700'}`}>
                                                {isLatest ? 'Latest snapshot' : `Version ${versions.length - i}`}
                                            </p>
                                            <p className={`text-[10px] mt-0.5 ${isActive ? 'text-white/70' : 'text-slate-400'}`}>{timeAgo(v.created_at)}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: page preview */}
                    <div className="flex-1 flex flex-col overflow-hidden bg-slate-100">
                        {/* Version label bar */}
                        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white shrink-0">
                            <div>
                                <span className="text-sm font-bold text-slate-800">{label}</span>
                                <span className="ml-3 text-xs text-slate-400">{timeAgo(version?.created_at)}</span>
                            </div>
                            {pages.length > 1 && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPageIdx(p => Math.max(0, p - 1))}
                                        disabled={pageIdx === 0}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <span className="material-icons-round text-[16px]">chevron_left</span>
                                    </button>
                                    <span className="text-xs font-semibold text-slate-500 select-none tabular-nums">
                                        Page {pageIdx + 1} / {pages.length}
                                    </span>
                                    <button
                                        onClick={() => setPageIdx(p => Math.min(pages.length - 1, p + 1))}
                                        disabled={pageIdx === pages.length - 1}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <span className="material-icons-round text-[16px]">chevron_right</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Scaled page */}
                        <div
                            ref={previewAreaRef}
                            className="flex-1 overflow-hidden flex items-center justify-center p-6"
                        >
                            <div
                                style={{
                                    transform: `scale(${scale})`,
                                    transformOrigin: 'center center',
                                    width: `${PAGE_W}px`,
                                    height: `${PAGE_H}px`,
                                    flexShrink: 0,
                                }}
                            >
                                <StaticPage
                                    content={pages[pageIdx] ?? ''}
                                    paperStyle={noteStyles.paperStyle}
                                    paperColor={noteStyles.paperColor}
                                    lineColor={noteStyles.lineColor}
                                    lineSpacing={lineSpacing}
                                    fontSize={fontSize}
                                    fontFamily={noteStyles.fontFamily}
                                    textColor={noteStyles.textColor}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white shrink-0">
                    <p className="text-xs text-slate-400">
                        {pages.length} {pages.length === 1 ? 'page' : 'pages'} · saved {timeAgo(version?.created_at)}
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onRevert(version.id)}
                            disabled={reverting === version?.id}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-60 shadow-lg shadow-primary/20"
                        >
                            {reverting === version?.id ? (
                                <><span className="material-icons-round text-[15px] animate-spin">sync</span> Restoring…</>
                            ) : (
                                <><span className="material-icons-round text-[15px]">restore</span> Restore this version</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export const NoteVersionSidebar = ({
    noteId,
    onClose,
    onRevert,
    // current note styles — used as the preview backdrop
    paperStyle = 'ruled',
    paperColor = '#ffffff',
    lineColor = '#cbd5e1',
    textColor = '#1e293b',
    fontFamily = 'sans',
}) => {
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reverting, setReverting] = useState(null);
    const [previewIdx, setPreviewIdx] = useState(null); // null = modal closed

    const load = useCallback(async () => {
        if (!noteId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await noteService.versions(noteId);
            setVersions(res.data?.data ?? []);
        } catch {
            setError('Could not load version history.');
        } finally {
            setLoading(false);
        }
    }, [noteId]);

    useEffect(() => { load(); }, [load]);

    const handleRevert = async (versionId) => {
        if (!noteId) return;
        setReverting(versionId);
        try {
            const res = await noteService.revert(noteId, versionId);
            onRevert(res.data);
            setPreviewIdx(null);
            await load();
        } catch {
            setError('Failed to restore version. Try again.');
        } finally {
            setReverting(null);
        }
    };

    return (
        <aside className="w-72 border-l border-slate-200 bg-white flex flex-col shrink-0 overflow-hidden relative z-30">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <span className="material-icons-round text-primary text-[20px]">history</span>
                    <h3 className="font-display font-bold text-sm text-slate-900">Version History</h3>
                    <button
                        onClick={load}
                        disabled={loading}
                        title="Refresh version list"
                        className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <span className={`material-icons-round text-[15px] ${loading ? 'animate-spin' : ''}`}>refresh</span>
                    </button>
                </div>
                <button
                    onClick={onClose}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
                >
                    <span className="material-icons-round text-[18px]">close</span>
                </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loading && (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                        <span className="material-icons-round text-[32px] animate-spin">sync</span>
                        <p className="text-xs font-normal">Loading history…</p>
                    </div>
                )}

                {error && (
                    <div className="m-4 p-3 bg-red-50 rounded-xl text-xs text-red-500 font-medium flex items-center gap-2">
                        <span className="material-icons-round text-[16px]">error_outline</span>
                        {error}
                    </div>
                )}

                {!loading && !error && versions.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 px-6 text-center">
                        <span className="material-icons-round text-[36px] text-slate-200">history_toggle_off</span>
                        <p className="text-[10px] font-normal text-slate-400">No versions yet. Keep writing — snapshots are saved every 5 minutes.</p>
                    </div>
                )}

                {!loading && versions.length > 0 && (
                    <div className="py-3 px-3 flex flex-col gap-1">
                        {versions.map((v, i) => {
                            const isFirst = i === 0;
                            return (
                                <button
                                    key={v.id}
                                    onClick={() => setPreviewIdx(i)}
                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all duration-150 group"
                                >
                                    {/* Timeline dot */}
                                    <div className="flex flex-col items-center shrink-0">
                                        <div className={`w-2.5 h-2.5 rounded-full border-2 ${isFirst ? 'border-primary bg-primary' : 'border-slate-300 bg-white'}`} />
                                        {i < versions.length - 1 && <div className="w-px flex-1 min-h-[20px] bg-slate-100 mt-1" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-700 truncate">
                                            {isFirst ? 'Latest snapshot' : `Version ${versions.length - i}`}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(v.created_at)}</p>
                                    </div>

                                    <span className="material-icons-round text-[16px] text-slate-300 group-hover:text-primary transition-colors">
                                        visibility
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-50">
                <p className="text-[10px] text-slate-400 text-center">Snapshots saved every 5 minutes automatically</p>
            </div>

            {/* Preview modal — rendered via portal so it covers the whole screen */}
            {previewIdx !== null && versions.length > 0 && (
                <VersionPreviewModal
                    versions={versions}
                    selectedIdx={previewIdx}
                    onSelectIdx={setPreviewIdx}
                    onClose={() => setPreviewIdx(null)}
                    onRevert={handleRevert}
                    reverting={reverting}
                    noteStyles={{ paperStyle, paperColor, lineColor, textColor, fontFamily }}
                />
            )}
        </aside>
    );
};
