import { useState, useRef } from 'react';

// ── Shimmer keyframe injected once ────────────────────────────────────────────
const SHIMMER_CSS = `
@keyframes scholarShimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}
.scholar-shimmer {
    background: linear-gradient(90deg, #ab8eff 0%, #6541c4 50%, #ab8eff 100%);
    background-size: 200% 100%;
    animation: scholarShimmer 2.5s infinite linear;
}
`;

// ── Reference upload slot ─────────────────────────────────────────────────────
const ReferenceSlot = ({ index, file, onUpload, onRemove, disabled }) => {
    const inputRef = useRef(null);

    if (file) {
        return (
            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100 flex flex-col gap-2">
                <div className="flex items-start justify-between">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                        <span className="material-icons-round text-primary text-[16px]">description</span>
                    </div>
                    {!disabled && (
                        <button
                            onClick={onRemove}
                            className="p-1 rounded-full hover:bg-slate-100 transition-colors"
                        >
                            <span className="material-icons-round text-slate-300 text-[16px]">close</span>
                        </button>
                    )}
                </div>
                <div>
                    <p className="text-[13px] font-semibold text-slate-700 truncate">{file.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
                <span className="self-start text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                    Uploaded
                </span>
            </div>
        );
    }

    return (
        <button
            onClick={() => !disabled && inputRef.current?.click()}
            disabled={disabled}
            className="aspect-video flex flex-col items-center justify-center p-4 rounded-lg bg-white border border-dashed border-slate-200 hover:border-primary/40 hover:bg-slate-50 transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
        >
            <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
                onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])}
            />
            <span className="material-icons-round text-slate-300 text-3xl group-hover:text-primary/50 transition-colors mb-2">
                upload_file
            </span>
            <p className="text-[12px] text-slate-400 text-center font-medium leading-snug">
                Paste or upload<br />example {index + 1}
            </p>
        </button>
    );
};

// ── Idle right panel ──────────────────────────────────────────────────────────
const IdlePanel = () => (
    <div className="flex-1 bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center justify-center p-10 text-center relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center mb-6">
                <span className="material-icons-round text-slate-200 text-4xl">menu_book</span>
            </div>
            <h4 className="text-lg font-semibold text-slate-700 mb-2">Ready for Research</h4>
            <p className="text-[13px] text-slate-400 max-w-xs leading-relaxed">
                Your report will appear here. Add references and instructions on the left, then hit Generate.
            </p>
            <div className="mt-8">
                <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-slate-300" />
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                        Waiting for input
                    </span>
                </div>
            </div>
        </div>

        {/* Decorative rings */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.035] flex items-center justify-center">
            <div className="w-80 h-80 border-[14px] border-primary rounded-full absolute" />
            <div className="w-56 h-56 border-[7px] border-primary rounded-full absolute" />
        </div>
    </div>
);

