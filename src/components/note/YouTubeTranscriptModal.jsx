import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// ─── Fetch readable text from any URL via Jina Reader ────────────────────────

async function fetchPageText(url) {
    const raw = url.trim();
    if (!raw) throw Object.assign(new Error(), { code: 'bad_url' });

    // Basic URL sanity check
    try { new URL(raw); } catch { throw Object.assign(new Error(), { code: 'bad_url' }); }

    const res = await fetch(`https://r.jina.ai/${raw}`, {
        headers: { Accept: 'text/plain' },
    });

    if (!res.ok) throw Object.assign(new Error(), { code: 'failed' });

    const text = (await res.text()).trim();
    if (!text) throw Object.assign(new Error(), { code: 'empty' });

    return text;
}

// ─── Modal ────────────────────────────────────────────────────────────────────

const WebToTextModal = ({ onClose, onInsert }) => {
    const [url, setUrl]       = useState('');
    const [status, setStatus] = useState('idle'); // idle | fetching | done | error
    const [text, setText]     = useState('');
    const [errorCode, setErrorCode] = useState(null);
    const inputRef = useRef(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    const handleFetch = async () => {
        if (!url.trim() || status === 'fetching') return;
        setStatus('fetching');
        setText('');
        setErrorCode(null);
        try {
            const result = await fetchPageText(url);
            setText(result);
            setStatus('done');
        } catch (err) {
            setErrorCode(err.code ?? 'failed');
            setStatus('error');
        }
    };

    const handleReset = () => {
        setUrl('');
        setStatus('idle');
        setText('');
        setErrorCode(null);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const errorMessage =
        errorCode === 'bad_url' ? "That doesn't look like a valid URL." :
        errorCode === 'empty'   ? 'The page was found but had no readable content.' :
                                  'Could not extract content. The page may be behind a login or blocked.';

    return createPortal(
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-[99]" onClick={onClose} />

            {/* Modal */}
            <div
                className="fixed z-[100] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] md:w-[420px] bg-white rounded-l md:rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
                style={{ maxHeight: '80vh' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 md:w-7 md:h-7 :rounded-md md:rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm shrink-0">
                            <span className="material-icons-round text-[13px] md:text-[15px]">article</span>
                        </div>
                        <div>
                            <p className="font-semibold text-[12px] text-slate-800 leading-tight">Web to Text</p>
                            <p className="text-[9px] text-slate-400">Paste any article or blog URL to extract its text.</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="md:w-7 md:h-7 w-5 h-5 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
                    >
                        <span className="material-icons-round text-[13px] md:text-[16px]">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex flex-col gap-3 px-4 py-3 overflow-y-auto flex-1">

                    {(status === 'idle' || status === 'error') && (
                        <div className="flex flex-col gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleFetch(); }}
                                placeholder="https://example.com/article..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-md md:rounded-xl px-1.5 md:px-3 py-1 md:py-2.5 text-[12px] text-slate-700 placeholder-slate-400 outline-none focus:border-primary"
                            />
                            {status === 'error' && (
                                <p className="text-[11px] text-red-500 flex items-center gap-1">
                                    <span className="material-icons-round text-[13px]">error_outline</span>
                                    {errorMessage}
                                </p>
                            )}
                        </div>
                    )}

                    {status === 'fetching' && (
                        <div className="flex items-center justify-center py-8 gap-2 text-slate-400">
                            <span className="material-icons-round text-primary text-[16px] md:text-[28px] animate-spin">sync</span>
                            <span className="text-[12px]">Extracting content…</span>
                        </div>
                    )}

                    {status === 'done' && (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <p className="text-[9px] font-medium md:font-semibold text-slate-400 uppercase tracking-widest">
                                    Extracted content
                                </p>
                                <button
                                    onClick={handleReset}
                                    className="text-[9px] text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    Try another
                                </button>
                            </div>
                            <div className="bg-slate-50 border border-slate-200 rounded-md md:rounded-xl px-3 py-2.5 text-[11px] md:text-[12px] text-slate-700 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                                {text}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 pb-3 pt-2 border-t border-slate-100 shrink-0 flex justify-end gap-2">
                    {(status === 'idle' || status === 'error') && (
                        <button
                            onClick={handleFetch}
                            disabled={!url.trim()}
                            className="px-2 py-1 md:px-4 md:py-2 rounded-md md:rounded-xl bg-slate-900 text-white text-[11px] font-medium hover:bg-slate-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Continue
                        </button>
                    )}
                    {status === 'done' && (
                        <button
                            onClick={() => onInsert(text)}
                            className="px-2 py-1 md:px-4 md:py-2 rounded-md md:rounded-xl bg-primary text-white text-[11px] font-medium shadow shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all"
                        >
                            Insert into note
                        </button>
                    )}
                </div>
            </div>
        </>,
        document.body
    );
};

export default WebToTextModal;
