import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import CharacterCount from '@tiptap/extension-character-count';
import { useState, useEffect, useRef } from 'react';
import { scholarService } from '../../api/scholarService';

function Divider() {
    return <span className="w-px h-5 bg-slate-200 mx-0.5 shrink-0 inline-block" />;
}

function ToolBtn({ onClick, active, disabled, title, children }) {
    return (
        <button
            type="button"
            onMouseDown={(e) => {
                e.preventDefault();
                if (!disabled) onClick?.();
            }}
            disabled={disabled}
            title={title}
            className={`flex items-center justify-center w-7 h-7 rounded text-[13px] transition-colors shrink-0 ${
                active
                    ? 'bg-primary text-white'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            } disabled:opacity-30 disabled:cursor-not-allowed`}
        >
            {children}
        </button>
    );
}

export default function ChapterEditor({ chapter, documentId, onSave, onCancel, onDirtyChange }) {
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    const focusedRef = useRef(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Link.configure({ openOnClick: false }),
            Image.configure({ inline: false }),
            Table.configure({ resizable: false }),
            TableRow,
            TableCell,
            TableHeader,
            CharacterCount,
        ],
        content: chapter.content || '',
        onUpdate: () => onDirtyChange?.(true),
        editorProps: {
            attributes: {
                class: 'scholar-doc scholar-editor-content p-6 min-h-[320px] focus:outline-none',
            },
        },
    });

    // TipTap's autofocus option fires before EditorContent has attached the DOM element,
    // so focus silently fails. We defer until the next macrotask when the contenteditable
    // is fully in the DOM and ready to receive input.
    useEffect(() => {
        if (!editor || focusedRef.current) return;
        focusedRef.current = true;
        const timer = setTimeout(() => editor.commands.focus('end'), 0);
        return () => clearTimeout(timer);
    }, [editor]);

    const handleSave = async () => {
        if (!editor || saving) return;
        setSaving(true);
        setSaveError('');
        try {
            const res = await scholarService.updateChapter(documentId, chapter.id, editor.getHTML());
            onDirtyChange?.(false);
            onSave(chapter.id, res.data);
        } catch {
            setSaveError('Could not save changes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const insertLink = () => {
        const prev = editor?.getAttributes('link').href ?? '';
        const url = window.prompt('Link URL:', prev);
        if (url === null) return;
        if (url === '') {
            editor?.chain().focus().unsetLink().run();
        } else {
            editor?.chain().focus().setLink({ href: url }).run();
        }
    };

    const insertImage = () => {
        const url = window.prompt('Image URL:');
        if (!url) return;
        editor?.chain().focus().setImage({ src: url }).run();
    };

    const words = editor?.storage.characterCount?.words() ?? 0;

    return (
        <div className="flex flex-col rounded-xl shadow-sm border border-primary/30 bg-white overflow-hidden">

            {/* ── Toolbar row ─────────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 bg-slate-50 border-b-2 border-slate-200">

                {/* History */}
                <ToolBtn onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()} title="Undo">
                    <span className="material-icons-round text-[17px]">undo</span>
                </ToolBtn>
                <ToolBtn onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()} title="Redo">
                    <span className="material-icons-round text-[17px]">redo</span>
                </ToolBtn>

                <Divider />

                {/* Text formatting */}
                <ToolBtn onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')} title="Bold (Ctrl+B)">
                    <span className="material-icons-round text-[17px]">format_bold</span>
                </ToolBtn>
                <ToolBtn onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')} title="Italic (Ctrl+I)">
                    <span className="material-icons-round text-[17px]">format_italic</span>
                </ToolBtn>
                <ToolBtn onClick={() => editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive('underline')} title="Underline (Ctrl+U)">
                    <span className="material-icons-round text-[17px]">format_underlined</span>
                </ToolBtn>
                <ToolBtn onClick={() => editor?.chain().focus().toggleStrike().run()} active={editor?.isActive('strike')} title="Strikethrough">
                    <span className="material-icons-round text-[17px]">strikethrough_s</span>
                </ToolBtn>
                <ToolBtn onClick={() => editor?.chain().focus().toggleCode().run()} active={editor?.isActive('code')} title="Inline Code">
                    <span className="material-icons-round text-[17px]">code</span>
                </ToolBtn>

                <Divider />

                {/* Headings */}
                {[2, 3, 4].map(level => (
                    <ToolBtn
                        key={level}
                        onClick={() => editor?.chain().focus().toggleHeading({ level }).run()}
                        active={editor?.isActive('heading', { level })}
                        title={`Heading ${level}`}
                    >
                        <span className="text-[11px] font-bold leading-none">H{level}</span>
                    </ToolBtn>
                ))}
                <ToolBtn onClick={() => editor?.chain().focus().setParagraph().run()} active={editor?.isActive('paragraph') && !editor?.isActive('heading')} title="Paragraph">
                    <span className="material-icons-round text-[17px]">subject</span>
                </ToolBtn>

                <Divider />

                {/* Alignment */}
                <ToolBtn onClick={() => editor?.chain().focus().setTextAlign('left').run()} active={editor?.isActive({ textAlign: 'left' })} title="Align Left">
                    <span className="material-icons-round text-[17px]">format_align_left</span>
                </ToolBtn>
                <ToolBtn onClick={() => editor?.chain().focus().setTextAlign('center').run()} active={editor?.isActive({ textAlign: 'center' })} title="Align Center">
                    <span className="material-icons-round text-[17px]">format_align_center</span>
                </ToolBtn>
                <ToolBtn onClick={() => editor?.chain().focus().setTextAlign('right').run()} active={editor?.isActive({ textAlign: 'right' })} title="Align Right">
                    <span className="material-icons-round text-[17px]">format_align_right</span>
                </ToolBtn>
                <ToolBtn onClick={() => editor?.chain().focus().setTextAlign('justify').run()} active={editor?.isActive({ textAlign: 'justify' })} title="Justify">
                    <span className="material-icons-round text-[17px]">format_align_justify</span>
                </ToolBtn>

                <Divider />

                {/* Lists */}
                <ToolBtn onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')} title="Bullet List">
                    <span className="material-icons-round text-[17px]">format_list_bulleted</span>
                </ToolBtn>
                <ToolBtn onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')} title="Ordered List">
                    <span className="material-icons-round text-[17px]">format_list_numbered</span>
                </ToolBtn>

                <Divider />

                {/* Block */}
                <ToolBtn onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive('blockquote')} title="Blockquote">
                    <span className="material-icons-round text-[17px]">format_quote</span>
                </ToolBtn>
                <ToolBtn onClick={() => editor?.chain().focus().toggleCodeBlock().run()} active={editor?.isActive('codeBlock')} title="Code Block">
                    <span className="material-icons-round text-[17px]">integration_instructions</span>
                </ToolBtn>
                <ToolBtn onClick={() => editor?.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
                    <span className="material-icons-round text-[17px]">horizontal_rule</span>
                </ToolBtn>

                <Divider />

                {/* Insert */}
                <ToolBtn onClick={insertLink} active={editor?.isActive('link')} title="Insert / Edit Link">
                    <span className="material-icons-round text-[17px]">link</span>
                </ToolBtn>
                <ToolBtn onClick={() => editor?.chain().focus().unsetLink().run()} disabled={!editor?.isActive('link')} title="Remove Link">
                    <span className="material-icons-round text-[17px]">link_off</span>
                </ToolBtn>
                <ToolBtn onClick={insertImage} title="Insert Image from URL">
                    <span className="material-icons-round text-[17px]">image</span>
                </ToolBtn>
                <ToolBtn
                    onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                    title="Insert Table"
                >
                    <span className="material-icons-round text-[17px]">table_chart</span>
                </ToolBtn>

                {/* Table controls — only visible when cursor is inside a table */}
                {editor?.isActive('table') && (
                    <>
                        <Divider />
                        <ToolBtn onClick={() => editor?.chain().focus().addColumnAfter().run()} title="Add Column">
                            <span className="material-icons-round text-[17px]">view_column</span>
                        </ToolBtn>
                        <ToolBtn onClick={() => editor?.chain().focus().addRowAfter().run()} title="Add Row">
                            <span className="material-icons-round text-[17px]">table_rows</span>
                        </ToolBtn>
                        <ToolBtn onClick={() => editor?.chain().focus().deleteTable().run()} title="Delete Table">
                            <span className="material-icons-round text-[17px]">delete</span>
                        </ToolBtn>
                    </>
                )}

                {/* Word count + actions pushed to the right */}
                <div className="ml-auto flex items-center gap-2 pl-2 shrink-0">
                    <span className="text-[11px] text-slate-400 tabular-nums hidden sm:inline">
                        {words.toLocaleString()} words
                    </span>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-white text-[12px] font-semibold hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <span className="material-icons-round text-[14px]">save</span>
                        )}
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                </div>
            </div>

            {/* ── Content row ─────────────────────────────────────────────── */}
            <div className="flex flex-col bg-white">
                {saveError && (
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-red-50 border-b border-red-100 text-[12px] text-red-600">
                        <span className="material-icons-round text-[14px]">error_outline</span>
                        {saveError}
                    </div>
                )}
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
