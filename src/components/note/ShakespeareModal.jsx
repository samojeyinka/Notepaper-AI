import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { shakespeare } from '../../assets/assets';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

const google = createGoogleGenerativeAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

const QUICK_PROMPTS = [
    'Introduce a topic',
    'Write a summary',
    'Explain like I\'m 5',
    'Write a conclusion',
    'Write a paragraph',
    'Give 3 key points',
];

const SYSTEM_INSTRUCTION = `You are Shakespeare Assist — an eloquent, intelligent writing companion embedded inside a note-taking app called Notepaper.ai.
Your job is to help users draft, expand, or polish text for their notes.
Rules:
- Respond ONLY with the requested content — no meta-commentary, no "Here is your text:", no preamble.
- Write in clear, natural prose unless the user asks for a specific style.
- Match the length to the request. Short request = concise output.
- Never refuse a reasonable writing task.`;

const PREMIUM_PERKS = [
    { icon: 'bolt',            text: 'More requests per day' },
    { icon: 'speed',           text: 'Priority generation speed' },
    { icon: 'psychology',      text: 'Advanced reasoning & longer outputs' },
    { icon: 'auto_fix_high',   text: 'Rewrite, expand & style tools' },
    { icon: 'translate',       text: 'Multi-language support' },
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
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 text-[11px] font-bold hover:bg-amber-100 transition-colors"
            >
                <span className="material-icons-round text-[14px]">workspace_premium</span>
                Pro
            </button>

            {open && (
                <div
                    onMouseEnter={() => setOpen(true)}
                    onMouseLeave={() => setOpen(false)}
                    className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-10 animate-in fade-in zoom-in-95 duration-150"
                >
                    <p className="text-[11px] font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                        <span className="material-icons-round text-amber-500 text-[15px]">workspace_premium</span>
                        Unlock Pro Shakespeare
                    </p>
                    <ul className="flex flex-col gap-2 mb-3">
                        {PREMIUM_PERKS.map(p => (
                            <li key={p.text} className="flex items-center gap-2 text-[11px] text-slate-600">
                                <span className="material-icons-round text-primary text-[14px]">{p.icon}</span>
                                {p.text}
                            </li>
                        ))}
                    </ul>
                    <button className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[11px] font-bold hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-amber-200">
                        Upgrade to Pro
                    </button>
                </div>
            )}
        </div>
    );
};

const ShakespeareModal = ({ onClose, onInsert }) => {
    const [prompt, setPrompt]       = useState('');
    const [output, setOutput]       = useState('');
    const [status, setStatus]       = useState('idle'); // idle | streaming | done | error
    const abortRef                  = useRef(null);
    const outputRef                 = useRef(null);

    // Auto-scroll output as it streams
    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [output]);

    const handleGenerate = async () => {
        if (!prompt.trim() || status === 'streaming') return;

        setOutput('');
        setStatus('streaming');
        abortRef.current = new AbortController();

        try {
            const result = streamText({
                model: google('gemini-2.5-flash'),
                system: SYSTEM_INSTRUCTION,
                messages: [{ role: 'user', content: prompt.trim() }],
                temperature: 0.85,
                maxTokens: 1024,
                abortSignal: abortRef.current.signal,
            });

            for await (const chunk of result.textStream) {
                setOutput(prev => prev + chunk);
            }

            setStatus('done');
        } catch (err) {
            if (err.name === 'AbortError') {
                setStatus('done');
            } else {
                console.error('[Shakespeare]', err);
                setStatus('error');
            }
        }
    };

    const handleStop = () => {
        abortRef.current?.abort();
    };

    const handleInsert = () => {
        if (output.trim() && onInsert) {
            onInsert(output.trim());
            onClose();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleGenerate();
        }
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}
        >
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-400 to-black flex items-center justify-center shadow-lg overflow-hidden">
                                <img src={shakespeare} className="w-full h-full object-cover" alt="Shakespeare" />
                            </div>
                            <div>
                                <h2 className="font-display font-bold text-slate-900 text-base leading-tight">Shakespeare Assist</h2>
                                <p className="text-[11px] text-slate-400 mt-0.5">Shakespeare writes it — you own it.</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors shrink-0"
                        >
                            <span className="material-icons-round text-[18px]">close</span>
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 py-5 flex flex-col gap-4 overflow-y-auto flex-1">

                    {/* Quick prompts */}
                    <div className="flex flex-wrap gap-2">
                        {QUICK_PROMPTS.map(q => (
                            <button
                                key={q}
                                onClick={() => setPrompt(q)}
                                className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-primary/10 hover:text-primary text-slate-600 text-[11px] font-medium transition-colors"
                            >
                                {q}
                            </button>
                        ))}
                    </div>

                    {/* Prompt input */}
                    <div className="relative">
                        <textarea
                            rows={3}
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="e.g. Write a short paragraph introducing photosynthesis for a biology note…"
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-primary resize-none leading-relaxed"
                        />
                        <p className="text-[10px] text-slate-300 text-right mt-1">Ctrl + Enter to generate</p>
                    </div>

                    {/* Generate / Stop button */}
                    {status !== 'streaming' ? (
                        <button
                            onClick={handleGenerate}
                            disabled={!prompt.trim()}
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r from-gray-700 to-black text-white text-sm font-bold shadow-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <span className="material-icons-round text-[17px]">auto_fix_high</span>
                            Let Shakespeare Write It
                        </button>
                    ) : (
                        <button
                            onClick={handleStop}
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-red-50 border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-100 active:scale-[0.98] transition-all"
                        >
                            <span className="material-icons-round text-[17px]">stop_circle</span>
                            Stop
                        </button>
                    )}

                    {/* Streamed output */}
                    {(output || status === 'streaming') && (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                                    {status === 'streaming' ? (
                                        <span className="flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" />
                                            Writing…
                                        </span>
                                    ) : 'Result'}
                                </p>
                                {status === 'done' && output && (
                                    <button
                                        onClick={() => { setOutput(''); setStatus('idle'); }}
                                        className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                            <div
                                ref={outputRef}
                                className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto"
                            >
                                {output}
                                {status === 'streaming' && (
                                    <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse align-text-bottom" />
                                )}
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                            <span className="material-icons-round text-[14px]">error_outline</span>
                            Something went wrong. Check your API key or try again.
                        </p>
                    )}
                </div>

                {/* Footer — Insert button */}
                <div className="px-6 pb-5 pt-2 border-t border-slate-100 shrink-0 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleInsert}
                            disabled={!output.trim() || status === 'streaming'}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <span className="material-icons-round text-[17px]">note_add</span>
                            Insert into Note
                        </button>

                        {/* Premium badge with hover tooltip */}
                        <PremiumBadge />
                    </div>
                    <p className="text-center text-[10px] text-slate-300 flex items-center justify-center gap-1">
                        <span className="material-icons-round text-[12px]">bolt</span>
                        Powered by Gemini 2.5 Flash
                    </p>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ShakespeareModal;
