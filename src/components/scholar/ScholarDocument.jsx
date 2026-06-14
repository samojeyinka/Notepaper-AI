import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { scholarService } from '../../api/scholarService';
import PageEditor from './ChapterEditor';
import CoverPage from './CoverPage';
import CoverPageForm from './CoverPageForm';
import TocStyleForm from './TocStyleForm';
import { GeneratePresentationModal } from '../paper/GeneratePresentationModal';
import { ScholarPresentationsSidebar } from './ScholarPresentationsSidebar';

const SCHOLAR_FONTS = [
    { label: 'Default',         value: null },
    { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
    { label: 'Arial',           value: 'Arial, Helvetica, sans-serif' },
    { label: 'Georgia',         value: 'Georgia, serif' },
    { label: 'Helvetica',       value: 'Helvetica, Arial, sans-serif' },
    { label: 'Courier New',     value: '"Courier New", Courier, monospace' },
    { label: 'Verdana',         value: 'Verdana, Geneva, sans-serif' },
];
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Prevents dnd-kit from swallowing pointer events on contenteditable / form elements,
// which would otherwise block the TipTap editor from receiving focus and keystrokes.
function isEditableTarget(element) {
    if (!element) return false;
    if (element.isContentEditable) return true;
    if (element.closest?.('[contenteditable]')) return true;
    const tag = element.tagName?.toLowerCase();
    return ['input', 'textarea', 'select', 'option'].includes(tag);
}

class SmartPointerSensor extends PointerSensor {
    static activators = [
        {
            eventName: 'onPointerDown',
            handler: ({ nativeEvent }) => {
                if (!nativeEvent.isPrimary || nativeEvent.button !== 0) return false;
                if (isEditableTarget(nativeEvent.target)) return false;
                return true;
            },
        },
    ];
}

const SHIMMER_CSS = `
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
    0%,100% { transform: scale(1) rotate(0deg);   opacity: 1; }
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
.shakespeare-sparkle {
    animation: shakespeareSparkle 2.5s ease-in-out infinite;
    display: inline-block;
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
.scholar-editor-content { outline: none; }
.scholar-editor-content > *:first-child { margin-top: 0; }
.scholar-editor-content table { width: 100%; border-collapse: collapse; margin: 1.25rem 0; font-size: 0.875rem; }
.scholar-editor-content th { background: #f8fafc; color: #334155; font-weight: 600; padding: 0.65rem 1rem; border: 1px solid #e2e8f0; text-align: left; }
.scholar-editor-content td { padding: 0.6rem 1rem; border: 1px solid #e2e8f0; color: #475569; }
.scholar-editor-content .selectedCell { background: rgba(101, 65, 196, 0.08); }
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
            setMessage('Researching topic and building document page plan…');
        } else if (s === 'generating_chapter' || s === 'chapter_ready') {
            const n     = doc.current_page || 1;
            const total = doc.total_pages  || 1;
            const pct   = Math.round(15 + ((n - 1) / total) * 70);
            setProgress(pct);
            const title = (doc.pages || []).find(c => c.page_number === n)?.title || '';
            setMessage(`Writing Page ${n}${title ? ': ' + title : ''}…`);
        } else if (s === 'assembling') {
            setProgress(90);
            setMessage('Assembling your final document…');
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

// ── TOC helpers ───────────────────────────────────────────────────────────────
function extractHeadings(html, pageNum) {
    if (!html) return [];
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    return [...parsed.querySelectorAll('h2, h3, h4')].map((node, idx) => ({
        id: `${pageNum}-h${node.tagName[1]}-${idx}`,
        level: parseInt(node.tagName[1]),
        originalText: node.textContent.trim(),
    }));
}

function buildFreshEntries(pages) {
    return (pages || []).map(pg => ({
        pageId: pg.id,
        page_number: pg.page_number,
        label: pg.title || '',
        hidden: false,
        subs: extractHeadings(pg.content, pg.page_number).map(h => ({
            ...h, label: h.originalText, hidden: false,
        })),
    }));
}

function mergeTocEntries(fresh, saved) {
    if (!saved?.length) return fresh;
    return fresh.map(entry => {
        const sv = saved.find(s => s.pageId === entry.pageId);
        if (!sv) return entry;
        const mergedSubs = entry.subs.map(sub => {
            const svSub = sv.subs?.find(s => s.id === sub.id);
            return svSub ? { ...sub, label: svSub.label ?? sub.label, hidden: Boolean(svSub.hidden) } : sub;
        });
        return { ...entry, label: sv.label ?? entry.label, hidden: Boolean(sv.hidden), subs: mergedSubs };
    });
}

// ── Table of contents ─────────────────────────────────────────────────────────
function TableOfContents({ pages, savedEntries, documentId }) {
    const [entries, setEntries]   = useState(() => mergeTocEntries(buildFreshEntries(pages), savedEntries));
    const [collapsed, setCollapsed] = useState(false);
    const [editing, setEditing]   = useState(false);
    const [draft, setDraft]       = useState([]);
    const [saving, setSaving]     = useState(false);
    const [saveErr, setSaveErr]   = useState('');
    const prevPagesRef = useRef(pages);

    // Re-merge when pages change (content edits, new pages, reorder, delete).
    useEffect(() => {
        if (prevPagesRef.current === pages) return;
        prevPagesRef.current = pages;
        setEntries(prev => mergeTocEntries(buildFreshEntries(pages), prev));
    }, [pages]);

    const openEdit = () => {
        setDraft(JSON.parse(JSON.stringify(entries)));
        setSaveErr('');
        setEditing(true);
    };

    const updateEntry = (ei, field, value) =>
        setDraft(prev => prev.map((e, i) => i === ei ? { ...e, [field]: value } : e));

    const updateSub = (ei, si, field, value) =>
        setDraft(prev => prev.map((e, i) => i !== ei ? e : {
            ...e,
            subs: e.subs.map((s, j) => j === si ? { ...s, [field]: value } : s),
        }));

    const handleReset = () => setDraft(buildFreshEntries(pages));

    const handleSave = async () => {
        setSaving(true);
        setSaveErr('');
        try {
            await scholarService.updateMeta(documentId, { toc_entries: draft });
            setEntries(draft);
            setEditing(false);
        } catch {
            setSaveErr('Could not save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const visible = entries.filter(e => !e.hidden);

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl mb-8 overflow-hidden print:break-inside-avoid">
            {/* Header — clicking the title area collapses/expands */}
            <div
                className={`flex items-center justify-between px-6 py-4 cursor-pointer select-none hover:bg-slate-100/60 transition-colors ${!collapsed ? 'border-b border-slate-200' : ''}`}
                onClick={() => { if (!editing) setCollapsed(c => !c); }}
            >
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <span className="material-icons-round text-primary text-[20px]">toc</span>
                    Table of Contents
                    <span className={`material-icons-round text-[18px] text-slate-400 transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`}>
                        expand_more
                    </span>
                </h2>
                {!collapsed && !editing && (
                    <button
                        onClick={e => { e.stopPropagation(); openEdit(); }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-primary hover:bg-primary/8 transition-colors border border-transparent hover:border-primary/15"
                    >
                        <span className="material-icons-round text-[14px]">edit</span>
                        Edit
                    </button>
                )}
                {!collapsed && editing && (
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={handleReset}
                            className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            Reset
                        </button>
                        <button
                            onClick={() => setEditing(false)}
                            className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-white text-[12px] font-semibold hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-60"
                        >
                            {saving
                                ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                : <span className="material-icons-round text-[14px]">save</span>}
                            {saving ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                )}
            </div>

            {/* Collapsible body */}
            {!collapsed && <div className="px-6 py-5">

            {saveErr && (
                <div className="flex items-center gap-1.5 mb-3 px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-[12px] text-red-600">
                    <span className="material-icons-round text-[14px]">error_outline</span>
                    {saveErr}
                </div>
            )}

            {/* ── View mode ── */}
            {!editing && (
                <nav>
                    {visible.length === 0 ? (
                        <p className="text-[13px] text-slate-400 italic">All entries are hidden. Click "Edit" to restore them.</p>
                    ) : visible.map(entry => (
                        <div key={entry.pageId ?? entry.page_number}>
                            <a
                                href={`#page-${entry.page_number}`}
                                className="flex items-center gap-3 text-[14px] text-slate-600 hover:text-primary transition-colors group py-1.5"
                            >
                                <span className="w-7 h-7 bg-white border border-slate-200 rounded-full text-[11px] font-bold text-slate-500 flex items-center justify-center shrink-0 group-hover:border-primary/40 group-hover:text-primary transition-colors">
                                    {entry.page_number}
                                </span>
                                <span className="font-medium group-hover:underline">
                                    {entry.label || <em className="text-slate-400 font-normal">Untitled</em>}
                                </span>
                            </a>
                            {entry.subs?.filter(s => !s.hidden).map(sub => (
                                <a
                                    key={sub.id}
                                    href={`#page-${entry.page_number}`}
                                    style={{ paddingLeft: `${(sub.level - 2) * 18 + 46}px` }}
                                    className="flex items-center gap-2 text-[12px] text-slate-400 hover:text-primary transition-colors group py-0.5"
                                >
                                    <span className="w-1 h-1 rounded-full bg-slate-300 group-hover:bg-primary/50 shrink-0 transition-colors" />
                                    <span className="group-hover:underline">{sub.label}</span>
                                </a>
                            ))}
                        </div>
                    ))}
                </nav>
            )}

            {/* ── Edit mode ── */}
            {editing && (
                <div className="flex flex-col gap-2">
                    {draft.map((entry, ei) => (
                        <div
                            key={entry.pageId ?? entry.page_number}
                            className={`rounded-xl border overflow-hidden transition-opacity ${entry.hidden ? 'opacity-40 border-dashed border-slate-200' : 'border-slate-200 bg-white'}`}
                        >
                            {/* Page-level row */}
                            <div className="flex items-center gap-2 px-3 py-2">
                                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0 select-none">
                                    {entry.page_number}
                                </span>
                                <input
                                    value={entry.label}
                                    placeholder="Untitled"
                                    disabled={entry.hidden}
                                    onChange={e => updateEntry(ei, 'label', e.target.value)}
                                    className="flex-1 min-w-0 bg-transparent text-[13px] font-semibold text-slate-700 outline-none border border-transparent hover:border-slate-200 focus:border-primary/40 focus:bg-white px-2 py-1 rounded-lg transition-all placeholder-slate-300 disabled:opacity-50"
                                />
                                <button
                                    onClick={() => updateEntry(ei, 'hidden', !entry.hidden)}
                                    title={entry.hidden ? 'Show in TOC' : 'Hide from TOC'}
                                    className={`p-1 rounded-lg transition-colors shrink-0 ${entry.hidden ? 'text-slate-300 hover:text-primary hover:bg-primary/8' : 'text-slate-400 hover:text-red-400 hover:bg-red-50'}`}
                                >
                                    <span className="material-icons-round text-[16px]">
                                        {entry.hidden ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>

                            {/* Sub-heading rows */}
                            {!entry.hidden && entry.subs?.map((sub, si) => (
                                <div
                                    key={sub.id}
                                    style={{ paddingLeft: `${(sub.level - 2) * 16 + 12}px` }}
                                    className={`flex items-center gap-2 pr-3 py-1.5 border-t border-slate-100 transition-opacity ${sub.hidden ? 'opacity-40' : ''}`}
                                >
                                    <span className={`text-[9px] font-bold rounded px-1 py-0.5 shrink-0 ${sub.level === 2 ? 'bg-primary/10 text-primary' : sub.level === 3 ? 'bg-slate-100 text-slate-400' : 'bg-slate-50 text-slate-300'}`}>
                                        H{sub.level}
                                    </span>
                                    <input
                                        value={sub.label}
                                        placeholder={sub.originalText}
                                        disabled={sub.hidden}
                                        onChange={e => updateSub(ei, si, 'label', e.target.value)}
                                        className="flex-1 min-w-0 bg-transparent text-[12px] text-slate-600 outline-none border border-transparent hover:border-slate-200 focus:border-primary/40 focus:bg-white px-2 py-0.5 rounded-lg transition-all placeholder-slate-300 disabled:opacity-50"
                                    />
                                    <button
                                        onClick={() => updateSub(ei, si, 'hidden', !sub.hidden)}
                                        title={sub.hidden ? 'Show in TOC' : 'Hide from TOC'}
                                        className={`p-1 rounded-lg transition-colors shrink-0 ${sub.hidden ? 'text-slate-200 hover:text-primary hover:bg-primary/8' : 'text-slate-300 hover:text-red-400 hover:bg-red-50'}`}
                                    >
                                        <span className="material-icons-round text-[14px]">
                                            {sub.hidden ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ))}
                    <p className="text-[11px] text-slate-400 mt-1">
                        Hiding an entry removes it from the TOC only — page content is not affected.
                    </p>
                </div>
            )}
            </div>}
        </div>
    );
}

// ── Bibliography (view + edit) ────────────────────────────────────────────────
const EMPTY_CITATION = { author: '', title: '', year: '', source: '', url: '' };

function Bibliography({ citations: initialCitations, documentId, onSaved }) {
    const [editing, setEditing]     = useState(false);
    const [draft, setDraft]         = useState([]);
    const [saving, setSaving]       = useState(false);
    const [saveError, setSaveError] = useState('');

    const citations = initialCitations || [];

    const openEditor = () => {
        setDraft(citations.map(c => ({ ...c })));
        setSaveError('');
        setEditing(true);
    };

    const updateField = (idx, field, value) =>
        setDraft(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));

    const addRow = () => setDraft(prev => [...prev, { ...EMPTY_CITATION }]);

    const removeRow = (idx) => setDraft(prev => prev.filter((_, i) => i !== idx));

    const handleSave = async () => {
        setSaving(true);
        setSaveError('');
        try {
            const res = await scholarService.updateBibliography(documentId, draft);
            onSaved(res.data?.meta?.all_citations ?? draft);
            setEditing(false);
        } catch {
            setSaveError('Could not save references. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const fieldClass = 'w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[12px] text-slate-700 placeholder-slate-300 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all';

    return (
        <section className="mt-10 pt-8 border-t border-slate-200 print:break-before-page">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">References</h2>
                {!editing ? (
                    <button
                        onClick={openEditor}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-primary hover:bg-primary/8 transition-colors border border-transparent hover:border-primary/15"
                    >
                        <span className="material-icons-round text-[14px]">edit</span>
                        Edit references
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setEditing(false)}
                            className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-white text-[12px] font-semibold hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-60"
                        >
                            {saving ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span className="material-icons-round text-[14px]">save</span>}
                            {saving ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                )}
            </div>

            {saveError && (
                <div className="flex items-center gap-1.5 mb-4 px-4 py-2 bg-red-50 border border-red-100 rounded-lg text-[12px] text-red-600">
                    <span className="material-icons-round text-[14px]">error_outline</span>
                    {saveError}
                </div>
            )}

            {editing ? (
                <div className="flex flex-col gap-4">
                    {draft.map((cite, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reference {idx + 1}</span>
                                <button
                                    onClick={() => removeRow(idx)}
                                    className="p-1 rounded-full hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors"
                                    title="Remove reference"
                                >
                                    <span className="material-icons-round text-[16px]">delete_outline</span>
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Author(s)</label>
                                    <input className={fieldClass} value={cite.author} placeholder="e.g. Smith, J." onChange={e => updateField(idx, 'author', e.target.value)} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Year</label>
                                    <input className={fieldClass} value={cite.year} placeholder="e.g. 2024" onChange={e => updateField(idx, 'year', e.target.value)} />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Title</label>
                                <input className={fieldClass} value={cite.title} placeholder="Publication title" onChange={e => updateField(idx, 'title', e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Source / Journal / Publisher</label>
                                <input className={fieldClass} value={cite.source} placeholder="e.g. Nature, 502(1), 45–50" onChange={e => updateField(idx, 'source', e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">URL (optional)</label>
                                <input className={fieldClass} value={cite.url || ''} placeholder="https://…" onChange={e => updateField(idx, 'url', e.target.value)} />
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={addRow}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-primary/40 text-slate-400 hover:text-primary text-[12px] font-semibold transition-all"
                    >
                        <span className="material-icons-round text-[16px]">add</span>
                        Add Reference
                    </button>
                </div>
            ) : citations.length === 0 ? (
                <p className="text-[13px] text-slate-400 italic">No references. Click "Edit references" to add some.</p>
            ) : (
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
            )}
        </section>
    );
}

// ── Sortable page item ────────────────────────────────────────────────────────
function SortablePageItem({ pg, isEditing, isCollapsed, onToggleCollapse, onEdit, onSave, onCancel, onDelete, onDirtyChange, documentId, pageNumbering }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: pg.id });
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [isDeleting, setIsDeleting]             = useState(false);

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            await onDelete(pg.id);
        } finally {
            setIsDeleting(false);
            setConfirmingDelete(false);
        }
    };

    return (
        <section
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            id={`page-${pg.page_number}`}
            className={`scroll-mt-20 ${isDragging ? 'opacity-50' : ''}`}
        >
            {/* Page header */}
            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border mb-3 transition-colors ${isEditing ? 'bg-primary/5 border-primary/20' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                {/* Drag handle */}
                <button
                    {...attributes}
                    {...listeners}
                    tabIndex={-1}
                    className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing shrink-0 touch-none"
                    title="Drag to reorder"
                >
                    <span className="material-icons-round text-[20px]">drag_indicator</span>
                </button>

                {/* Number badge */}
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0 select-none">
                    {pg.page_number}
                </span>

                {/* Title */}
                <span className="text-[13px] font-semibold flex-1 truncate select-none text-slate-700">
                    {pg.title || <span className="text-slate-400 italic font-normal">Untitled page</span>}
                </span>

                {/* Word count */}
                {(pg.word_count > 0) && !isEditing && (
                    <span className="text-[10px] text-slate-400 shrink-0 tabular-nums hidden sm:inline">
                        {pg.word_count.toLocaleString()}w
                    </span>
                )}

                {/* Inline delete confirm — replaces edit/delete/collapse when active */}
                {!isEditing && confirmingDelete ? (
                    <div className="flex items-center gap-1.5 ml-auto shrink-0">
                        <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">Delete page?</span>
                        <button
                            onClick={() => setConfirmingDelete(false)}
                            disabled={isDeleting}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-40"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60"
                        >
                            {isDeleting && <span className="material-icons-round text-[12px] animate-spin">autorenew</span>}
                            Delete
                        </button>
                    </div>
                ) : !isEditing && (
                    <>
                        {/* Edit button */}
                        <button
                            onClick={() => onEdit(pg.id)}
                            className="flex items-center gap-0.5 px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-primary hover:bg-primary/8 transition-colors shrink-0"
                        >
                            <span className="material-icons-round text-[14px]">edit</span>
                            <span className="hidden sm:inline">Edit</span>
                        </button>

                        {/* Delete button */}
                        <button
                            onClick={() => setConfirmingDelete(true)}
                            className="flex items-center gap-0.5 px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                            title="Delete page"
                        >
                            <span className="material-icons-round text-[14px]">delete_outline</span>
                        </button>
                    </>
                )}

                {/* Collapse toggle */}
                {!confirmingDelete && (
                    <button
                        onClick={() => onToggleCollapse(pg.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
                        title={isCollapsed ? 'Expand' : 'Collapse'}
                    >
                        <span className={`material-icons-round text-[20px] transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`}>
                            expand_more
                        </span>
                    </button>
                )}
            </div>

            {/* Collapsible body */}
            {!isCollapsed && (
                isEditing ? (
                    <PageEditor
                        page={pg}
                        documentId={documentId}
                        onSave={onSave}
                        onCancel={onCancel}
                        onDirtyChange={onDirtyChange}
                    />
                ) : (
                    <>
                        <div className="scholar-doc" dangerouslySetInnerHTML={{ __html: resolveImages(pg.content || '') }} />
                        {pageNumbering && (
                            <div className="flex justify-end mt-4 pt-3 border-t border-slate-100">
                                <span className="text-[11px] text-slate-300 font-medium tabular-nums">— {pg.page_number} —</span>
                            </div>
                        )}
                    </>
                )
            )}
        </section>
    );
}

// ── Add page form ─────────────────────────────────────────────────────────────
function AddPageForm({ documentId, onAdded }) {
    const [open, setOpen]         = useState(false);
    const [title, setTitle]       = useState('');
    const [noTitle, setNoTitle]   = useState(false);
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState('');
    const inputRef = useRef(null);

    const openForm = () => {
        setTitle('');
        setNoTitle(false);
        setError('');
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const canSubmit = noTitle || title.trim().length > 0;

    const handleAdd = async () => {
        if (!canSubmit || loading) return;
        setLoading(true);
        setError('');
        try {
            const res = await scholarService.addPage(documentId, noTitle ? '' : title.trim());
            onAdded(res.data);
            setOpen(false);
        } catch {
            setError('Could not add page. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!open) {
        return (
            <button
                onClick={openForm}
                className="w-full flex items-center justify-center gap-2 py-3 mt-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-primary/40 text-slate-400 hover:text-primary text-[13px] font-semibold transition-all"
            >
                <span className="material-icons-round text-[18px]">add</span>
                Add Page
            </button>
        );
    }

    return (
        <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">New Page</p>

            {/* Title input — hidden when noTitle is checked */}
            {!noTitle && (
                <input
                    ref={inputRef}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setOpen(false); }}
                    placeholder="Page title…"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-[14px] text-slate-700 placeholder-slate-300 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                />
            )}

            {/* No title toggle */}
            <button
                type="button"
                onClick={() => {
                    setNoTitle(v => !v);
                    if (noTitle) setTimeout(() => inputRef.current?.focus(), 0);
                }}
                className="flex items-center gap-2 text-[12px] text-slate-500 hover:text-slate-700 transition-colors w-fit"
            >
                <span className={`material-icons-round text-[16px] ${noTitle ? 'text-primary' : 'text-slate-300'}`}>
                    {noTitle ? 'check_box' : 'check_box_outline_blank'}
                </span>
                No title (continuation page)
            </button>

            {error && (
                <p className="text-[12px] text-red-500 flex items-center gap-1">
                    <span className="material-icons-round text-[14px]">error_outline</span>
                    {error}
                </p>
            )}
            <div className="flex gap-2">
                <button
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 rounded-lg text-[12px] font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleAdd}
                    disabled={!canSubmit || loading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-[12px] font-semibold hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading
                        ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <span className="material-icons-round text-[14px]">add</span>}
                    {loading ? 'Adding…' : 'Add Page'}
                </button>
            </div>
        </div>
    );
}

// ── Unsaved changes modal ─────────────────────────────────────────────────────
function UnsavedChangesModal({ onDiscard, onKeep }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 flex flex-col gap-5">
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-amber-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-icons-round text-amber-500 text-[20px]">edit_note</span>
                    </div>
                    <div>
                        <p className="text-[14px] font-semibold text-slate-800">Unsaved changes</p>
                        <p className="text-[13px] text-slate-500 mt-1 leading-relaxed">
                            This page has unsaved edits. Discard them and switch pages?
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={onKeep}
                        className="px-4 py-2 rounded-lg text-[12px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                        Keep editing
                    </button>
                    <button
                        onClick={onDiscard}
                        className="px-4 py-2 rounded-lg text-[12px] font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-colors"
                    >
                        Discard & switch
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Export options modal ──────────────────────────────────────────────────────
function ExportOptionsModal({ format, formatting, onConfirm, onClose }) {
    const [bodyPt, setBodyPt] = useState(12);
    const [tocPt,  setTocPt]  = useState(12);
    const [refPt,  setRefPt]  = useState(12);

    const step = (setter, delta) => setter(v => Math.max(8, Math.min(20, v + delta)));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 flex flex-col gap-5">
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <span className="material-icons-round text-primary text-[20px]">download</span>
                    </div>
                    <div>
                        <p className="text-[14px] font-semibold text-slate-800">Export as {format.toUpperCase()}</p>
                        <p className="text-[13px] text-slate-500 mt-0.5">Set font sizes for each section</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    {[
                        { label: 'Body text',         val: bodyPt, setter: setBodyPt },
                        { label: 'Table of contents', val: tocPt,  setter: setTocPt  },
                        { label: 'References',        val: refPt,  setter: setRefPt  },
                    ].map(({ label, val, setter }) => (
                        <div key={label} className="flex items-center justify-between">
                            <span className="text-[12px] font-medium text-slate-600">{label}</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => step(setter, -1)}
                                    className="w-7 h-7 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center text-[16px] font-medium leading-none transition-colors"
                                >−</button>
                                <span className="text-[13px] font-semibold text-slate-800 w-8 text-center">{val}pt</span>
                                <button
                                    onClick={() => step(setter, 1)}
                                    className="w-7 h-7 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center text-[16px] font-medium leading-none transition-colors"
                                >+</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex gap-2 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-[12px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => { onConfirm(format, { ...formatting, body_font_size: bodyPt, toc_font_size: tocPt, ref_font_size: refPt }); onClose(); }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-[12px] font-semibold hover:bg-primary/90 transition-all active:scale-95"
                    >
                        <span className="material-icons-round text-[14px]">download</span>
                        Download
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Full document viewer ──────────────────────────────────────────────────────
function DocumentViewer({ doc, onExport, onCoverSaved, onTocStyleSaved }) {
    const navigate = useNavigate();
    const [pages, setPages]                   = useState(doc.pages || []);
    const [editingPageId, setEditingPageId]   = useState(null);
    const [collapsedIds, setCollapsedIds]     = useState(new Set());
    const [allCitations, setAllCitations]     = useState(
        doc.meta?.all_citations || (doc.pages || []).flatMap(c => c.citations || [])
    );
    const dirtyRef      = useRef(false);
    const [pendingEditId, setPendingEditId]   = useState(null);
    const [docLineHeight, setDocLineHeight]   = useState('1.5');
    const [docSpaceBefore, setDocSpaceBefore] = useState(false);
    const [docSpaceAfter, setDocSpaceAfter]   = useState(false);
    const [marginTop,    setMarginTop]    = useState(24);
    const [marginRight,  setMarginRight]  = useState(24);
    const [marginBottom, setMarginBottom] = useState(24);
    const [marginLeft,   setMarginLeft]   = useState(24);
    const [docFontFamily, setDocFontFamily] = useState(null);
    const [showCoverForm, setShowCoverForm]             = useState(!doc.meta?.cover?.layout);
    const [showTocStyleForm, setShowTocStyleForm]       = useState(false);
    const [showPresentationModal, setShowPresentationModal] = useState(false);
    const [showPresentationsSidebar, setShowPresentationsSidebar] = useState(false);
    const [exportModal, setExportModal]                 = useState(null);

    const fontLabel = SCHOLAR_FONTS.find(f => f.value === docFontFamily)?.label ?? 'Default';

    const handleCoverSaved = (updatedCover) => {
        setShowCoverForm(false);
        onCoverSaved(updatedCover);
    };

    const handleTocStyleSaved = (tocStyle) => {
        setShowTocStyleForm(false);
        onTocStyleSaved(tocStyle);
    };

    // meta.page_numbering is stored as string '1'/'0' or boolean; use loose != to handle both
    const pageNumbering = doc.meta?.page_numbering != false && doc.meta?.page_numbering !== '0';

    const sensors = useSensors(
        useSensor(SmartPointerSensor, { activationConstraint: { distance: 8 } })
    );

    const switchToEdit = (pageId) => {
        dirtyRef.current = false;
        setCollapsedIds(prev => { const s = new Set(prev); s.delete(pageId); return s; });
        setEditingPageId(pageId);
    };

    const requestEdit = (pageId) => {
        if (editingPageId === pageId) return;
        if (editingPageId !== null && dirtyRef.current) {
            setPendingEditId(pageId);
            return;
        }
        switchToEdit(pageId);
    };

    const handleSave = (pageId, updatedPage) => {
        setPages(prev => prev.map(pg =>
            pg.id === pageId ? { ...pg, content: updatedPage.content ?? pg.content } : pg
        ));
        setEditingPageId(null);
        dirtyRef.current = false;
    };

    const handleCancel = () => {
        setEditingPageId(null);
        dirtyRef.current = false;
    };

    const toggleCollapse = (pageId) => {
        setCollapsedIds(prev => {
            const s = new Set(prev);
            s.has(pageId) ? s.delete(pageId) : s.add(pageId);
            return s;
        });
    };

    const collapseAll = () => setCollapsedIds(new Set(pages.map(c => c.id)));
    const expandAll   = () => setCollapsedIds(new Set());

    const handleDragEnd = async ({ active, over }) => {
        if (!over || active.id === over.id) return;
        const oldIdx = pages.findIndex(c => c.id === active.id);
        const newIdx = pages.findIndex(c => c.id === over.id);
        const reordered = arrayMove(pages, oldIdx, newIdx).map((pg, i) => ({ ...pg, page_number: i + 1 }));
        setPages(reordered);
        try {
            await scholarService.reorderPages(doc.id, reordered.map(c => c.id));
        } catch {
            setPages(pages);
        }
    };

    const handlePageAdded = (newPage) => {
        setPages(prev => [...prev, newPage]);
        setCollapsedIds(prev => { const s = new Set(prev); s.delete(newPage.id); return s; });
        setEditingPageId(newPage.id);
    };

    const handlePageDeleted = async (pageId) => {
        const snapshot = pages;
        setPages(pages.filter(c => c.id !== pageId).map((c, i) => ({ ...c, page_number: i + 1 })));
        setCollapsedIds(prev => { const s = new Set(prev); s.delete(pageId); return s; });
        if (editingPageId === pageId) setEditingPageId(null);
        try {
            await scholarService.deletePage(doc.id, pageId);
        } catch {
            setPages(snapshot);
        }
    };

    const allCollapsed = pages.length > 0 && collapsedIds.size === pages.length;

    return (
        <div className="flex items-start gap-0">
            {/* modals — all fixed/portal, don't affect layout */}
            {pendingEditId !== null && (
                <UnsavedChangesModal
                    onDiscard={() => { switchToEdit(pendingEditId); setPendingEditId(null); }}
                    onKeep={() => setPendingEditId(null)}
                />
            )}

            {exportModal && (
                <ExportOptionsModal
                    format={exportModal}
                    formatting={{
                        line_height:   docLineHeight,
                        space_before:  docSpaceBefore ? '1' : '0',
                        space_after:   docSpaceAfter  ? '1' : '0',
                        margin_top:    marginTop,
                        margin_right:  marginRight,
                        margin_bottom: marginBottom,
                        margin_left:   marginLeft,
                        font_family:   docFontFamily || '',
                    }}
                    onConfirm={onExport}
                    onClose={() => setExportModal(null)}
                />
            )}

            {/* Main document content */}
            <div className="flex-1 min-w-0">
            {/* Global formatting overrides — applies to every page in both view and edit mode */}
            <style>{`
                .scholar-doc p, .scholar-doc li,
                .scholar-editor-content p, .scholar-editor-content li {
                    line-height: ${docLineHeight} !important;
                    ${docSpaceBefore ? 'margin-top: 1em !important;' : ''}
                    ${docSpaceAfter  ? 'margin-bottom: 1em !important;' : ''}
                }
                .scholar-doc,
                .scholar-editor-content {
                    padding-top: ${marginTop}px !important;
                    padding-right: ${marginRight}px !important;
                    padding-bottom: ${marginBottom}px !important;
                    padding-left: ${marginLeft}px !important;
                }
                ${docFontFamily ? `.scholar-doc, .scholar-doc *,
                .scholar-editor-content, .scholar-editor-content * {
                    font-family: ${docFontFamily} !important;
                }` : ''}
            `}</style>

            {/* Sticky document toolbar */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-0 py-2 mb-8 flex items-center gap-2 justify-between">

                {/* Left — document identity */}
                <div className="shrink-0 min-w-0">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Scholar</p>
                    <p className="text-[13px] font-semibold text-slate-800 leading-snug truncate max-w-[200px]">{doc.title}</p>
                </div>

                <div className="w-px h-6 bg-slate-200 shrink-0" />

                {/* Centre — formatting menus */}
                <div className="flex items-center gap-0.5 flex-1">

                    {/* Font */}
                    <GlobalDropdown label={fontLabel} icon="text_fields" panelClass="min-w-[180px]">
                        {SCHOLAR_FONTS.map(f => (
                            <GDItem
                                key={f.label}
                                active={docFontFamily === f.value}
                                onClick={() => setDocFontFamily(f.value)}
                            >
                                <span style={{ fontFamily: f.value ?? 'inherit' }}>{f.label}</span>
                            </GDItem>
                        ))}
                    </GlobalDropdown>

                    {/* Spacing */}
                    <GlobalDropdown label="Spacing" icon="format_line_spacing" panelClass="min-w-[210px]">
                        <div className="py-1.5">
                            <p className="px-3 pt-1 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Line height</p>
                            {[
                                { label: 'Single', value: '1'    },
                                { label: '1.15',   value: '1.15' },
                                { label: '1.5',    value: '1.5'  },
                                { label: 'Double', value: '2'    },
                            ].map(s => (
                                <GDItem key={s.value} active={docLineHeight === s.value} onClick={() => setDocLineHeight(s.value)}>
                                    {s.label}
                                </GDItem>
                            ))}
                            <div className="border-t border-slate-100 my-1.5" />
                            <p className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paragraph spacing</p>
                            {[
                                { label: 'Space before paragraph', val: docSpaceBefore, toggle: () => setDocSpaceBefore(v => !v) },
                                { label: 'Space after paragraph',  val: docSpaceAfter,  toggle: () => setDocSpaceAfter(v => !v)  },
                            ].map(({ label, val, toggle }) => (
                                <button
                                    key={label}
                                    onClick={toggle}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-slate-700 hover:bg-slate-50 transition-colors text-left"
                                >
                                    <span className={`material-icons-round text-[15px] ${val ? 'text-primary' : 'text-slate-300'}`}>
                                        {val ? 'check_box' : 'check_box_outline_blank'}
                                    </span>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </GlobalDropdown>

                    {/* Margins */}
                    <GlobalDropdown label="Margins" icon="border_outer" panelClass="min-w-[200px]">
                        <div className="p-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Page margins (px)</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                {[
                                    { label: 'Top',    val: marginTop,    fn: setMarginTop    },
                                    { label: 'Right',  val: marginRight,  fn: setMarginRight  },
                                    { label: 'Bottom', val: marginBottom, fn: setMarginBottom },
                                    { label: 'Left',   val: marginLeft,   fn: setMarginLeft   },
                                ].map(({ label, val, fn }) => (
                                    <div key={label} className="flex flex-col gap-1">
                                        <span className="text-[10px] font-semibold text-slate-500">{label}</span>
                                        <input
                                            type="number"
                                            value={val}
                                            onChange={e => fn(Math.max(0, Number(e.target.value)))}
                                            min="0"
                                            step="4"
                                            className="w-full text-center text-[12px] text-slate-700 border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-primary/50"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </GlobalDropdown>
                </div>

                <div className="w-px h-6 bg-slate-200 shrink-0" />

                {/* Right — actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                    <button
                        onClick={() => setShowCoverForm(true)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    >
                        <span className="material-icons-round text-[14px]">auto_stories</span>
                        Cover
                    </button>
                    {doc.toc_enabled && (
                        <button
                            onClick={() => setShowTocStyleForm(true)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        >
                            <span className="material-icons-round text-[14px]">toc</span>
                            TOC Style
                        </button>
                    )}
                    <button
                        onClick={() => setShowPresentationsSidebar(v => !v)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all ${showPresentationsSidebar ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        title="View presentations from this document"
                    >
                        <span className="material-icons-round text-[14px]">slideshow</span>
                        Slides
                    </button>
                    {['pdf', 'docx'].map(fmt => (
                        <button
                            key={fmt}
                            onClick={() => setExportModal(fmt)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-[12px] font-semibold hover:bg-primary/90 transition-all active:scale-95"
                        >
                            <span className="material-icons-round text-[14px]">download</span>
                            {fmt.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cover page */}
            <div className="relative group">
                <CoverPage cover={doc.meta?.cover} doc={doc} />
                <button
                    onClick={() => setShowCoverForm(true)}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white shadow-sm border border-slate-200 text-[11px] font-semibold text-slate-500 hover:text-primary hover:border-primary/40 transition-all"
                >
                    <span className="material-icons-round text-[13px]">edit</span>
                    {doc.meta?.cover?.layout ? 'Edit Cover' : 'Customize Cover'}
                </button>
            </div>

            {/* Cover form modal */}
            {showCoverForm && (
                <CoverPageForm
                    doc={doc}
                    onSaved={handleCoverSaved}
                    onClose={() => setShowCoverForm(false)}
                />
            )}

            {/* TOC style form modal */}
            {showTocStyleForm && (
                <TocStyleForm
                    doc={doc}
                    onSaved={handleTocStyleSaved}
                    onClose={() => setShowTocStyleForm(false)}
                />
            )}

            {/* Generate Presentation modal */}
            {showPresentationModal && (
                <GeneratePresentationModal
                    onClose={() => setShowPresentationModal(false)}
                    paperId={null}
                    scholarDocumentId={doc.id}
                    paperTitle={doc.title}
                    pages={pages.map(pg => pg.content || '')}
                    onGenerated={(saved) => {
                        setShowPresentationModal(false);
                        if (saved?.id) navigate(`/lockedin/presentations/${saved.id}`);
                    }}
                />
            )}

            {/* Table of contents */}
            {doc.toc_enabled && pages.length > 0 && (
                <TableOfContents
                    pages={pages}
                    savedEntries={doc.meta?.toc_entries}
                    documentId={doc.id}
                />
            )}

            {/* Collapse / expand all */}
            {pages.length > 1 && (
                <div className="flex justify-end mb-4">
                    <button
                        onClick={allCollapsed ? expandAll : collapseAll}
                        className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-primary transition-colors"
                    >
                        <span className="material-icons-round text-[15px]">
                            {allCollapsed ? 'unfold_more' : 'unfold_less'}
                        </span>
                        {allCollapsed ? 'Expand all' : 'Collapse all'}
                    </button>
                </div>
            )}

            {/* Pages (drag + collapse) */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={pages.map(pg => pg.id)} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-col gap-6">
                        {pages.map(pg => (
                            <SortablePageItem
                                key={pg.id}
                                pg={pg}
                                isEditing={editingPageId === pg.id}
                                isCollapsed={collapsedIds.has(pg.id)}
                                onToggleCollapse={toggleCollapse}
                                onEdit={requestEdit}
                                onSave={handleSave}
                                onCancel={handleCancel}
                                onDelete={handlePageDeleted}
                                onDirtyChange={(dirty) => { dirtyRef.current = dirty; }}
                                documentId={doc.id}
                                pageNumbering={pageNumbering}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {/* Add page */}
            <AddPageForm documentId={doc.id} onAdded={handlePageAdded} />

            {/* Bibliography */}
            {doc.bibliography_enabled && (
                <Bibliography
                    citations={allCitations}
                    documentId={doc.id}
                    onSaved={setAllCitations}
                />
            )}
            </div>{/* end flex-1 content */}

            {/* Presentations sidebar */}
            {showPresentationsSidebar && (
                <ScholarPresentationsSidebar
                    docId={doc.id}
                    onClose={() => setShowPresentationsSidebar(false)}
                    onNewPresentation={() => { setShowPresentationsSidebar(false); setShowPresentationModal(true); }}
                />
            )}
        </div>
    );
}

// ── Global toolbar primitives ─────────────────────────────────────────────────

function GlobalDropdown({ label, icon, children, panelClass = '' }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(o => !o)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors whitespace-nowrap ${
                    open ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
            >
                <span className="material-icons-round text-[14px]">{icon}</span>
                {label}
                <span className="material-icons-round text-[12px] text-slate-400">expand_more</span>
            </button>
            {open && (
                <div
                    className={`absolute top-full left-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-50 ${panelClass}`}
                    onMouseDown={e => e.stopPropagation()}
                >
                    {children}
                </div>
            )}
        </div>
    );
}

function GDItem({ active, onClick, children }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left transition-colors ${
                active ? 'bg-primary/8 text-primary font-semibold' : 'text-slate-700 hover:bg-slate-50'
            }`}
        >
            <span className={`material-icons-round text-[13px] ${active ? 'opacity-100' : 'opacity-0'}`}>check</span>
            {children}
        </button>
    );
}

// ── Failed panel ──────────────────────────────────────────────────────────────
function FailedPanel({ doc, onRetryPage, onRetryOutline }) {
    const pages       = doc?.pages || [];
    const outlineFailed = pages.length === 0;
    const failedPage  = !outlineFailed
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

            {/* Progress context */}
            {outlineFailed ? (
                <p className="text-[12px] text-slate-400">Failed while generating the document outline.</p>
            ) : failedPage ? (
                <p className="text-[12px] text-slate-400">
                    Failed on Page {failedPage.page_number} — {failedPage.title}
                    {approvedCount > 0 && ` · ${approvedCount} of ${pages.length} pages completed`}
                </p>
            ) : (
                <p className="text-[12px] text-slate-400">
                    {approvedCount} of {pages.length} pages completed before failure.
                </p>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
                {outlineFailed ? (
                    <button
                        onClick={onRetryOutline}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-[13px] font-semibold shadow-sm hover:bg-primary/90 transition-all active:scale-95"
                    >
                        <span className="material-icons-round text-[16px]">refresh</span>
                        Retry outline generation
                    </button>
                ) : failedPage ? (
                    <>
                        <button
                            onClick={() => onRetryPage(doc, failedPage)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-[13px] font-semibold shadow-sm hover:bg-primary/90 transition-all active:scale-95"
                        >
                            <span className="material-icons-round text-[16px]">play_arrow</span>
                            Continue from Page {failedPage.page_number}
                        </button>
                        <button
                            onClick={onRetryOutline}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-[13px] font-semibold hover:bg-slate-50 transition-all active:scale-95"
                        >
                            <span className="material-icons-round text-[16px]">restart_alt</span>
                            Restart from scratch
                        </button>
                    </>
                ) : (
                    <button
                        onClick={onRetryOutline}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-[13px] font-semibold shadow-sm hover:bg-primary/90 transition-all active:scale-95"
                    >
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
    const [doc, setDoc]         = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');
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
                                <DocumentViewer doc={doc} onExport={handleExport} onCoverSaved={handleCoverSaved} onTocStyleSaved={handleTocStyleSaved} />
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