// ── Generating right panel ────────────────────────────────────────────────────
const GeneratingPanel = ({ email }) => (
    <div className="flex-1 bg-white rounded-lg shadow-lg border border-slate-100 flex flex-col items-center justify-center p-10 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-8 animate-pulse">
            <span className="material-icons-round text-primary text-3xl">hourglass_empty</span>
        </div>

        <h3 className="text-xl font-semibold text-slate-800 mb-2">Synthesizing Research</h3>
        <p className="text-[14px] text-slate-500 mb-8 leading-relaxed">
            This is deep work —{' '}
            <span className="text-primary font-semibold">we'll email you when it's ready.</span>
        </p>

        {/* Shimmer bar */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full mb-8 overflow-hidden">
            <div className="h-full w-2/3 scholar-shimmer rounded-full" />
        </div>

        <div className="flex flex-col items-center gap-3 w-full">
            <div className="flex items-center gap-2 text-slate-400">
                <span className="material-icons-round text-[16px]">mail</span>
                <p className="text-[13px]">
                    Notification → <span className="font-semibold text-slate-600">{email}</span>
                </p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full">
                <span className="material-icons-round text-emerald-500 text-[14px]">check_circle</span>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    You can close this tab safely
                </p>
            </div>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-100 w-full grid grid-cols-2 gap-4 text-left">
            <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Estimated Time</p>
                <p className="text-[13px] font-semibold text-slate-700">4–6 minutes</p>
            </div>
            <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Queue Status</p>
                <p className="text-[13px] font-semibold text-slate-700">Priority High</p>
            </div>
        </div>
    </div>
);

// ── Done right panel ──────────────────────────────────────────────────────────
const DonePanel = ({ title }) => (
    <div className="flex-1 flex flex-col gap-5">
        {/* Main result card */}
        <div className="bg-white rounded-lg shadow-lg border border-slate-100 p-6 flex flex-col gap-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-8 -mt-8" />

            {/* Status badge */}
            <span className="inline-flex self-start items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-semibold">
                <span className="material-icons-round text-[13px]">check_circle</span>
                Research Complete
            </span>

            {/* Title + meta */}
            <div>
                <h3 className="text-lg font-semibold text-slate-800 leading-snug mb-3">{title}</h3>
                <div className="flex items-center gap-4 text-slate-400">
                    <div className="flex items-center gap-1.5">
                        <span className="material-icons-round text-[15px]">format_align_left</span>
                        <span className="text-[13px] font-medium">3,500 words</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="material-icons-round text-[15px]">schedule</span>
                        <span className="text-[13px] font-medium">12 min read</span>
                    </div>
                </div>
            </div>

            {/* Quality score */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                        Content Quality Score
                    </span>
                    <span className="text-sm font-semibold text-primary">98%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '98%' }} />
                </div>
                <div className="mt-4 flex items-center gap-4">
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-widest">Citations</p>
                        <p className="text-[13px] font-semibold text-slate-700 mt-0.5">24 Sources</p>
                    </div>
                    <div className="w-px h-8 bg-slate-200" />
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-widest">Originality</p>
                        <p className="text-[13px] font-semibold text-slate-700 mt-0.5">99.8% Unique</p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                    <button className="flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-white text-[13px] font-semibold shadow-sm hover:bg-primary/90 transition-all active:scale-95">
                        <span className="material-icons-round text-[16px]">download</span>
                        Download
                    </button>
                    <button className="flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-white text-[13px] font-semibold shadow-sm hover:bg-primary/90 transition-all active:scale-95">
                        <span className="material-icons-round text-[16px]">edit_square</span>
                        Open & Edit
                    </button>
                </div>
                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary/8 text-primary text-[13px] font-semibold hover:bg-primary/12 transition-colors border border-primary/15">
                    <span className="material-icons-round text-[16px]">slideshow</span>
                    Export as Presentation
                </button>
            </div>
        </div>

        {/* AI agent strip */}
        <div className="bg-white rounded-lg border border-slate-100 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                    <span className="material-icons-round text-amber-500 text-[18px]">auto_awesome</span>
                </div>
                <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">AI Research Agent</p>
                    <p className="text-[13px] font-semibold text-slate-700">Synthesis Complete</p>
                </div>
            </div>
            <button className="text-[13px] font-semibold text-primary hover:underline">
                View Logs
            </button>
        </div>
    </div>
);

