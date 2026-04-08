import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NoteHeader } from "./NoteHeader";
import { NoteToolbar } from "./NoteToolbar";
import { NoteEditor } from "./NoteEditor";
import { NoteAISidebar } from "./NoteAISidebar";
import { NoteSettingsSidebar } from "./NoteSettingsSidebar";
import { NotePageSidebar } from "./NotePageSidebar";
import * as htmlToImage from 'html-to-image';
import { jsPDF } from "jspdf";
import JSZip from 'jszip';
import { useNoteSync } from "../../hooks/useNoteSync";
import { useUndoHistory } from "../../hooks/useUndoHistory";
import { deserializeNote } from "../../api/noteService";
import { NoteVersionSidebar } from "./NoteVersionSidebar";

export const Note = () => {
    const { id: routeId } = useParams();
    const navigate = useNavigate();

    // Note Data
    const [noteId, setNoteId] = useState(routeId ?? null);
    const [title, setTitle] = useState("Untitled Note");
    const [pages, setPages] = useState([""]);
    const [activePageIndex, setActivePageIndex] = useState(0);

    // Layout State
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);
    const [isVersionSidebarOpen, setIsVersionSidebarOpen] = useState(false);
    const [isPageSidebarOpen, setIsPageSidebarOpen] = useState(true);

    // Draw Mode
    const [drawMode, setDrawMode] = useState({ active: false, color: '#1e293b', thickness: 4, eraser: false });
    const [drawingData, setDrawingData] = useState([""]); // data URL per page, "" = blank

    // Style State
    const [paperStyle, setPaperStyle] = useState("ruled");
    const [fontFamily, setFontFamily] = useState("sans");
    const [fontSize, setFontSize] = useState(18);
    const [lineSpacing, setLineSpacing] = useState(32);
    const [textColor, setTextColor] = useState("#1e293b");
    const [paperColor, setPaperColor] = useState("#ffffff");
    const [lineColor, setLineColor] = useState("#cbd5e1");
    const [recentColors, setRecentColors] = useState(["#ffffff", "#FDFBF7", "#F0FDF4", "#F0F9FF", "#A78BFA", "#F472B6"]);

    // ── Undo / Redo refs (functions assigned after markDirty is available) ───
    const { push: historyPush, undo: historyUndo, redo: historyRedo, canUndo, canRedo } = useUndoHistory();
    const isHistoryApplyingRef = useRef(false);
    const contentSessionRef    = useRef(false);
    const contentIdleTimerRef  = useRef(null);
    const handleUndoRef        = useRef(null);
    const handleRedoRef        = useRef(null);
    // ─────────────────────────────────────────────────────────────────────────

    // Ref to the currently active page's contentEditable div
    const activeEditorRef = useRef(null);
    // Live refs to each page's wrapper DOM node (used for export)
    const pageRefsRef = useRef([]);
    // When true, the next activePageIndex change should place cursor at END (backspace nav)
    const pendingFocusEndRef = useRef(false);

    // Ctrl+S — instant save (forceFlush is stable, defined after useNoteSync below,
    // so we use a ref to avoid a stale closure here)
    const forceFlushRef = useRef(null);
    useEffect(() => {
        const handler = (e) => {
            if (!(e.ctrlKey || e.metaKey)) return;
            if (e.key === 's') { e.preventDefault(); forceFlushRef.current?.(); return; }
            // Undo/redo outside contentEditable — inside the editor the browser handles native text undo
            if (document.activeElement?.isContentEditable) return;
            if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); handleUndoRef.current?.(); }
            if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); handleRedoRef.current?.(); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

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

            setActiveToolbarState(prev => ({
                bold: document.queryCommandState('bold'),
                italic: document.queryCommandState('italic'),
                underline: document.queryCommandState('underline'),
                heading: getHeadingState(),
                align: getAlignment(),
                foreColor: rgbToHex(document.queryCommandValue('foreColor')),
                hiliteColor: rgbToHex(document.queryCommandValue('hiliteColor') || document.queryCommandValue('backColor')),
                list: document.queryCommandState('insertUnorderedList') ? 'ul'
                    : document.queryCommandState('insertOrderedList') ? 'ol' : null,
                drawMode: prev.drawMode, // preserve draw mode across selection changes
            }));
        };

        document.addEventListener('selectionchange', handleSelectionChange);
        return () => document.removeEventListener('selectionchange', handleSelectionChange);
    }, []);

    // Keep drawMode reflected in activeToolbarState so the toolbar reads it
    useEffect(() => {
        setActiveToolbarState(prev => ({ ...prev, drawMode }));
    }, [drawMode]);

    // Grow/shrink drawingData array in sync with pages
    useEffect(() => {
        setDrawingData(prev => {
            if (prev.length === pages.length) return prev;
            if (prev.length < pages.length) return [...prev, ...Array(pages.length - prev.length).fill("")];
            return prev.slice(0, pages.length);
        });
    }, [pages.length]);

    // ── Note sync ──────────────────────────────────────────────────────────────
    // getState is a stable ref — always returns the latest state without
    // being a useCallback dependency (avoids stale closure on the hook).
    const latestStateRef = useRef({});
    latestStateRef.current = {
        title, pages, fontSize, lineSpacing, drawingData,
        paperStyle, paperColor, lineColor, textColor, fontFamily,
    };
    const getState = useCallback(() => latestStateRef.current, []);

    const { saveStatus, markDirty, forceFlush, loadNote } = useNoteSync(
        getState,
        noteId,
        (id) => {
            setNoteId(id);
            // Update URL to /lockedin/notes/:id without a page reload
            navigate(`/lockedin/notes/${id}`, { replace: true });
        }
    );

    // Keep the Ctrl+S handler in sync with the latest forceFlush
    forceFlushRef.current = forceFlush;

    // ── Undo / Redo implementation (markDirty now available) ─────────────────

    // Restore a full state snapshot (undo, redo, or version revert)
    const applySnapshot = useCallback((snapshot) => {
        if (!snapshot) return;
        isHistoryApplyingRef.current = true;
        setTitle(snapshot.title);
        setPages(snapshot.pages);
        setFontSize(snapshot.fontSize);
        setLineSpacing(snapshot.lineSpacing);
        setDrawingData(snapshot.drawingData);
        setPaperStyle(snapshot.paperStyle);
        setPaperColor(snapshot.paperColor);
        setLineColor(snapshot.lineColor);
        setTextColor(snapshot.textColor);
        setFontFamily(snapshot.fontFamily);
        isHistoryApplyingRef.current = false;
        markDirty(['title','content','paperStyle','paperColor','lineColor','textColor','fontFamily','fontSize','lineSpacing','drawingData']);
    }, [markDirty]);

    // Push snapshot BEFORE a discrete action (style/title/page-ops)
    const pushNow = useCallback(() => {
        if (isHistoryApplyingRef.current) return;
        historyPush({ ...latestStateRef.current });
    }, [historyPush]);

    // Debounced push for continuous input (typing, drawing) — records once per edit session
    const pushBeforeContent = useCallback(() => {
        if (isHistoryApplyingRef.current) return;
        if (!contentSessionRef.current) {
            contentSessionRef.current = true;
            historyPush({ ...latestStateRef.current });
        }
        clearTimeout(contentIdleTimerRef.current);
        contentIdleTimerRef.current = setTimeout(() => { contentSessionRef.current = false; }, 800);
    }, [historyPush]);

    // Assign to stable refs every render so the keyboard listener always calls the latest closures
    handleUndoRef.current = () => applySnapshot(historyUndo({ ...latestStateRef.current }));
    handleRedoRef.current = () => applySnapshot(historyRedo({ ...latestStateRef.current }));

    // ─────────────────────────────────────────────────────────────────────────

    // Load existing note on mount
    useEffect(() => {
        if (!noteId) return;
        loadNote(noteId, (serverNote) => {
            const s = deserializeNote(serverNote);
            setTitle(s.title);
            setPages(s.pages);
            setFontSize(s.fontSize);
            setLineSpacing(s.lineSpacing);
            setDrawingData(s.drawingData);
            setPaperStyle(s.paperStyle);
            setPaperColor(s.paperColor);
            setLineColor(s.lineColor);
            setTextColor(s.textColor);
            setFontFamily(s.fontFamily);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Formatting commands — also handles draw mode commands
    const handleCommand = useCallback((command, value = null) => {
        // Draw mode commands
        if (command === 'drawToggle') {
            setDrawMode(prev => ({ ...prev, active: !prev.active }));
            return;
        }
        if (command === 'drawColor') {
            setDrawMode(prev => ({ ...prev, color: value }));
            return;
        }
        if (command === 'drawThickness') {
            setDrawMode(prev => ({ ...prev, thickness: value }));
            return;
        }
        if (command === 'drawEraser') {
            setDrawMode(prev => ({ ...prev, eraser: value }));
            return;
        }

        // Standard formatting — needs editor focus
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
        if (activeEditorRef.current) {
            const newPages = [...pages];
            newPages[activePageIndex] = activeEditorRef.current.innerHTML;
            setPages(newPages);
            markDirty('content');
        }
    }, [pages, activePageIndex, markDirty]);

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
        markDirty('content');

        setTimeout(() => { overflowGuardRef.current.delete(index); }, 300);
    }, [markDirty]);

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

                // If this page has no meaningful content, remove it entirely
                const isEmpty = editorEl.textContent.trim() === '';
                if (isEmpty) {
                    setPages(prev => prev.filter((_, i) => i !== index));
                    markDirty('content');
                }
                setActivePageIndex(index - 1);
            }
        } catch (_) { /* cross-boundary edge case — do nothing */ }
    }, []);

    const handleAddPage = () => {
        setPages(prev => [...prev, ""]);
        setActivePageIndex(pages.length);
        markDirty('content');
    };

    const handleRemovePage = (index) => {
        if (pages.length <= 1) return;
        setPages(prev => prev.filter((_, i) => i !== index));
        setActivePageIndex(prev => Math.min(prev, pages.length - 2));
        markDirty('content');
    };

    const slug = () => title.replace(/\s+/g, '-').toLowerCase() || 'note';

    const capturePages = async () => {
        const refs = pageRefsRef.current.filter(Boolean);
        const canvases = [];
        for (const el of refs) {
            // Temporarily make the page's inner contentEditable visible at full scroll height
            const canvas = await htmlToImage.toCanvas(el, { pixelRatio: 2, useCORS: true });
            canvases.push(canvas);
        }
        return canvases;
    };

    const handleExport = async (format) => {
        try {
            const canvases = await capturePages();
            if (!canvases.length) return;

            const PAGE_W = 816;
            const PAGE_H = 1056;
            const MARGIN = 40; // left/right margin in PDF

            if (format === 'pdf') {
                const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [PAGE_W, PAGE_H] });
                for (let i = 0; i < canvases.length; i++) {
                    if (i > 0) pdf.addPage();
                    // Draw image with margin on left/right
                    pdf.addImage(
                        canvases[i].toDataURL('image/png'),
                        'PNG',
                        MARGIN,           // x — left margin
                        0,                // y — no top margin (paper already has it)
                        PAGE_W - MARGIN * 2, // width shrunk by margins
                        PAGE_H            // height fills page
                    );
                }
                pdf.save(`${slug()}.pdf`);

            } else if (format === 'png') {
                if (canvases.length === 1) {
                    // Single page — direct download
                    const link = document.createElement('a');
                    link.download = `${slug()}.png`;
                    link.href = canvases[0].toDataURL('image/png');
                    link.click();
                } else {
                    // Multiple pages — zip them
                    const zip = new JSZip();
                    const folder = zip.folder(slug());
                    canvases.forEach((c, i) => {
                        const base64 = c.toDataURL('image/png').split(',')[1];
                        folder.file(`page-${i + 1}.png`, base64, { base64: true });
                    });
                    const blob = await zip.generateAsync({ type: 'blob' });
                    const link = document.createElement('a');
                    link.download = `${slug()}.zip`;
                    link.href = URL.createObjectURL(blob);
                    link.click();
                    setTimeout(() => URL.revokeObjectURL(link.href), 10000);
                }
            }
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        }
    };

    return (
        <div className="flex flex-col flex-1 h-screen overflow-hidden bg-white border-l border-slate-200 lg:ml-64 pt-16 lg:pt-0">
            <NoteHeader
                title={title}
                onTitleChange={(v) => { pushNow(); setTitle(v); markDirty('title'); }}
                saveStatus={saveStatus}
                onSave={forceFlush}
                onExportPDF={async () => { await forceFlush(); handleExport('pdf'); }}
                onExportImage={async () => { await forceFlush(); handleExport('png'); }}
                onCopy={() => alert('Copied!')}
                onShare={() => alert('Shared!')}
                onToggleAI={() => setIsAISidebarOpen(!isAISidebarOpen)}
                isAIOpen={isAISidebarOpen}
                onToggleHistory={() => setIsVersionSidebarOpen(v => !v)}
                isHistoryOpen={isVersionSidebarOpen}
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={() => handleUndoRef.current?.()}
                onRedo={() => handleRedoRef.current?.()}
            />

            <div className="flex flex-1 overflow-hidden relative">
                <NoteToolbar
                    onAction={handleCommand}
                    activeState={activeToolbarState}
                    recentColors={recentColors}
                    onAddRecentColor={addRecentColor}
                    onImageUpload={(url) => {
                        if (activeEditorRef.current) activeEditorRef.current.focus();
                        const img = `<img src="${url}" style="max-width:100%;height:auto;display:inline-block;" data-resizable="true" />`;
                        document.execCommand('insertHTML', false, img);
                        if (activeEditorRef.current) {
                            const newPages = [...pages];
                            newPages[activePageIndex] = activeEditorRef.current.innerHTML;
                            setPages(newPages);
                            markDirty('content');
                        }
                    }}
                />

                <div className="flex-1 overflow-hidden flex" style={{ position: 'relative' }}>
                    <div className="note-pages-container flex-1 overflow-hidden flex">
                        <NoteEditor
                            ref={activeEditorRef}
                            pages={pages}
                            onContentChange={(index, content) => {
                                pushBeforeContent();
                                setPages(prev => {
                                    const newPages = [...prev];
                                    newPages[index] = content;
                                    return newPages;
                                });
                                markDirty('content');
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
                            onPageRefsReady={(refs) => { pageRefsRef.current = refs; }}
                            drawMode={drawMode}
                            drawingData={drawingData}
                            onDrawingChange={(index, dataUrl) => {
                                pushBeforeContent();
                                setDrawingData(prev => {
                                    const next = [...prev];
                                    next[index] = dataUrl;
                                    return next;
                                });
                                markDirty('drawingData');
                            }}
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

                {isVersionSidebarOpen && (
                    <NoteVersionSidebar
                        noteId={noteId}
                        onClose={() => setIsVersionSidebarOpen(false)}
                        paperStyle={paperStyle}
                        paperColor={paperColor}
                        lineColor={lineColor}
                        textColor={textColor}
                        fontFamily={fontFamily}
                        onRevert={(revertedNote) => {
                            const s = deserializeNote(revertedNote);
                            setTitle(s.title);
                            setPages(s.pages);
                            setFontSize(s.fontSize);
                            setLineSpacing(s.lineSpacing);
                            setDrawingData(s.drawingData);
                            setPaperStyle(s.paperStyle);
                            setPaperColor(s.paperColor);
                            setLineColor(s.lineColor);
                            setTextColor(s.textColor);
                            setFontFamily(s.fontFamily);
                        }}
                    />
                )}

                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="fixed bottom-10 right-10 z-50 w-12 h-12 bg-white border-2 border-primary text-primary rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                >
                    <span className="material-icons-round">settings</span>
                </button>

                <NoteSettingsSidebar
                    isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}
                    paperStyle={paperStyle} setPaperStyle={(v) => { pushNow(); setPaperStyle(v); markDirty('paperStyle'); }}
                    fontFamily={fontFamily} setFontFamily={(v) => { pushNow(); setFontFamily(v); markDirty('fontFamily'); }}
                    fontSize={fontSize} setFontSize={(v) => { pushNow(); setFontSize(v); markDirty('fontSize'); }}
                    lineSpacing={lineSpacing} setLineSpacing={(v) => { pushNow(); setLineSpacing(v); markDirty('lineSpacing'); }}
                    textColor={textColor} setTextColor={(v) => { pushNow(); setTextColor(v); markDirty('textColor'); }}
                    paperColor={paperColor} setPaperColor={(v) => { pushNow(); setPaperColor(v); markDirty('paperColor'); }}
                    lineColor={lineColor} setLineColor={(v) => { pushNow(); setLineColor(v); markDirty('lineColor'); }}
                    recentColors={recentColors} onAddRecentColor={addRecentColor}
                />
            </div>
        </div>
    );
};