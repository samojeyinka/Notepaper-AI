import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";

const MAX_FILE_MB = 10;

export const DocumentImportModal = ({ onClose, onInsert }) => {
    const [status, setStatus]     = useState('idle'); // idle | parsing | done | error
    const [error, setError]       = useState(null);
    const [preview, setPreview]   = useState('');
    const [fileName, setFileName] = useState('');
    const fileRef                 = useRef(null);

    const handleFile = async (file) => {
        if (!file) return;
        const ext = file.name.split('.').pop().toLowerCase();
        if (!['pdf', 'docx', 'doc'].includes(ext)) {
            setError('Only PDF, DOCX, and DOC files are supported.'); return;
        }
        if (file.size > MAX_FILE_MB * 1024 * 1024) {
            setError(`File too large. Maximum size is ${MAX_FILE_MB}MB.`); return;
        }

        setError(null);
        setStatus('parsing');
        setFileName(file.name);

        try {
            let html = '';

            if (ext === 'docx' || ext === 'doc') {
                const mammoth = await import('mammoth');
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.convertToHtml({ arrayBuffer });
                html = result.value;
            } else if (ext === 'pdf') {
                const pdfjsLib = await import('pdfjs-dist');
                // Set worker source
                pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
                    'pdfjs-dist/build/pdf.worker.min.mjs',
                    import.meta.url
                ).toString();

                const arrayBuffer = await file.arrayBuffer();
                const pdf         = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                const pageTexts   = [];

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page    = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    const text    = content.items.map(item => item.str).join(' ');
                    pageTexts.push(`<div>${text}</div>`);
                }
                html = pageTexts.join('<br>');
            }

            setPreview(html);
            setStatus('done');
        } catch (err) {
            console.error('[DocumentImport] parse error', err);
            setError('Failed to parse document. Please try a different file.');
            setStatus('error');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    return createPortal(
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <span className="material-icons-round text-primary text-[22px]">upload_file</span>
                        <div>
                            <h2 className="font-display font-semibold text-slate-900 text-base leading-tight">Import Document</h2>
                            <p className="text-[11px] text-slate-400">PDF or DOCX — content will be inserted into your paper</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
                        <span className="material-icons-round text-[18px]">close</span>
                    </button>
                </div>

                <div className="p-6 flex flex-col gap-4">
                    {/* Drop zone */}
                    {status === 'idle' || status === 'error' ? (
                        <div
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            onClick={() => fileRef.current?.click()}
                            className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                        >
                            <span className="material-icons-round text-[48px] text-slate-300">cloud_upload</span>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-slate-700">Drop your file here</p>
                                <p className="text-[11px] text-slate-400 mt-1">or click to browse — PDF, DOCX (max {MAX_FILE_MB}MB)</p>
                            </div>
                            {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-1.5 rounded-lg">{error}</p>}
                        </div>
                    ) : status === 'parsing' ? (
                        <div className="border-2 border-slate-100 rounded-xl p-8 flex flex-col items-center gap-3">
                            <span className="material-icons-round text-[40px] text-primary animate-spin">sync</span>
                            <p className="text-sm font-semibold text-slate-700">Parsing {fileName}…</p>
                            <p className="text-[11px] text-slate-400">Extracting text content</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-xl border border-green-100">
                                <span className="material-icons-round text-green-500 text-[18px]">check_circle</span>
                                <p className="text-xs text-green-700 font-medium">{fileName} parsed successfully</p>
                            </div>
                            <div
                                className="h-48 overflow-y-auto custom-scrollbar bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs text-slate-500 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: preview }}
                            />
                        </div>
                    )}

                    <input ref={fileRef} type="file" accept=".pdf,.docx,.doc" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; e.target.value=''; if (f) handleFile(f); }} />

                    {status === 'done' && (
                        <div className="flex gap-3">
                            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200">
                                Cancel
                            </button>
                            <button
                                onClick={() => { onInsert(preview); onClose(); }}
                                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/20"
                            >
                                Insert into Paper
                            </button>
                        </div>
                    )}

                    {(status === 'idle' || status === 'error') && (
                        <button onClick={onClose} className="py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-colors">
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};
