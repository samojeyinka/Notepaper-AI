import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const GEMINI_IMAGE_URL =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${import.meta.env.VITE_GEMINI_IMAGE_API_KEY}`;

const GenerateImageModal = ({ onClose, onInsert }) => {
    const [prompt, setPrompt]   = useState('');
    const [status, setStatus]   = useState('idle'); // idle | generating | done | error
    const [imageUrl, setImageUrl] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const inputRef = useRef(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    const handleGenerate = async () => {
        if (!prompt.trim() || status === 'generating') return;
        setStatus('generating');
        setImageUrl(null);
        setErrorMsg('');

        try {
            const res = await fetch(GEMINI_IMAGE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt.trim() }] }],
                    generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error?.message ?? `API error ${res.status}`);
            }

            const data = await res.json();
            const imagePart = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (!imagePart) throw new Error('No image was returned. Try rephrasing your prompt.');

            const { mimeType, data: b64 } = imagePart.inlineData;
            setImageUrl(`data:${mimeType};base64,${b64}`);
            setStatus('done');
        } catch (err) {
            console.error('[GenerateImage]', err);
            setErrorMsg(err.message || 'Generation failed. Check your API key or try again.');
            setStatus('error');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleGenerate();
    };

    const handleReset = () => {
        setStatus('idle');
        setImageUrl(null);
        setPrompt('');
        setErrorMsg('');
    };

    return createPortal(
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-[99]" onClick={onClose} />

            {/* Card */}
            <div
                className="fixed z-[100] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] md:w-[480px] bg-white rounded-lg md:rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
                style={{ maxHeight: '85vh' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-2 md:px-4 py-1.5 md:py-3 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 md:w-7 md:h-7 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-sm shrink-0">
                            <span className="material-icons-round text-white text-[12px] md:text-[15px]">auto_awesome</span>
                        </div>
                        <div>
                            <p className="font-medium md:font-semibold text-[12px] text-slate-800 leading-tight">Image AI</p>
                            <p className="text-[9px] text-slate-400">Generate images with Gemini</p>
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

                    {/* Prompt textarea — shown in idle/error states */}
                    {(status === 'idle' || status === 'error') && (
                        <textarea
                            ref={inputRef}
                            rows={3}
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Describe the image you want…  e.g. a misty mountain at sunrise, photorealistic"
                            className="w-full bg-slate-50 border border-slate-200 rounded-md md:rounded-xl md:px-3 px-1.5 py-1.5 md:py-2.5 text-[10px] md:text-[12px] text-slate-700 placeholder-slate-400 outline-none focus:border-primary resize-none leading-relaxed"
                        />
                    )}

                    {/* Generating spinner */}
                    {status === 'generating' && (
                        <div className="flex flex-col items-center gap-3 py-10">
                            <div className="w-9 h-9 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
                            <p className="text-[11px] text-slate-400">Generating your image…</p>
                        </div>
                    )}

                    {/* Generated image */}
                    {status === 'done' && imageUrl && (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Result</p>
                                <button
                                    onClick={handleReset}
                                    className="text-[9px] text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    New image
                                </button>
                            </div>
                            <img
                                src={imageUrl}
                                alt="AI generated"
                                className="w-full rounded-xl border border-slate-200 object-contain"
                                style={{ maxHeight: '340px' }}
                            />
                        </div>
                    )}

                    {/* Error message */}
                    {status === 'error' && (
                        <p className="text-[11px] text-red-500 flex items-center gap-1">
                            <span className="material-icons-round text-[13px]">error_outline</span>
                            {errorMsg}
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 pb-3 pt-2 border-t border-slate-100 shrink-0">
                    <div className="flex items-center gap-2 justify-end">
                        {status === 'done' ? (
                            <>
                                <a
                                    href={imageUrl}
                                    download="generated-image.png"
                                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium hover:bg-slate-200 active:scale-[0.98] transition-all"
                                >
                                    <span className="material-icons-round text-[13px]">download</span>
                                    Download
                                </a>
                                <button
                                    onClick={() => onInsert?.(imageUrl)}
                                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary text-white text-[11px] font-medium shadow shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all"
                                >
                                    <span className="material-icons-round text-[13px]">add_photo_alternate</span>
                                    Insert
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleGenerate}
                                disabled={!prompt.trim() || status === 'generating'}
                                className="px-2 md:px-4 py-1 md:py-2 rounded-md md:rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-[10px] md:text-[11px] font-medium shadow hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                            >
                                {status === 'generating'
                                    ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    : status === 'error' ? 'Retry' : 'Generate'
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

export default GenerateImageModal;
