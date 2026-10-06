import { useState, useRef, useEffect } from 'react';
import { useAIKeys } from '../../hooks/useAIKeys';
import { generateWithUserKey, NO_AI_KEY_MESSAGE } from '../../utils/aiRuntime';

// ── Diagram types ─────────────────────────────────────────────────────────────
const DIAGRAM_TYPES = [
    { value: 'flowchart TD',    label: 'Flowchart'  },
    { value: 'sequenceDiagram', label: 'Sequence'   },
    { value: 'erDiagram',       label: 'ER Diagram' },
    { value: 'classDiagram',    label: 'Class'      },
    { value: 'stateDiagram-v2', label: 'State'      },
    { value: 'mindmap',         label: 'Mind Map'   },
    { value: 'gantt',           label: 'Gantt'      },
];

// ── Mermaid helpers (mirrored from DocumentEditor) ────────────────────────────
let _mermaidInstance = null;
let _previewSeq = 0;

function sanitizeMermaid(code) {
    if (!code) return code;
    if (!code.includes('\n') && /\s{3,}/.test(code)) {
        code = code.replace(/\s{3,}/g, '\n    ');
    }
    code = code.replace(/(\})\s{2,}(?=(class|participant|actor|state|note|section|task|milestone|link|click|style|classDef|subgraph|end)\s)/g, '$1\n    ');
    code = code.replace(/(;|,)\s{2,}(?=class\s)/g, '$1\n    ');
    code = code.replace(/\[([^[\]"\n][^[\]\n]*\([^)\n]*\)[^[\]\n]*)\]/g, '["$1"]');
    code = code.replace(
        /\bclass\s+"([^"]+)"\s+as\s+(\w+)\s*(\{[^}]*\})?/g,
        (_, label, alias, body) => {
            const trimmed = (body ?? '').replace(/\s/g, '');
            return trimmed && trimmed !== '{}'
                ? `class ${alias}["${label}"] ${body.trim()}`
                : `class ${alias}["${label}"]`;
        }
    );
    code = code.replace(/\bclass\s+(\w+(?:\[(?:[^\]]*)\])?)\s*\{\s*\}/g, 'class $1');
    return code;
}

async function getMermaid() {
    if (_mermaidInstance) return _mermaidInstance;
    const m = await import('mermaid');
    _mermaidInstance = m.default;
    _mermaidInstance.initialize({
        startOnLoad: false,
        theme: 'neutral',
        securityLevel: 'loose',
        fontFamily: 'Arial, sans-serif',
        flowchart: { htmlLabels: false },
    });
    return _mermaidInstance;
}

async function renderToSvg(code, id) {
    const m = await getMermaid();
    const { svg } = await m.render(id, sanitizeMermaid(code));
    return svg;
}

