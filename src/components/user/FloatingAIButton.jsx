import { useState, useRef, useEffect } from "react";
import Loader from '../globals/Loader';
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { folderService } from "../../api/folderService";
import { presentationService } from "../../api/presentationService";

// ── Shape definitions (match ShapeEnum values on the backend) ────────────────
export const SHAPES = [
    { id: 'squircle', label: 'Squircle', style: { borderRadius: '30%' } },
    { id: 'blob',     label: 'Blob',     style: { borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%' } },
    { id: 'pebble',   label: 'Pebble',   style: { borderRadius: '50% 50% 48% 52% / 55% 55% 45% 45%' } },
    { id: 'arch',     label: 'Arch',     style: { borderRadius: '50% 50% 30% 30% / 60% 60% 40% 40%' } },
    { id: 'wave',     label: 'Wave',     style: { borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' } },
    { id: 'gem',      label: 'Gem',      style: { borderRadius: '10% 30% 10% 30% / 30% 10% 30% 10%' } },
];

const COLORS = [
    { label: 'Amber',   value: '#F59E0B' },
    { label: 'Emerald', value: '#10B981' },
    { label: 'Rose',    value: '#F43F5E' },
    { label: 'Violet',  value: '#A78BFA' },
    { label: 'Sky',     value: '#38BDF8' },
    { label: 'Orange',  value: '#F97316' },
    { label: 'Slate',   value: '#64748B' },
    { label: 'Pink',    value: '#F472B6' },
];

const ICONS = [
    'folder', 'school', 'code', 'favorite', 'auto_awesome',
    'science', 'music_note', 'sports_esports', 'work', 'travel_explore',
    'brush', 'fitness_center',
];

// ── Reusable folder icon renderer ────────────────────────────────────────────
export const FolderShape = ({ shape = 'squircle', color = '#A78BFA', icon = 'folder', size = 56 }) => {
    const shapeStyle = SHAPES.find(s => s.id === shape)?.style ?? SHAPES[0].style;
    return (
        <div style={{ width: size, height: size, backgroundColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...shapeStyle }}>
            <span className="material-icons-round text-white" style={{ fontSize: size * 0.45 }}>{icon}</span>
        </div>
    );
};

// ── Create Folder Modal ───────────────────────────────────────────────────────
export const CreateFolderModal = ({ onClose, onCreated }) => {
    const [name, setName]               = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor]             = useState(COLORS[3].value); // Violet default
    const [shape, setShape]             = useState(SHAPES[0].id);
    const [icon, setIcon]               = useState(ICONS[0]);
    const [loading, setLoading]         = useState(false);
    const [error, setError]             = useState(null);
    const inputRef = useRef(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const res = await folderService.create({
                name: name.trim(),
                ...(description.trim() && { description: description.trim() }),
                color,
                shape,
                icon,
            });
            onCreated(res.data);
        } catch {
            setError('Could not create folder. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}>
            <div className="bg-white rounded-xl md:rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-3 md:px-6 pt-3 md:pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FolderShape shape={shape} color={color} icon={icon} size={44} />
                        <div>
                            <h2 className="font-display font-medium md:font-bold text-slate-900 text-base">{name || 'New Folder'}</h2>
                            <p className="text-[11px] text-slate-400 mt-0.5">Organise your notes into a folder</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
                        <span className="material-icons-round text-[18px]">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">
                    {/* Name */}
                    <div>
                        <label className="text-[10px] font-medium md:font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Folder Name</label>
                        <input
                            ref={inputRef}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. University Finals"
                            className="w-full bg-slate-50 border border-slate-200 rounded-md md:rounded-xl px-2 md:px-4 py-1.5 md:py-2.5 text-[11px] md:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-primary"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                            Description <span className="normal-case font-normal text-slate-300">(optional)</span>
                        </label>
                        <input
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="What's this folder for?"
                           className="w-full bg-slate-50 border border-slate-200 rounded-md md:rounded-xl px-2 md:px-4 py-1.5 md:py-2.5 text-[11px] md:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-primary"
                        />
                    </div>

                    {/* Color */}
                    <div>
                        <label className="text-[10px] font-medium md:font-bold text-slate-400 uppercase tracking-widest mb-2 block">Color</label>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map(c => (
                                <button key={c.value} type="button" onClick={() => setColor(c.value)} title={c.label}
                                    className={`w-5 h-5 md:w-8 md:h-8 rounded-full transition-transform hover:scale-110 active:scale-95 ${color === c.value ? 'ring-2 ring-offset-2 ring-slate-500 scale-110' : ''}`}
                                    style={{ backgroundColor: c.value }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Shape */}
                    <div>
                        <label className="text-[10px] font-medium md:font-bold text-slate-400 uppercase tracking-widest mb-2 block">Shape</label>
                        <div className="flex flex-wrap gap-3">
                            {SHAPES.map(s => (
                                <button key={s.id} type="button" onClick={() => setShape(s.id)} title={s.label}
                                    className={`transition-transform hover:scale-110 active:scale-95 p-0.5 rounded-lg ${shape === s.id ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                                    style={{ background: 'none', border: 'none' }}
                                >
                                    <div style={{backgroundColor: color, ...s.style }} className="w-[24px] h-[24px] md:w-[34px] md:h-[34px]" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Icon */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Icon</label>
                        <div className="flex flex-wrap gap-2">
                            {ICONS.map(ic => (
                                <button key={ic} type="button" onClick={() => setIcon(ic)}
                                    className={`w-7 h-7 md:w-9 md:h-9 rounded-xl flex items-center justify-center transition-all
                                        ${icon === ic ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                >
                                    <span className="material-icons-round text-[14px] md:text-[18px]">{ic}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                            <span className="material-icons-round text-[14px]">error_outline</span>{error}
                        </p>
                    )}

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-1.5 md:py-2.5 rounded-md md:rounded-xl bg-slate-100 text-slate-600 text-[12px] md:text-sm font-semibold hover:bg-slate-200 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={!name.trim() || loading}
                            className="flex-1 py-1.5 md:py-2.5 rounded-md md:rounded-xl bg-primary text-white text-[12px] md:text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            {loading
                                ? <><Loader size="xs" /></>
                                : <><span className="material-icons-round text-[15px]">create_new_folder</span>Create Folder</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

// ── FAB keyframes ─────────────────────────────────────────────────────────────
const FAB_STYLES = `
@keyframes fabItemIn {
    from { opacity: 0; transform: translateY(16px) scale(0.88); }
    to   { opacity: 1; transform: translateY(0)    scale(1); }
}
@keyframes fabPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(167,139,250,0.45); }
    50%      { box-shadow: 0 0 0 10px rgba(167,139,250,0); }
}
.fab-item        { animation: fabItemIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both; }
.fab-pulse       { animation: fabPulse 2.4s ease-in-out infinite; }
`;

// ── FloatingAIButton (FAB) ────────────────────────────────────────────────────
export const FloatingAIButton = ({ exclude = [], folderId = null }) => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen]                 = useState(false);
    const [showCreateFolder, setShowCreateFolder] = useState(false);
    const [creatingSlides, setCreatingSlides]     = useState(false);
    const wrapRef = useRef(null);

    useEffect(() => {
        if (!menuOpen) return;
        const handler = (e) => { if (!wrapRef.current?.contains(e.target)) setMenuOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [menuOpen]);

    const handleNewSlides = async () => {
        setMenuOpen(false);
        setCreatingSlides(true);
        try {
            const payload = {
                title: 'Untitled Presentation',
                slides: JSON.stringify([{ slide: 1, layout: 'title', title: '', bullets: [''], speaker_notes: '', listStyle: 'bullet' }]),
                theme: 'modern',
                slide_count: 1,
                ...(folderId && { folder_id: folderId }),
            };
            const res = await presentationService.create(payload);
            navigate(`/lockedin/presentations/${res.data?.id ?? res.id}`);
        } catch { /* non-fatal */ }
        finally { setCreatingSlides(false); }
    };

    const folderSuffix   = folderId ? `?folder=${folderId}`    : '';
    const fcFolderSuffix = folderId ? `?folder_id=${folderId}` : '';

    const ITEMS = [
        { label: 'New Note',       icon: 'note_add',          color: '#8b5cf6', shadow: 'rgba(139,92,246,0.35)',  onClick: () => { setMenuOpen(false); navigate(`/lockedin/notes/new${folderSuffix}`); } },
        { label: 'New Paper',      icon: 'article',           color: '#6366f1', shadow: 'rgba(99,102,241,0.35)',  onClick: () => { setMenuOpen(false); navigate(`/lockedin/papers/new${folderSuffix}`); } },
        { label: 'New Slides',     icon: 'slideshow',         color: '#10b981', shadow: 'rgba(16,185,129,0.35)',  onClick: handleNewSlides, loading: creatingSlides },
        { label: 'New Folder',     icon: 'create_new_folder', color: '#f59e0b', shadow: 'rgba(245,158,11,0.35)',  onClick: () => { setMenuOpen(false); setShowCreateFolder(true); } },
        { label: 'New Flashcards', icon: 'style',             color: '#f43f5e', shadow: 'rgba(244,63,94,0.35)',   onClick: () => { setMenuOpen(false); navigate(`/lockedin/flashcards/new${fcFolderSuffix}`); } },
    ];

    const visibleItems = ITEMS.filter(item => !exclude.includes(item.label));

    return (
        <>
            <style>{FAB_STYLES}</style>

            <div ref={wrapRef} className="fixed bottom-8 right-8 z-40 flex flex-col items-end gap-3">

                {/* Menu items */}
                {menuOpen && (
                    <div className="flex flex-col items-end gap-2.5 mb-1">
                        {visibleItems.map((item, i) => (
                            <button
                                key={item.label}
                                onClick={item.onClick}
                                disabled={item.loading}
                                className="fab-item group flex items-center gap-3 disabled:opacity-60 cursor-pointer"
                                style={{ animationDelay: `${i * 45}ms` }}
                            >
                                {/* Label pill */}
                                <span className="
                                    opacity-0 group-hover:opacity-100
                                    translate-x-2 group-hover:translate-x-0
                                    transition-all duration-200
                                    text-[10px] md:text-[12px] font-normal md:font-semibold text-white
                                    px-1.5 md:px-3 py-1 md:py-1.5 rounded-sm md:rounded-md whitespace-nowrap
                                    shadow-lg select-none pointer-events-none
                                " style={{ background: item.color }}>
                                    {item.label}
                                </span>

                                {/* Icon circle */}
                                <div
                                    className="w-8 md:w-12 h-8 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-white
                                        transition-all duration-200
                                        hover:scale-110 active:scale-95
                                        shadow-lg group-hover:shadow-xl"
                                    style={{
                                        background: item.color,
                                        boxShadow: `0 4px 18px ${item.shadow}`,
                                    }}
                                >
                                    {item.loading
                                        ? <Loader size="xs" />
                                        : <span className="material-icons-round text-[15px] md:text-[22px] group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                                    }
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* FAB trigger */}
                <button
                    onClick={() => setMenuOpen(v => !v)}
                    title={menuOpen ? 'Close' : 'Create new…'}
                    className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-2xl active:scale-95 ${!menuOpen ? 'fab-pulse' : ''}`}
                    style={{
                        background: menuOpen
                            ? 'linear-gradient(135deg,#1e293b,#334155)'
                            : 'linear-gradient(135deg,#a78bfa,#8b5cf6)',
                        transform: menuOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), background 0.2s',
                        boxShadow: menuOpen ? '0 8px 32px rgba(30,41,59,0.4)' : '0 8px 32px rgba(139,92,246,0.45)',
                    }}
                >
                    <span className="material-icons-round text-[18px] md:text-[26px]">add</span>
                </button>
            </div>

            {showCreateFolder && (
                <CreateFolderModal
                    onClose={() => setShowCreateFolder(false)}
                    onCreated={(folder) => {
                        setShowCreateFolder(false);
                        navigate(`/lockedin/folders/${folder.id}`);
                    }}
                />
            )}
        </>
    );
};
