import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { shakespeare } from '../../assets/assets';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { usePlan } from '../../hooks/usePlan';

const google = createGoogleGenerativeAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

const SYSTEM_INSTRUCTION = `You are Shakespeare Assist — an intelligent writing companion inside a note-taking app called Notepaper-ai.
Help the user draft, expand, or polish text for their notes.
Rules:
- Respond ONLY with the requested content. No preamble, no "Here is your text:", no meta-commentary.
- Write in clear, natural prose unless the user asks for a specific style.
- Match the length to the request.
- Never refuse a reasonable writing task.`;

const PREMIUM_PERKS = [
    { icon: 'bolt',           text: 'More requests per day' },
    { icon: 'speed',          text: 'Priority generation speed' },
    { icon: 'psychology',     text: 'Advanced reasoning & longer outputs' },
    { icon: 'translate',      text: 'Multi-language support' },
];

const PremiumBadge = () => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    return (
        <div ref={ref} className="relative shrink-0">
            <button
                onClick={() => setOpen(v => !v)}
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 text-[10px] font-bold hover:bg-amber-100 transition-colors"
            >
                <span className="material-icons-round text-[12px]">workspace_premium</span>
                Pro
            </button>

            {open && (
                <div
                    onMouseEnter={() => setOpen(true)}
                    onMouseLeave={() => setOpen(false)}
                    className="absolute bottom-1 right-0 mb-2 w-60 bg-white rounded-xl shadow-md border border-slate-100 p-2 z-10"
                >
                    <p className="text-[10px] md:text-[11px] font-medium md:font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                        <span className="material-icons-round text-amber-500 text-[13px]">workspace_premium</span>
                        Unlock Pro Shakespeare
                    </p>
                    <ul className="flex flex-col gap-1">
                        {PREMIUM_PERKS.map(p => (
                            <li key={p.text} className="flex items-center gap-1 text-[9px] text-slate-600">
                                <span className="material-icons-round text-primary text-[10px] md:text-[11px]">{p.icon}</span>
                                {p.text}
                            </li>
                        ))}
                    </ul>
                    <button className="w-full py-0.5 md:py-1 rounded-md md:rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[10px] font-medium hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-amber-200">
                        Upgrade to Pro
                    </button>
                </div>
            )}
        </div>
    );
};

