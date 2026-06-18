import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { scholarService } from '../../api/scholarService';
import { workspaceCache } from '../../api/workspaceCache';

const PAGE_OPTIONS = [
    { value: 1,  label: '1 page  (~500 words)'   },
    { value: 5,  label: '5 pages  (~2.5k words)'  },
    { value: 10, label: '10 pages  (~5k words)'   },
    { value: 20, label: '20 pages  (~10k words)'  },
    { value: 30, label: '30 pages  (~15k words)'  },
    { value: 40, label: '40 pages  (~20k words)'  },
    { value: 50, label: '50 pages  (~25k words)'  },
];

const STYLE_OPTIONS = [
    { value: 'apa',  label: 'APA 7th Edition' },
    { value: 'mla',  label: 'MLA 9th Edition' },
    { value: 'ieee', label: 'IEEE'             },
];

const RECENCY_OPTIONS = [
    { value: '',   label: 'Any time'      },
    { value: '1',  label: 'Last year'     },
    { value: '2',  label: 'Last 2 years'  },
    { value: '3',  label: 'Last 3 years'  },
    { value: '5',  label: 'Last 5 years'  },
    { value: '10', label: 'Last 10 years' },
];

function SectionLabel({ icon, children }) {
    return (
        <div className="flex items-center gap-2 mb-4">
            <span className="material-icons-round text-primary text-[16px]">{icon}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em]">{children}</span>
        </div>
    );
}

function StyledSelect({ value, onChange, options, disabled }) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                disabled={disabled}
                className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-3 py-2.5 pr-8 text-[13px] font-medium text-slate-700 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all disabled:opacity-50 cursor-pointer"
            >
                {options.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
            <span className="material-icons-round absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] pointer-events-none">expand_more</span>
        </div>
    );
}

