import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { folderService } from "../../api/folderService";

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
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FolderShape shape={shape} color={color} icon={icon} size={44} />
                        <div>
                            <h2 className="font-display font-bold text-slate-900 text-base">{name || 'New Folder'}</h2>
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
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Folder Name</label>
                        <input
                            ref={inputRef}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. University Finals"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-primary"
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
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-primary"
                        />
                    </div>

                    {/* Color */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Color</label>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map(c => (
                                <button key={c.value} type="button" onClick={() => setColor(c.value)} title={c.label}
                                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 active:scale-95 ${color === c.value ? 'ring-2 ring-offset-2 ring-slate-500 scale-110' : ''}`}
                                    style={{ backgroundColor: c.value }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Shape */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Shape</label>
                        <div className="flex flex-wrap gap-3">
                            {SHAPES.map(s => (
                                <button key={s.id} type="button" onClick={() => setShape(s.id)} title={s.label}
                                    className={`transition-transform hover:scale-110 active:scale-95 p-0.5 rounded-lg ${shape === s.id ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                                    style={{ background: 'none', border: 'none' }}
                                >
                                    <div style={{ width: 34, height: 34, backgroundColor: color, ...s.style }} />
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
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all
                                        ${icon === ic ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                >
                                    <span className="material-icons-round text-[18px]">{ic}</span>
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
                            className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={!name.trim() || loading}
                            className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            {loading
                                ? <><span className="material-icons-round text-[15px] animate-spin">sync</span>Creating…</>
                                : <><span className="material-icons-round text-[15px]">create_new_folder</span>Create Folder</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

// ── FloatingAIButton (FAB) ────────────────────────────────────────────────────
export const FloatingAIButton = () => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen]             = useState(false);
    const [showCreateFolder, setShowCreateFolder] = useState(false);
    const wrapRef = useRef(null);

    useEffect(() => {
        if (!menuOpen) return;
        const handler = (e) => { if (!wrapRef.current?.contains(e.target)) setMenuOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [menuOpen]);

    return (
        <>
            <div ref={wrapRef} className="fixed bottom-8 right-8 z-40 flex flex-col items-end gap-2">
                {/* Pop-up options */}
                {menuOpen && (
                    <div className="flex flex-col gap-2 mb-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
                        <button
                            onClick={() => { setMenuOpen(false); navigate('/lockedin/notes/new'); }}
                            className="flex items-center gap-3 bg-white text-slate-700 pl-4 pr-5 py-3 rounded-2xl shadow-xl border border-slate-100 text-sm font-semibold hover:border-primary/30 hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
                        >
                            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <span className="material-icons-round text-[18px]">note_add</span>
                            </div>
                            New Note
                        </button>
                        <button
                            onClick={() => { setMenuOpen(false); navigate('/lockedin/flashcards/new'); }}
                            className="flex items-center gap-3 bg-white text-slate-700 pl-4 pr-5 py-3 rounded-2xl shadow-xl border border-slate-100 text-sm font-semibold hover:border-violet-200 hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
                        >
                            <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center shrink-0">
                                <span className="material-icons-round text-[18px]">style</span>
                            </div>
                            New Flashcard
                        </button>
                        <button
                            onClick={() => { setMenuOpen(false); setShowCreateFolder(true); }}
                            className="flex items-center gap-3 bg-white text-slate-700 pl-4 pr-5 py-3 rounded-2xl shadow-xl border border-slate-100 text-sm font-semibold hover:border-emerald-200 hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
                        >
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                                <span className="material-icons-round text-[18px]">create_new_folder</span>
                            </div>
                            New Folder
                        </button>
                    </div>
                )}

                {/* FAB */}
                <button
                    onClick={() => setMenuOpen(v => !v)}
                    title={menuOpen ? 'Close' : 'Create new…'}
                    className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all active:scale-95"
                    style={{
                        background: menuOpen ? '#1e293b' : '#A78BFA',
                        transform: menuOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s, background 0.2s',
                    }}
                >
                    <span className="material-icons-round text-white text-2xl">add</span>
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
