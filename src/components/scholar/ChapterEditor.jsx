import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { Extension } from '@tiptap/core';
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
import { scholarService } from '../../api/scholarService';
import ShakespeareModal from '../note/ShakespeareModal';

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
const LINE_SPACINGS = [
    { label: 'Single', value: '1'    },
    { label: '1.15',   value: '1.15' },
    { label: '1.5',    value: '1.5'  },
    { label: 'Double', value: '2'    },
];
const BLOCK_STYLES = [
    { label: 'Normal text', check: ed => ed.isActive('paragraph') && !ed.isActive('heading'), run: ed => ed.chain().focus().setParagraph().run() },
    { label: 'Heading 2',   check: ed => ed.isActive('heading', { level: 2 }), run: ed => ed.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: 'Heading 3',   check: ed => ed.isActive('heading', { level: 3 }), run: ed => ed.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: 'Heading 4',   check: ed => ed.isActive('heading', { level: 4 }), run: ed => ed.chain().focus().toggleHeading({ level: 4 }).run() },
];

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

// ── Custom extension: LineHeight + paragraph spacing ─────────────────────────
const LineHeight = Extension.create({
    name: 'lineHeight',
    addGlobalAttributes() {
        return [{
            types: ['paragraph', 'heading'],
            attributes: {
                lineHeight:  {
                    default: null,
                    parseHTML: el => el.style.lineHeight || null,
                    renderHTML: attrs => attrs.lineHeight  ? { style: `line-height: ${attrs.lineHeight}` }  : {},
                },
                spaceBefore: {
                    default: null,
                    parseHTML: el => el.style.marginTop || null,
                    renderHTML: attrs => attrs.spaceBefore ? { style: `margin-top: ${attrs.spaceBefore}` }   : {},
                },
                spaceAfter:  {
                    default: null,
                    parseHTML: el => el.style.marginBottom || null,
                    renderHTML: attrs => attrs.spaceAfter  ? { style: `margin-bottom: ${attrs.spaceAfter}` } : {},
                },
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

// ── Shakespeare text → TipTap HTML ───────────────────────────────────────────
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
        const onMove = ev => {
            updateAttributes({ width: `${Math.max(80, startW.current + ev.clientX - startX.current)}px` });
        };
        const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
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

// Dropdown container — children can be JSX or a render function `(close) => JSX`
function DropdownMenu({ trigger, children, minW = 'min-w-[160px]', alignRight = false }) {
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
            <div onMouseDown={(e) => { e.preventDefault(); setOpen(v => !v); }}>
                {trigger}
            </div>
            {open && (
                <div className={`absolute ${alignRight ? 'right-0' : 'left-0'} top-full mt-0.5 z-50 bg-white rounded-lg shadow-xl border border-slate-200 py-1 ${minW} max-h-64 overflow-y-auto`}>
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
            className={`w-full text-left flex items-center gap-2 px-3 py-1.5 text-[12px] hover:bg-slate-50 transition-colors ${
                active ? 'text-primary font-semibold' : 'text-slate-700'
            }`}
        >
            <span className="w-3 shrink-0 flex items-center justify-center">
                {active && <span className="material-icons-round text-[12px]">check</span>}
            </span>
            {icon && <span className="material-icons-round text-[14px] text-slate-400 shrink-0">{icon}</span>}
            {children}
        </button>
    );
}

// Font-size: text input + preset dropdown
function FontSizeControl({ editor }) {
    const rawSize    = editor?.getAttributes('textStyle')?.fontSize;
    const currentPt  = rawSize ? parseInt(rawSize) : null;
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

// ── Chapter editor ────────────────────────────────────────────────────────────
export default function ChapterEditor({ chapter, documentId, onSave, onCancel, onDirtyChange }) {
    const [saving, setSaving]                   = useState(false);
    const [saveError, setSaveError]             = useState('');
    const [shakespeareOpen, setShakespeareOpen] = useState(false);
    const [isUploading, setIsUploading]         = useState(false);

    const focusedRef   = useRef(false);
    const fileInputRef = useRef(null);

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
        ],
        content: chapter.content || '',
        onUpdate: () => onDirtyChange?.(true),
        editorProps: {
            attributes: { class: 'scholar-doc scholar-editor-content p-6 min-h-[320px] focus:outline-none' },
        },
    });

    useEffect(() => {
        if (!editor || focusedRef.current) return;
        focusedRef.current = true;
        const t = setTimeout(() => editor.commands.focus('end'), 0);
        return () => clearTimeout(t);
    }, [editor]);

    const handleSave = async () => {
        if (!editor || saving) return;
        setSaving(true); setSaveError('');
        try {
            const res = await scholarService.updateChapter(documentId, chapter.id, editor.getHTML());
            onDirtyChange?.(false);
            onSave(chapter.id, res.data);
        } catch { setSaveError('Could not save changes. Please try again.'); }
        finally  { setSaving(false); }
    };

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
                { method: 'POST', body: data },
            );
            const json = await res.json();
            if (json.secure_url) editor?.chain().focus().setImage({ src: json.secure_url }).run();
        } catch (err) { console.error('[ImageUpload]', err); }
        finally       { setIsUploading(false); }
    };

    // Derived toolbar state
    const currentBlock      = BLOCK_STYLES.find(b => editor && b.check(editor))?.label ?? 'Normal text';
    const currentFontFamily = editor?.getAttributes('textStyle')?.fontFamily ?? null;
    const currentFontLabel  = FONT_FAMILIES.find(f => f.value === currentFontFamily)?.label ?? 'Default';
    const currentLineHeight = editor?.getAttributes('paragraph')?.lineHeight ?? null;
    const spaceBefore       = !!editor?.getAttributes('paragraph')?.spaceBefore;
    const spaceAfter        = !!editor?.getAttributes('paragraph')?.spaceAfter;
    const currentAlign      = ['left','center','right','justify'].find(a => editor?.isActive({ textAlign: a })) ?? 'left';
    const alignIcons        = { left: 'format_align_left', center: 'format_align_center', right: 'format_align_right', justify: 'format_align_justify' };
    const words             = editor?.storage.characterCount?.words() ?? 0;

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

    return (
        <div className="flex flex-col rounded-xl shadow-sm border border-primary/30 bg-white overflow-hidden">

            {/* ── Toolbar ─────────────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-slate-50 border-b border-slate-200">

                {/* History */}
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

                {/* Font size */}
                <FontSizeControl editor={editor} />

                <Divider />

                {/* Inline formatting */}
                <ToolBtn onClick={() => editor?.chain().focus().toggleBold().run()}      active={editor?.isActive('bold')}      title="Bold (Ctrl+B)">
                    <span className="material-icons-round text-[15px]">format_bold</span>
                </ToolBtn>
                <ToolBtn onClick={() => editor?.chain().focus().toggleItalic().run()}    active={editor?.isActive('italic')}    title="Italic (Ctrl+I)">
                    <span className="material-icons-round text-[15px]">format_italic</span>
                </ToolBtn>
                <ToolBtn onClick={() => editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive('underline')} title="Underline (Ctrl+U)">
                    <span className="material-icons-round text-[15px]">format_underlined</span>
                </ToolBtn>
                <ToolBtn onClick={() => editor?.chain().focus().toggleStrike().run()}    active={editor?.isActive('strike')}    title="Strikethrough">
                    <span className="material-icons-round text-[15px]">strikethrough_s</span>
                </ToolBtn>

                <Divider />

                {/* Alignment */}
                <DropdownMenu trigger={triggerBtn(null, alignIcons[currentAlign], 'Text alignment', false)} minW="min-w-[140px]">
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

                {/* Line spacing */}
                <DropdownMenu trigger={triggerBtn(null, 'format_line_spacing', 'Line spacing')} minW="min-w-[200px]">
                    {(close) => (
                        <>
                            {LINE_SPACINGS.map(ls => (
                                <MenuItem
                                    key={ls.value}
                                    active={currentLineHeight === ls.value}
                                    onSelect={() => { editor?.chain().focus().setLineHeight(ls.value).run(); close(); }}
                                >
                                    {ls.label}
                                </MenuItem>
                            ))}
                            <MenuItem separator />
                            <MenuItem
                                active={spaceBefore}
                                icon="vertical_align_top"
                                onSelect={() => { editor?.chain().focus().toggleSpaceBefore().run(); close(); }}
                            >
                                {spaceBefore ? 'Remove' : 'Add'} space before paragraph
                            </MenuItem>
                            <MenuItem
                                active={spaceAfter}
                                icon="vertical_align_bottom"
                                onSelect={() => { editor?.chain().focus().toggleSpaceAfter().run(); close(); }}
                            >
                                {spaceAfter ? 'Remove' : 'Add'} space after paragraph
                            </MenuItem>
                        </>
                    )}
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
                <DropdownMenu trigger={triggerBtn(null, 'add', 'Insert')} minW="min-w-[160px]">
                    {(close) => (
                        <>
                            <MenuItem icon="link" onSelect={() => { insertLink(); close(); }} active={editor?.isActive('link')}>Link</MenuItem>
                            <MenuItem icon="link_off" onSelect={() => { editor?.chain().focus().unsetLink().run(); close(); }} disabled={!editor?.isActive('link')}>Remove link</MenuItem>
                            <MenuItem separator />
                            <MenuItem icon={isUploading ? 'hourglass_top' : 'image'} onSelect={() => { fileInputRef.current?.click(); close(); }}>
                                {isUploading ? 'Uploading…' : 'Upload image'}
                            </MenuItem>
                            <MenuItem icon="table_chart" onSelect={() => { editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); close(); }}>Table</MenuItem>
                            <MenuItem separator />
                            <MenuItem icon="format_quote"           onSelect={() => { editor?.chain().focus().toggleBlockquote().run(); close(); }}    active={editor?.isActive('blockquote')}>Blockquote</MenuItem>
                            <MenuItem icon="integration_instructions" onSelect={() => { editor?.chain().focus().toggleCodeBlock().run(); close(); }}   active={editor?.isActive('codeBlock')}>Code block</MenuItem>
                            <MenuItem icon="code"                   onSelect={() => { editor?.chain().focus().toggleCode().run(); close(); }}          active={editor?.isActive('code')}>Inline code</MenuItem>
                            <MenuItem icon="horizontal_rule"        onSelect={() => { editor?.chain().focus().setHorizontalRule().run(); close(); }}>Divider</MenuItem>
                        </>
                    )}
                </DropdownMenu>

                {/* Table controls — only when cursor is inside a table */}
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

                {/* Right side */}
                <div className="ml-auto flex items-center gap-1.5 pl-2 shrink-0">
                    <span className="text-[11px] text-slate-400 tabular-nums hidden sm:inline">{words.toLocaleString()}w</span>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-3 py-1 rounded-lg text-[12px] font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-primary text-white text-[12px] font-semibold hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {saving
                            ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <span className="material-icons-round text-[13px]">save</span>
                        }
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                </div>
            </div>

            {/* ── Content ─────────────────────────────────────────────────── */}
            <div className="relative flex flex-col bg-white">
                {saveError && (
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-red-50 border-b border-red-100 text-[12px] text-red-600">
                        <span className="material-icons-round text-[14px]">error_outline</span>
                        {saveError}
                    </div>
                )}
                <EditorContent editor={editor} />

                {/* Floating Shakespeare FAB */}
                <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); setShakespeareOpen(true); }}
                    title="Shakespeare Assist — AI writing"
                    className="absolute bottom-4 right-4 w-11 h-11 rounded-full flex items-center justify-center text-white shakespeare-glow-btn"
                    style={{ background: 'linear-gradient(135deg, #6541c4 0%, #9b59f5 50%, #6541c4 100%)', backgroundSize: '200% 200%' }}
                >
                    <span className="material-icons-round text-[20px] shakespeare-sparkle">auto_awesome</span>
                </button>
            </div>

            {shakespeareOpen && (
                <ShakespeareModal
                    onClose={() => { setShakespeareOpen(false); editor?.commands.focus(); }}
                    onInsert={(text) => {
                        setShakespeareOpen(false);
                        editor?.chain().focus().insertContent(shakespeareToHtml(text)).run();
                    }}
                />
            )}
        </div>
    );
}
