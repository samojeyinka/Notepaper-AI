import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { Extension, Node, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import CharacterCount from '@tiptap/extension-character-count';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { scholarService } from '../../api/scholarService';
import ShakespeareModal from '../note/ShakespeareModal';
import ImageSearchModal from './ImageSearchModal';
import CoverPage from './CoverPage';
import CoverPageForm from './CoverPageForm';
import TocStyleForm from './TocStyleForm';
import { GeneratePresentationModal } from '../paper/GeneratePresentationModal';
import { ScholarPresentationsSidebar } from './ScholarPresentationsSidebar';

// ── Constants ─────────────────────────────────────────────────────────────────
const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];
const FONT_FAMILIES = [
    { label: 'Default',         value: null },
    { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
    { label: 'Arial',           value: 'Arial, Helvetica, sans-serif' },
    { label: 'Georgia',         value: 'Georgia, serif' },
    { label: 'Helvetica',       value: 'Helvetica, Arial, sans-serif' },
    { label: 'Courier New',     value: '"Courier New", Courier, monospace' },
    { label: 'Verdana',         value: 'Verdana, Geneva, sans-serif' },
];
const AUTO_SAVE_MS = 2000;

// ── Custom extension: FontSize ────────────────────────────────────────────────
const FontSize = Extension.create({
    name: 'fontSize',
    addGlobalAttributes() {
        return [{
            types: ['textStyle'],
            attributes: {
                fontSize: {
                    default: null,
                    parseHTML: el => el.style.fontSize || null,
                    renderHTML: attrs => attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
                },
            },
        }];
    },
    addCommands() {
        return {
            setFontSize:   size => ({ chain }) => chain().setMark('textStyle', { fontSize: `${size}pt` }).run(),
            unsetFontSize: ()   => ({ chain }) => chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
        };
    },
});

// ── Custom extension: LineHeight ──────────────────────────────────────────────
const LineHeight = Extension.create({
    name: 'lineHeight',
    addGlobalAttributes() {
        return [{
            types: ['paragraph', 'heading'],
            attributes: {
                lineHeight:  { default: null, parseHTML: el => el.style.lineHeight || null,   renderHTML: attrs => attrs.lineHeight  ? { style: `line-height: ${attrs.lineHeight}` }  : {} },
                spaceBefore: { default: null, parseHTML: el => el.style.marginTop || null,    renderHTML: attrs => attrs.spaceBefore ? { style: `margin-top: ${attrs.spaceBefore}` }   : {} },
                spaceAfter:  { default: null, parseHTML: el => el.style.marginBottom || null, renderHTML: attrs => attrs.spaceAfter  ? { style: `margin-bottom: ${attrs.spaceAfter}` } : {} },
            },
        }];
    },
    addCommands() {
        return {
            setLineHeight:     value => ({ commands }) =>
                commands.updateAttributes('paragraph', { lineHeight: value }) &&
                commands.updateAttributes('heading',   { lineHeight: value }),
            toggleSpaceBefore: () => ({ editor, commands }) =>
                commands.updateAttributes('paragraph', {
                    spaceBefore: editor.getAttributes('paragraph').spaceBefore ? null : '1em',
                }),
            toggleSpaceAfter:  () => ({ editor, commands }) =>
                commands.updateAttributes('paragraph', {
                    spaceAfter: editor.getAttributes('paragraph').spaceAfter ? null : '1em',
                }),
        };
    },
});

// ── Resizable image NodeView ──────────────────────────────────────────────────
function ResizableImageView({ node, updateAttributes, selected }) {
    const { src, alt, title, width } = node.attrs;
    const imgRef = useRef(null);
    const startX = useRef(0);
    const startW = useRef(0);
    const [hovered, setHovered] = useState(false);
    const showControls = selected || hovered;

    const onHandleMouseDown = (e) => {
        e.preventDefault(); e.stopPropagation();
        startX.current = e.clientX;
        startW.current = imgRef.current?.offsetWidth ?? 300;
        const onMove = ev => updateAttributes({ width: `${Math.max(80, startW.current + ev.clientX - startX.current)}px` });
        const onUp   = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    };

    return (
        <NodeViewWrapper
            as="span"
            style={{ position: 'relative', display: 'inline-block', verticalAlign: 'middle', maxWidth: '100%' }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <img
                ref={imgRef} src={src} alt={alt ?? ''} title={title ?? ''} draggable={false}
                style={{ width: width ?? 'auto', maxWidth: '100%', display: 'block' }}
                className={`rounded transition-all ${showControls ? 'ring-2 ring-primary ring-offset-2' : ''}`}
            />
            {showControls && (
                <>
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/50 text-white text-[10px] font-medium tabular-nums pointer-events-none select-none">
                        {imgRef.current ? `${imgRef.current.offsetWidth} × ${imgRef.current.offsetHeight}` : ''}
                    </div>
                    <div
                        onMouseDown={onHandleMouseDown}
                        className="absolute bottom-0 right-0 w-5 h-5 rounded-tl-md bg-primary cursor-se-resize flex items-center justify-center shadow"
                        title="Drag to resize"
                    >
                        <span className="material-icons-round text-white text-[11px]">open_in_full</span>
                    </div>
                </>
            )}
        </NodeViewWrapper>
    );
}

const ResizableImage = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: null,
                parseHTML: el => el.getAttribute('width') || null,
                renderHTML: attrs => attrs.width ? { width: attrs.width } : {},
            },
        };
    },
    addNodeView() { return ReactNodeViewRenderer(ResizableImageView); },
});

// ── Mermaid diagram extension ─────────────────────────────────────────────────
let _mermaidSeq = 0;
let _mermaidInstance = null;
// Registry: raw mermaid code → rendered SVG string (populated by MermaidNodeView)
const _mermaidSvgRegistry = new Map();

