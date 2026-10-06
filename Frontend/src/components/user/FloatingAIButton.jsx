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
    { label: 'Amber',   value: '#B45309' },
    { label: 'Emerald', value: '#059669' },
    { label: 'Rose',    value: '#BE123C' },
    { label: 'Plum',    value: '#6C4EA6' },
    { label: 'Sky',     value: '#0284C7' },
    { label: 'Orange',  value: '#C2410C' },
    { label: 'Slate',   value: '#475569' },
    { label: 'Pink',    value: '#DB2777' },
];

const ICONS = [
    'folder', 'school', 'code', 'favorite', 'book',
    'science', 'music_note', 'sports_esports', 'work', 'travel_explore',
    'brush', 'fitness_center',
];

// ── Reusable folder icon renderer ────────────────────────────────────────────
export const FolderShape = ({ shape = 'squircle', color = '#6C4EA6', icon = 'folder', size = 56 }) => {
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
    const [color, setColor]             = useState(COLORS[3].value); // Plum default
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

    const fieldCls =
        "w-full bg-stone-50 border border-stone-200  px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 outline-none focus:border-plum-500 focus:ring-2 focus:ring-plum-100 transition-colors";

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ background: 'rgba(28,25,23,0.5)', backdropFilter: 'blur(4px)' }}>
            <div className="bg-paper  md: shadow-2xl ring-1 ring-stone-200 w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-stone-200/70 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FolderShape shape={shape} color={color} icon={icon} size={44} />
                        <div>
                            <h2 className="font-display-serif text-[18px] font-semibold text-stone-900 leading-tight">
                                {name || 'New Folder'}
                            </h2>
                            <p className="text-[11.5px] text-stone-400 mt-0.5">Group related pages in one place</p>
                        </div>
                    </div>
                    <button onClick={onClose} aria-label="Close" className="w-8 h-8  flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors">
                        <span className="material-icons-round text-[18px]">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">
                    {/* Name */}
                    <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 block">Folder name</label>
                        <input
                            ref={inputRef}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. University finals"
                            className={fieldCls}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 block">
                            Description <span className="normal-case font-normal text-stone-300">(optional)</span>
                        </label>
                        <input
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="What's this folder for?"
                            className={fieldCls}
                        />
                    </div>

                    {/* Color */}
                    <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 block">Colour</label>
                        <div className="flex flex-wrap gap-2.5">
                            {COLORS.map(c => (
                                <button key={c.value} type="button" onClick={() => setColor(c.value)} title={c.label}
                                    className={`w-6 h-6 md:w-7 md:h-7  transition-transform hover:scale-110 active:scale-95 ${color === c.value ? 'ring-2 ring-stone-900 ring-offset-2 scale-110' : ''}`}
                                    style={{ backgroundColor: c.value }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Shape */}
                    <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 block">Shape</label>
                        <div className="flex flex-wrap gap-3">
                            {SHAPES.map(s => (
                                <button key={s.id} type="button" onClick={() => setShape(s.id)} title={s.label}
                                    className={`transition-transform hover:scale-110 active:scale-95 p-1  ${shape === s.id ? 'ring-2 ring-plum-600 ring-offset-2 ring-offset-paper' : ''}`}
                                >
                                    <div style={{ backgroundColor: color, ...s.style }} className="w-6 h-6 md:w-7 md:h-7" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Icon */}
                    <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 block">Icon</label>
                        <div className="flex flex-wrap gap-2">
                            {ICONS.map(ic => (
                                <button key={ic} type="button" onClick={() => setIcon(ic)}
                                    className={`w-8 h-8 md:w-9 md:h-9  flex items-center justify-center transition-all
                                        ${icon === ic ? 'bg-plum-600 text-white shadow-md shadow-plum-600/25' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
                                >
                                    <span className="material-icons-round text-[16px] md:text-[18px]">{ic}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <p className="text-xs text-rose-600 flex items-center gap-1">
                            <span className="material-icons-round text-[14px]">error_outline</span>{error}
                        </p>
                    )}

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5  bg-stone-100 text-stone-600 text-sm font-semibold hover:bg-stone-200 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={!name.trim() || loading}
                            className="flex-1 py-2.5  bg-stone-900 text-white text-sm font-semibold hover:bg-stone-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            {loading
                                ? <Loader size="sm" />
                                : <><span className="material-icons-round text-[16px]">create_new_folder</span>Create folder</>}
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
    from { opacity: 0; transform: translateY(14px) scale(0.9); }
    to   { opacity: 1; transform: translateY(0)    scale(1); }
}
.fab-item { animation: fabItemIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both; }
`;

// ── Floating action button ────────────────────────────────────────────────────
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
        { label: 'New Note',       icon: 'edit_note',          color: '#6C4EA6', onClick: () => { setMenuOpen(false); navigate(`/lockedin/notes/new${folderSuffix}`); } },
        { label: 'New Paper',      icon: 'article',            color: '#6C4EA6', onClick: () => { setMenuOpen(false); navigate(`/lockedin/papers/new${folderSuffix}`); } },
        { label: 'New Slides',     icon: 'slideshow',          color: '#6C4EA6', onClick: handleNewSlides, loading: creatingSlides },
        { label: 'New Folder',     icon: 'create_new_folder',  color: '#6C4EA6', onClick: () => { setMenuOpen(false); setShowCreateFolder(true); } },
        { label: 'New Flashcards', icon: 'style',              color: '#6C4EA6', onClick: () => { setMenuOpen(false); navigate(`/lockedin/flashcards/new${fcFolderSuffix}`); } },
    ];

    const visibleItems = ITEMS.filter(item => !exclude.includes(item.label));

    return (
        <>
            <style>{FAB_STYLES}</style>

            <div ref={wrapRef} className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 flex flex-col items-end gap-3">

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
                                    opacity-0 group-hover:opacity-100 translate-x-1.5 group-hover:translate-x-0
                                    transition-all duration-200
                                    text-[12px] font-semibold text-stone-700
                                    bg-white ring-1 ring-stone-200 shadow-md shadow-stone-900/5
                                    px-3 py-1.5  whitespace-nowrap select-none pointer-events-none
                                ">
                                    {item.label}
                                </span>

                                {/* Icon circle */}
                                <div
                                    className="w-10 md:w-12 h-10 md:h-12  flex items-center justify-center text-white
                                        transition-all duration-200 hover:scale-110 active:scale-95
                                        shadow-md shadow-stone-900/15"
                                    style={{ backgroundColor: item.color }}
                                >
                                    {item.loading
                                        ? <Loader size="sm" />
                                        : <span className="material-icons-round text-[19px] md:text-[22px]">{item.icon}</span>
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
                    aria-label={menuOpen ? 'Close menu' : 'Create new'}
                    className={`w-12 h-12 md:w-14 md:h-14  flex items-center justify-center text-white bg-stone-900 shadow-lg shadow-stone-900/25 hover:bg-stone-700 active:scale-95 transition-all duration-200`}
                    style={{ transform: menuOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                >
                    <span className="material-icons-round text-[22px] md:text-[26px]">add</span>
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
