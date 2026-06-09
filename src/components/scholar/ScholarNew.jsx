import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { scholarService } from '../../api/scholarService';

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
                        <button onClick={onRemove} className="p-1 rounded-full hover:bg-slate-100 transition-colors">
                            <span className="material-icons-round text-slate-300 text-[16px]">close</span>
                        </button>
                    )}
                </div>
                <div>
                    <p className="text-[13px] font-semibold text-slate-700 truncate">{file.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
                <span className="self-start text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                    Ready
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
            <span className="material-icons-round text-slate-300 text-3xl group-hover:text-primary/50 transition-colors mb-2">upload_file</span>
            <p className="text-[12px] text-slate-400 text-center font-medium leading-snug">
                Upload reference<br />file {index + 1}
            </p>
        </button>
    );
};

export default function ScholarNew() {
    const navigate = useNavigate();

    const [refs, setRefs]                 = useState([null, null]);
    const [instructions, setInstructions] = useState('');
    const [citationStyle, setCitationStyle] = useState('apa');
    const [pageCount, setPageCount]       = useState(20);
    const [error, setError]               = useState('');
    const [loading, setLoading]           = useState(false);

    const handleUpload = (i, file) => setRefs(prev => prev.map((r, idx) => idx === i ? file : r));
    const handleRemove = (i)       => setRefs(prev => prev.map((r, idx) => idx === i ? null : r));

    const canSubmit = instructions.trim().length >= 20 && !loading;

    const handleGenerate = async () => {
        if (!canSubmit) return;
        setError('');
        setLoading(true);
        try {
            const res = await scholarService.create({
                prompt: instructions.trim(),
                citationStyle,
                pageCount,
                uploads: refs.filter(Boolean),
            });
            navigate(`/lockedin/scholar/${res.data.id}`);
        } catch (err) {
            setError(
                err?.errors?.plan?.[0] || err?.errors?.limit?.[0] ||
                err?.errors?.uploads?.[0] || err?.errors?.prompt?.[0] ||
                err?.message || 'Something went wrong. Please try again.'
            );
            setLoading(false);
        }
    };

    return (
        <main className="flex-1 h-full overflow-y-auto bg-slate-50 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8">
            <div className="max-w-2xl mx-auto">

                {/* Back nav */}
                <button
                    onClick={() => navigate('/lockedin/scholar')}
                    className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-400 hover:text-primary transition-colors mb-6"
                >
                    <span className="material-icons-round text-[16px]">arrow_back</span>
                    My Documents
                </button>

                <div className="mb-6">
                    <h1 className="text-3xl font-semibold text-slate-800 tracking-tight font-serif-elegant mb-1">New Document</h1>
                    <p className="text-[14px] text-slate-400">Describe what you need — Scholar will research, write, and format a complete document for you.</p>
                </div>

                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col gap-6">

                    {/* Instructions */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <span className="material-icons-round text-primary text-[15px]">draw</span>
                            What should Scholar write?
                        </label>
                        <textarea
                            value={instructions}
                            onChange={e => setInstructions(e.target.value)}
                            disabled={loading}
                            rows={5}
                            placeholder="e.g. Write a comprehensive report on climate change and its impact on global food security. Include recent statistics, case studies, and policy recommendations."
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 text-[14px] text-slate-700 placeholder-slate-300 resize-none outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all disabled:opacity-50"
                        />
                        <p className="text-[11px] text-slate-400">
                            {instructions.trim().length} / 5000 characters{instructions.trim().length < 20 ? ` (minimum 20)` : ''}
                        </p>
                    </div>

                    {/* Reference uploads */}
                    <div className="flex flex-col gap-2">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <span className="material-icons-round text-primary text-[15px]">attachment</span>
                            Reference Files (optional)
                        </p>
                        <p className="text-[12px] text-slate-400">Upload PDFs, Word docs, or text files. Scholar will read them and incorporate their content.</p>
                        <div className="grid grid-cols-2 gap-3 mt-1">
                            {refs.map((file, i) => (
                                <ReferenceSlot
                                    key={i}
                                    index={i}
                                    file={file}
                                    disabled={loading}
                                    onUpload={f => handleUpload(i, f)}
                                    onRemove={() => handleRemove(i)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Page count picker */}
                    <div className="flex flex-col gap-2">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <span className="material-icons-round text-primary text-[15px]">menu_book</span>
                            Document Length
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {[1, 5, 10, 20, 30, 40, 50].map(n => (
                                <button
                                    key={n}
                                    onClick={() => setPageCount(n)}
                                    disabled={loading}
                                    className={`px-4 py-2 rounded-lg text-[12px] font-semibold border transition-all disabled:opacity-50 ${pageCount === n ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-primary/40'}`}
                                >
                                    {n} pages
                                </button>
                            ))}
                        </div>
                        <p className="text-[11px] text-slate-400">~{pageCount * 500} words. Longer documents take more time to generate.</p>
                    </div>

                    {/* Citation style */}
                    <div className="flex flex-col gap-2">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Citation Style</p>
                        <div className="flex gap-2">
                            {['apa', 'mla', 'ieee'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setCitationStyle(s)}
                                    disabled={loading}
                                    className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all disabled:opacity-50 ${citationStyle === s ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-primary/40'}`}
                                >
                                    {s.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                            <span className="material-icons-round text-red-400 text-[16px] mt-0.5">error_outline</span>
                            <p className="text-[13px] text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        onClick={handleGenerate}
                        disabled={!canSubmit}
                        className="w-full py-4 rounded-lg bg-primary text-white text-[14px] font-semibold flex items-center justify-center gap-2 shadow-lg hover:bg-primary/90 hover:shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <span className="material-icons-round text-[18px]">auto_awesome</span>
                        )}
                        {loading ? 'Creating document…' : 'Generate Document'}
                    </button>
                </div>

                {/* Info strip */}
                <div className="mt-4 bg-white rounded-xl border border-slate-100 px-5 py-4 flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-icons-round text-primary text-[16px]">info</span>
                    </div>
                    <div>
                        <p className="text-[12px] font-semibold text-slate-700 mb-0.5">What happens next?</p>
                        <p className="text-[12px] text-slate-400 leading-relaxed">
                            Scholar will research your topic using live web search, generate a complete multi-chapter document with table of contents and bibliography, then let you export it as PDF, DOCX, or HTML.
                            This takes 3–8 minutes depending on document length.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
