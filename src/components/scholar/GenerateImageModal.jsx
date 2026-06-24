import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { apiClient } from '../../api/apiClient';

const ASPECT_RATIOS = [
    { label: '1:1',  value: '1:1',  icon: 'crop_square'     },
    { label: '16:9', value: '16:9', icon: 'crop_16_9'       },
    { label: '9:16', value: '9:16', icon: 'crop_portrait'   },
    { label: '4:3',  value: '4:3',  icon: 'crop_landscape'  },
    { label: '3:4',  value: '3:4',  icon: 'crop_3_2'        },
];

export default function GenerateImageModal({ onClose, onInsert }) {
    const [prompt, setPrompt]         = useState('');
    const [ratio, setRatio]           = useState('1:1');
    const [status, setStatus]         = useState('idle');   // idle | loading | done | error
    const [imageUrl, setImageUrl]     = useState('');
    const [errorMsg, setErrorMsg]     = useState('');
    const textareaRef                 = useRef(null);

    useEffect(() => { textareaRef.current?.focus(); }, []);

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    const handleGenerate = async () => {
        if (!prompt.trim() || status === 'loading') return;
        setStatus('loading');
        setErrorMsg('');
        setImageUrl('');

        try {
            const res = await apiClient('/ai/image/generate', {
                method: 'POST',
                body: { prompt: prompt.trim(), aspect_ratio: ratio },
            });
            setImageUrl(res.data_url);
            setStatus('done');
        } catch (err) {
            setErrorMsg(err?.message || 'Generation failed. Please try again.');
            setStatus('error');
        }
    };

    const handleDownload = () => {
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = `ai-image-${Date.now()}.png`;
        a.click();
    };

    const handleInsert = () => {
        if (imageUrl && onInsert) {
            onInsert(imageUrl);
        }
    };

    return createPortal(
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-[99] bg-black/20 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div
                className="fixed z-[100] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] md:w-[480px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
                style={{ maxHeight: '90vh' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-sm shrink-0">
                            <span className="material-icons-round text-white text-[15px]">auto_awesome</span>
                        </div>
                        <div>
                            <p className="font-semibold text-[13px] text-slate-800 leading-tight">AI Image Generator</p>
                            <p className="text-[10px] text-slate-400">Powered by Google Gemini</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
                    >
                        <span className="material-icons-round text-[16px]">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex flex-col gap-3 px-4 py-3 overflow-y-auto flex-1">

                    {/* Prompt */}
                    {status !== 'done' && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Describe your image</label>
                            <textarea
                                ref={textareaRef}
                                rows={3}
                                value={prompt}
                                onChange={e => setPrompt(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleGenerate(); }}
                                placeholder="A futuristic cityscape at sunset, ultra-detailed, photorealistic…"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[12px] text-slate-700 placeholder-slate-400 outline-none focus:border-primary resize-none leading-relaxed"
                            />
                        </div>
                    )}

                    {/* Aspect ratio */}
                    {status !== 'done' && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Aspect ratio</label>
                            <div className="flex gap-1.5 flex-wrap">
                                {ASPECT_RATIOS.map(r => (
                                    <button
                                        key={r.value}
                                        type="button"
                                        onClick={() => setRatio(r.value)}
                                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                                            ratio === r.value
                                                ? 'bg-primary text-white border-primary'
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        <span className="material-icons-round text-[13px]">{r.icon}</span>
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Loading */}
                    {status === 'loading' && (
                        <div className="flex flex-col items-center gap-3 py-10">
                            <div className="relative w-14 h-14">
                                <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="material-icons-round text-primary text-[18px]">auto_awesome</span>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-[13px] font-semibold text-slate-700">Generating your image…</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">This may take 10–30 seconds</p>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {status === 'error' && (
                        <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                            <span className="material-icons-round text-red-400 text-[15px] mt-0.5 shrink-0">error_outline</span>
                            <p className="text-[12px] text-red-600">{errorMsg}</p>
                        </div>
                    )}

                    {/* Generated image */}
                    {status === 'done' && imageUrl && (
                        <div className="flex flex-col gap-3">
                            <div className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                                <img src={imageUrl} alt="Generated" className="w-full object-cover" />
                            </div>
                            <p className="text-[10px] text-slate-400 text-center">{prompt}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 pb-3 pt-2 border-t border-slate-100 shrink-0 flex items-center justify-between gap-2">
                    {status === 'done' ? (
                        <>
                            <button
                                onClick={() => { setStatus('idle'); setImageUrl(''); }}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                            >
                                <span className="material-icons-round text-[14px]">refresh</span>
                                Regenerate
                            </button>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    <span className="material-icons-round text-[14px]">download</span>
                                    Download
                                </button>
                                <button
                                    onClick={handleInsert}
                                    className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-primary text-white text-[12px] font-semibold hover:bg-primary/90 transition-all active:scale-95 shadow shadow-primary/20"
                                >
                                    <span className="material-icons-round text-[14px]">add_photo_alternate</span>
                                    Insert
                                </button>
                            </div>
                        </>
                    ) : status === 'loading' ? (
                        <p className="text-[11px] text-slate-400 mx-auto">Gemini is creating your image…</p>
                    ) : (
                        <button
                            onClick={handleGenerate}
                            disabled={!prompt.trim()}
                            className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 text-white text-[12px] font-semibold shadow hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <span className="material-icons-round text-[15px]">auto_awesome</span>
                            Generate
                        </button>
                    )}
                </div>
            </div>
        </>,
        document.body,
    );
}
