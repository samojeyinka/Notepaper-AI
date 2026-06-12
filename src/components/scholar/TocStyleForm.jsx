import { useState } from 'react';
import { scholarService } from '../../api/scholarService';

const TOC_STYLES = [
    {
        id: 'classic',
        name: 'Classic',
        desc: 'Numbered list with dotted leader lines',
        preview: (
            <div className="w-full h-full flex flex-col justify-center gap-1.5 p-3 bg-white">
                {[['1. Introduction', '···· 1'], ['2. Methodology', '···· 5'], ['3. Results', '··· 12']].map(([title, dots]) => (
                    <div key={title} className="flex items-center justify-between border-b border-dotted border-slate-300 pb-1">
                        <span className="text-[9px] text-slate-700">{title}</span>
                        <span className="text-[9px] text-slate-400">{dots}</span>
                    </div>
                ))}
            </div>
        ),
    },
    {
        id: 'modern',
        name: 'Modern',
        desc: 'Bold titles with thin rule separator',
        preview: (
            <div className="w-full h-full flex flex-col justify-center gap-2 p-3 bg-white">
                {['Introduction', 'Methodology', 'Results'].map(title => (
                    <div key={title}>
                        <p className="text-[9px] font-bold text-slate-800">{title}</p>
                        <div className="h-px bg-slate-200 mt-1" />
                    </div>
                ))}
            </div>
        ),
    },
    {
        id: 'minimal',
        name: 'Minimal',
        desc: 'Plain numbered list, clean whitespace',
        preview: (
            <div className="w-full h-full flex flex-col justify-center gap-2 p-3 bg-white">
                {['1. Introduction', '2. Methodology', '3. Results'].map(t => (
                    <p key={t} className="text-[9px] text-slate-700">{t}</p>
                ))}
            </div>
        ),
    },
    {
        id: 'boxed',
        name: 'Boxed',
        desc: 'Chapter badge in gray rounded box',
        preview: (
            <div className="w-full h-full flex flex-col justify-center gap-1.5 p-3 bg-white">
                {[[1, 'Introduction'], [2, 'Methodology'], [3, 'Results']].map(([n, title]) => (
                    <div key={n} className="flex items-center gap-1.5 bg-slate-100 rounded px-1.5 py-1">
                        <span className="w-4 h-4 bg-slate-500 text-white text-[8px] font-bold flex items-center justify-center rounded-sm shrink-0">{n}</span>
                        <span className="text-[9px] text-slate-700">{title}</span>
                    </div>
                ))}
            </div>
        ),
    },
];

export default function TocStyleForm({ doc, onClose, onSaved }) {
    const [selected, setSelected] = useState(doc.meta?.toc_style ?? 'classic');
    const [saving, setSaving]     = useState(false);
    const [error, setError]       = useState('');

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            await scholarService.updateMeta(doc.id, { toc_style: selected });
            onSaved(selected);
        } catch {
            setError('Failed to save. Please try again.');
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh]">

                {/* Header */}
                <div className="flex items-start justify-between px-6 pt-6 pb-4">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                            PDF Export
                        </p>
                        <h2 className="text-[17px] font-bold text-slate-800">TOC Style</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors mt-0.5"
                    >
                        <span className="material-icons-round text-[18px]">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 pb-2">
                    <p className="text-[12px] text-slate-500 mb-4">
                        Choose how the Table of Contents looks in PDF exports. Has no effect on the web view.
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                        {TOC_STYLES.map(style => (
                            <button
                                key={style.id}
                                onClick={() => setSelected(style.id)}
                                className={`flex flex-col rounded-xl border-2 overflow-hidden text-left transition-all ${
                                    selected === style.id
                                        ? 'border-primary shadow-md shadow-primary/10 ring-2 ring-primary/10'
                                        : 'border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <div className="h-24 w-full bg-slate-50 overflow-hidden">
                                    {style.preview}
                                </div>
                                <div className="px-2.5 py-2">
                                    <p className="text-[12px] font-semibold text-slate-700">{style.name}</p>
                                    <p className="text-[10px] text-slate-400 leading-snug mt-0.5">{style.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    {error && <p className="mt-3 text-[12px] text-red-500">{error}</p>}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 mt-2">
                    <button
                        onClick={onClose}
                        className="text-[13px] font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-60"
                    >
                        {saving ? (
                            <>
                                <span className="material-icons-round animate-spin text-[16px]">refresh</span>
                                Saving…
                            </>
                        ) : (
                            <>
                                <span className="material-icons-round text-[16px]">check</span>
                                Save Style
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