function sanitizeMermaid(code) {
    if (!code) return code;

    // When newlines collapse to spaces (AI JSON encoding), restore them.
    // 3+ consecutive spaces in a single-line diagram = a missing newline.
    // Single spaces inside labels are safe — they're never 3+ in a row.
    if (!code.includes('\n') && /\s{3,}/.test(code)) {
        code = code.replace(/\s{3,}/g, '\n    ');
    }

    // Auto-quote node labels that contain bare parentheses
    // e.g.  [Label (detail)]  →  ["Label (detail)"]
    code = code.replace(
        /\[([^[\]"\n][^[\]\n]*\([^)\n]*\)[^[\]\n]*)\]/g,
        '["$1"]'
    );

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
        // Use SVG <text> elements for labels instead of <foreignObject>.
        // <foreignObject> is invisible in DomPDF and unrenderable on canvas.
        flowchart: { htmlLabels: false },
    });
    return _mermaidInstance;
}

// Insert the SVG into the live DOM so the browser resolves CSS class rules and
// var(--…) custom properties, then inline every computed style and drop <style> blocks.
// Also converts <foreignObject> labels to SVG <text> elements — canvas and DomPDF
// cannot render foreignObject, but we can extract the text and position it correctly.
async function prepareExportSvg(svgString) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1000px;visibility:hidden;pointer-events:none;';
    wrap.innerHTML = svgString;
    document.body.appendChild(wrap);
    // Two frames: first for DOM layout, second for paint/computed-style resolution.
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    const svgEl = wrap.querySelector('svg');
    if (!svgEl) { document.body.removeChild(wrap); return svgString; }

    // Convert <foreignObject> to SVG <text> so canvas can render node labels.
    // Mermaid's foreignObject contains the node text; we extract it and place a
    // <text> at the centre of the foreignObject's bounding box.
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

    // Inline computed styles — canvas and DomPDF both need concrete values, not
    // CSS class lookups or var(--…) custom properties.
    const PROPS = [
        'fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin',
        'font-family', 'font-size', 'font-weight', 'font-style', 'opacity',
    ];
    [svgEl, ...svgEl.querySelectorAll('*')].forEach(el => {
        if (el.tagName.toLowerCase() === 'style') return;
        try {
            const cs = window.getComputedStyle(el);
            const isTextNode = /^(text|tspan)$/i.test(el.tagName);
            const parts = [];
            for (const prop of PROPS) {
                const val = cs.getPropertyValue(prop);
                if (!val || val === '' || val === 'initial' || val === 'unset') continue;
                // Never make text/tspan invisible — if CSS says fill:none, skip it so
                // the SVG default (black) is used and text stays readable.
                if (prop === 'fill' && val === 'none' && isTextNode) continue;
                parts.push(`${prop}:${val}`);
            }
            if (parts.length) el.setAttribute('style', parts.join(';'));
        } catch { /* non-styleable nodes (defs, marker, etc.) */ }
    });

    svgEl.querySelectorAll('style').forEach(s => s.remove());

    // Trim the SVG viewBox to the actual content bounding box so whitespace
    // padding added by Mermaid is removed. Without this, diagrams render
    // shifted inside an oversized white canvas in the exported PNG.
    try {
        const bbox = svgEl.getBBox();
        const { x, y, width, height } = bbox;
        if (width > 0 && height > 0 && isFinite(x) && isFinite(y) && isFinite(width) && isFinite(height)) {
            const pad = 16;
            svgEl.setAttribute('viewBox', `${x - pad} ${y - pad} ${width + pad * 2} ${height + pad * 2}`);
            svgEl.setAttribute('width',   String(Math.ceil(width  + pad * 2)));
            svgEl.setAttribute('height',  String(Math.ceil(height + pad * 2)));
        }
    } catch { /* getBBox unavailable (e.g. offscreen or cross-origin) */ }

    // XMLSerializer always emits proper xmlns declarations so the SVG is valid
    // as a standalone document when loaded via a blob URL for canvas rendering.
    // outerHTML in an HTML context may omit xmlns, causing img.onerror to fire.
    const result = new XMLSerializer().serializeToString(svgEl);
    document.body.removeChild(wrap);
    return result;
}

// Render a prepared SVG string to a PNG data URL via canvas.
// Uses a blob URL (no size limits, no encoding overhead).
// Scales wide diagrams (e.g. sequence diagrams) down to maxWidth so they fit the PDF page.
async function svgStringToPng(svgString, maxWidth = 1400) {
    return new Promise(resolve => {
        try {
            const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const url  = URL.createObjectURL(blob);
            const img  = new Image();
            img.onload = () => {
                let w = img.naturalWidth  || 900;
                let h = img.naturalHeight || 450;
                if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
                const scale = 2; // 2× for crisp text in PDF
                const canvas = document.createElement('canvas');
                canvas.width  = w * scale;
                canvas.height = h * scale;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.scale(scale, scale);
                ctx.drawImage(img, 0, 0, w, h);
                URL.revokeObjectURL(url);
                try { resolve(canvas.toDataURL('image/png')); } catch { resolve(null); }
            };
            img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
            img.src = url;
        } catch { resolve(null); }
    });
}

async function collectMermaidDiagrams() {
    const entries = Array.from(_mermaidSvgRegistry.entries()).filter(([, s]) => s);
    return Promise.all(
        entries.map(async ([code, svg]) => {
            const prepared = await prepareExportSvg(svg);
            const png = await svgStringToPng(prepared);
            // Always include svg so the backend has a fallback if canvas failed
            return { code, svg: prepared, png };
        })
    );
}