// Insert SVG into live DOM so the browser resolves CSS class rules and
// var(--…) custom properties, then inline every computed style and trim
// the viewBox to actual content bounds so the exported image isn't padded.
async function prepareExportSvg(svgString) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1200px;visibility:hidden;pointer-events:none;';
    wrap.innerHTML = svgString;
    document.body.appendChild(wrap);
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    const svgEl = wrap.querySelector('svg');
    if (!svgEl) { document.body.removeChild(wrap); return svgString; }

    // Convert <foreignObject> labels to SVG <text> so canvas renders them
    svgEl.querySelectorAll('foreignObject').forEach(fo => {
        const label = (fo.textContent || '').replace(/\s+/g, ' ').trim();
        if (!label) { fo.remove(); return; }
        const fw = parseFloat(fo.getAttribute('width')  || '0');
        const fh = parseFloat(fo.getAttribute('height') || '0');
        const fx = parseFloat(fo.getAttribute('x') || '0');
        const fy = parseFloat(fo.getAttribute('y') || '0');
        const inner = fo.firstElementChild;
        const cs = inner ? window.getComputedStyle(inner) : null;
        const fontSize   = cs?.fontSize   || '14px';
        const fontFamily = (cs?.fontFamily || 'Arial, sans-serif').replace(/\binherit\b/gi, 'Arial, sans-serif');
        const fillColor  = cs?.color      || '#333333';
        const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        t.setAttribute('x', String(fx + fw / 2));
        t.setAttribute('y', String(fy + fh / 2));
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('dominant-baseline', 'central');
        t.setAttribute('style', `font-size:${fontSize};font-family:${fontFamily};fill:${fillColor};`);
        t.textContent = label;
        fo.parentNode?.replaceChild(t, fo);
    });

    // Inline computed styles — canvas needs concrete values, not class lookups
    const PROPS = [
        'fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin',
        'font-family', 'font-size', 'font-weight', 'font-style', 'opacity',
    ];
    [svgEl, ...svgEl.querySelectorAll('*')].forEach(el => {
        if (el.tagName.toLowerCase() === 'style') return;
        try {
            const cs = window.getComputedStyle(el);
            const isText = /^(text|tspan)$/i.test(el.tagName);
            const parts = [];
            for (const prop of PROPS) {
                const val = cs.getPropertyValue(prop);
                if (!val || val === '' || val === 'initial' || val === 'unset') continue;
                if (prop === 'fill' && val === 'none' && isText) continue;
                parts.push(`${prop}:${val}`);
            }
            if (parts.length) el.setAttribute('style', parts.join(';'));
        } catch { /* non-styleable nodes */ }
    });
    svgEl.querySelectorAll('style').forEach(s => s.remove());

    // Trim viewBox to actual content so there's no excess whitespace
    try {
        const bbox = svgEl.getBBox();
        const { x, y, width, height } = bbox;
        if (width > 0 && height > 0 && isFinite(x) && isFinite(y)) {
            const pad = 20;
            svgEl.setAttribute('viewBox', `${x - pad} ${y - pad} ${width + pad * 2} ${height + pad * 2}`);
            svgEl.setAttribute('width',   String(Math.ceil(width  + pad * 2)));
            svgEl.setAttribute('height',  String(Math.ceil(height + pad * 2)));
        }
    } catch { /* getBBox unavailable */ }

    const result = new XMLSerializer().serializeToString(svgEl);
    document.body.removeChild(wrap);
    return result;
}

async function svgToCanvas(svgString) {
    // prepareExportSvg must be called first to get accurate naturalWidth/Height
    return new Promise((resolve, reject) => {
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url  = URL.createObjectURL(blob);
        const img  = new window.Image();
        img.onload = () => {
            const SCALE   = 3; // 3× for crisp text at any zoom
            const MIN_W   = 1400;
            let w = img.naturalWidth  || MIN_W;
            let h = img.naturalHeight || Math.round(w * 0.5);
            // Upscale small diagrams to at least MIN_W so text is never tiny
            if (w < MIN_W) { h = Math.round(h * MIN_W / w); w = MIN_W; }
            const canvas = document.createElement('canvas');
            canvas.width  = w * SCALE;
            canvas.height = h * SCALE;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.scale(SCALE, SCALE);
            ctx.drawImage(img, 0, 0, w, h);
            URL.revokeObjectURL(url);
            try { resolve(canvas); } catch { reject(new Error('canvas tainted')); }
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('SVG load failed')); };
        img.src = url;
    });
}

