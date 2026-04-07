import React, { useState, useEffect, useRef, useCallback } from "react";
import { NoteHeader } from "./NoteHeader";
import { NoteToolbar } from "./NoteToolbar";
import { NoteEditor } from "./NoteEditor";
import { NoteAISidebar } from "./NoteAISidebar";
import { NoteSettingsSidebar } from "./NoteSettingsSidebar";
import { NotePageSidebar } from "./NotePageSidebar";
import * as htmlToImage from 'html-to-image';
import { jsPDF } from "jspdf";

export const Note = () => {
    // Note Data
    const [title, setTitle] = useState("Architecture Lecture Notes");
    const [pages, setPages] = useState([
        "<h1>Modernism in Late 20th Century Architecture</h1><p>The late 20th century saw a shift from the rigid functionalism of early modernism to something more expressive...</p>"
    ]);
    const [activePageIndex, setActivePageIndex] = useState(0);
    const [isSaved, setIsSaved] = useState(true);

    // Layout State
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);
    const [isPageSidebarOpen, setIsPageSidebarOpen] = useState(true);

    // Style State
    const [paperStyle, setPaperStyle] = useState("ruled");
    const [fontFamily, setFontFamily] = useState("sans");
    const [fontSize, setFontSize] = useState(18);
    const [lineSpacing, setLineSpacing] = useState(32);
    const [textColor, setTextColor] = useState("#1e293b");
    const [paperColor, setPaperColor] = useState("#ffffff");
    const [lineColor, setLineColor] = useState("#cbd5e1");
    const [recentColors, setRecentColors] = useState(["#ffffff", "#FDFBF7", "#F0FDF4", "#F0F9FF", "#A78BFA", "#F472B6"]);

    // Ref to the currently active page's contentEditable div
    const activeEditorRef = useRef(null);
    // When true, the next activePageIndex change should place cursor at END (backspace nav)
    const pendingFocusEndRef = useRef(false);

    // After navigating back via backspace, move cursor to end of the previous page.
    // This runs after NotePage's auto-focus effect (child effects run before parent),
    // so it safely overrides the "cursor at start" default.
    useEffect(() => {
        if (!pendingFocusEndRef.current) return;
        pendingFocusEndRef.current = false;
        if (!activeEditorRef.current) return;

        activeEditorRef.current.focus();
        try {
            const range = document.createRange();
            range.selectNodeContents(activeEditorRef.current);
            range.collapse(false); // false = end
            const sel = window.getSelection();
            if (sel) { sel.removeAllRanges(); sel.addRange(range); }
        } catch (_) {}
    }, [activePageIndex]);

    // Per-page guard — prevents the same page from double-firing overflow,
    // while still allowing cascading overflow across multiple pages.
    const overflowGuardRef = useRef(new Set());

    const addRecentColor = (color) => {
        if (!color) return;
        setRecentColors(prev => {
            const filtered = prev.filter(c => c.toLowerCase() !== color.toLowerCase());
            return [color, ...filtered].slice(0, 6);
        });
    };

    const [activeToolbarState, setActiveToolbarState] = useState({
        bold: false,
        italic: false,
        underline: false,
        heading: 'p',
        align: 'left',
        list: null
    });

    // Track selection changes to update toolbar state
    useEffect(() => {
        const rgbToHex = (rgb) => {
            if (!rgb) return "#000000";
            if (rgb.startsWith("#")) return rgb;
            const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            if (!match) return "#000000";
            return "#" + [match[1], match[2], match[3]]
                .map(n => parseInt(n).toString(16).padStart(2, '0'))
                .join('').toUpperCase();
        };

        const handleSelectionChange = () => {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            const range = selection.getRangeAt(0);
            const pagesContainer = document.querySelector('.note-pages-container');
            if (pagesContainer && !pagesContainer.contains(range.commonAncestorContainer)) return;

            const getAlignment = () => {
                if (document.queryCommandState('justifyCenter')) return 'center';
                if (document.queryCommandState('justifyRight')) return 'right';
                if (document.queryCommandState('justifyFull')) return 'justify';
                return 'left';
            };

            const getHeadingState = () => {
                const block = document.queryCommandValue('formatBlock');
                if (['h1', 'h2', 'h3'].includes(block)) return block;
                return 'p';
            };

            setActiveToolbarState({
                bold: document.queryCommandState('bold'),
                italic: document.queryCommandState('italic'),
                underline: document.queryCommandState('underline'),
                heading: getHeadingState(),
                align: getAlignment(),
                foreColor: rgbToHex(document.queryCommandValue('foreColor')),
                hiliteColor: rgbToHex(document.queryCommandValue('hiliteColor') || document.queryCommandValue('backColor')),
                list: document.queryCommandState('insertUnorderedList') ? 'ul'
                    : document.queryCommandState('insertOrderedList') ? 'ol' : null
            });
        };

        document.addEventListener('selectionchange', handleSelectionChange);
        return () => document.removeEventListener('selectionchange', handleSelectionChange);
    }, []);

    // Autosave simulation
    useEffect(() => {
        setIsSaved(false);
        const timer = setTimeout(() => setIsSaved(true), 1500);
        return () => clearTimeout(timer);
    }, [title, pages, fontSize, lineSpacing, textColor, paperColor, lineColor, paperStyle, fontFamily]);

    // Formatting commands — always operate on the currently focused contentEditable
    const handleCommand = useCallback((command, value = null) => {
        // Make sure focus is in the editor
        if (activeEditorRef.current) {
            activeEditorRef.current.focus();
        }

        document.execCommand('styleWithCSS', false, true);

        if (command === 'createLink') {
            if (!value) return;
            document.execCommand(command, false, value);
        } else {
            document.execCommand(command, false, value);
        }

        // Sync changes back to state
        if (activeEditorRef.current) {
            const newPages = [...pages];
            newPages[activePageIndex] = activeEditorRef.current.innerHTML;
            setPages(newPages);
        }
    }, [pages, activePageIndex]);

    // Handle overflow: split content moves to the next page (or a new page).
    // The per-page Set guard prevents the same page from double-firing while
    // still allowing cascading: page 1 → page 2 → page 3, etc.
    const handlePageOverflow = useCallback((index, overflowContent = "") => {
        if (overflowGuardRef.current.has(index)) return;

        overflowGuardRef.current.add(index);
        setPages(prev => {
            const newPages = [...prev];
            if (index >= newPages.length - 1) {
                newPages.push(overflowContent);
            } else {
                newPages[index + 1] = overflowContent + (newPages[index + 1] || '');
            }
            return newPages;
        });
        setActivePageIndex(index + 1);

        setTimeout(() => { overflowGuardRef.current.delete(index); }, 300);
    }, []);

    const handleNoteKeyDown = useCallback((e, index) => {
        if (e.key !== 'Backspace' || index === 0) return;

        const selection = window.getSelection();
        if (!selection || !selection.rangeCount || !selection.isCollapsed) return;

        const range = selection.getRangeAt(0);
        const editorEl = e.currentTarget; // the contentEditable div

        // Build a range from the very start of this page to the cursor.
        // Only if that range is collapsed (nothing before the cursor) should
        // we jump to the previous page — otherwise let normal backspace handle it.
        try {
            const preRange = document.createRange();
            preRange.setStart(editorEl, 0);
            preRange.setEnd(range.startContainer, range.startOffset);
            if (preRange.collapsed) {
                e.preventDefault();
                pendingFocusEndRef.current = true;
                setActivePageIndex(index - 1);
            }
        } catch (_) { /* cross-boundary edge case — do nothing */ }
    }, []);

    const handleAddPage = () => {
        setPages(prev => [...prev, ""]);
        setActivePageIndex(pages.length);
    };

    const handleRemovePage = (index) => {
        if (pages.length <= 1) return;
        setPages(prev => {
            const newPages = prev.filter((_, i) => i !== index);
            return newPages;
        });
        setActivePageIndex(prev => Math.min(prev, pages.length - 2));
    };

    const handleExport = async (format) => {
        try {
            if (format === 'pdf') {
                const pageElems = document.querySelectorAll('.note-page-paper');
                const pageWidth = 816;
                const pageHeight = 1056;
                const pdf = new jsPDF('p', 'px', [pageWidth, pageHeight]);

                for (let i = 0; i < pageElems.length; i++) {
                    const canvas = await htmlToImage.toCanvas(pageElems[i], {
                        width: pageWidth,
                        height: pageHeight,
                        pixelRatio: 2
                    });
                    if (i > 0) pdf.addPage();
                    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pageWidth, pageHeight);
                }
                pdf.save(`${title.replace(/\s+/g, '-').toLowerCase()}.pdf`);
            } else if (format === 'png') {
                const container = document.querySelector('.note-pages-container');
                if (!container) return;
                const dataUrl = await htmlToImage.toPng(container, { quality: 1.0, pixelRatio: 2 });
                const link = document.createElement('a');
                link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.png`;
                link.href = dataUrl;
                link.click();
            }
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export. Please try again.');
        }
    };

    return (
        <div className="flex flex-col flex-1 h-screen overflow-hidden bg-white border-l border-slate-200 lg:ml-64 pt-16 lg:pt-0">
            <NoteHeader
                title={title} onTitleChange={setTitle} isSaved={isSaved}
                onExportPDF={() => handleExport('pdf')}
                onExportImage={() => handleExport('png')}
                onCopy={() => alert('Copied!')}
                onShare={() => alert('Shared!')}
                onToggleAI={() => setIsAISidebarOpen(!isAISidebarOpen)}
                isAIOpen={isAISidebarOpen}
            />

            <div className="flex flex-1 overflow-hidden relative">
                <NoteToolbar
                    onAction={handleCommand}
                    activeState={activeToolbarState}
                    recentColors={recentColors}
                    onAddRecentColor={addRecentColor}
                />

                <div className="flex-1 overflow-hidden flex" style={{ position: 'relative' }}>
                    <div className="note-pages-container flex-1 overflow-hidden flex">
                        <NoteEditor
                            ref={activeEditorRef}
                            pages={pages}
                            onContentChange={(index, content) => {
                                setPages(prev => {
                                    const newPages = [...prev];
                                    newPages[index] = content;
                                    return newPages;
                                });
                            }}
                            paperStyle={paperStyle}
                            fontFamily={fontFamily}
                            fontSize={fontSize}
                            lineSpacing={lineSpacing}
                            textColor={textColor}
                            paperColor={paperColor}
                            lineColor={lineColor}
                            activePageIndex={activePageIndex}
                            setActivePageIndex={setActivePageIndex}
                            onPageOverflow={handlePageOverflow}
                            onKeyDown={handleNoteKeyDown}
                        />
                    </div>

                    {isPageSidebarOpen && (
                        <NotePageSidebar
                            pages={pages}
                            activePageIndex={activePageIndex}
                            onAddPage={handleAddPage}
                            onRemovePage={handleRemovePage}
                            onSelectPage={setActivePageIndex}
                            onCollapse={() => setIsPageSidebarOpen(false)}
                        />
                    )}

                    {!isPageSidebarOpen && (
                        <button
                            onClick={() => setIsPageSidebarOpen(true)}
                            className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-20 bg-white border border-slate-200 rounded-l-xl flex items-center justify-center hover:bg-slate-50 transition-colors z-20"
                        >
                            <span className="material-icons-round text-slate-400">chevron_left</span>
                        </button>
                    )}
                </div>

                {isAISidebarOpen && <NoteAISidebar />}

                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="fixed bottom-10 right-10 z-50 w-12 h-12 bg-white border-2 border-primary text-primary rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                >
                    <span className="material-icons-round">settings</span>
                </button>

                <NoteSettingsSidebar
                    isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}
                    paperStyle={paperStyle} setPaperStyle={setPaperStyle}
                    fontFamily={fontFamily} setFontFamily={setFontFamily}
                    fontSize={fontSize} setFontSize={setFontSize}
                    lineSpacing={lineSpacing} setLineSpacing={setLineSpacing}
                    textColor={textColor} setTextColor={setTextColor}
                    paperColor={paperColor} setPaperColor={setPaperColor}
                    lineColor={lineColor} setLineColor={setLineColor}
                    recentColors={recentColors} onAddRecentColor={addRecentColor}
                />
            </div>
        </div>
    );
};