function MermaidNodeView({ node, updateAttributes, selected }) {
    const [svg,     setSvg]     = useState('');
    const [errMsg,  setErrMsg]  = useState('');
    const [editing, setEditing] = useState(!node.attrs.code?.trim());
    const [hovered, setHovered] = useState(false);
    const svgId       = useRef(`mmd-${++_mermaidSeq}`);
    const containerRef = useRef(null);
    const startX      = useRef(0);
    const startW      = useRef(0);

    const showControls = selected || hovered;

    useEffect(() => {
        const code = node.attrs.code?.trim();
        if (!code) { setSvg(''); return; }
        let cancelled = false;
        document.getElementById(svgId.current)?.remove();
        getMermaid()
            .then(m => m.render(svgId.current, sanitizeMermaid(code)))
            .then(({ svg: s }) => { if (!cancelled) { setSvg(s); setErrMsg(''); _mermaidSvgRegistry.set(code, s); } })
            .catch(err => {
                console.error('[Mermaid]', err, '\nCode:\n', code);
                if (!cancelled) { setSvg(''); setErrMsg('Diagram syntax error — click Edit to fix'); }
            });
        return () => {
            cancelled = true;
            document.getElementById(svgId.current)?.remove();
        };
    }, [node.attrs.code]);

    const onHandleMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        startX.current = e.clientX;
        startW.current = containerRef.current?.offsetWidth ?? 600;
        const onMove = ev => updateAttributes({ width: `${Math.max(240, startW.current + ev.clientX - startX.current)}px` });
        const onUp   = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    };

    return (
        <NodeViewWrapper contentEditable={false}>
            <div
                ref={containerRef}
                style={{ width: node.attrs.width ?? '100%', maxWidth: '100%' }}
                className={`relative my-4 rounded-xl border-2 bg-white transition-colors overflow-hidden ${showControls ? 'border-primary/50' : 'border-slate-100'}`}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-b border-slate-100">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <span className="material-icons-round text-[13px]">account_tree</span>
                        Diagram
                    </span>
                    <button
                        onMouseDown={e => { e.preventDefault(); setEditing(v => !v); }}
                        className="text-[11px] font-semibold text-slate-400 hover:text-primary transition-colors"
                    >
                        {editing ? 'Preview' : 'Edit code'}
                    </button>
                </div>

                {/* Editor pane */}
                {editing && (
                    <textarea
                        value={node.attrs.code}
                        onChange={e => updateAttributes({ code: e.target.value })}
                        spellCheck={false}
                        rows={8}
                        placeholder={'flowchart TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Result A]\n    B -->|No| D[Result B]'}
                        className="w-full font-mono text-[12px] text-slate-700 leading-relaxed p-3 outline-none resize-y bg-white border-b border-slate-100"
                    />
                )}

                {/* Preview pane — [&_svg]:w-full scales the SVG to fill the container */}
                {!editing && (
                    <div
                        className="p-4 flex justify-center overflow-x-auto cursor-pointer min-h-[80px] [&_svg]:max-w-full [&_svg]:h-auto"
                        onClick={() => setEditing(true)}
                        title="Click to edit"
                        dangerouslySetInnerHTML={{
                            __html: svg
                                || (errMsg ? `<p style="color:#f87171;font-size:0.8rem;text-align:center;padding:1rem">${errMsg}</p>`
                                           : '<p style="color:#cbd5e1;font-size:0.8rem;text-align:center;padding:1rem">Rendering…</p>'),
                        }}
                    />
                )}

                {/* Resize handle — same style as images */}
                {showControls && !editing && (
                    <div
                        onMouseDown={onHandleMouseDown}
                        className="absolute bottom-0 right-0 w-5 h-5 rounded-tl-md bg-primary cursor-se-resize flex items-center justify-center shadow"
                        title="Drag to resize"
                    >
                        <span className="material-icons-round text-white text-[11px]">open_in_full</span>
                    </div>
                )}
            </div>
        </NodeViewWrapper>
    );
}

const MermaidBlock = Node.create({
    name: 'mermaidBlock',
    group: 'block',
    atom: true,
    draggable: true,
    selectable: true,

    addAttributes() {
        return {
            code: {
                default: '',
                parseHTML: el => el.getAttribute('data-code') ?? el.textContent?.trim() ?? '',
                renderHTML: attrs => ({ 'data-code': attrs.code }),
            },
            width: {
                default: null,
                parseHTML: el => el.getAttribute('data-width') || null,
                renderHTML: attrs => attrs.width ? { 'data-width': attrs.width } : {},
            },
        };
    },

    parseHTML() {
        return [{ tag: 'div.mermaid' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes({ class: 'mermaid' }, HTMLAttributes)];
    },

    addNodeView() {
        return ReactNodeViewRenderer(MermaidNodeView);
    },
});

// ── Toolbar primitives ────────────────────────────────────────────────────────
function Divider() {
    return <span className="w-px h-4 bg-slate-200 mx-0.5 shrink-0 self-center" />;
}

function ToolBtn({ onClick, active, disabled, title, children }) {
    return (
        <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); if (!disabled) onClick?.(); }}
            disabled={disabled}
            title={title}
            className={`flex items-center justify-center w-6 h-6 rounded text-[13px] transition-colors shrink-0 ${
                active ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            } disabled:opacity-30 disabled:cursor-not-allowed`}
        >
            {children}
        </button>
    );
}

function DropdownMenu({ trigger, children, minW = 'min-w-[160px]', alignRight = false, panelClass = 'max-h-64 overflow-y-auto' }) {
    const [open, setOpen] = useState(false);
    const ref  = useRef(null);
    const close = useCallback(() => setOpen(false), []);

    useEffect(() => {
        if (!open) return;
        const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [open]);

    return (
        <div ref={ref} className="relative shrink-0">
            <div onMouseDown={(e) => { e.preventDefault(); setOpen(v => !v); }}>{trigger}</div>
            {open && (
                <div className={`absolute ${alignRight ? 'right-0' : 'left-0'} top-full mt-0.5 z-50 bg-white rounded-lg shadow-xl border border-slate-200 py-1 ${minW} ${panelClass}`}>
                    {typeof children === 'function' ? children(close) : children}
                </div>
            )}
        </div>
    );
}

function MenuItem({ onSelect, active, icon, children, separator }) {
    if (separator) return <div className="my-1 border-t border-slate-100" />;
    return (
        <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onSelect?.(); }}
            className={`w-full text-left flex items-center gap-2 px-3 py-1.5 text-[12px] hover:bg-slate-50 transition-colors ${active ? 'text-primary font-semibold' : 'text-slate-700'}`}
        >
            <span className="w-3 shrink-0 flex items-center justify-center">
                {active && <span className="material-icons-round text-[12px]">check</span>}
            </span>
            {icon && <span className="material-icons-round text-[14px] text-slate-400 shrink-0">{icon}</span>}
            {children}
        </button>
    );
}

