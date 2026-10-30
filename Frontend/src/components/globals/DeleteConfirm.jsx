import { useState, useEffect, useRef } from 'react';

// ── Three-dot card menu with a Delete action ──────────────────────────────────
export function CardMenu({ onDelete, extraActions = [] }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const h = e => { if (!ref.current?.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [open]);

    return (
        <div ref={ref} className="relative shrink-0" onClick={e => { e.stopPropagation(); e.preventDefault(); }}>
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className="w-7 h-7 flex items-center justify-center  text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-colors"
            >
                <span className="material-icons-round text-[18px]">more_vert</span>
            </button>
            {open && (
                <div className="workspace-menu absolute right-0 top-full mt-1 bg-white border border-slate-200 shadow-lg z-20 py-1 min-w-[130px]">
                    {extraActions.map((action, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => { setOpen(false); action.onClick(); }}
                            className="w-full text-left flex items-center gap-2 px-3 py-2 text-[12px] text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <span className="material-icons-round text-[14px] text-slate-400">{action.icon}</span>
                            {action.label}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => { setOpen(false); onDelete(); }}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-[12px] text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <span className="material-icons-round text-[14px]">delete_outline</span>
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}

// ── Delete confirmation modal ─────────────────────────────────────────────────
export function DeleteConfirmModal({ title, subtitle, warning, onConfirm, onCancel }) {
    return (
        <div className="workspace-modal fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
            <div
                className="workspace-modal-panel relative bg-white shadow-xl w-full max-w-sm p-6 flex flex-col gap-4"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10  bg-red-50 flex items-center justify-center shrink-0">
                        <span className="material-icons-round text-red-500 text-[20px]">delete_outline</span>
                    </div>
                    <div className="min-w-0">
                        <p className="text-[14px] font-bold text-slate-800">{title}</p>
                        {subtitle && <p className="text-[12px] text-slate-400 mt-0.5 line-clamp-2">{subtitle}</p>}
                    </div>
                </div>
                <p className="text-[12px] text-slate-500">{warning ?? 'This action cannot be undone.'}</p>
                <div className="flex gap-2 pt-1">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5  border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2.5  bg-red-500 text-white text-[13px] font-semibold hover:bg-red-600 transition-colors active:scale-95"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
