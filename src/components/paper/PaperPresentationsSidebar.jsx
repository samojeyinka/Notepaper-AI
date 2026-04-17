import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { paperService } from "../../api/paperService";

const THEME_PREVIEWS = {
    modern:   { bg: 'linear-gradient(135deg, #0f172a, #1e293b)', accent: '#6366f1', text: '#fff' },
    minimal:  { bg: 'linear-gradient(135deg, #fff, #f8fafc)',    accent: '#0f172a', text: '#0f172a', border: '1px solid #e2e8f0' },
    academic: { bg: 'linear-gradient(135deg, #1e3a5f, #1d4ed8)', accent: '#60a5fa', text: '#fff' },
    bold:     { bg: 'linear-gradient(135deg, #6d28d9, #c026d3)', accent: '#f0abfc', text: '#fff' },
    pastel:   { bg: 'linear-gradient(135deg, #fce7f3, #e0e7ff)', accent: '#8b5cf6', text: '#3730a3' },
};

const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7)  return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const SlideMiniPreview = ({ theme }) => {
    const p = THEME_PREVIEWS[theme] ?? THEME_PREVIEWS.modern;
    return (
        <div className="w-full aspect-video rounded-lg overflow-hidden relative shrink-0"
            style={{ background: p.bg, border: p.border ?? 'none' }}>
            <div className="absolute inset-0 p-2 flex flex-col justify-center">
                <div style={{ width: 16, height: 2, background: p.accent, borderRadius: 1, marginBottom: 4 }} />
                <div style={{ width: '70%', height: 3, background: p.text, opacity: 0.7, borderRadius: 1, marginBottom: 3 }} />
                <div style={{ width: '50%', height: 2, background: p.text, opacity: 0.35, borderRadius: 1 }} />
            </div>
        </div>
    );
};

export const PaperPresentationsSidebar = ({ paperId, onClose, onNewPresentation }) => {
    const navigate = useNavigate();
    const [presentations, setPresentations] = useState([]);
    const [loading, setLoading]             = useState(true);
    const [error, setError]                 = useState(null);

    const load = useCallback(async () => {
        if (!paperId) return;
        setLoading(true); setError(null);
        try {
            const res = await paperService.presentations(paperId);
            setPresentations(res.data ?? []);
        } catch {
            setError('Could not load presentations.');
        } finally {
            setLoading(false);
        }
    }, [paperId]);

    useEffect(() => { load(); }, [load]);

    return (
        <aside className="w-72 border-l border-slate-200 bg-white flex flex-col shrink-0 overflow-hidden relative z-30">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <span className="material-icons-round text-primary text-[20px]">slideshow</span>
                    <h3 className="font-display font-bold text-sm text-slate-900">Presentations</h3>
                    <button onClick={load} disabled={loading} title="Refresh"
                        className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-primary transition-colors disabled:opacity-40">
                        <span className={`material-icons-round text-[15px] ${loading ? 'animate-spin' : ''}`}>refresh</span>
                    </button>
                </div>
                <button onClick={onClose}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
                    <span className="material-icons-round text-[18px]">close</span>
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loading && (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                        <span className="material-icons-round text-[32px] animate-spin">sync</span>
                        <p className="text-xs">Loading…</p>
                    </div>
                )}
                {error && (
                    <div className="m-4 p-3 bg-red-50 rounded-xl text-xs text-red-500 font-medium flex items-center gap-2">
                        <span className="material-icons-round text-[16px]">error_outline</span>{error}
                    </div>
                )}
                {!loading && !error && presentations.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 px-6 text-center">
                        <span className="material-icons-round text-[36px] text-slate-200">slideshow</span>
                        <p className="text-[11px] text-slate-400 leading-relaxed">No presentations yet.<br />Generate slides from this paper to get started.</p>
                    </div>
                )}
                {!loading && presentations.length > 0 && (
                    <div className="py-3 px-3 flex flex-col gap-2">
                        {presentations.map((p) => (
                            <button key={p.id} onClick={() => navigate(`/lockedin/presentations/${p.id}`)}
                                className="w-full text-left rounded-xl border border-slate-100 hover:border-primary/30 hover:shadow-md bg-white p-3 transition-all group">
                                <SlideMiniPreview theme={p.theme} />
                                <div className="mt-2.5">
                                    <p className="text-xs font-semibold text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">{p.title}</p>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-[10px] text-slate-400">{p.slide_count} slides · {p.theme}</span>
                                        <span className="text-[10px] text-slate-400">{timeAgo(p.created_at)}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer action */}
            <div className="px-4 py-3 border-t border-slate-100">
                <button onClick={onNewPresentation}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-primary to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all">
                    <span className="material-icons-round text-[16px]">auto_awesome</span>
                    Generate New Presentation
                </button>
            </div>
        </aside>
    );
};
