import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { shakespeare } from '../../assets/assets';
import { useAIKeys } from '../../hooks/useAIKeys';
import { friendlyAIError } from '../../utils/aiErrors';
import { generateWithUserKey, NO_AI_KEY_MESSAGE } from '../../utils/aiRuntime';

const SYSTEM_INSTRUCTION = `You are Shakespeare Assist — an intelligent writing companion inside a note-taking app called Notepaper-ai.
Help the user draft, expand, or polish text for their notes.
Rules:
- Respond ONLY with the requested content. No preamble, no "Here is your text:", no meta-commentary.
- Write in clear, natural prose unless the user asks for a specific style.
- Match the length to the request.
- Never refuse a reasonable writing task.`;

const ShakespeareModal = ({ onClose, onInsert }) => {
    const { hasKeys, openModal, loaded } = useAIKeys();
    const [prompt, setPrompt] = useState('');
    const [output, setOutput] = useState('');
    const [status, setStatus] = useState('idle'); // idle | streaming | done | error
    const [errorMsg, setErrorMsg] = useState('');
    const [refinePrompt, setRefinePrompt] = useState('');
    const abortRef = useRef(null);
    const outputRef = useRef(null);
    const inputRef = useRef(null);

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
        setErrorMsg('');
        setStatus('streaming');
        abortRef.current = new AbortController();

        if (!hasKeys) {
            openModal();
            setErrorMsg(NO_AI_KEY_MESSAGE);
            setStatus('error');
            return;
        }

        try {
            const { text } = await generateWithUserKey({
                system: SYSTEM_INSTRUCTION,
                prompt: userPrompt.trim(),
                signal: abortRef.current.signal,
            });

            setOutput(text);
            setStatus('done');
        } catch (err) {
            if (err.name === 'AbortError') {
                setStatus('done');
            } else {
                console.error('[Shakespeare]', err);
                setErrorMsg(friendlyAIError(err, 'Something went wrong. Check your API key or try again.'));
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
                className="fixed z-[100] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] md:w-[420px] bg-white   shadow-2xl border border-stone-200 flex flex-col overflow-hidden"
                style={{ maxHeight: '80vh' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-2 md:px-4 py-1.5 md:py-3 border-b border-stone-100 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 md:w-7 md:h-7  bg-stone-900 flex items-center justify-center shadow-sm overflow-hidden shrink-0">
                            <img src={shakespeare} className="w-full h-full object-cover" alt="Shakespeare Assist" />
                        </div>
                        <div>
                            <p className="font-medium md:font-semibold text-[12px] text-stone-800 leading-tight">Shakespeare Assist</p>
                            <p className="text-[9px] text-stone-400">Shakespeare writes it — you own it.</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7  flex items-center justify-center text-stone-400 hover:bg-stone-100 transition-colors"
                    >
                        <span className="material-icons-round text-[13px] md:text-[16px]">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex flex-col gap-3 px-4 py-3 overflow-y-auto flex-1">

                    {/* Prompt input — only shown before first generation */}
                    {status === 'idle' && (
                        <textarea
                            ref={inputRef}
                            rows={3}
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="What should Shakespeare write?  e.g. a short intro to photosynthesis…"
                            className="w-full bg-stone-50 border border-stone-200   md:px-3 px-1.5 py-1.5 md:py-2.5 text-[10px] md:text-[12px] text-stone-700 placeholder-stone-400 outline-none focus:border-primary resize-none leading-relaxed"
                        />
                    )}

                    {/* Streaming / done output */}
                    {(output || status === 'streaming') && (
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <p className="text-[9px] font-semibold text-stone-400 uppercase tracking-widest">
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
                                        className="text-[9px] text-stone-400 hover:text-stone-600 transition-colors"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                            <div
                                ref={outputRef}
                                className="bg-stone-50 border border-stone-200   px-3 py-2.5 text-[10px] md:text-[12px] text-stone-700 leading-relaxed whitespace-pre-wrap max-h-52 overflow-y-auto"
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
                            {errorMsg}
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
                                className="flex-1 bg-stone-50 border border-stone-200   md:px-3 px-1.5 py-1 md:py-2 text-[10px] md:text-[11px] text-stone-700 placeholder-stone-400 outline-none focus:border-primary"
                            />
                            <button
                                onClick={handleRefine}
                                disabled={!refinePrompt.trim()}
                                className="shrink-0 w-6 h-6 md:w-8 md:h-8  bg-stone-100 hover:bg-primary hover:text-white text-stone-600 flex items-center justify-center transition-colors disabled:opacity-40"
                            >
                                <span className="material-icons-round text-[14px] md:text-[16px]">send</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 pb-3 pt-2 border-t border-stone-100 shrink-0 flex flex-col gap-2">
                    {/* Action row */}
                    <div className="flex items-center gap-2 ml-auto">
                        {status === 'streaming' ? (
                            <button
                                onClick={handleStop}
                                className="w-[fit-conetent] flex items-center justify-center gap-1 p-1  bg-red-50 border border-red-200 text-red-500 text-[11px] font-normal hover:bg-red-100 active:scale-[0.98] transition-all"
                            >
                        
                              <span className="material-symbols-outlined">stop_circle</span>
                            </button>
                        ) : status === 'done' ? (
                            <>
                                <button
                                    onClick={handleInsert}
                                    disabled={!output.trim()}
                                    className="w-[fit-content] flex items-center justify-center gap-1 px-2 py-1  bg-plum-600 text-white text-[11px] font-medium hover:bg-plum-700 active:scale-[0.98] transition-all disabled:opacity-40"
                                >
                                    Insert
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleGenerate}
                                disabled={!prompt.trim() || !loaded}
                                className="w-[fit-content] ml-auto px-2 md:px-4 py-1 md:py-2   bg-stone-900 text-white hover:bg-stone-800 text-[10px] md:text-[11px] font-medium shadow hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
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
