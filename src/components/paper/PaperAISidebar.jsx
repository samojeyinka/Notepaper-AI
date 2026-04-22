import React, { useState } from "react";
import { naomi } from "../../assets/assets";

const premiumFeatures = [
    { id: 'quiz',   icon: 'quiz',       title: 'Generate Quiz',      description: 'Turn your paper into a personalised practice test.',  color: 'bg-primary/15 text-primary' },
    { id: 'plan',   icon: 'event_note', title: 'Create Study Plan',  description: 'Get a weekly roadmap built from your paper topics.',   color: 'bg-emerald-100 text-emerald-600' },
    { id: 'expand', icon: 'lightbulb',  title: 'Expand Topic',       description: 'Schola researches and adds related content to your paper.', color: 'bg-amber-100 text-amber-500' },
];

export const PaperAISidebar = () => {
    const [scholaOpen, setScholaOpen] = useState(true);

    return (
        <aside className="w-64 md:w-80 border-l border-slate-200 bg-white flex flex-col overflow-hidden relative z-30 shrink-0">

            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 flex flex-col gap-3">

                {/* ── Schola collapsible section ── */}
                <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-indigo-500/5 overflow-hidden">

                    <button
                        onClick={() => setScholaOpen(v => !v)}
                        className="w-full flex items-center justify-between px-4 py-1.5 hover:bg-primary/5 transition-colors"
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="w-4 h-4 md:w-6 md:h-6 rounded md:rounded-lg bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center shadow-sm shadow-primary/30 shrink-0 overflow-hidden">
                                <img src={naomi} className="w-full h-full object-cover" />
                            </div>
                            <div className="text-left">
                                <p className="font-display font-medium md:font-semibold text-[11px] md:text-[13px] text-slate-900 leading-tight">Schola</p>
                                <p className="text-[8px] md:text-[9px] text-slate-400">Study smarter. Stay motivated. Reach your goals.</p>
                            </div>
                        </div>
                        <span className={`material-icons-round text-[18px] text-slate-400 transition-transform duration-200 ${scholaOpen ? 'rotate-180' : ''}`}>
                            expand_more
                        </span>
                    </button>

                    {scholaOpen && (
                        <div className="px-2 md:px-3 pb-2 md:pb-3 flex flex-col gap-2 border-t border-primary/10">
                            <p className="text-[8px] md:text-[9px] font-normal text-primary/60 uppercase tracking-widest px-1 pt-2.5">Powered by Schola</p>
                            {premiumFeatures.map((f) => (
                                <div key={f.id}
                                    className="relative group p-2 md:p-3 rounded-md md:rounded-xl bg-white border border-slate-100 opacity-80 cursor-not-allowed select-none overflow-hidden">
                                    <div className="absolute inset-0 rounded md:rounded-xl bg-white/60 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <div className="flex items-center gap-1.5 bg-slate-900/80 text-white text-[10px] font-medium px-2 py-1 rounded-full">
                                            <span className="material-icons-round text-[11px]">lock</span>
                                            Upgrade to unlock
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2 md:gap-3">
                                        <div className={`w-5 h-5 md:w-6 md:h-6 rounded-md ${f.color} flex items-center justify-center shrink-0`}>
                                            <span className="material-icons-round text-[12px] md:text-[14px]">{f.icon}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <p className="md:font-medium text-[10.5px] md:text-xs text-slate-800">{f.title}</p>
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

            {/* ── Footer ── */}
            <div className="px-2 md:px-4 pb-2 md:pb-4 pt-2 md:pt-3 border-t border-slate-100">
                <div className="bg-gradient-to-br from-primary/10 to-indigo-500/10 rounded-lg md:rounded-xl p-4 border border-primary/15">
                    <div className="flex items-center gap-1 md:gap-2 mb-2">
                        <span className="material-icons-round text-primary text-[16px]">bolt</span>
                        <p className="text-[11px] md:text-xs font-medium md:font-bold text-slate-800">Unlock the full Schola</p>
                    </div>
                    <p className="text-[9.5px] md:text-[11px] text-slate-500 mb-3 leading-relaxed">
                        Quizzes, study plans, goal tracking &amp; daily motivation — Schola works in the background so you stay focused.
                    </p>
                    <button className="w-full bg-slate-900 text-white py-1.5 md:py-2.5 rounded-md md:rounded-xl text-[11px] md:text-[12px] font-bold shadow hover:bg-black active:scale-[0.98] transition-all">
                        Upgrade to Pro
                    </button>
                </div>
            </div>
        </aside>
    );
};
