import { useState } from 'react';

const LockedSource = ({ icon, label }) => (
    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 opacity-60 cursor-not-allowed select-none">
        <div className="w-6 h-6 rounded-md bg-slate-200 flex items-center justify-center shrink-0">
            <span className="material-icons-round text-slate-400 text-[14px]">{icon}</span>
        </div>
        <span className="text-xs text-slate-500 font-medium flex-1">{label}</span>
        <span className="material-icons-round text-slate-300 text-[14px]">lock</span>
    </div>
);

export default function GenerateFromContent({ description, sources = [] }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] overflow-hidden">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full p-2.5 md:p-5 flex items-center justify-between text-left transition hover:bg-slate-50"
            >
                <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-sm font-semibold text-slate-700">Generate from your content</p>
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-[9px] font-medium uppercase tracking-wider flex items-center gap-1">
                        <span className="material-icons-round text-[10px]">workspace_premium</span>
                        Pro
                    </span>
                </div>
                <span className={`material-icons-round text-slate-400 text-[18px] shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
                    expand_more
                </span>
            </button>

            {open && (
                <div className="px-2.5 md:px-5 pb-2.5 md:pb-5 flex flex-col gap-3 border-t border-slate-50">
                    {description && (
                        <p className="text-[11px] text-slate-400 pt-3">{description}</p>
                    )}
                    <div className="flex flex-col gap-2">
                        {sources.map((s, i) => (
                            <LockedSource key={i} icon={s.icon} label={s.label} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
