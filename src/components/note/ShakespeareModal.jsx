import React, { useState } from 'react'
import { createPortal } from "react-dom";
import { shakespeare } from '../../assets/assets';


const ShakespeareModal = ({ onClose }) => {
    const [prompt, setPrompt] = useState("");

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ background: 'rgba(15,23,42,0.50)', backdropFilter: 'blur(4px)' }}>
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-400 to-black flex items-center justify-center shadow-lg shadow-indigo-200">
                                <span className="material-icons-round text-white text-[20px]">
                                      <span className="material-icons-round">
                                                                            <img src={shakespeare}/>
                                                                        </span>
                                </span>
                            </div>
                            <div>
                                <h2 className="font-display font-bold text-slate-900 text-base leading-tight">Shakespeare Assist</h2>
                                <p className="text-[11px] text-slate-400 mt-0.5">Shakespeare writes it — you own it.</p>
                            </div>
                        </div>
                        <button onClick={onClose}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors shrink-0">
                            <span className="material-icons-round text-[18px]">close</span>
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 py-5 flex flex-col gap-4">
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Tell Shakespeare what to write. He'll draft it, polish it, and drop it straight into your note — no copy-paste needed.
                    </p>

                    {/* Quick prompts */}
                    <div className="flex flex-wrap gap-2">
                        {["Introduce a topic", "Write a summary", "Explain like I'm 5", "Write a conclusion"].map(q => (
                            <button key={q}
                                onClick={() => setPrompt(q)}
                                className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-primary/10 hover:text-primary text-slate-600 text-[11px] font-medium transition-colors">
                                {q}
                            </button>
                        ))}
                    </div>

                    <textarea
                        rows={4}
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        placeholder="e.g. Write a short paragraph introducing the topic of photosynthesis for a biology note…"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-primary resize-none leading-relaxed"
                    />

                    <button
                        disabled={!prompt.trim()}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r from-gray-700 to-black text-white text-sm font-bold shadow-lg shadow-indigo-200 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <span className="material-icons-round text-[17px]">auto_fix_high</span>
                        Let Shakespeare Write It
                    </button>
                </div>

                {/* Footer */}
                <div className="px-6 pb-5">
                    <p className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
                        <span className="material-icons-round text-[12px]">bolt</span>
                        Handled quietly in the background by <span className="font-bold text-slate-500 ml-0.5">Shakespeare</span>
                    </p>
                </div>
            </div>
        </div>,
        document.body
    );
};



export default ShakespeareModal;