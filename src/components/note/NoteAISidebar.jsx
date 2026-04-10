import React, { useState } from "react";
import { naomi, shakespeare } from "../../assets/assets";
import ShakespeareModal from "./ShakespeareModal";



// ── Sidebar ──────────────────────────────────────────────────────────────────
const premiumFeatures = [
    {
        id: 'quiz',
        icon: 'quiz',
        title: 'Generate Quiz',
        description: 'Turn your notes into a personalised practice test.',
        color: 'bg-primary/15 text-primary',
        glow: 'shadow-primary/20',
    },
    {
        id: 'plan',
        icon: 'event_note',
        title: 'Create Study Plan',
        description: 'Get a weekly roadmap built from your lecture topics.',
        color: 'bg-emerald-100 text-emerald-600',
        glow: 'shadow-emerald-200',
    },
    {
        id: 'expand',
        icon: 'lightbulb',
        title: 'Expand Topic',
        description: 'Naomi researches and adds related details to your note.',
        color: 'bg-amber-100 text-amber-500',
        glow: 'shadow-amber-200',
    },
];

export const NoteAISidebar = ({ onInsertText }) => {
    const [showShakespeare, setShowShakespeare] = useState(false);
    const [naomiOpen, setNaomiOpen] = useState(true);

    return (
        <>
            <aside className="w-80 border-l border-slate-200 bg-white flex flex-col overflow-hidden relative z-30 shrink-0">

             

                <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 flex flex-col gap-3">

                    {/* ── Shakespeare Assist ── */}
                    <div className="border-b border-slate-100 pb-2">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5 px-1">Write for me</p>
                        <button
                            onClick={() => setShowShakespeare(true)}
                            className="group w-full text-left p-2.5 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-100 transition-all active:scale-[0.98]"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-gray-400 to-black flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
                                    <span className="material-icons-round">
                                        <img src={shakespeare}/>
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-[12px] text-slate-800">Shakespeare Assist</p>
                                        <span className="material-icons-round text-indigo-400 text-[14px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                                        Describe what you need — Shakespeare drafts it straight into your note.
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* ── Premium features ── */}
                    <div>

                        
                        {/* ── Naomi collapsible section ── */}
                        <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-indigo-500/5 overflow-hidden">

                            {/* Collapsible trigger */}
                            <button
                                onClick={() => setNaomiOpen(v => !v)}
                                className="w-full flex items-center justify-between px-4 py-1.5 hover:bg-primary/5 transition-colors"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center shadow-sm shadow-primary/30 shrink-0 overflow-hidden">
                                        <img src={naomi} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-display font-semibold text-[13px] text-slate-900 leading-tight">Naomi</p>
                                        <p className="text-[9px] text-slate-400">Study smarter. Stay motivated. Reach your goals.</p>
                                    </div>
                                </div>
                                <span className={`material-icons-round text-[18px] text-slate-400 transition-transform duration-200 ${naomiOpen ? 'rotate-180' : ''}`}>
                                    expand_more
                                </span>
                            </button>

                            {/* Collapsible body */}
                            {naomiOpen && (
                                <div className="px-3 pb-3 flex flex-col gap-2 border-t border-primary/10">
                                    <p className="text-[9px] font-normal text-primary/60 uppercase tracking-widest px-1 pt-2.5">Powered by Naomi</p>
                                    {premiumFeatures.map((f) => (
                                        <div key={f.id}
                                            className="relative group p-3 rounded-xl bg-white border border-slate-100 opacity-80 cursor-not-allowed select-none overflow-hidden">
                                            {/* Lock overlay */}
                                            <div className="absolute inset-0 rounded-xl bg-white/60 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                <div className="flex items-center gap-1.5 bg-slate-900/80 text-white text-[10px] font-medium px-2 py-1 rounded-full">
                                                    <span className="material-icons-round text-[11px]">lock</span>
                                                    Upgrade to unlock
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className={`w-6 h-6 rounded-md ${f.color} flex items-center justify-center shrink-0`}>
                                                    <span className="material-icons-round text-[14px]">{f.icon}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <p className="font-medium text-xs text-slate-800">{f.title}</p>
                                                        <span className="material-icons-round text-[12px] text-amber-400" title="Premium only">workspace_premium</span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{f.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className="px-4 pb-4 pt-3 border-t border-slate-100">
                    <div className="bg-gradient-to-br from-primary/10 to-indigo-500/10 rounded-xl p-4 border border-primary/15">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-icons-round text-primary text-[16px]">bolt</span>
                            <p className="text-xs font-bold text-slate-800">Unlock the full Naomi</p>
                        </div>
                        <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                            Quizzes, study plans, goal tracking &amp; daily motivation — Naomi works in the background so you stay focused.
                        </p>
                        <button className="w-full bg-slate-900 text-white py-2.5 rounded-xl text-[12px] font-bold shadow hover:bg-black active:scale-[0.98] transition-all">
                            Upgrade to Pro
                        </button>
                    </div>
                    <p className="text-center text-[10px] text-slate-300 mt-3 flex items-center justify-center gap-1">
                        <span className="material-icons-round text-[11px]">auto_awesome</span>
                        Notes · Goals · Reminders — all handled by <span className="font-bold text-slate-400 ml-0.5">Naomi</span>
                    </p>
                </div>
            </aside>

            {showShakespeare && <ShakespeareModal onClose={() => setShowShakespeare(false)} onInsert={onInsertText} />}
        </>
    );
};
