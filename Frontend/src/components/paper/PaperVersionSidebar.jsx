import { useState, useEffect, useCallback, useRef } from "react";
import Loader from '../globals/Loader';
import { createPortal } from "react-dom";
import { paperService } from "../../api/paperService";

const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString(undefined, { month:'short',day:'numeric',year:'numeric' });
};

const parseContent = (raw) => {
    if (!raw) return { pages: [''], fontSize: 16, lineSpacing: 28, paddingX: 96, paddingY: 80 };
    try {
        const p = JSON.parse(raw);
        return { pages: p.pages ?? [''], fontSize: p.fontSize ?? 16, lineSpacing: p.lineSpacing ?? 28, paddingX: p.paddingX ?? 96, paddingY: p.paddingY ?? 80 };
    } catch {
        return { pages: [raw], fontSize: 16, lineSpacing: 28, paddingX: 96, paddingY: 80 };
    }
};

const PAGE_W = 816, PAGE_H = 1056;

const StaticPage = ({ content, fontSize, lineSpacing, paddingX, paddingY }) => (
    <div style={{ position:'relative',width:`${PAGE_W}px`,height:`${PAGE_H}px`,flexShrink:0,backgroundColor:'#ffffff',boxShadow:'0 8px 40px rgba(0,0,0,0.18)',borderRadius:'2px' }}>
        <div style={{ position:'absolute',inset:0,padding:`${paddingY}px ${paddingX}px`,fontSize:`${fontSize}px`,lineHeight:`${lineSpacing}px`,color:'#1e293b',fontFamily:'Inter,ui-sans-serif,sans-serif',wordBreak:'break-word',overflowWrap:'break-word',overflow:'hidden',boxSizing:'border-box',userSelect:'none',pointerEvents:'none' }}
            className="prose prose-stone max-w-none"
            dangerouslySetInnerHTML={{ __html: content ?? '' }} />
    </div>
);