// ── Global toolbar dropdown ───────────────────────────────────────────────────
function GlobalDropdown({ label, icon, children, panelClass = '' }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [open]);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(o => !o)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors whitespace-nowrap ${
                    open ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
            >
                <span className="material-icons-round text-[14px]">{icon}</span>
                {label}
                <span className="material-icons-round text-[12px] text-slate-400">expand_more</span>
            </button>
            {open && (
                <div
                    className={`absolute top-full left-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-50 ${panelClass}`}
                    onMouseDown={e => e.stopPropagation()}
                >
                    {children}
                </div>
            )}
        </div>
    );
}

function GDItem({ active, onClick, children }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left transition-colors ${
                active ? 'bg-primary/8 text-primary font-semibold' : 'text-slate-700 hover:bg-slate-50'
            }`}
        >
            <span className={`material-icons-round text-[13px] ${active ? 'opacity-100' : 'opacity-0'}`}>check</span>
            {children}
        </button>
    );
}

// ── Table grid picker ─────────────────────────────────────────────────────────
function TableGridPicker({ editor, close }) {
    const [hovCol, setHovCol] = useState(0);
    const [hovRow, setHovRow] = useState(0);
    const CELL = 16, MAX = 20;
    const visCols = Math.min(MAX, Math.max(10, hovCol + 1));
    const visRows = Math.min(MAX, Math.max(10, hovRow + 1));

    return (
        <div className="px-2 py-1.5" onMouseLeave={() => { setHovCol(0); setHovRow(0); }}>
            <div className="flex items-center gap-2 mb-1 text-[12px] text-slate-500 pointer-events-none select-none">
                <span className="material-icons-round text-[14px] text-slate-400">table_chart</span>
                Table
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${visCols}, ${CELL}px)`, lineHeight: 0 }}>
                {Array.from({ length: visRows * visCols }, (_, i) => {
                    const r = Math.floor(i / visCols), c = i % visCols;
                    return (
                        <div
                            key={`${r}-${c}`}
                            style={{ width: CELL, height: CELL, border: '1px solid #000', borderRadius: 2, backgroundColor: r < hovRow && c < hovCol ? '#1a73e8' : '#fff', boxSizing: 'border-box' }}
                            onMouseEnter={() => { setHovCol(c + 1); setHovRow(r + 1); }}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                if (hovCol > 0 && hovRow > 0) {
                                    editor?.chain().focus().insertTable({ rows: hovRow, cols: hovCol, withHeaderRow: true }).run();
                                    close();
                                }
                            }}
                        />
                    );
                })}
            </div>
            <div className="mt-1 text-center text-[11px] text-slate-500 select-none">
                {hovCol > 0 && hovRow > 0 ? `${hovCol} × ${hovRow}` : 'Insert table'}
            </div>
        </div>
    );
}

