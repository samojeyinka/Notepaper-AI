import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAIKeys } from '../../hooks/useAIKeys';
import { friendlyAIError } from '../../utils/aiErrors';
import { generateImageWithUserKey } from '../../utils/aiRuntime';

const GenerateImageModal = ({ onClose, onInsert }) => {
    const { hasProvider, openModal } = useAIKeys();
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

        if (!hasProvider('gemini')) {
            openModal();
            setErrorMsg('Add a Google Gemini API key in Settings to generate images.');
            setStatus('error');
            return;
        }

        try {
            const { url } = await generateImageWithUserKey(prompt.trim());
            setImageUrl(url);
            setStatus('done');
        } catch (err) {
            console.error('[GenerateImage]', err);
            setErrorMsg(friendlyAIError(err, err.message || 'Generation failed. Check your API key or try again.'));
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
                className="fixed z-[100] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] md:w-[480px] bg-white   shadow-2xl border border-stone-200 flex flex-col overflow-hidden"
                style={{ maxHeight: '85vh' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-2 md:px-4 py-1.5 md:py-3 border-b border-stone-100 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 md:w-7 md:h-7  bg-plum-600 flex items-center justify-center shadow-sm shrink-0">
                            <span className="material-icons-round text-white text-[12px] md:text-[15px]">auto_awesome</span>
                        </div>
                        <div>
                            <p className="font-medium md:font-semibold text-[12px] text-stone-800 leading-tight">Image AI</p>
                            <p className="text-[9px] text-stone-400">Generate images with Gemini</p>
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

                    {/* Prompt textarea — shown in idle/error states */}
                    {(status === 'idle' || status === 'error') && (
                        <textarea
                            ref={inputRef}
                            rows={3}
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Describe the image you want…  e.g. a misty mountain at sunrise, photorealistic"
                            className="w-full bg-stone-50 border border-stone-200   md:px-3 px-1.5 py-1.5 md:py-2.5 text-[10px] md:text-[12px] text-stone-700 placeholder-stone-400 outline-none focus:border-primary resize-none leading-relaxed"
                        />
                    )}

                    {/* Generating spinner */}
                    {status === 'generating' && (
                        <div className="flex flex-col items-center gap-3 py-10">
                            <div className="w-9 h-9 border-4 border-plum-200 border-t-plum-600 rounded-full animate-spin" />
                            <p className="text-[11px] text-stone-400">Generating your image…</p>
                        </div>
                    )}

                    {/* Generated image */}
                    {status === 'done' && imageUrl && (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <p className="text-[9px] font-semibold text-stone-400 uppercase tracking-widest">Result</p>
                                <button
                                    onClick={handleReset}
                                    className="text-[9px] text-stone-400 hover:text-stone-600 transition-colors"
                                >
                                    New image
                                </button>
                            </div>
                            <img
                                src={imageUrl}
                                alt="AI generated"
                                className="w-full  border border-stone-200 object-contain"
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
                <div className="px-4 pb-3 pt-2 border-t border-stone-100 shrink-0">
                    <div className="flex items-center gap-2 justify-end">
                        {status === 'done' ? (
                            <>
                                <a
                                    href={imageUrl}
                                    download="generated-image.png"
                                    className="flex items-center gap-1 px-2 py-1  bg-stone-100 text-stone-600 text-[11px] font-medium hover:bg-stone-200 active:scale-[0.98] transition-all"
                                >
                                    <span className="material-icons-round text-[13px]">download</span>
                                    Download
                                </a>
                                <button
                                    onClick={() => onInsert?.(imageUrl)}
                                    className="flex items-center gap-1 px-2 py-1  bg-plum-600 text-white text-[11px] font-medium hover:bg-plum-700 active:scale-[0.98] transition-all"
                                >
                                    <span className="material-icons-round text-[13px]">add_photo_alternate</span>
                                    Insert
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleGenerate}
                                disabled={!prompt.trim() || status === 'generating'}
                                className="px-2 md:px-4 py-1 md:py-2   bg-plum-600 text-white hover:bg-plum-700 text-[10px] md:text-[11px] font-medium shadow hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
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