export default function ScholarNew() {
    const navigate = useNavigate();
    const [instructions, setInstructions] = useState('');
    const [pageCount,    setPageCount]    = useState('20');
    const [citationStyle, setCitationStyle] = useState('apa');
    const [yearsBack,    setYearsBack]    = useState('');
    const [refs, setRefs] = useState([null, null]);
    const [error,   setError]   = useState('');
    const [loading, setLoading] = useState(false);

    const inputRefs = [useRef(null), useRef(null)];

    const charCount  = instructions.trim().length;
    const canSubmit  = charCount >= 20 && !loading;

    const handleUpload = (i, file) => setRefs(prev => prev.map((r, idx) => idx === i ? file : r));
    const handleRemove = (i)       => setRefs(prev => prev.map((r, idx) => idx === i ? null : r));

    const handleGenerate = async () => {
        if (!canSubmit) return;
        setError('');
        setLoading(true);
        try {
            const res = await scholarService.create({
                prompt:       instructions.trim(),
                citationStyle,
                pageCount:    parseInt(pageCount),
                yearsBack:    yearsBack ? parseInt(yearsBack) : null,
                uploads:      refs.filter(Boolean),
            });
            workspaceCache.invalidateScholars();
            navigate(`/lockedin/scholar/${res.data.id}`);
        } catch (err) {
            setError(
                err?.errors?.plan?.[0]   || err?.errors?.limit?.[0] ||
                err?.errors?.uploads?.[0] || err?.errors?.prompt?.[0] ||
                err?.message || 'Something went wrong. Please try again.'
            );
            setLoading(false);
        }
    };

    return (
        <main className="flex-1 h-full overflow-y-auto bg-slate-50 lg:ml-64 px-4 lg:px-8 pt-20 lg:pt-8 pb-12">
            <div className="max-w-2xl mx-auto flex flex-col gap-5">

                {/* ── Header ─────────────────────────────────────────── */}
                <div className="flex items-start justify-between">
                    <div>
                        <button
                            onClick={() => navigate('/lockedin/scholar')}
                            className="flex items-center gap-1 text-[12px] font-semibold text-slate-400 hover:text-primary transition-colors mb-2"
                        >
                            <span className="material-icons-round text-[15px]">arrow_back</span>
                            Back
                        </button>
                        <h1 className="text-[26px] font-bold text-slate-800 tracking-tight">New Document</h1>
                    </div>
                    <span className="mt-8 text-[11px] font-semibold text-primary/70 bg-primary/8 px-2.5 py-1 rounded-full">
                        4–6 min generation
                    </span>
                </div>

                {/* ── Research Prompt ─────────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                        <SectionLabel icon="edit">Research Prompt</SectionLabel>
                        <span className="text-[11px] text-slate-400 tabular-nums">{charCount} / 5000</span>
                    </div>
                    <textarea
                        value={instructions}
                        onChange={e => setInstructions(e.target.value.slice(0, 5000))}
                        disabled={loading}
                        rows={5}
                        placeholder="e.g. Write a comprehensive report on climate change and its impact on global food security. Include recent statistics, case studies, and policy recommendations."
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-[13px] text-slate-700 placeholder-slate-300 resize-none outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/30 transition-all disabled:opacity-50"
                    />
                    {charCount > 0 && charCount < 20 && (
                        <p className="mt-1.5 text-[11px] text-amber-500">Minimum 20 characters ({20 - charCount} more needed)</p>
                    )}
                </div>

                {/* ── Document Parameters ─────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <SectionLabel icon="settings">Document Parameters</SectionLabel>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Length</label>
                            <StyledSelect
                                value={pageCount}
                                onChange={setPageCount}
                                options={PAGE_OPTIONS.map(o => ({ value: String(o.value), label: o.label }))}
                                disabled={loading}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Style</label>
                            <StyledSelect
                                value={citationStyle}
                                onChange={setCitationStyle}
                                options={STYLE_OPTIONS}
                                disabled={loading}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recency</label>
                            <StyledSelect
                                value={yearsBack}
                                onChange={setYearsBack}
                                options={RECENCY_OPTIONS}
                                disabled={loading}
                            />
                        </div>
                    </div>
                </div>

                {/* ── References ──────────────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <SectionLabel icon="attach_file">References (Optional)</SectionLabel>
                    <div className="grid grid-cols-2 gap-3">
                        {refs.map((file, i) => (
                            <div key={i}>
                                <input
                                    ref={inputRefs[i]}
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.txt"
                                    onChange={e => { if (e.target.files?.[0]) handleUpload(i, e.target.files[0]); e.target.value = ''; }}
                                />
                                {file ? (
                                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-primary/20 bg-primary/5">
                                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                                            <span className="material-icons-round text-primary text-[16px]">description</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[12px] font-semibold text-slate-700 truncate">{file.name}</p>
                                            <p className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(0)} KB</p>
                                        </div>
                                        {!loading && (
                                            <button onClick={() => handleRemove(i)} className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors">
                                                <span className="material-icons-round text-slate-400 text-[14px]">close</span>
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => !loading && inputRefs[i].current?.click()}
                                        disabled={loading}
                                        className="w-full flex flex-col items-center gap-2 py-5 rounded-xl border border-dashed border-slate-200 hover:border-primary/40 hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                                            <span className="material-icons-round text-primary text-[18px]">upload</span>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[12px] font-semibold text-slate-600">Upload source {i + 1}</p>
                                            <p className="text-[10px] text-slate-400">PDF, DOCX, TXT</p>
                                        </div>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Error ───────────────────────────────────────────── */}
                {error && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                        <span className="material-icons-round text-red-400 text-[16px] mt-0.5 shrink-0">error_outline</span>
                        <p className="text-[13px] text-red-600">{error}</p>
                    </div>
                )}

                {/* ── Generate button ──────────────────────────────────── */}
                <button
                    onClick={handleGenerate}
                    disabled={!canSubmit}
                    className="w-full py-4 rounded-2xl bg-primary text-white text-[14px] font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                >
                    {loading ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <span className="material-icons-round text-[18px]">auto_awesome</span>
                    )}
                    {loading ? 'Creating document…' : 'Generate Complete Document'}
                </button>
            </div>
        </main>
    );
}