// ── Font size control ─────────────────────────────────────────────────────────
function FontSizeControl({ editor }) {
    const rawSize   = editor?.getAttributes('textStyle')?.fontSize;
    const currentPt = rawSize ? parseInt(rawSize) : null;
    const [val, setVal]   = useState('');
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => { setVal(currentPt != null ? String(currentPt) : ''); }, [currentPt]);
    useEffect(() => {
        if (!open) return;
        const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [open]);

    const apply = (n) => {
        const num = parseInt(n);
        if (num > 0) editor?.chain().focus().setFontSize(num).run();
        else         editor?.chain().focus().unsetFontSize().run();
    };

    return (
        <div ref={ref} className="relative flex items-stretch shrink-0">
            <input
                value={val}
                onChange={e => setVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { apply(val); setOpen(false); } if (e.key === 'Escape') setOpen(false); }}
                onBlur={() => apply(val)}
                onFocus={e => e.stopPropagation()}
                placeholder="—"
                className="w-9 text-center text-[11px] border border-slate-200 rounded-l py-0.5 bg-white text-slate-700 outline-none focus:border-primary"
            />
            <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); setOpen(v => !v); }}
                className="px-0.5 border border-l-0 border-slate-200 rounded-r text-slate-400 hover:bg-slate-50 flex items-center"
            >
                <span className="material-icons-round text-[13px]">expand_more</span>
            </button>
            {open && (
                <div className="absolute top-full left-0 mt-0.5 z-50 bg-white rounded-lg shadow-xl border border-slate-200 py-1 min-w-[56px] max-h-52 overflow-y-auto">
                    {FONT_SIZES.map(s => (
                        <button
                            key={s}
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); apply(s); setVal(String(s)); setOpen(false); }}
                            className={`w-full text-center px-2 py-1 text-[12px] hover:bg-slate-50 ${currentPt === s ? 'text-primary font-semibold' : 'text-slate-700'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}



// ── Shakespeare helper ────────────────────────────────────────────────────────
function shakespeareToHtml(text) {
    return text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean).map(p => {
        const html = p
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
        return `<p>${html}</p>`;
    }).join('');
}

// Resolve figure tags before TipTap parses (TipTap strips unsupported <figure> elements)
function resolveImagesForEditor(html) {
    if (!html) return '';
    return html
        // Numbered, captioned images → <img> + figure-caption paragraph
        .replace(
            /<figure\b[^>]*class="scholar-generated-image"[^>]*data-src="([^"]+)"[^>]*data-figure-num="(\d+)"[^>]*data-caption="([^"]*)"[^>]*>.*?<\/figure>/gi,
            (_, src, num, caption) =>
                `<img src="${src}" alt="${caption}" />` +
                `<p style="text-align:center;font-size:0.8rem;color:#64748b;font-style:italic;margin-top:0.25rem;margin-bottom:0.75rem;">Figure ${num}${caption ? ': ' + caption : ''}</p>`
        )
        // Fetched images without a figure number yet (fallback — still loading or older doc)
        .replace(
            /<figure\b[^>]*class="scholar-generated-image"[^>]*data-src="([^"]+)"(?:[^>]*data-alt="([^"]*)")?[^>]*>.*?<\/figure>/gi,
            (_, src, alt = '') => `<img src="${src}" alt="${alt}" />`
        )
        // Unfetched placeholders → visible styled block with keywords
        .replace(
            /<figure\b[^>]*class="image-placeholder"[^>]*data-keywords="([^"]+)"[^>]*(?:>\s*<\/figure>|\/?>)/gi,
            (_, keywords) => `<p style="border:2px dashed #c4b5fd;border-radius:0.5rem;padding:0.75rem 1.25rem;background:#faf5ff;color:#7c3aed;font-size:0.875rem;font-style:italic;text-align:center;">[ Suggested image: ${keywords} ]</p>`
        );
}

// ── Block style options ───────────────────────────────────────────────────────
const BLOCK_STYLES = [
    { label: 'Normal text', check: ed => ed.isActive('paragraph') && !ed.isActive('heading'), run: ed => ed.chain().focus().setParagraph().run() },
    { label: 'Heading 2',   check: ed => ed.isActive('heading', { level: 2 }), run: ed => ed.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: 'Heading 3',   check: ed => ed.isActive('heading', { level: 3 }), run: ed => ed.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: 'Heading 4',   check: ed => ed.isActive('heading', { level: 4 }), run: ed => ed.chain().focus().toggleHeading({ level: 4 }).run() },
];

// ── Document editor ───────────────────────────────────────────────────────────
export default function DocumentEditor({ doc, onExport, onCoverSaved, onTocStyleSaved }) {
    const navigate = useNavigate();

    // ── Formatting overrides ──────────────────────────────────────────────────
    const [docFontFamily,  setDocFontFamily]  = useState(null);
    const [docLineHeight,  setDocLineHeight]  = useState('1.5');
    const [docSpaceBefore, setDocSpaceBefore] = useState(false);
    const [docSpaceAfter,  setDocSpaceAfter]  = useState(false);
    const [marginTop,    setMarginTop]    = useState(24);
    const [marginRight,  setMarginRight]  = useState(24);
    const [marginBottom, setMarginBottom] = useState(24);
    const [marginLeft,   setMarginLeft]   = useState(24);
    const fontLabel = FONT_FAMILIES.find(f => f.value === docFontFamily)?.label ?? 'Default';

    // ── Modals ────────────────────────────────────────────────────────────────
    const [showCoverForm,            setShowCoverForm]            = useState(!doc.meta?.cover?.layout);
    const [showTocStyleForm,         setShowTocStyleForm]         = useState(false);
    const [showPresentationModal,    setShowPresentationModal]    = useState(false);
    const [showPresentationsSidebar, setShowPresentationsSidebar] = useState(false);
    const [shakespeareOpen,          setShakespeareOpen]          = useState(false);
    const [imageAiOpen,              setImageAiOpen]              = useState(false);
    const [isUploading,              setIsUploading]              = useState(false);

    // ── Save state ────────────────────────────────────────────────────────────
    const [saveStatus,  setSaveStatus]  = useState('idle');
    const autoSaveTimer = useRef(null);
    const fileInputRef  = useRef(null);

    // ── Initial content ───────────────────────────────────────────────────────
    const initialContent = resolveImagesForEditor(
        doc.body ||
        (doc.pages || [])
            .slice()
            .sort((a, b) => a.page_number - b.page_number)
            .map(p => p.content || '')
            .filter(Boolean)
            .join('\n')
    );

    // ── Auto-save ─────────────────────────────────────────────────────────────
    const doSave = useCallback(async (html) => {
        setSaveStatus('saving');
        try {
            await scholarService.updateBody(doc.id, html);
            setSaveStatus('saved');
        } catch {
            setSaveStatus('error');
        }
    }, [doc.id]);

    const scheduleAutoSave = useCallback((html) => {
        clearTimeout(autoSaveTimer.current);
        setSaveStatus('unsaved');
        autoSaveTimer.current = setTimeout(() => doSave(html), AUTO_SAVE_MS);
    }, [doSave]);

    useEffect(() => () => clearTimeout(autoSaveTimer.current), []);

    // ── Editor ────────────────────────────────────────────────────────────────
    const editor = useEditor({
        extensions: [
            StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
            Underline, TextStyle, FontFamily, FontSize, LineHeight,
            TextAlign.configure({ types: ['heading', 'paragraph', 'image'] }),
            Link.configure({ openOnClick: false }),
            ResizableImage.configure({ inline: true }),
            Table.configure({ resizable: false }),
            TableRow, TableCell, TableHeader,
            CharacterCount,
            MermaidBlock,
        ],
        content: initialContent,
        onUpdate: ({ editor: ed }) => scheduleAutoSave(ed.getHTML()),
        editorProps: {
            attributes: { class: 'scholar-doc scholar-editor-content focus:outline-none' },
        },
    });

    // ── Toolbar state ─────────────────────────────────────────────────────────
    const currentBlock      = BLOCK_STYLES.find(b => editor && b.check(editor))?.label ?? 'Normal text';
    const currentFontFamily = editor?.getAttributes('textStyle')?.fontFamily ?? null;
    const currentFontLabel  = FONT_FAMILIES.find(f => f.value === currentFontFamily)?.label ?? 'Default';
    const currentAlign      = ['left', 'center', 'right', 'justify'].find(a => editor?.isActive({ textAlign: a })) ?? 'left';
    const alignIcons        = { left: 'format_align_left', center: 'format_align_center', right: 'format_align_right', justify: 'format_align_justify' };

    const triggerBtn = (label, icon, title, active = false) => (
        <button
            type="button"
            title={title}
            className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] transition-colors shrink-0 ${
                active ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'
            }`}
        >
            {label && <span className="truncate max-w-[80px]">{label}</span>}
            {icon  && <span className="material-icons-round text-[14px]">{icon}</span>}
            <span className="material-icons-round text-[12px] text-slate-400">expand_more</span>
        </button>
    );

    const insertLink = () => {
        const prev = editor?.getAttributes('link').href ?? '';
        const url  = window.prompt('Link URL:', prev);
        if (url === null) return;
        url === '' ? editor?.chain().focus().unsetLink().run()
                   : editor?.chain().focus().setLink({ href: url }).run();
    };

    const handleImageFile = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        setIsUploading(true);
        try {
            const data = new FormData();
            data.append('file', file);
            data.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
            data.append('cloud_name',    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
            const res  = await fetch(
                `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
                { method: 'POST', body: data }
            );
            const json = await res.json();
            if (json.secure_url) editor?.chain().focus().setImage({ src: json.secure_url }).run();
        } catch (err) { console.error('[ImageUpload]', err); }
        finally       { setIsUploading(false); }
    };

    const exportFormatting = {
        line_height:   docLineHeight,
        space_before:  docSpaceBefore ? '1' : '0',
        space_after:   docSpaceAfter  ? '1' : '0',
        margin_top:    marginTop,
        margin_right:  marginRight,
        margin_bottom: marginBottom,
        margin_left:   marginLeft,
        font_family:   docFontFamily || '',
    };

    // ── Save badge ────────────────────────────────────────────────────────────
    const SaveBadge = () => {
        if (saveStatus === 'idle') return null;
        const cfg = {
            unsaved: { icon: 'edit',          cls: 'text-slate-400',   label: 'Unsaved'     },
            saving:  { icon: 'autorenew',     cls: 'text-primary',     label: 'Saving…'     },
            saved:   { icon: 'check_circle',  cls: 'text-emerald-500', label: 'Saved'       },
            error:   { icon: 'error_outline', cls: 'text-red-500',     label: 'Save failed' },
        }[saveStatus];
        return (
            <span className={`flex items-center gap-1 text-[11px] font-medium ${cfg.cls}`}>
                <span className={`material-icons-round text-[13px] ${saveStatus === 'saving' ? 'animate-spin' : ''}`}>{cfg.icon}</span>
                <span className="hidden sm:inline">{cfg.label}</span>
            </span>
        );
    };

    return (
        <>
            {/* Global formatting preview */}
            <style>{`
                .scholar-doc p, .scholar-doc li,
                .scholar-editor-content p, .scholar-editor-content li {
                    line-height: ${docLineHeight} !important;
                    ${docSpaceBefore ? 'margin-top: 1em !important;' : ''}
                    ${docSpaceAfter  ? 'margin-bottom: 1em !important;' : ''}
                }
                ${docFontFamily ? `.scholar-doc, .scholar-doc *,
                .scholar-editor-content, .scholar-editor-content * { font-family: ${docFontFamily} !important; }` : ''}
            `}</style>

            {/* Modals */}
            {showCoverForm && (
                <CoverPageForm doc={doc} onSaved={(cover) => { setShowCoverForm(false); onCoverSaved(cover); }} onClose={() => setShowCoverForm(false)} />
            )}
            {showTocStyleForm && (
                <TocStyleForm doc={doc} onSaved={(style) => { setShowTocStyleForm(false); onTocStyleSaved(style); }} onClose={() => setShowTocStyleForm(false)} />
            )}
            {showPresentationModal && (
                <GeneratePresentationModal
                    onClose={() => setShowPresentationModal(false)}
                    paperId={null}
                    scholarDocumentId={doc.id}
                    paperTitle={doc.title}
                    pages={(doc.pages || []).map(pg => pg.content || '')}
                    onGenerated={(saved) => { setShowPresentationModal(false); if (saved?.id) navigate(`/lockedin/presentations/${saved.id}`); }}
                />
            )}
            {shakespeareOpen && (
                <ShakespeareModal
                    onClose={() => { setShakespeareOpen(false); editor?.commands.focus(); }}
                    onInsert={(text) => { setShakespeareOpen(false); editor?.chain().focus().insertContent(shakespeareToHtml(text)).run(); }}
                />
            )}
            {imageAiOpen && (
                <ImageSearchModal
                    onClose={() => { setImageAiOpen(false); editor?.commands.focus(); }}
                    onInsert={(url) => { setImageAiOpen(false); editor?.chain().focus().setImage({ src: url }).run(); }}
                />
            )}

            <div className="flex items-start gap-0">
                <div className="flex-1 min-w-0">

                    {/* ── Sticky top bar ─────────────────────────────────────── */}
                    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-0 py-2 mb-6 flex flex-wrap items-center gap-x-2 gap-y-1.5">

                        <div className="shrink-0 min-w-0">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Scholar</p>
                            <p className="text-[13px] font-semibold text-slate-800 leading-snug truncate max-w-[120px] sm:max-w-[200px]">{doc.title}</p>
                        </div>

                        <div className="w-px h-6 bg-slate-200 shrink-0 hidden md:block" />

                        {/* Formatting menus — full-width scrollable row on mobile, inline on md+ */}
                        <div className="flex items-center gap-0.5 md:flex-1 w-full md:w-auto order-last md:order-none overflow-x-auto pb-0.5">
                            <GlobalDropdown label={fontLabel} icon="text_fields" panelClass="min-w-[180px]">
                                {FONT_FAMILIES.map(f => (
                                    <GDItem key={f.label} active={docFontFamily === f.value} onClick={() => setDocFontFamily(f.value)}>
                                        <span style={{ fontFamily: f.value ?? 'inherit' }}>{f.label}</span>
                                    </GDItem>
                                ))}
                            </GlobalDropdown>

                            <GlobalDropdown label="Spacing" icon="format_line_spacing" panelClass="min-w-[210px]">
                                <div className="py-1.5">
                                    <p className="px-3 pt-1 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Line height</p>
                                    {[{ label: 'Single', value: '1' }, { label: '1.15', value: '1.15' }, { label: '1.5', value: '1.5' }, { label: 'Double', value: '2' }].map(s => (
                                        <GDItem key={s.value} active={docLineHeight === s.value} onClick={() => setDocLineHeight(s.value)}>{s.label}</GDItem>
                                    ))}
                                    <div className="border-t border-slate-100 my-1.5" />
                                    <p className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paragraph spacing</p>
                                    {[
                                        { label: 'Space before paragraph', val: docSpaceBefore, toggle: () => setDocSpaceBefore(v => !v) },
                                        { label: 'Space after paragraph',  val: docSpaceAfter,  toggle: () => setDocSpaceAfter(v => !v)  },
                                    ].map(({ label, val, toggle }) => (
                                        <button key={label} onClick={toggle} className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-slate-700 hover:bg-slate-50 transition-colors text-left">
                                            <span className={`material-icons-round text-[15px] ${val ? 'text-primary' : 'text-slate-300'}`}>
                                                {val ? 'check_box' : 'check_box_outline_blank'}
                                            </span>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </GlobalDropdown>

                            <GlobalDropdown label="Margins" icon="border_outer" panelClass="min-w-[200px]">
                                <div className="p-3">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Page margins (px)</p>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                        {[
                                            { label: 'Top',    val: marginTop,    fn: setMarginTop    },
                                            { label: 'Right',  val: marginRight,  fn: setMarginRight  },
                                            { label: 'Bottom', val: marginBottom, fn: setMarginBottom },
                                            { label: 'Left',   val: marginLeft,   fn: setMarginLeft   },
                                        ].map(({ label, val, fn }) => (
                                            <div key={label} className="flex flex-col gap-1">
                                                <span className="text-[10px] font-semibold text-slate-500">{label}</span>
                                                <input type="number" value={val} onChange={e => fn(Math.max(0, Number(e.target.value)))} min="0" step="4"
                                                    className="w-full text-center text-[12px] text-slate-700 border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-primary/50" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </GlobalDropdown>
                        </div>

                        <div className="w-px h-6 bg-slate-200 shrink-0 hidden md:block" />

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0 ml-auto md:ml-0">
                            <SaveBadge />
                            <button onClick={() => setShowCoverForm(true)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                                <span className="material-icons-round text-[14px]">auto_stories</span>
                                <span className="hidden md:inline">Cover</span>
                            </button>
                            <button
                                onClick={() => setShowPresentationsSidebar(v => !v)}
                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all ${showPresentationsSidebar ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                <span className="material-icons-round text-[14px]">slideshow</span>
                                <span className="hidden md:inline">Slides</span>
                            </button>
                            {['pdf', 'docx'].map(fmt => (
                                <button key={fmt} onClick={() => collectMermaidDiagrams().then(diagrams => onExport(fmt, exportFormatting, diagrams))}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-[12px] font-semibold hover:bg-primary/90 transition-all active:scale-95">
                                    <span className="material-icons-round text-[14px]">download</span>
                                    {fmt.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Cover */}
                    <div className="relative group">
                        <CoverPage cover={doc.meta?.cover} doc={doc} />
                        <button
                            onClick={() => setShowCoverForm(true)}
                            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white shadow-sm border border-slate-200 text-[11px] font-semibold text-slate-500 hover:text-primary hover:border-primary/40 transition-all"
                        >
                            <span className="material-icons-round text-[13px]">edit</span>
                            {doc.meta?.cover?.layout ? 'Edit Cover' : 'Customize Cover'}
                        </button>
                    </div>

                    {/* ── Editor ───────────────────────────────────────────── */}
                    <div className="mt-8 rounded-xl shadow-sm border border-primary/20 bg-white overflow-hidden">

                        {/* Toolbar */}
                        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-slate-50 border-b border-slate-200 sticky top-[4px] z-[9]">

                            <ToolBtn onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()} title="Undo">
                                <span className="material-icons-round text-[15px]">undo</span>
                            </ToolBtn>
                            <ToolBtn onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()} title="Redo">
                                <span className="material-icons-round text-[15px]">redo</span>
                            </ToolBtn>

                            <Divider />

                            <DropdownMenu trigger={triggerBtn(currentBlock, null, 'Paragraph style')} minW="min-w-[148px]">
                                {(close) => BLOCK_STYLES.map(b => (
                                    <MenuItem key={b.label} active={editor && b.check(editor)} onSelect={() => { b.run(editor); close(); }}>
                                        {b.label}
                                    </MenuItem>
                                ))}
                            </DropdownMenu>

                            <Divider />

                            <DropdownMenu trigger={triggerBtn(currentFontLabel, null, 'Font family')} minW="min-w-[180px]">
                                {(close) => FONT_FAMILIES.map(f => (
                                    <MenuItem key={f.label} active={currentFontFamily === f.value}
                                        onSelect={() => { f.value ? editor?.chain().focus().setFontFamily(f.value).run() : editor?.chain().focus().unsetFontFamily().run(); close(); }}>
                                        <span style={{ fontFamily: f.value ?? 'inherit' }}>{f.label}</span>
                                    </MenuItem>
                                ))}
                            </DropdownMenu>

                            <FontSizeControl editor={editor} />

                            <Divider />

                            <ToolBtn onClick={() => editor?.chain().focus().toggleBold().run()}      active={editor?.isActive('bold')}      title="Bold"><span className="material-icons-round text-[15px]">format_bold</span></ToolBtn>
                            <ToolBtn onClick={() => editor?.chain().focus().toggleItalic().run()}    active={editor?.isActive('italic')}    title="Italic"><span className="material-icons-round text-[15px]">format_italic</span></ToolBtn>
                            <ToolBtn onClick={() => editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive('underline')} title="Underline"><span className="material-icons-round text-[15px]">format_underlined</span></ToolBtn>
                            <ToolBtn onClick={() => editor?.chain().focus().toggleStrike().run()}    active={editor?.isActive('strike')}    title="Strikethrough"><span className="material-icons-round text-[15px]">strikethrough_s</span></ToolBtn>

                            <Divider />

                            <DropdownMenu trigger={triggerBtn(null, alignIcons[currentAlign], 'Alignment')} minW="min-w-[140px]">
                                {(close) => [
                                    { label: 'Left',    align: 'left',    icon: 'format_align_left'    },
                                    { label: 'Center',  align: 'center',  icon: 'format_align_center'  },
                                    { label: 'Right',   align: 'right',   icon: 'format_align_right'   },
                                    { label: 'Justify', align: 'justify', icon: 'format_align_justify' },
                                ].map(a => (
                                    <MenuItem key={a.align} active={currentAlign === a.align} icon={a.icon} onSelect={() => { editor?.chain().focus().setTextAlign(a.align).run(); close(); }}>{a.label}</MenuItem>
                                ))}
                            </DropdownMenu>

                            <Divider />

                            <ToolBtn onClick={() => editor?.chain().focus().toggleBulletList().run()}  active={editor?.isActive('bulletList')}  title="Bullet list"><span className="material-icons-round text-[15px]">format_list_bulleted</span></ToolBtn>
                            <ToolBtn onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')} title="Numbered list"><span className="material-icons-round text-[15px]">format_list_numbered</span></ToolBtn>

                            <Divider />

                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
                            <DropdownMenu trigger={triggerBtn(null, 'add', 'Insert')} minW="min-w-[160px]" panelClass="overflow-y-auto">
                                {(close) => (
                                    <>
                                        <MenuItem icon="link"     active={editor?.isActive('link')} onSelect={() => { insertLink(); close(); }}>Link</MenuItem>
                                        <MenuItem icon="link_off" onSelect={() => { editor?.chain().focus().unsetLink().run(); close(); }}>Remove link</MenuItem>
                                        <MenuItem separator />
                                        <MenuItem icon={isUploading ? 'hourglass_top' : 'image'} onSelect={() => { fileInputRef.current?.click(); close(); }}>{isUploading ? 'Uploading…' : 'Upload image'}</MenuItem>
                                        <MenuItem icon="image_search" onSelect={() => { setImageAiOpen(true); close(); }}>Search Images</MenuItem>
                                        <TableGridPicker editor={editor} close={close} />
                                        <MenuItem separator />
                                        <MenuItem icon="format_quote"             active={editor?.isActive('blockquote')} onSelect={() => { editor?.chain().focus().toggleBlockquote().run(); close(); }}>Blockquote</MenuItem>
                                        <MenuItem icon="integration_instructions" active={editor?.isActive('codeBlock')}  onSelect={() => { editor?.chain().focus().toggleCodeBlock().run(); close(); }}>Code block</MenuItem>
                                        <MenuItem icon="code"                     active={editor?.isActive('code')}       onSelect={() => { editor?.chain().focus().toggleCode().run(); close(); }}>Inline code</MenuItem>
                                        <MenuItem icon="horizontal_rule" onSelect={() => { editor?.chain().focus().setHorizontalRule().run(); close(); }}>Divider</MenuItem>
                                        <MenuItem separator />
                                        <MenuItem icon="account_tree" onSelect={() => {
                                            editor?.chain().focus().insertContent({
                                                type: 'mermaidBlock',
                                                attrs: { code: 'flowchart TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Result A]\n    B -->|No| D[Result B]' },
                                            }).run();
                                            close();
                                        }}>Diagram (Mermaid)</MenuItem>
                                    </>
                                )}
                            </DropdownMenu>

                            {editor?.isActive('table') && (
                                <>
                                    <Divider />
                                    <ToolBtn onClick={() => editor?.chain().focus().addColumnAfter().run()} title="Add column"><span className="material-icons-round text-[15px]">view_column</span></ToolBtn>
                                    <ToolBtn onClick={() => editor?.chain().focus().addRowAfter().run()} title="Add row"><span className="material-icons-round text-[15px]">table_rows</span></ToolBtn>
                                    <ToolBtn onClick={() => editor?.chain().focus().deleteTable().run()} title="Delete table"><span className="material-icons-round text-[15px]">delete</span></ToolBtn>
                                </>
                            )}

                            <div className="ml-auto shrink-0">
                                <button
                                    type="button"
                                    onMouseDown={(e) => { e.preventDefault(); setShakespeareOpen(true); }}
                                    title="Shakespeare AI writing assist"
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-white text-[11px] font-semibold shakespeare-glow-btn"
                                    style={{ background: 'linear-gradient(135deg, #6541c4 0%, #9b59f5 50%, #6541c4 100%)', backgroundSize: '200% 200%' }}
                                >
                                    <span className="material-icons-round text-[14px] shakespeare-sparkle">auto_awesome</span>
                                    <span className="hidden sm:inline">AI Assist</span>
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div style={{ paddingTop: `${marginTop}px`, paddingRight: `${marginRight}px`, paddingBottom: `${marginBottom}px`, paddingLeft: `${marginLeft}px` }}>
                            <EditorContent editor={editor} />
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                            <span className="text-[11px] text-slate-400 tabular-nums">
                                {editor?.storage.characterCount?.words() ?? 0} words
                            </span>
                            <SaveBadge />
                        </div>
                    </div>
                </div>

                {showPresentationsSidebar && (
                    <ScholarPresentationsSidebar
                        docId={doc.id}
                        onClose={() => setShowPresentationsSidebar(false)}
                        onNewPresentation={() => { setShowPresentationsSidebar(false); setShowPresentationModal(true); }}
                    />
                )}
            </div>
        </>
    );
}