// ── Main Scholar component ────────────────────────────────────────────────────
export default function Scholar() {
    const [status, setStatus]           = useState('idle'); // idle | generating | done
    const [refs, setRefs]               = useState([null, null]);
    const [instructions, setInstructions] = useState('');
    const [reportTitle, setReportTitle] = useState('');

    const handleUpload = (index, file) => setRefs(prev => prev.map((r, i) => i === index ? file : r));
    const handleRemove = (index)       => setRefs(prev => prev.map((r, i) => i === index ? null : r));

    const handleGenerate = () => {
        if (!instructions.trim()) return;
        setReportTitle(instructions.trim().slice(0, 60) + (instructions.length > 60 ? '…' : ''));
        setStatus('generating');
        // Placeholder — real API call goes here
        setTimeout(() => setStatus('done'), 5000);
    };

    const handleReset = () => {
        setStatus('idle');
        setRefs([null, null]);
        setInstructions('');
        setReportTitle('');
    };

    const isGenerating = status === 'generating';
    const isDone       = status === 'done';
    const canGenerate  = instructions.trim().length > 0 && !isGenerating;

    return (
        <>
            <style>{SHIMMER_CSS}</style>
            <main className="flex-1 h-full overflow-y-auto bg-slate-50 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8">
                <div className="max-w-6xl mx-auto grid grid-cols-12 gap-6 lg:gap-8 min-h-full">

                    {/* ── Left column — controls ── */}
                    <section className="col-span-12 lg:col-span-5 flex flex-col gap-6">

                        {/* Page header */}
                        <div>
                            <h1 className="text-3xl font-semibold text-slate-800 tracking-tight font-serif-elegant mb-1">
                                Scholar
                            </h1>
                            <p className="text-[14px] text-slate-400">Deep work, done right.</p>
                        </div>

                        {/* Reference examples */}
                        <div className="flex flex-col gap-3">
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <span className="material-icons-round text-primary text-[15px]">attachment</span>
                                Reference Examples
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                {refs.map((file, i) => (
                                    <ReferenceSlot
                                        key={i}
                                        index={i}
                                        file={file}
                                        disabled={isGenerating}
                                        onUpload={f => handleUpload(i, f)}
                                        onRemove={() => handleRemove(i)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Instructions textarea */}
                        <div className="flex flex-col gap-3 flex-1">
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <span className="material-icons-round text-primary text-[15px]">draw</span>
                                Your Instructions
                            </p>
                            <div className="relative flex-1 min-h-[200px]">
                                <textarea
                                    value={instructions}
                                    onChange={e => setInstructions(e.target.value)}
                                    disabled={isGenerating}
                                    placeholder="Describe what you want: topic, depth, format, audience…"
                                    className="w-full h-full min-h-[200px] bg-white border border-slate-100 rounded-lg p-5 text-[14px] text-slate-700 placeholder-slate-300 resize-none outline-none focus:ring-2 focus:ring-primary/20 shadow-sm hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                {instructions.trim() && !isGenerating && (
                                    <button className="absolute bottom-3 right-3 text-[11px] font-semibold text-primary bg-primary/8 hover:bg-primary/12 px-3 py-1.5 rounded-full transition-colors border border-primary/15">
                                        Improve Prompt
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* CTA */}
                        {isDone ? (
                            <button
                                onClick={handleReset}
                                className="w-full py-4 rounded-lg bg-slate-100 text-slate-600 text-[14px] font-semibold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors active:scale-95"
                            >
                                <span className="material-icons-round text-[18px]">refresh</span>
                                Start New Report
                            </button>
                        ) : (
                            <button
                                onClick={handleGenerate}
                                disabled={!canGenerate}
                                className="w-full py-4 rounded-lg bg-primary text-white text-[14px] font-semibold flex items-center justify-center gap-2 shadow-lg hover:bg-primary/90 hover:shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                            >
                                {isGenerating ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <span className="material-icons-round text-[18px]">auto_awesome</span>
                                )}
                                {isGenerating ? 'Generating…' : 'Generate Report'}
                            </button>
                        )}
                    </section>

                    {/* ── Right column — status panel ── */}
                    <section className="col-span-12 lg:col-span-7 flex flex-col min-h-[420px] pb-8">
                        {status === 'idle'       && <IdlePanel />}
                        {status === 'generating' && <GeneratingPanel email="user@example.com" />}
                        {status === 'done'       && <DonePanel title={reportTitle || 'Your Research Report'} />}
                    </section>

                </div>
            </main>
        </>
    );
}
