import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { DecorationSet, Decoration } from '@tiptap/pm/view';
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
const AUTO_SAVE_DELAY_MS = 2000;

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
                lineHeight:  { default: null, parseHTML: el => el.style.lineHeight || null,    renderHTML: attrs => attrs.lineHeight  ? { style: `line-height: ${attrs.lineHeight}` }  : {} },
                spaceBefore: { default: null, parseHTML: el => el.style.marginTop || null,     renderHTML: attrs => attrs.spaceBefore ? { style: `margin-top: ${attrs.spaceBefore}` }   : {} },
                spaceAfter:  { default: null, parseHTML: el => el.style.marginBottom || null,  renderHTML: attrs => attrs.spaceAfter  ? { style: `margin-bottom: ${attrs.spaceAfter}` } : {} },
            },
        }];
    },
    addCommands() {
        return {
            setLineHeight: value => ({ commands }) =>
                commands.updateAttributes('paragraph', { lineHeight: value }) &&
                commands.updateAttributes('heading',   { lineHeight: value }),
            toggleSpaceBefore: () => ({ editor, commands }) =>
                commands.updateAttributes('paragraph', {
                    spaceBefore: editor.getAttributes('paragraph').spaceBefore ? null : '1em',
                }),
            toggleSpaceAfter: () => ({ editor, commands }) =>
                commands.updateAttributes('paragraph', {
                    spaceAfter: editor.getAttributes('paragraph').spaceAfter ? null : '1em',
                }),
        };
    },
});

// ── HeadingNumbers extension ──────────────────────────────────────────────────
// Visual-only decorations — not stored in HTML. Mirrors what the exporter does.
const HEADING_NUM_KEY = new PluginKey('headingNumbers');

function computeHeadingDecorations(doc) {
    const decos = [];
    let h2 = 0, h3 = 0, h4 = 0;

    doc.descendants((node, pos) => {
        if (node.type.name !== 'heading') return;
        const level = node.attrs.level;
        let num;
        if (level === 2)      { h2++; h3 = 0; h4 = 0; num = `${h2}`; }
        else if (level === 3) { h3++; h4 = 0;          num = `${h2}.${h3}`; }
        else if (level === 4) { h4++;                   num = `${h2}.${h3}.${h4}`; }
        else return;

        const span = document.createElement('span');
        span.className = 'heading-num-badge';
        span.textContent = num + ' ';
        span.contentEditable = 'false';

        decos.push(Decoration.widget(pos + 1, () => span, { key: `hnum-${pos}`, side: -1 }));
    });

    return DecorationSet.create(doc, decos);
}

const HeadingNumbers = Extension.create({
    name: 'headingNumbers',
    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: HEADING_NUM_KEY,
                state: {
                    init: (_, state) => computeHeadingDecorations(state.doc),
                    apply: (tr, old) => tr.docChanged ? computeHeadingDecorations(tr.doc) : old,
                },
                props: {
                    decorations(state) { return this.getState(state); },
                },
            }),
        ];
    },
});

// ── Extract headings with hierarchical numbers (for InlineTOC) ────────────────
function extractNumberedHeadings(doc) {
    const list = [];
    let h2 = 0, h3 = 0, h4 = 0;

    doc.descendants((node) => {
        if (node.type.name !== 'heading') return;
        const level = node.attrs.level;
        const text = node.textContent.trim();
        let num;
        if (level === 2)      { h2++; h3 = 0; h4 = 0; num = `${h2}`; }
        else if (level === 3) { h3++; h4 = 0;          num = `${h2}.${h3}`; }
        else if (level === 4) { h4++;                   num = `${h2}.${h3}.${h4}`; }
        else return;
        if (text) list.push({ level, num, text });
    });

    return list;
}

