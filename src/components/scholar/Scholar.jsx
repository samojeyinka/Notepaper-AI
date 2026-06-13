import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { scholarService } from '../../api/scholarService';

const STATUS_META = {
    pending_outline:    { label: 'Queued',      color: 'text-slate-500  bg-slate-100',   icon: 'hourglass_empty' },
    generating_outline: { label: 'Researching', color: 'text-amber-700  bg-amber-50',    icon: 'search' },
    outline_ready:      { label: 'Writing',     color: 'text-amber-700  bg-amber-50',    icon: 'edit' },
    generating_chapter: { label: 'Writing',     color: 'text-amber-700  bg-amber-50',    icon: 'edit' },
    chapter_ready:      { label: 'Writing',     color: 'text-amber-700  bg-amber-50',    icon: 'edit' },
    assembling:         { label: 'Assembling',  color: 'text-amber-700  bg-amber-50',    icon: 'sync' },
    complete:           { label: 'Complete',    color: 'text-emerald-700 bg-emerald-50', icon: 'check_circle' },
    failed:             { label: 'Failed',      color: 'text-red-700    bg-red-50',      icon: 'error_outline' },
};

const ACTIVE_STATUSES = new Set([
    'pending_outline', 'generating_outline', 'outline_ready',
    'generating_chapter', 'chapter_ready', 'assembling',
]);

const DocumentCard = ({ doc, onOpen }) => {
    const meta       = STATUS_META[doc.status] ?? STATUS_META.pending_outline;
    const isActive   = ACTIVE_STATUSES.has(doc.status);
    const isComplete = doc.status === 'complete';
    const isFailed   = doc.status === 'failed';

    const actionLabel = isComplete ? 'Open Document'
        : isFailed   ? 'View Error'
        : isActive   ? 'View Progress'
        : 'Open';

    return (
        <div className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-3 ${isComplete ? 'border-emerald-100' : isFailed ? 'border-red-100' : 'border-slate-100'}`}>
            <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${meta.color}`}>
                    <span className="material-icons-round text-[13px]">{meta.icon}</span>
                    {meta.label}
                </span>
                {isActive && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
            </div>

            <div className="flex-1">
                <p className="text-[14px] font-semibold text-slate-800 leading-snug line-clamp-2">
                    {doc.title || doc.prompt}
                </p>
                {doc.title && (
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{doc.prompt}</p>
                )}
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                    <span className="material-icons-round text-[13px]">calendar_today</span>
                    {new Date(doc.created_at).toLocaleDateString()}
                </span>
                {doc.word_count > 0 && (
                    <span className="flex items-center gap-1">
                        <span className="material-icons-round text-[13px]">format_align_left</span>
                        {doc.word_count.toLocaleString()} words
                    </span>
                )}
                {doc.total_pages > 0 && (
                    <span className="flex items-center gap-1">
                        <span className="material-icons-round text-[13px]">menu_book</span>
                        {doc.total_pages} pg.
                    </span>
                )}
            </div>

            <button
                onClick={() => onOpen(doc)}
                className={`w-full py-2.5 rounded-lg text-[13px] font-semibold transition-all active:scale-95 ${
                    isComplete ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : isFailed  ? 'bg-red-50 text-red-700 hover:bg-red-100'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
            >
                {actionLabel}
            </button>
        </div>
    );
};

export default function Scholar() {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading]     = useState(true);

    useEffect(() => {
        scholarService.list()
            .then(res => setDocuments(res.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    return (
        <main className="flex-1 h-full overflow-y-auto bg-slate-50 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8">
            <div className="max-w-6xl mx-auto">

                <div className="flex items-end justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-800 tracking-tight font-serif-elegant mb-1">Scholar</h1>
                        <p className="text-[14px] text-slate-400">Deep work, done right.</p>
                    </div>
                    <button
                        onClick={() => navigate('/lockedin/scholar/new')}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-[13px] font-semibold shadow-sm hover:bg-primary/90 transition-all active:scale-95"
                    >
                        <span className="material-icons-round text-[18px]">add</span>
                        New Document
                    </button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-xl border border-slate-100 p-5 h-48 animate-pulse">
                                <div className="h-4 bg-slate-100 rounded w-1/3 mb-3" />
                                <div className="h-4 bg-slate-100 rounded w-full mb-2" />
                                <div className="h-4 bg-slate-100 rounded w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : documents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center mb-6">
                            <span className="material-icons-round text-slate-200 text-4xl">menu_book</span>
                        </div>
                        <h4 className="text-lg font-semibold text-slate-700 mb-2">No documents yet</h4>
                        <p className="text-[13px] text-slate-400 mb-6 max-w-xs">
                            Create your first AI-researched document. Give it a topic and Scholar will do the deep work.
                        </p>
                        <button
                            onClick={() => navigate('/lockedin/scholar/new')}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-[13px] font-semibold shadow-sm hover:bg-primary/90 transition-all active:scale-95"
                        >
                            <span className="material-icons-round text-[18px]">auto_awesome</span>
                            Create First Document
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {documents.map(doc => (
                            <DocumentCard
                                key={doc.id}
                                doc={doc}
                                onOpen={d => navigate(`/lockedin/scholar/${d.id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