const ShakespeareModal = ({ onClose, onInsert }) => {
    const { canUseAI, increment, loaded } = usePlan();
    const [prompt, setPrompt] = useState('');
    const [output, setOutput] = useState('');
    const [status, setStatus] = useState('idle'); // idle | streaming | done | error
    const [refinePrompt, setRefinePrompt] = useState('');
    const abortRef = useRef(null);
    const outputRef = useRef(null);
    const inputRef = useRef(null);

    const limitReached = loaded && !canUseAI('ai_use');

    // Focus input on mount
    useEffect(() => { inputRef.current?.focus(); }, []);

    // Auto-scroll output
    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [output]);

    // Close on Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    const runGenerate = async (userPrompt) => {
        if (!userPrompt.trim() || status === 'streaming') return;
        setOutput('');
        setStatus('streaming');
        abortRef.current = new AbortController();

        try {
            const result = streamText({
                model: google('gemini-2.5-flash-lite'),
                system: SYSTEM_INSTRUCTION,
                messages: [{ role: 'user', content: userPrompt.trim() }],
                temperature: 0.85,
                maxTokens: 1024,
                abortSignal: abortRef.current.signal,
            });

            for await (const chunk of result.textStream) {
                setOutput(prev => prev + chunk);
            }
            setStatus('done');
            increment('ai_use');
        } catch (err) {
            if (err.name === 'AbortError') {
                setStatus('done');
            } else {
                console.error('[Shakespeare]', err);
                setStatus('error');
            }
        }
    };

    const handleGenerate = () => runGenerate(prompt);

    const handleRefine = () => {
        if (!refinePrompt.trim()) return;
        const combined = `${output.trim()}\n\n---\nRefine instruction: ${refinePrompt.trim()}`;
        setRefinePrompt('');
        runGenerate(combined);
    };

    const handleStop = () => { abortRef.current?.abort(); };

    const handleInsert = () => {
        if (output.trim() && onInsert) {
            onInsert(output.trim());
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleGenerate();
    };

    const handleRefineKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleRefine(); }
    };

    return createPortal(
        <>
            {/* Backdrop — clicking outside closes */}
            <div
                className="fixed inset-0 z-[99]"
                onClick={onClose}
            />

            {/* Popover card */}
            <div
                className="fixed z-[100] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] md:w-[420px] bg-white rounded-lg md:rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
                style={{ maxHeight: '80vh' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-2 md:px-4 py-1.5 md:py-3 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 md:w-7 md:h-7 rounded-xl bg-gradient-to-br from-gray-400 to-black flex items-center justify-center shadow-sm overflow-hidden shrink-0">
                            <img src={shakespeare} className="w-full h-full object-cover" alt="Shakespeare Assist" />
                        </div>
                        <div>
                            <p className="font-medium md:font-semibold text-[12px] text-slate-800 leading-tight">Shakespeare Assist</p>
                            <p className="text-[9px] text-slate-400">Shakespeare writes it — you own it.</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
                    >
                        <span className="material-icons-round text-[13px] md:text-[16px]">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex flex-col gap-3 px-4 py-3 overflow-y-auto flex-1">

                    {/* Prompt input — only shown before first generation */}
                    {status === 'idle' && (
                        <>
                            {limitReached ? (
                                <div className="flex flex-col items-center gap-2 py-4 px-3 bg-amber-50 border border-amber-200 rounded-md md:rounded-xl text-center">
                                    <span className="material-icons-round text-amber-500 text-[22px]">workspace_premium</span>
                                    <p className="text-[11px] font-semibold text-amber-800">Daily limit reached</p>
                                    <p className="text-[10px] text-amber-700">You've used all your free AI generations for today. Upgrade to Pro for more daily uses.</p>
                                </div>
                            ) : (
                                <textarea
                                    ref={inputRef}
                                    rows={3}
                                    value={prompt}
                                    onChange={e => setPrompt(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="What should Shakespeare write?  e.g. a short intro to photosynthesis…"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-md md:rounded-xl md:px-3 px-1.5 py-1.5 md:py-2.5 text-[10px] md:text-[12px] text-slate-700 placeholder-slate-400 outline-none focus:border-primary resize-none leading-relaxed"
                                />
                            )}
                        </>
                    )}

                    {/* Streaming / done output */}
                    {(output || status === 'streaming') && (
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
                                    {status === 'streaming' ? (
                                        <span className="flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" />
                                            Writing…
                                        </span>
                                    ) : 'Result'}
                                </p>
                                {status === 'done' && (
                                    <button
                                        onClick={() => { setOutput(''); setStatus('idle'); setPrompt(''); setRefinePrompt(''); }}
                                        className="text-[9px] text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                            <div
                                ref={outputRef}
                                className="bg-slate-50 border border-slate-200 rounded-md md:rounded-xl px-3 py-2.5 text-[10px] md:text-[12px] text-slate-700 leading-relaxed whitespace-pre-wrap max-h-52 overflow-y-auto"
                            >
                                {output}
                                {status === 'streaming' && (
                                    <span className="inline-block w-0.5 h-3.5 bg-primary ml-0.5 animate-pulse align-text-bottom" />
                                )}
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <p className="text-[11px] text-red-500 flex items-center gap-1">
                            <span className="material-icons-round text-[11px] md:text-[13px]">error_outline</span>
                            Something went wrong. Check your API key or try again.
                        </p>
                    )}

                    {/* Refine input — shown after generation */}
                    {status === 'done' && (
                        <div className="flex gap-2 items-center">
                            <input
                                type="text"
                                value={refinePrompt}
                                onChange={e => setRefinePrompt(e.target.value)}
                                onKeyDown={handleRefineKeyDown}
                                placeholder="Refine… e.g. make it shorter, add examples"
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-md md:rounded-xl md:px-3 px-1.5 py-1 md:py-2 text-[10px] md:text-[11px] text-slate-700 placeholder-slate-400 outline-none focus:border-primary"
                            />
                            <button
                                onClick={handleRefine}
                                disabled={!refinePrompt.trim()}
                                className="shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-xl bg-slate-100 hover:bg-primary hover:text-white text-slate-600 flex items-center justify-center transition-colors disabled:opacity-40"
                            >
                                <span className="material-icons-round text-[14px] md:text-[16px]">send</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 pb-3 pt-2 border-t border-slate-100 shrink-0 flex flex-col gap-2">
                    {/* Action row */}
                    <div className="flex items-center gap-2 ml-auto">
                        {status === 'streaming' ? (
                            <button
                                onClick={handleStop}
                                className="w-[fit-conetent] flex items-center justify-center gap-1 p-1 rounded-md bg-red-50 border border-red-200 text-red-500 text-[11px] font-normal hover:bg-red-100 active:scale-[0.98] transition-all"
                            >
                        
                              <span className="material-symbols-outlined">stop_circle</span>
                            </button>
                        ) : status === 'done' ? (
                            <>
                                <button
                                    onClick={handleInsert}
                                    disabled={!output.trim()}
                                    className="w-[fit-content] flex items-center justify-center gap-1 px-2 py-1 rounded-md bg-primary text-white text-[11px] font-medium shadow shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-40"
                                >
                                    Insert
                                </button>
                                <PremiumBadge />
                            </>
                        ) : (
                            <button
                                onClick={handleGenerate}
                                disabled={!prompt.trim() || limitReached || !loaded}
                                className="w-[fit-content] ml-auto px-2 md:px-4 py-1 md:py-2 rounded-md md:rounded-xl bg-gradient-to-r from-gray-700 to-black text-white text-[10px] md:text-[11px] font-medium shadow hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                            >
                                {!loaded
                                    ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    : 'Create'
                                }
                            </button>
                        )}
                    </div>

                  
                </div>
            </div>
        </>,
        document.body
    );
};

export default ShakespeareModal;