// ── Resizable image NodeView ──────────────────────────────────────────────────
function ResizableImageView({ node, updateAttributes, selected }) {
    const { src, alt, title, width } = node.attrs;
    const imgRef  = useRef(null);
    const startX  = useRef(0);
    const startW  = useRef(0);
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

// ── Export options modal ──────────────────────────────────────────────────────
function ExportOptionsModal({ format, formatting, onConfirm, onClose }) {
    const [bodyPt, setBodyPt] = useState(12);
    const [tocPt,  setTocPt]  = useState(12);
    const [refPt,  setRefPt]  = useState(12);
    const step = (setter, delta) => setter(v => Math.max(8, Math.min(20, v + delta)));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 flex flex-col gap-5">
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <span className="material-icons-round text-primary text-[20px]">download</span>
                    </div>
                    <div>
                        <p className="text-[14px] font-semibold text-slate-800">Export as {format.toUpperCase()}</p>
                        <p className="text-[13px] text-slate-500 mt-0.5">Set font sizes for each section</p>
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    {[
                        { label: 'Body text',         val: bodyPt, setter: setBodyPt },
                        { label: 'Table of contents', val: tocPt,  setter: setTocPt  },
                        { label: 'References',        val: refPt,  setter: setRefPt  },
                    ].map(({ label, val, setter }) => (
                        <div key={label} className="flex items-center justify-between">
                            <span className="text-[12px] font-medium text-slate-600">{label}</span>
                            <div className="flex items-center gap-2">
                                <button onClick={() => step(setter, -1)} className="w-7 h-7 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center text-[16px] font-medium leading-none transition-colors">−</button>
                                <span className="text-[13px] font-semibold text-slate-800 w-8 text-center">{val}pt</span>
                                <button onClick={() => step(setter, 1)}  className="w-7 h-7 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center text-[16px] font-medium leading-none transition-colors">+</button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-[12px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
                    <button
                        onClick={() => { onConfirm(format, { ...formatting, body_font_size: bodyPt, toc_font_size: tocPt, ref_font_size: refPt }); onClose(); }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-[12px] font-semibold hover:bg-primary/90 transition-all active:scale-95"
                    >
                        <span className="material-icons-round text-[14px]">download</span>
                        Download
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Bibliography ──────────────────────────────────────────────────────────────
const EMPTY_CITATION = { author: '', title: '', year: '', source: '', url: '' };

function Bibliography({ citations: initialCitations, documentId, onSaved }) {
    const [editing, setEditing]     = useState(false);
    const [draft, setDraft]         = useState([]);
    const [saving, setSaving]       = useState(false);
    const [saveError, setSaveError] = useState('');
    const citations = initialCitations || [];

    const openEditor = () => { setDraft(citations.map(c => ({ ...c }))); setSaveError(''); setEditing(true); };
    const updateField = (idx, field, value) => setDraft(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
    const addRow    = () => setDraft(prev => [...prev, { ...EMPTY_CITATION }]);
    const removeRow = (idx) => setDraft(prev => prev.filter((_, i) => i !== idx));

    const handleSave = async () => {
        setSaving(true); setSaveError('');
        try {
            const res = await scholarService.updateBibliography(documentId, draft);
            onSaved(res.data?.meta?.all_citations ?? draft);
            setEditing(false);
        } catch { setSaveError('Could not save references. Please try again.'); }
        finally  { setSaving(false); }
    };

    const fieldCls = 'w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[12px] text-slate-700 placeholder-slate-300 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all';

    return (
        <section className="mt-10 pt-8 border-t border-slate-200">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">References</h2>
                {!editing ? (
                    <button onClick={openEditor} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-primary hover:bg-primary/8 transition-colors border border-transparent hover:border-primary/15">
                        <span className="material-icons-round text-[14px]">edit</span>
                        Edit references
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <button onClick={() => setEditing(false)} className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-slate-500 hover:bg-slate-100 transition-colors">Cancel</button>
                        <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-white text-[12px] font-semibold hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-60">
                            {saving ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span className="material-icons-round text-[14px]">save</span>}
                            {saving ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                )}
            </div>

            {saveError && (
                <div className="flex items-center gap-1.5 mb-4 px-4 py-2 bg-red-50 border border-red-100 rounded-lg text-[12px] text-red-600">
                    <span className="material-icons-round text-[14px]">error_outline</span>
                    {saveError}
                </div>
            )}

            {editing ? (
                <div className="flex flex-col gap-4">
                    {draft.map((cite, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reference {idx + 1}</span>
                                <button onClick={() => removeRow(idx)} className="p-1 rounded-full hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors"><span className="material-icons-round text-[16px]">delete_outline</span></button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Author(s)</label>
                                    <input className={fieldCls} value={cite.author} placeholder="e.g. Smith, J." onChange={e => updateField(idx, 'author', e.target.value)} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Year</label>
                                    <input className={fieldCls} value={cite.year} placeholder="e.g. 2024" onChange={e => updateField(idx, 'year', e.target.value)} />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Title</label>
                                <input className={fieldCls} value={cite.title} placeholder="Publication title" onChange={e => updateField(idx, 'title', e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Source / Journal / Publisher</label>
                                <input className={fieldCls} value={cite.source} placeholder="e.g. Nature, 502(1), 45–50" onChange={e => updateField(idx, 'source', e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">URL (optional)</label>
                                <input className={fieldCls} value={cite.url || ''} placeholder="https://…" onChange={e => updateField(idx, 'url', e.target.value)} />
                            </div>
                        </div>
                    ))}
                    <button onClick={addRow} className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-primary/40 text-slate-400 hover:text-primary text-[12px] font-semibold transition-all">
                        <span className="material-icons-round text-[16px]">add</span>
                        Add Reference
                    </button>
                </div>
            ) : citations.length === 0 ? (
                <p className="text-[13px] text-slate-400 italic">No references yet. Click "Edit references" to add some.</p>
            ) : (
                <ol className="flex flex-col gap-3 pl-6">
                    {citations.map((cite, i) => (
                        <li key={i} className="text-[13px] text-slate-600 leading-relaxed">
                            {cite.author} ({cite.year}). <em>{cite.title}</em>. {cite.source}.
                            {cite.url && <a href={cite.url} target="_blank" rel="noreferrer" className="ml-1 text-primary hover:underline break-all">{cite.url}</a>}
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}

// ── InlineTOC ─────────────────────────────────────────────────────────────────
function InlineTOC({ headings, tocEnabled }) {
    const [collapsed, setCollapsed] = useState(false);
    if (!tocEnabled || headings.length === 0) return null;

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl mb-8 overflow-hidden">
            <button
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-100/60 transition-colors"
                onClick={() => setCollapsed(c => !c)}
            >
                <span className="flex items-center gap-2 text-[14px] font-semibold text-slate-700">
                    <span className="material-icons-round text-primary text-[18px]">toc</span>
                    Table of Contents
                </span>
                <span className={`material-icons-round text-[18px] text-slate-400 transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`}>
                    expand_more
                </span>
            </button>

            {!collapsed && (
                <nav className="px-5 py-4 border-t border-slate-200">
                    {headings.map((h, i) => (
                        <div
                            key={i}
                            style={{ paddingLeft: `${(h.level - 2) * 20}px` }}
                            className="py-1"
                        >
                            <span className={`inline-block text-${h.level === 2 ? '[13px] font-semibold text-slate-700' : h.level === 3 ? '[12px] text-slate-500' : '[11px] text-slate-400'}`}>
                                <span className="font-mono text-primary mr-1.5">{h.num}</span>
                                {h.text}
                            </span>
                        </div>
                    ))}
                </nav>
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
            .replace(/\*(.+?)\*/g,   '<em>$1</em>')
            .replace(/\n/g, '<br>');
        return `<p>${html}</p>`;
    }).join('');
}

// Resolve <figure class="scholar-generated-image"> to <img> before loading into TipTap
function resolveImagesForEditor(html) {
    if (!html) return '';
    return html.replace(
        /<figure\s+class="scholar-generated-image"\s+data-src="([^"]+)"(?:\s+data-alt="([^"]*)")?\s*(?:data-keywords="[^"]*")?\s*><\/figure>/gi,
        (_, src, alt = '') => `<img src="${src}" alt="${alt}" />`
    );
}

// ── Document editor ───────────────────────────────────────────────────────────
const BLOCK_STYLES = [
    { label: 'Normal text', check: ed => ed.isActive('paragraph') && !ed.isActive('heading'), run: ed => ed.chain().focus().setParagraph().run() },
    { label: 'Heading 2',   check: ed => ed.isActive('heading', { level: 2 }), run: ed => ed.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: 'Heading 3',   check: ed => ed.isActive('heading', { level: 3 }), run: ed => ed.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: 'Heading 4',   check: ed => ed.isActive('heading', { level: 4 }), run: ed => ed.chain().focus().toggleHeading({ level: 4 }).run() },
];

export default function DocumentEditor({ doc, onExport, onCoverSaved, onTocStyleSaved }) {
    const navigate = useNavigate();

    // ── Local doc state ───────────────────────────────────────────────────────
    const [allCitations, setAllCitations] = useState(
        doc.meta?.all_citations || (doc.pages || []).flatMap(c => c.citations || [])
    );

    // ── Formatting overrides (preview in editor, pass to export) ─────────────
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
    const [showCoverForm,         setShowCoverForm]         = useState(!doc.meta?.cover?.layout);
    const [showTocStyleForm,      setShowTocStyleForm]      = useState(false);
    const [showPresentationModal, setShowPresentationModal] = useState(false);
    const [showPresentationsSidebar, setShowPresentationsSidebar] = useState(false);
    const [exportModal,           setExportModal]           = useState(null);
    const [shakespeareOpen,       setShakespeareOpen]       = useState(false);
    const [imageAiOpen,           setImageAiOpen]           = useState(false);
    const [isUploading,           setIsUploading]           = useState(false);

    // ── Save state ────────────────────────────────────────────────────────────
    // 'idle' | 'unsaved' | 'saving' | 'saved' | 'error'
    const [saveStatus, setSaveStatus] = useState('idle');
    const autoSaveTimer = useRef(null);
    const fileInputRef  = useRef(null);

    // ── TOC headings (derived from editor state) ──────────────────────────────
    const [headings, setHeadings] = useState([]);

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
        autoSaveTimer.current = setTimeout(() => doSave(html), AUTO_SAVE_DELAY_MS);
    }, [doSave]);

    useEffect(() => () => clearTimeout(autoSaveTimer.current), []);

    // ── Editor ────────────────────────────────────────────────────────────────
    const editor = useEditor({
        extensions: [
            StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
            Underline,
            TextStyle,
            FontFamily,
            FontSize,
            LineHeight,
            TextAlign.configure({ types: ['heading', 'paragraph', 'image'] }),
            Link.configure({ openOnClick: false }),
            ResizableImage.configure({ inline: true }),
            Table.configure({ resizable: false }),
            TableRow, TableCell, TableHeader,
            CharacterCount,
            HeadingNumbers,
        ],
        content: initialContent,
        onCreate: ({ editor: ed }) => {
            setHeadings(extractNumberedHeadings(ed.state.doc));
        },
        onUpdate: ({ editor: ed }) => {
            const html = ed.getHTML();
            scheduleAutoSave(html);
            setHeadings(extractNumberedHeadings(ed.state.doc));
        },
        editorProps: {
            attributes: { class: 'scholar-doc scholar-editor-content focus:outline-none' },
        },
    });

    // ── Toolbar helpers ───────────────────────────────────────────────────────
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

    const handleCoverSaved = (updatedCover) => {
        setShowCoverForm(false);
        onCoverSaved(updatedCover);
    };

    const handleTocStyleSaved = (tocStyle) => {
        setShowTocStyleForm(false);
        onTocStyleSaved(tocStyle);
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

    // ── Save status indicator ─────────────────────────────────────────────────
    const SaveIndicator = () => {
        if (saveStatus === 'idle') return null;
        const map = {
            unsaved: { icon: 'edit',          cls: 'text-slate-400',   label: 'Unsaved' },
            saving:  { icon: 'autorenew',     cls: 'text-primary animate-spin', label: 'Saving…' },
            saved:   { icon: 'check_circle',  cls: 'text-emerald-500', label: 'Saved'   },
            error:   { icon: 'error_outline', cls: 'text-red-500',     label: 'Save failed' },
        };
        const s = map[saveStatus];
        return (
            <span className={`flex items-center gap-1 text-[11px] font-medium ${s.cls} tabular-nums`}>
                <span className={`material-icons-round text-[13px] ${saveStatus === 'saving' ? 'animate-spin' : ''}`}>{s.icon}</span>
                <span className="hidden sm:inline">{s.label}</span>
            </span>
        );
    };

    return (
        <>
            {/* Global formatting overrides */}
            <style>{`
                .scholar-doc p, .scholar-doc li,
                .scholar-editor-content p, .scholar-editor-content li {
                    line-height: ${docLineHeight} !important;
                    ${docSpaceBefore ? 'margin-top: 1em !important;' : ''}
                    ${docSpaceAfter  ? 'margin-bottom: 1em !important;' : ''}
                }
                ${docFontFamily ? `.scholar-doc, .scholar-doc *,
                .scholar-editor-content, .scholar-editor-content * {
                    font-family: ${docFontFamily} !important;
                }` : ''}
                .heading-num-badge {
                    font-weight: 600;
                    color: #6541c4;
                    margin-right: 0.2em;
                    user-select: none;
                    pointer-events: none;
                    font-size: 0.9em;
                }
                .scholar-editor-content h2 .heading-num-badge { font-size: 1rem; }
                .scholar-editor-content h3 .heading-num-badge { font-size: 0.9rem; }
                .scholar-editor-content h4 .heading-num-badge { font-size: 0.85rem; }
            `}</style>

            {/* Modals */}
            {exportModal && (
                <ExportOptionsModal
                    format={exportModal}
                    formatting={exportFormatting}
                    onConfirm={onExport}
                    onClose={() => setExportModal(null)}
                />
            )}
            {showCoverForm && (
                <CoverPageForm doc={doc} onSaved={handleCoverSaved} onClose={() => setShowCoverForm(false)} />
            )}
            {showTocStyleForm && (
                <TocStyleForm doc={doc} onSaved={handleTocStyleSaved} onClose={() => setShowTocStyleForm(false)} />
            )}
            {showPresentationModal && (
                <GeneratePresentationModal
                    onClose={() => setShowPresentationModal(false)}
                    paperId={null}
                    scholarDocumentId={doc.id}
                    paperTitle={doc.title}
                    pages={(doc.pages || []).map(pg => pg.content || '')}
                    onGenerated={(saved) => {
                        setShowPresentationModal(false);
                        if (saved?.id) navigate(`/lockedin/presentations/${saved.id}`);
                    }}
                />
            )}
            {shakespeareOpen && (
                <ShakespeareModal
                    onClose={() => { setShakespeareOpen(false); editor?.commands.focus(); }}
                    onInsert={(text) => {
                        setShakespeareOpen(false);
                        editor?.chain().focus().insertContent(shakespeareToHtml(text)).run();
                    }}
                />
            )}
            {imageAiOpen && (
                <ImageSearchModal
                    onClose={() => { setImageAiOpen(false); editor?.commands.focus(); }}
                    onInsert={(url) => {
                        setImageAiOpen(false);
                        editor?.chain().focus().setImage({ src: url }).run();
                    }}
                />
            )}

            <div className="flex items-start gap-0">
                <div className="flex-1 min-w-0">

                    {/* ── Sticky top bar ───────────────────────────────────── */}
                    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-0 py-2 mb-6 flex items-center gap-2 justify-between">

                        {/* Document identity */}
                        <div className="shrink-0 min-w-0">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Scholar</p>
                            <p className="text-[13px] font-semibold text-slate-800 leading-snug truncate max-w-[200px]">{doc.title}</p>
                        </div>

                        <div className="w-px h-6 bg-slate-200 shrink-0" />

                        {/* Formatting menus */}
                        <div className="flex items-center gap-0.5 flex-1">
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

                        <div className="w-px h-6 bg-slate-200 shrink-0" />

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                            <SaveIndicator />
                            <button onClick={() => setShowCoverForm(true)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                                <span className="material-icons-round text-[14px]">auto_stories</span>
                                <span className="hidden md:inline">Cover</span>
                            </button>
                            {doc.toc_enabled && (
                                <button onClick={() => setShowTocStyleForm(true)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                                    <span className="material-icons-round text-[14px]">toc</span>
                                    <span className="hidden md:inline">TOC</span>
                                </button>
                            )}
                            <button
                                onClick={() => setShowPresentationsSidebar(v => !v)}
                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all ${showPresentationsSidebar ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                title="View presentations"
                            >
                                <span className="material-icons-round text-[14px]">slideshow</span>
                                <span className="hidden md:inline">Slides</span>
                            </button>
                            {['pdf', 'docx'].map(fmt => (
                                <button
                                    key={fmt}
                                    onClick={() => setExportModal(fmt)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-[12px] font-semibold hover:bg-primary/90 transition-all active:scale-95"
                                >
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

                    {/* Inline TOC */}
                    <div className="mt-8">
                        <InlineTOC headings={headings} tocEnabled={doc.toc_enabled} />
                    </div>

                    {/* ── Editor ───────────────────────────────────────────── */}
                    <div className="rounded-xl shadow-sm border border-primary/20 bg-white overflow-hidden">

                        {/* Editor toolbar */}
                        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-slate-50 border-b border-slate-200 sticky top-[52px] z-[9]">

                            <ToolBtn onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()} title="Undo">
                                <span className="material-icons-round text-[15px]">undo</span>
                            </ToolBtn>
                            <ToolBtn onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()} title="Redo">
                                <span className="material-icons-round text-[15px]">redo</span>
                            </ToolBtn>

                            <Divider />

                            {/* Block style */}
                            <DropdownMenu trigger={triggerBtn(currentBlock, null, 'Paragraph style')} minW="min-w-[148px]">
                                {(close) => BLOCK_STYLES.map(b => (
                                    <MenuItem key={b.label} active={editor && b.check(editor)} onSelect={() => { b.run(editor); close(); }}>
                                        {b.label}
                                    </MenuItem>
                                ))}
                            </DropdownMenu>

                            <Divider />

                            {/* Font family */}
                            <DropdownMenu trigger={triggerBtn(currentFontLabel, null, 'Font family')} minW="min-w-[180px]">
                                {(close) => FONT_FAMILIES.map(f => (
                                    <MenuItem
                                        key={f.label}
                                        active={currentFontFamily === f.value}
                                        onSelect={() => {
                                            f.value
                                                ? editor?.chain().focus().setFontFamily(f.value).run()
                                                : editor?.chain().focus().unsetFontFamily().run();
                                            close();
                                        }}
                                    >
                                        <span style={{ fontFamily: f.value ?? 'inherit' }}>{f.label}</span>
                                    </MenuItem>
                                ))}
                            </DropdownMenu>

                            <FontSizeControl editor={editor} />

                            <Divider />

                            {/* Inline formatting */}
                            <ToolBtn onClick={() => editor?.chain().focus().toggleBold().run()}      active={editor?.isActive('bold')}      title="Bold">
                                <span className="material-icons-round text-[15px]">format_bold</span>
                            </ToolBtn>
                            <ToolBtn onClick={() => editor?.chain().focus().toggleItalic().run()}    active={editor?.isActive('italic')}    title="Italic">
                                <span className="material-icons-round text-[15px]">format_italic</span>
                            </ToolBtn>
                            <ToolBtn onClick={() => editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive('underline')} title="Underline">
                                <span className="material-icons-round text-[15px]">format_underlined</span>
                            </ToolBtn>
                            <ToolBtn onClick={() => editor?.chain().focus().toggleStrike().run()}    active={editor?.isActive('strike')}    title="Strikethrough">
                                <span className="material-icons-round text-[15px]">strikethrough_s</span>
                            </ToolBtn>

                            <Divider />

                            {/* Alignment */}
                            <DropdownMenu trigger={triggerBtn(null, alignIcons[currentAlign], 'Text alignment')} minW="min-w-[140px]">
                                {(close) => [
                                    { label: 'Left',    align: 'left',    icon: 'format_align_left'    },
                                    { label: 'Center',  align: 'center',  icon: 'format_align_center'  },
                                    { label: 'Right',   align: 'right',   icon: 'format_align_right'   },
                                    { label: 'Justify', align: 'justify', icon: 'format_align_justify' },
                                ].map(a => (
                                    <MenuItem key={a.align} active={currentAlign === a.align} icon={a.icon} onSelect={() => { editor?.chain().focus().setTextAlign(a.align).run(); close(); }}>
                                        {a.label}
                                    </MenuItem>
                                ))}
                            </DropdownMenu>

                            <Divider />

                            {/* Lists */}
                            <ToolBtn onClick={() => editor?.chain().focus().toggleBulletList().run()}  active={editor?.isActive('bulletList')}  title="Bullet list">
                                <span className="material-icons-round text-[15px]">format_list_bulleted</span>
                            </ToolBtn>
                            <ToolBtn onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')} title="Numbered list">
                                <span className="material-icons-round text-[15px]">format_list_numbered</span>
                            </ToolBtn>

                            <Divider />

                            {/* Insert */}
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
                            <DropdownMenu trigger={triggerBtn(null, 'add', 'Insert')} minW="min-w-[160px]" panelClass="overflow-y-auto">
                                {(close) => (
                                    <>
                                        <MenuItem icon="link"     active={editor?.isActive('link')} onSelect={() => { insertLink(); close(); }}>Link</MenuItem>
                                        <MenuItem icon="link_off" onSelect={() => { editor?.chain().focus().unsetLink().run(); close(); }} disabled={!editor?.isActive('link')}>Remove link</MenuItem>
                                        <MenuItem separator />
                                        <MenuItem icon={isUploading ? 'hourglass_top' : 'image'} onSelect={() => { fileInputRef.current?.click(); close(); }}>
                                            {isUploading ? 'Uploading…' : 'Upload image'}
                                        </MenuItem>
                                        <MenuItem icon="image_search" onSelect={() => { setImageAiOpen(true); close(); }}>Search Images</MenuItem>
                                        <TableGridPicker editor={editor} close={close} />
                                        <MenuItem separator />
                                        <MenuItem icon="format_quote"              active={editor?.isActive('blockquote')} onSelect={() => { editor?.chain().focus().toggleBlockquote().run(); close(); }}>Blockquote</MenuItem>
                                        <MenuItem icon="integration_instructions"  active={editor?.isActive('codeBlock')}  onSelect={() => { editor?.chain().focus().toggleCodeBlock().run(); close(); }}>Code block</MenuItem>
                                        <MenuItem icon="code"                      active={editor?.isActive('code')}       onSelect={() => { editor?.chain().focus().toggleCode().run(); close(); }}>Inline code</MenuItem>
                                        <MenuItem icon="horizontal_rule"                                                   onSelect={() => { editor?.chain().focus().setHorizontalRule().run(); close(); }}>Divider</MenuItem>
                                    </>
                                )}
                            </DropdownMenu>

                            {/* Table controls when cursor is inside a table */}
                            {editor?.isActive('table') && (
                                <>
                                    <Divider />
                                    <ToolBtn onClick={() => editor?.chain().focus().addColumnAfter().run()} title="Add column">
                                        <span className="material-icons-round text-[15px]">view_column</span>
                                    </ToolBtn>
                                    <ToolBtn onClick={() => editor?.chain().focus().addRowAfter().run()} title="Add row">
                                        <span className="material-icons-round text-[15px]">table_rows</span>
                                    </ToolBtn>
                                    <ToolBtn onClick={() => editor?.chain().focus().deleteTable().run()} title="Delete table">
                                        <span className="material-icons-round text-[15px]">delete</span>
                                    </ToolBtn>
                                </>
                            )}

                            {/* Shakespeare FAB (toolbar version) */}
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

                        {/* Editor content */}
                        <div
                            style={{
                                paddingTop:    `${marginTop}px`,
                                paddingRight:  `${marginRight}px`,
                                paddingBottom: `${marginBottom}px`,
                                paddingLeft:   `${marginLeft}px`,
                            }}
                        >
                            <EditorContent editor={editor} />
                        </div>

                        {/* Word count footer */}
                        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                            <span className="text-[11px] text-slate-400 tabular-nums">
                                {editor?.storage.characterCount?.words() ?? 0} words
                            </span>
                            <SaveIndicator />
                        </div>
                    </div>

                    {/* Bibliography */}
                    {doc.bibliography_enabled && (
                        <Bibliography
                            citations={allCitations}
                            documentId={doc.id}
                            onSaved={setAllCitations}
                        />
                    )}
                </div>

                {/* Presentations sidebar */}
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