const VersionPreviewModal = ({ versions, selectedIdx, onSelectIdx, onClose, onRevert, reverting }) => {
    const version    = versions[selectedIdx];
    const { pages, fontSize, lineSpacing, paddingX, paddingY } = parseContent(version?.content);
    const [pageIdx, setPageIdx] = useState(0);
    const previewAreaRef        = useRef(null);
    const [scale, setScale]     = useState(0.6);
    const isFirst               = selectedIdx === 0;
    const label                 = isFirst ? 'Latest snapshot' : `Version ${versions.length - selectedIdx}`;

    useEffect(() => { setPageIdx(0); }, [selectedIdx]);

    useEffect(() => {
        const measure = () => {
            if (!previewAreaRef.current) return;
            const { width, height } = previewAreaRef.current.getBoundingClientRect();
            setScale(Math.min((width-48)/PAGE_W, (height-48)/PAGE_H, 1));
        };
        measure();
        const ro = new ResizeObserver(measure);
        if (previewAreaRef.current) ro.observe(previewAreaRef.current);
        return () => ro.disconnect();
    }, []);

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-stretch justify-center" style={{ background:'rgba(15,23,42,0.55)',backdropFilter:'blur(4px)' }}>
            <div className="relative flex flex-col bg-white   shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" style={{ width:'100%',maxWidth:'1100px',margin:'auto',height:'95vh' }}>
                <div className="flex items-center justify-between px-3 md:px-6 py-3 md:py-4 border-b border-stone-100 shrink-0">
                    <div className="flex items-center gap-2 md:gap-3">
                        <span className="material-icons-round text-primary text-[18px] md:text-[22px]">history</span>
                        <div>
                            <h2 className="font-display font-semibold text-stone-900 text-sm md:text-base leading-tight">Version History</h2>
                            <p className="text-[10px] md:text-[11px] text-stone-400 mt-0.5">Preview and restore a previous version.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-7 h-7 md:w-9 md:h-9   flex items-center justify-center text-stone-400 hover:bg-stone-100 transition-colors">
                        <span className="material-icons-round text-[17px] md:text-[20px]">close</span>
                    </button>
                </div>
                <div className="flex flex-1 overflow-hidden">
                    <div className="w-36 md:w-56 border-r border-stone-100 flex flex-col shrink-0 overflow-y-auto custom-scrollbar bg-stone-50/60">
                        <p className="px-2 md:px-4 pt-3 md:pt-4 pb-2 text-[9px] md:text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Snapshots</p>
                        <div className="flex flex-col gap-0.5 px-1.5 md:px-2 pb-4">
                            {versions.map((v, i) => {
                                const isActive = i === selectedIdx, isLatest = i === 0;
                                return (
                                    <button key={v.id} onClick={() => onSelectIdx(i)}
                                        className={`w-full text-left   px-1.5 py-1.5 transition-all duration-150 flex items-center gap-2 md:gap-2.5 ${isActive?'bg-plum-600 text-white':'hover:bg-white hover:shadow-sm text-stone-700'}`}>
                                        <div className="mt-0.5 flex flex-col items-center shrink-0">
                                            <div className={`w-1.5 h-1.5 rounded-full border-2 shrink-0 ${isActive?'border-white bg-white':isLatest?'border-plum-600 bg-plum-600':'border-stone-300 bg-white'}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`text-[10px] md:text-xs font-medium truncate ${isActive?'text-white':'text-stone-700'}`}>{isLatest?'Latest snapshot':`Version ${versions.length-i}`}</p>
                                            <p className={`text-[9px] md:text-[10px] mt-0.5 ${isActive?'text-white/70':'text-stone-400'}`}>{timeAgo(v.created_at)}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col overflow-hidden bg-stone-100">
                        <div className="flex items-center justify-between px-3 md:px-6 py-2 md:py-3 border-b border-stone-200 bg-white shrink-0">
                            <div>
                                <span className="text-[11px] md:text-sm font-semibold text-stone-800">{label}</span>
                                <span className="ml-2 md:ml-3 text-[10px] md:text-xs text-stone-400">{timeAgo(version?.created_at)}</span>
                            </div>
                            {pages.length > 1 && (
                                <div className="flex items-center gap-2">
                                    <button onClick={()=>setPageIdx(p=>Math.max(0,p-1))} disabled={pageIdx===0} className="w-7 h-7  flex items-center justify-center bg-stone-100 text-stone-500 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                        <span className="material-icons-round text-[16px]">chevron_left</span>
                                    </button>
                                    <span className="text-xs font-semibold text-stone-500 select-none tabular-nums">Page {pageIdx+1} / {pages.length}</span>
                                    <button onClick={()=>setPageIdx(p=>Math.min(pages.length-1,p+1))} disabled={pageIdx===pages.length-1} className="w-7 h-7  flex items-center justify-center bg-stone-100 text-stone-500 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                        <span className="material-icons-round text-[16px]">chevron_right</span>
                                    </button>
                                </div>
                            )}
                        </div>
                        <div ref={previewAreaRef} className="flex-1 overflow-hidden flex items-center justify-center p-6">
                            <div style={{ transform:`scale(${scale})`,transformOrigin:'center center',width:`${PAGE_W}px`,height:`${PAGE_H}px`,flexShrink:0 }}>
                                <StaticPage content={pages[pageIdx]??''} fontSize={fontSize} lineSpacing={lineSpacing} paddingX={paddingX} paddingY={paddingY} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between px-3 md:px-6 py-3 md:py-4 border-t border-stone-100 bg-white shrink-0">
                    <p className="text-[10px] md:text-xs text-stone-400">{pages.length} {pages.length===1?'page':'pages'} · saved {timeAgo(version?.created_at)}</p>
                    <div className="flex items-center gap-2 md:gap-3">
                        <button onClick={onClose} className="px-3 md:px-5 py-1.5 md:py-2.5   text-[11px] md:text-sm font-semibold text-stone-600 hover:bg-stone-100 transition-colors">Cancel</button>
                        <button onClick={()=>onRevert(version.id)} disabled={reverting===version?.id}
                            className="flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-1.5 md:py-2.5   bg-plum-600 text-white text-[11px] md:text-sm font-medium hover:bg-plum-700 active:scale-95 transition-all disabled:opacity-60">
                            {reverting===version?.id
                                ? <><Loader size="xs" /></>
                                : <><span className="material-icons-round text-[15px]">restore</span>Restore this version</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export const PaperVersionSidebar = ({ paperId, onClose, onRevert }) => {
    const [versions, setVersions] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);
    const [reverting, setReverting] = useState(null);
    const [previewIdx, setPreviewIdx] = useState(null);

    const load = useCallback(async () => {
        if (!paperId) return;
        setLoading(true); setError(null);
        try {
            const res = await paperService.versions(paperId);
            setVersions(res.data?.data ?? []);
        } catch { setError('Could not load version history.'); }
        finally { setLoading(false); }
    }, [paperId]);

    useEffect(() => { load(); }, [load]);

    const handleRevert = async (versionId) => {
        if (!paperId) return;
        setReverting(versionId);
        try {
            const res = await paperService.revert(paperId, versionId);
            onRevert(res.data);
            setPreviewIdx(null);
            await load();
        } catch { setError('Failed to restore. Try again.'); }
        finally { setReverting(null); }
    };

    return (
        <aside className="w-52 md:w-72 border-l border-stone-200 bg-paper flex flex-col shrink-0 overflow-hidden relative z-30">
            <div className="flex items-center justify-between px-3 md:px-5 py-3 md:py-4 border-b border-stone-100">
                <div className="flex items-center gap-2">
                    <span className="material-icons-round text-primary text-[16px] md:text-[20px]">history</span>
                    <h3 className="font-display font-bold text-[11px] md:text-sm text-stone-900">Version History</h3>
                    <button onClick={load} disabled={loading} title="Refresh" className="w-5 h-5 md:w-6 md:h-6  flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                        <span className={`material-icons-round text-[13px] md:text-[15px] ${loading?'animate-spin':''}`}>refresh</span>
                    </button>
                </div>
                <button onClick={onClose} className="w-6 h-6 md:w-7 md:h-7  flex items-center justify-center text-stone-400 hover:bg-stone-100 transition-colors">
                    <span className="material-icons-round text-[16px] md:text-[18px]">close</span>
                </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loading && <div className="flex flex-col items-center justify-center py-16 gap-3 text-stone-400"><Loader size="lg" /></div>}
                {error && <div className="m-4 p-3 bg-red-50  text-xs text-red-500 font-medium flex items-center gap-2"><span className="material-icons-round text-[16px]">error_outline</span>{error}</div>}
                {!loading && !error && versions.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 px-6 text-center">
                        <span className="material-icons-round text-[36px] text-stone-200">history_toggle_off</span>
                        <p className="text-[10px] font-normal text-stone-400">No versions yet. Snapshots are saved every 5 minutes.</p>
                    </div>
                )}
                {!loading && versions.length > 0 && (
                    <div className="py-2 md:py-3 px-2 md:px-3 flex flex-col gap-1">
                        {versions.map((v, i) => (
                            <button key={v.id} onClick={() => setPreviewIdx(i)}
                                className="w-full flex items-center gap-2 md:gap-3 px-1.5 py-1.5   text-left border border-transparent hover:border-stone-100 hover:bg-stone-50 transition-all duration-150 group">
                                <div className="flex flex-col items-center shrink-0">
                                    <div className={`w-1.5 h-1.5 rounded-full border-2 ${i===0?'border-plum-600 bg-plum-600':'border-stone-300 bg-white'}`} />
                                    {i < versions.length-1 && <div className="w-px flex-1 min-h-[20px] bg-stone-100 mt-1" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] md:text-xs font-medium text-stone-700 truncate">{i===0?'Latest snapshot':`Version ${versions.length-i}`}</p>
                                    <p className="text-[9px] md:text-[10px] text-stone-400 mt-0.5">{timeAgo(v.created_at)}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <div className="px-3 md:px-5 py-2 md:py-3 border-t border-stone-50">
                <p className="text-[9px] md:text-[10px] text-stone-400 text-center">Snapshots saved every 5 minutes automatically</p>
            </div>
            {previewIdx !== null && versions.length > 0 && (
                <VersionPreviewModal versions={versions} selectedIdx={previewIdx} onSelectIdx={setPreviewIdx}
                    onClose={() => setPreviewIdx(null)} onRevert={handleRevert} reverting={reverting} />
            )}
        </aside>
    );
};