// ── AutoDiagramTab ────────────────────────────────────────────────────────────
export default function AutoDiagramTab() {
    const { hasKeys, openModal } = useAIKeys();
    const [prompt,      setPrompt]      = useState('');
    const [diagramType, setDiagramType] = useState('flowchart TD');
    const [code,        setCode]        = useState('');
    const [editedCode,  setEditedCode]  = useState('');
    const [svg,         setSvg]         = useState('');
    const [status,      setStatus]      = useState('idle'); // idle | generating | done | error
    const [errorMsg,    setErrorMsg]    = useState('');
    const [showCode,    setShowCode]    = useState(false);
    const [downloading, setDownloading] = useState(null); // null | 'png' | 'jpg' | 'svg'
    const [rerendering, setRerendering] = useState(false);
    const previewId = useRef(`mmd-tab-${++_previewSeq}`);
    const promptRef = useRef(null);

    useEffect(() => { promptRef.current?.focus(); }, []);

    const generate = async () => {
        if (!prompt.trim() || status === 'generating') return;
        setStatus('generating');
        setCode(''); setEditedCode(''); setSvg('');
        setErrorMsg(''); setShowCode(false);
        try {
            if (!hasKeys) {
                openModal();
                setErrorMsg(NO_AI_KEY_MESSAGE);
                setStatus('error');
                return;
            }

            const { text: raw } = await generateWithUserKey({
                prompt: `Generate a ${diagramType} Mermaid diagram for: ${prompt.trim()}`,
                system: `You are an expert Mermaid diagram generator.
Output ONLY valid Mermaid diagram syntax. No markdown fences, no prose, no comments.
The very first line must be the diagram type keyword (e.g. flowchart TD, sequenceDiagram, classDiagram, etc).
Rules:
- classDiagram: class names must be single identifiers (no spaces, no quotes). Use ClassName["Display Label"] for a readable label. NEVER use: class "Name" as Alias syntax.
- flowchart: quote labels that contain special characters: A["Label with (parens)"]
- Keep it concise and accurate.`,
            });
            const cleaned = raw.replace(/^```[\w]*\n?/m, '').replace(/\n?```\s*$/m, '').trim();
            setCode(cleaned);
            setEditedCode(cleaned);
            document.getElementById(previewId.current)?.remove();
            const s = await renderToSvg(cleaned, previewId.current);
            setSvg(s);
            setStatus('done');
        } catch (err) {
            console.error('[DiagramTab]', err);
            setErrorMsg(err.message || 'Generation failed — try rephrasing your description.');
            setStatus('error');
        }
    };

    const applyCodeEdit = async () => {
        if (!editedCode.trim() || rerendering) return;
        setRerendering(true);
        try {
            document.getElementById(previewId.current)?.remove();
            const s = await renderToSvg(editedCode, previewId.current);
            setCode(editedCode);
            setSvg(s);
        } catch (err) {
            console.error('[DiagramTab render]', err);
        } finally {
            setRerendering(false);
        }
    };

    const handleDownload = async (fmt) => {
        if (!svg || downloading) return;
        setDownloading(fmt);
        const slug = prompt.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) || 'diagram';
        try {
            if (fmt === 'svg') {
                const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
                const url  = URL.createObjectURL(blob);
                const a    = document.createElement('a');
                a.href = url; a.download = `${slug}.svg`;
                document.body.appendChild(a); a.click(); document.body.removeChild(a);
                URL.revokeObjectURL(url);
                return;
            }
            // Inline computed styles + trim viewBox before rasterising so
            // naturalWidth/Height are accurate and text is crisp on canvas
            const prepared = await prepareExportSvg(svg);
            const canvas   = await svgToCanvas(prepared);
            const mime     = fmt === 'jpg' ? 'image/jpeg' : 'image/png';
            const quality  = fmt === 'jpg' ? 0.95 : undefined;
            const dataUrl  = canvas.toDataURL(mime, quality);
            const a        = document.createElement('a');
            a.href = dataUrl; a.download = `${slug}.${fmt}`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
        } catch (err) {
            console.error('[DiagramDownload]', err);
        } finally {
            setDownloading(null);
        }
    };

    const handleReset = () => {
        setCode(''); setEditedCode(''); setSvg('');
        setStatus('idle'); setPrompt(''); setShowCode(false);
        setTimeout(() => promptRef.current?.focus(), 50);
    };

    const isGenerating = status === 'generating';
    const isDone       = status === 'done';
    const isIdle       = status === 'idle';

    return (
        <div className="flex-1 p-4 md:p-6 grid grid-cols-12 gap-4 md:gap-6 items-start">

            {/* ── Left — config panel ──────────────────────────────────── */}
            <section className="col-span-12 md:col-span-4 flex flex-col gap-4">
                <div className="bg-white  md: p-3 md:p-6 flex flex-col gap-5">

                    <div className="flex items-center gap-3">
                       
                        <div>
                            <h2 className="font-display-serif text-[17px] font-semibold text-stone-900 leading-tight">Diagram studio</h2>
                            <p className="text-[11px] text-stone-400 mt-0.5">Flowcharts & diagrams, from a prompt</p>
                        </div>
                    </div>

                    {/* Diagram type */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-semibold md:font-bold text-stone-400 uppercase tracking-widest">Diagram Type</label>
                        <div className="flex flex-wrap gap-1.5">
                            {DIAGRAM_TYPES.map(t => (
                                <button
                                    key={t.value}
                                    onClick={() => setDiagramType(t.value)}
                                    disabled={isGenerating}
                                    className={`px-2.5 py-1  text-[10px] md:text-[11px] font-semibold transition-all disabled:opacity-50 ${
                                        diagramType === t.value
                                            ? 'bg-stone-900 text-white'
                                            : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                                    }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Prompt */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-semibold md:font-bold text-stone-400 uppercase tracking-widest">Description</label>
                        <textarea
                            ref={promptRef}
                            rows={4}
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) generate(); }}
                            disabled={isGenerating}
                            placeholder={'Describe your diagram, e.g. "user login and signup flow"'}
                            className="w-full resize-none  md: bg-stone-50 border-none px-4 py-3 text-[12px] md:text-sm text-stone-700 placeholder-stone-400 outline-none focus:ring-2 focus:ring-plum-200 transition disabled:opacity-50"
                        />
                    </div>

                    {/* Generate / Generating */}
                    {isGenerating ? (
                        <button disabled className="w-full py-2 md:py-3 bg-stone-100 text-stone-400  font-medium text-[12px] md:text-sm flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-stone-300 border-t-primary  animate-spin" />
                        </button>
                    ) : (
                        <button
                            onClick={generate}
                            disabled={!prompt.trim()}
                            className="w-full py-2 md:py-3 bg-stone-900 text-white  font-medium md:font-bold text-[12px] md:text-sm flex items-center justify-center gap-2 hover:scale-[0.98] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          
                            {isDone ? 'Regenerate' : 'Generate Diagram'}
                        </button>
                    )}

                    {isDone && (
                        <button
                            onClick={handleReset}
                            className="w-full py-2.5  border border-stone-200 text-stone-500 text-sm font-semibold hover:bg-stone-50 transition"
                        >
                            Start Over
                        </button>
                    )}

                    {/* Export */}
                    {isDone && svg && (
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Export</label>
                            <div className="flex gap-2">
                                {['png', 'jpg', 'svg'].map(fmt => (
                                    <button
                                        key={fmt}
                                        onClick={() => handleDownload(fmt)}
                                        disabled={!!downloading}
                                        className="flex-1 flex items-center justify-center gap-1 py-1.5  text-[11px] font-semibold text-stone-500 border border-stone-200 hover:border-stone-300 hover:text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        title={`Download as ${fmt.toUpperCase()}`}
                                    >
                                        {downloading === fmt ? (
                                            <span className="w-3 h-3 border-2 border-stone-300 border-t-stone-500  animate-spin shrink-0" />
                                        ) : (
                                            <span className="material-icons-round text-[13px]">download</span>
                                        )}
                                        {fmt.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ── Right — preview workspace ────────────────────────────── */}
            <section className="col-span-12 md:col-span-8">
                <div className="bg-white ring-1 ring-stone-200/70 flex flex-col overflow-hidden relative md:min-h-[500px]">

                    {/* Workspace header */}
                    <div className="px-6 py-4 flex items-center justify-between border-b border-stone-50 shrink-0">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-stone-500 tracking-wide">Diagram Preview</span>
                        </div>
                        {isDone && (
                            <div className="flex items-center gap-2">
                                {showCode && (
                                    <button
                                        onClick={applyCodeEdit}
                                        disabled={rerendering || editedCode === code}
                                        className="flex items-center gap-1 px-2.5 py-1  text-[11px] font-semibold bg-plum-50 text-plum-800 hover:bg-primary/15 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {rerendering ? (
                                            <span className="w-3 h-3 border-2 border-plum-600/30 border-t-primary  animate-spin shrink-0" />
                                        ) : (
                                            <span className="material-icons-round text-[13px]">refresh</span>
                                        )}
                                        Apply
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowCode(v => !v)}
                                    className="flex items-center gap-1 text-[11px] font-semibold text-stone-400 hover:text-plum-700 transition-colors"
                                >
                                    <span className="material-icons-round text-[14px]">{showCode ? 'visibility' : 'code'}</span>
                                    {showCode ? 'Preview' : 'Edit Code'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Content area */}
                    <div className="flex-1 p-6 md:p-8 overflow-auto">

                        {/* Empty state */}
                        {isIdle && (
                            <div className="h-full flex flex-col items-center justify-center gap-6 text-center py-10 min-h-[380px]">
                                <div className="relative">
                                    <div className="absolute inset-0 " />
                                    <div className="relative w-28 h-28 bg-stone-50  flex items-center justify-center">
                                        <span className="material-icons-round text-plum-700 text-5xl">account_tree</span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-display-serif text-[22px] font-semibold text-stone-900 mb-2 tracking-tight">Sketch it out</h3>
                                    <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
                                        Choose a type, describe what you need, and hit <strong className="text-stone-600">Generate Diagram</strong>.
                                    </p>
                                </div>
                                <div className="flex flex-wrap justify-center gap-2 max-w-xs opacity-20 pointer-events-none select-none">
                                    {DIAGRAM_TYPES.map(t => (
                                        <span key={t.value} className="px-2.5 py-1 bg-stone-100  text-[10px] font-semibold text-stone-500">{t.label}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Generating state */}
                        {isGenerating && (
                            <div className="h-full flex flex-col items-center justify-center gap-4 min-h-[380px]">
                                <div className="w-16 h-16  bg-plum-50 flex items-center justify-center">
                                    <span className="material-icons-round text-plum-700 text-3xl animate-pulse">account_tree</span>
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-stone-700">Generating diagram…</p>
                                    <p className="text-sm text-stone-400 mt-1">Building Mermaid syntax and rendering</p>
                                </div>
                                <div className="flex gap-1.5">
                                    {[0, 1, 2].map(i => (
                                        <div key={i} className="w-2 h-2  bg-primary/60 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Code editor */}
                        {isDone && showCode && (
                            <textarea
                                value={editedCode}
                                onChange={e => setEditedCode(e.target.value)}
                                spellCheck={false}
                                rows={18}
                                className="w-full font-mono text-[12px] text-stone-700 leading-relaxed p-4 outline-none resize-y bg-stone-50  border border-stone-200 focus:ring-2 focus:ring-plum-600/20"
                            />
                        )}

                        {/* SVG preview */}
                        {isDone && !showCode && svg && (
                            <div className="flex justify-center overflow-x-auto [&_svg]:max-w-full [&_svg]:h-auto">
                                <div dangerouslySetInnerHTML={{ __html: svg }} />
                            </div>
                        )}

                        {/* Error state */}
                        {status === 'error' && (
                            <div className="flex items-start gap-2 bg-red-50 border border-red-100  px-4 py-3">
                                <span className="material-icons-round text-red-400 text-[18px] mt-0.5 shrink-0">error_outline</span>
                                <div>
                                    <p className="text-sm font-semibold text-red-700">Generation failed</p>
                                    <p className="text-[12px] text-red-500 mt-0.5">{errorMsg || 'Try rephrasing your description.'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
