import React, { useState, useEffect, useRef, useCallback } from "react";
import Loader from '../globals/Loader';
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
// useSearchParams is used below to read ?folder= on new-note creation
import { NoteHeader } from "./NoteHeader";
import { NoteToolbar } from "./NoteToolbar";
import { NoteEditor } from "./NoteEditor";
import { NoteAISidebar } from "./NoteAISidebar";
import { useExpandTopicChannel } from "../../hooks/useExpandTopicChannel";
import { useSimplifyTopicChannel } from "../../hooks/useSimplifyTopicChannel";
import { NoteSettingsSidebar } from "./NoteSettingsSidebar";
import { NotePageSidebar } from "./NotePageSidebar";
import * as htmlToImage from 'html-to-image';
import { jsPDF } from "jspdf";
import JSZip from 'jszip';
import { useNoteSync } from "../../hooks/useNoteSync";
import { useUndoHistory } from "../../hooks/useUndoHistory";
import { deserializeNote, noteService } from "../../api/noteService";
import { workspaceCache } from "../../api/workspaceCache";
import { NoteVersionSidebar } from "./NoteVersionSidebar";
import ShakespeareModal from "./ShakespeareModal";
import YouTubeTranscriptModal from "./YouTubeTranscriptModal";

// ── Markdown → HTML converter for Shakespeare inserts ──────────────────────
function inlineFormat(text) {
    return text
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/_(.+?)_/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>');
}

function markdownToHtml(md) {
    const lines = md.split('\n');
    const out = [];
    let inUl = false, inOl = false;

    const closeList = () => {
        if (inUl) { out.push('</ul>'); inUl = false; }
        if (inOl) { out.push('</ol>'); inOl = false; }
    };

    for (const raw of lines) {
        const line = raw.trimEnd();
        if (/^### /.test(line))       { closeList(); out.push(`<h3>${inlineFormat(line.slice(4))}</h3>`); }
        else if (/^## /.test(line))   { closeList(); out.push(`<h2>${inlineFormat(line.slice(3))}</h2>`); }
        else if (/^# /.test(line))    { closeList(); out.push(`<h1>${inlineFormat(line.slice(2))}</h1>`); }
        else if (/^[-*] /.test(line)) {
            if (!inUl) { closeList(); out.push('<ul>'); inUl = true; }
            out.push(`<li>${inlineFormat(line.slice(2))}</li>`);
        } else if (/^\d+\. /.test(line)) {
            if (!inOl) { closeList(); out.push('<ol>'); inOl = true; }
            out.push(`<li>${inlineFormat(line.replace(/^\d+\. /, ''))}</li>`);
        } else if (/^-{3,}$/.test(line.trim())) {
            closeList(); out.push('<hr>');
        } else if (line.trim() === '') {
            closeList(); out.push('<br>');
        } else {
            closeList(); out.push(`<div>${inlineFormat(line)}</div>`);
        }
    }
    closeList();
    return out.join('');
}

export const Note = () => {
    const { id: routeId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();

    // Note Data
    const [noteId, setNoteId] = useState(routeId ?? null);
    const [isAIGenerating, setIsAIGenerating] = useState(false);
    // folderId — set from ?folder= query param on new notes, or from loaded note
    const [folderId, setFolderId] = useState(() => searchParams.get('folder') ?? null);
    const [folder, setFolder]     = useState(null);
    const [title, setTitle] = useState("Untitled Note");
    const [pages, setPages] = useState(() => {
        const voiceText = location.state?.voiceText;
        if (!voiceText) return [""];
        // Convert plain text lines into div-per-line HTML so the editor renders it correctly
        const html = voiceText
            .split('\n')
            .map(line => line.trim() ? `<div>${line}</div>` : '<div><br></div>')
            .join('');
        return [html];
    });
    const [activePageIndex, setActivePageIndex] = useState(0);
    // Always-current ref so callbacks with stale closures (e.g. voice handler) can
    // read the latest active page index without capturing a stale closure value.
    const activePageIndexRef = useRef(0);
    const [isRecording, setIsRecording] = useState(false);

    // Layout State
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);
    const [isShakespeareOpen, setIsShakespeareOpen] = useState(false);
    const [isYouTubeOpen, setIsYouTubeOpen] = useState(false);
    const savedRangeRef = useRef(null); // saved cursor position before AI sidebar steals focus
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
        folderId,
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

    // On a new note with ?folder=, mark folderId dirty so it's sent on first save
    useEffect(() => {
        if (!noteId && folderId) markDirty('folderId');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Load existing note on mount
    useEffect(() => {
        if (!noteId) return;
        let cancelled = false;
        loadNote(noteId, (data) => {
            if (cancelled) return;
            if (data.ai_generating) {
                setIsAIGenerating(true);
                setTitle(data.title ?? 'Untitled Note');
                return;
            }
            // data is either a raw server response (has .content JSON string)
            // or a localStorage draft (already has .pages array directly).
            const s = Array.isArray(data.pages) ? data : deserializeNote(data);
            setTitle(s.title);
            setPages(s.pages);
            setFontSize(s.fontSize);
            setLineSpacing(s.lineSpacing);
            setDrawingData(s.drawingData);
            setPaperStyle(s.paperStyle ?? 'ruled');
            setPaperColor(s.paperColor ?? '#ffffff');
            setLineColor(s.lineColor ?? '#cbd5e1');
            setTextColor(s.textColor ?? '#1e293b');
            setFontFamily(s.fontFamily ?? 'sans');
            if (s.folderId) setFolderId(s.folderId);
            if (s.folder)   setFolder(s.folder);
        });
        return () => { cancelled = true; };
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
        activePageIndexRef.current = index + 1;
        setActivePageIndex(index + 1);
        pendingFocusEndRef.current = true; // place cursor at end of the new page
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

    const applyWatermark = (canvas) => {
        const ctx = canvas.getContext('2d');
        const ratio = 2;

        const smallSize = 13 * ratio;
        const largeSize = 20 * ratio;
        const lineGap = 8 * ratio;
        const paddingBottom = 28 * ratio;

        const cx = canvas.width / 2;
        const largeY = canvas.height - paddingBottom;
        const smallY = largeY - largeSize - lineGap;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';

        ctx.font = `300 ${smallSize}px 'DM Sans', sans-serif`;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillText('Written with', cx, smallY);

        ctx.font = `500 ${largeSize}px 'DM Sans', sans-serif`;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.fillText('Notepaper-ai.com', cx, largeY);
    };

    const capturePages = async () => {
        const refs = pageRefsRef.current.filter(Boolean);
        const canvases = [];
        for (const el of refs) {
            // Temporarily make the page's inner contentEditable visible at full scroll height
            const canvas = await htmlToImage.toCanvas(el, { pixelRatio: 2, useCORS: true });
            applyWatermark(canvas);
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

    const expandRetryTimerRef = useRef(null);

    useExpandTopicChannel(isAIGenerating ? noteId : null, () => {
        clearTimeout(expandRetryTimerRef.current);
        const applyExpanded = (serverNote) => {
            const s = Array.isArray(serverNote.pages) ? serverNote : deserializeNote(serverNote);
            // If content is empty the backend hasn't committed yet — retry up to 5×
            if (!s.pages.some(p => p?.trim()) && (applyExpanded._attempts = (applyExpanded._attempts ?? 0) + 1) <= 5) {
                expandRetryTimerRef.current = setTimeout(() => loadNote(noteId, applyExpanded), 2000);
                return;
            }
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
            if (s.folderId) setFolderId(s.folderId);
            if (s.folder)   setFolder(s.folder);
            setIsAIGenerating(false);
        };
        loadNote(noteId, applyExpanded);
    });

    useSimplifyTopicChannel(isAIGenerating ? noteId : null, () => {
        clearTimeout(expandRetryTimerRef.current);
        const applySimplified = (serverNote) => {
            const s = Array.isArray(serverNote.pages) ? serverNote : deserializeNote(serverNote);
            if (!s.pages.some(p => p?.trim()) && (applySimplified._attempts = (applySimplified._attempts ?? 0) + 1) <= 5) {
                expandRetryTimerRef.current = setTimeout(() => loadNote(noteId, applySimplified), 2000);
                return;
            }
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
            if (s.folderId) setFolderId(s.folderId);
            if (s.folder)   setFolder(s.folder);
            setIsAIGenerating(false);
        };
        loadNote(noteId, applySimplified);
    });

    // Polling fallback: catches cases where ExpandTopicReady/SimplifyTopicReady fired before
    // this tab subscribed (tab opened after the event was broadcast) — resolves spinner-forever.
    useEffect(() => {
        if (!isAIGenerating || !noteId) return;
        const timer = setInterval(async () => {
            try {
                const res = await noteService.get(noteId);
                const serverNote = res.data;
                if (!serverNote.ai_generating && serverNote.content) {
                    clearInterval(timer);
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
                    if (s.folderId) setFolderId(s.folderId);
                    if (s.folder)   setFolder(s.folder);
                    setIsAIGenerating(false);
                }
            } catch { /* ignore poll errors */ }
        }, 5000);
        return () => { clearInterval(timer); clearTimeout(expandRetryTimerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAIGenerating]);

    return (
        <div className="flex flex-col flex-1 h-screen overflow-hidden bg-white border-l border-slate-200 lg:ml-64 pt-16 lg:pt-0">
            {isAIGenerating && (
                <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="material-icons-round text-primary text-[26px]">description</span>
                        </div>
                    </div>
                    <div className="text-center max-w-xs">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Schola is writing…</h3>
                        <p className="text-sm text-slate-500">Schola is preparing your note in the background — the page will update automatically when it's ready.</p>
                    </div>
                </div>
            )}
            <NoteHeader
                title={title}
                onTitleChange={(v) => { pushNow(); setTitle(v); markDirty('title'); }}
                saveStatus={saveStatus}
                onSave={forceFlush}
                folderId={folderId}
                onExportPDF={async () => { await forceFlush(); handleExport('pdf'); }}
                onExportImage={async () => { await forceFlush(); handleExport('png'); }}
                onCopy={async () => {
                    if (!noteId) return;
                    try {
                        const res = await noteService.duplicate(noteId);
                        const newId = res.data?.id;
                        if (newId) {
                            workspaceCache.invalidateNotes();
                            window.open(`/lockedin/notes/${newId}`, '_blank');
                        }
                    } catch {
                        // silent
                    }
                }}
                onShare={() => alert('Shared!')}
                onToggleAI={() => {
                    if (!isAISidebarOpen) {
                        // Save cursor before focus leaves the editor
                        const sel = window.getSelection();
                        savedRangeRef.current = sel && sel.rangeCount > 0 ? sel.getRangeAt(0).cloneRange() : null;
                        setIsVersionSidebarOpen(false); // close version sidebar if open
                    }
                    setIsAISidebarOpen(v => !v);
                }}
                isAIOpen={isAISidebarOpen}
                onToggleHistory={() => {
                    if (!isVersionSidebarOpen) {
                        setIsAISidebarOpen(false); // close AI sidebar if open
                    }
                    setIsVersionSidebarOpen(v => !v);
                }}
                isHistoryOpen={isVersionSidebarOpen}
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={() => handleUndoRef.current?.()}
                onRedo={() => handleRedoRef.current?.()}
                onVoiceResult={(transcript) => {
                    const sentences = transcript
                        .split(/(?<=[.!?])\s+|(?<=,)\s+|\s{2,}/)
                        .flatMap(s => {
                            if (s.length <= 80) return [s];
                            const words = s.split(' ');
                            const chunks = [];
                            let chunk = '';
                            for (const w of words) {
                                if ((chunk + ' ' + w).length > 80) {
                                    if (chunk) chunks.push(chunk);
                                    chunk = w;
                                } else {
                                    chunk = chunk ? chunk + ' ' + w : w;
                                }
                            }
                            if (chunk) chunks.push(chunk);
                            return chunks;
                        })
                        .filter(Boolean);

                    // Insert all sentences at once so the built-in overflow cascade
                    // can distribute content across new pages. Inserting one-by-one
                    // in a synchronous loop races against React state updates and the
                    // overflow guard, causing text to pile up on a single page.
                    // Use activePageIndexRef (not the stale closure value) so that
                    // continued speech after an overflow targets the correct page.
                    const pageEls = document.querySelectorAll('[data-note-page]');
                    const activePage = pageEls[activePageIndexRef.current] ?? pageEls[pageEls.length - 1];
                    if (activePage) {
                        activePage.focus();
                        const sel = window.getSelection();
                        sel.removeAllRanges();
                        const r = document.createRange();
                        r.selectNodeContents(activePage);
                        r.collapse(false);
                        sel.addRange(r);
                        const html = sentences.map(s => `<div>${s}</div>`).join('');
                        document.execCommand('insertHTML', false, html);
                        activePage.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                    savedRangeRef.current = null;
                }}
                onVoiceStateChange={setIsRecording}
            />

            <div className="flex flex-1 overflow-hidden relative">
                <NoteToolbar
                    onAction={handleCommand}
                    activeState={activeToolbarState}
                    recentColors={recentColors}
                    onAddRecentColor={addRecentColor}
                    onOpenShakespeare={() => {
                        const sel = window.getSelection();
                        savedRangeRef.current = sel && sel.rangeCount > 0 ? sel.getRangeAt(0).cloneRange() : null;
                        setIsShakespeareOpen(true);
                    }}
                    onOpenYouTube={() => {
                        const sel = window.getSelection();
                        savedRangeRef.current = sel && sel.rangeCount > 0 ? sel.getRangeAt(0).cloneRange() : null;
                        setIsYouTubeOpen(true);
                    }}
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
                    {/* Loading overlay — blocks interaction while note data is being fetched */}
                    {saveStatus === 'loading' && (
                        <div style={{ position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'all', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(241,245,249,0.7)', backdropFilter: 'blur(2px)' }}>
                            <div className="flex flex-col items-center justify-center gap-3">
                                <Loader size="xl" />
            
                            </div>
                        </div>
                    )}
                    <div className="note-pages-container flex-1 overflow-hidden flex relative">
                        {/* Block all pointer interaction on the pages while voice recording */}
                        {isRecording && (
                            <div
                                style={{ position: 'absolute', inset: 0, zIndex: 50, cursor: 'not-allowed' }}
                            />
                        )}
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
                            readOnly={saveStatus === 'loading'}
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
                            className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-10 md:w-6 md:h-20 bg-white border border-slate-200 rounded-l-xl flex items-center justify-center hover:bg-slate-50 transition-colors z-20"
                        >
                            <span className="material-icons-round text-slate-400">chevron_left</span>
                        </button>
                    )}
                </div>

                {isAISidebarOpen && (
                    <NoteAISidebar noteId={noteId} noteTitle={title} />
                )}

                {isYouTubeOpen && (
                    <YouTubeTranscriptModal
                        onClose={() => setIsYouTubeOpen(false)}
                        onInsert={(text) => {
                            setIsYouTubeOpen(false);
                            const pageEls = document.querySelectorAll('[data-note-page]');
                            const activePage = pageEls[activePageIndex] ?? pageEls[pageEls.length - 1];
                            if (!activePage) return;

                            activePage.focus();
                            const sel = window.getSelection();
                            sel.removeAllRanges();
                            if (savedRangeRef.current) {
                                try {
                                    if (activePage.contains(savedRangeRef.current.startContainer)) {
                                        sel.addRange(savedRangeRef.current);
                                    } else { throw new Error('out'); }
                                } catch {
                                    const r = document.createRange();
                                    r.selectNodeContents(activePage);
                                    r.collapse(false);
                                    sel.addRange(r);
                                }
                            } else {
                                const r = document.createRange();
                                r.selectNodeContents(activePage);
                                r.collapse(false);
                                sel.addRange(r);
                            }

                            document.execCommand('insertText', false, text);
                            savedRangeRef.current = null;
                        }}
                    />
                )}

                {isShakespeareOpen && (
                    <ShakespeareModal
                        onClose={() => setIsShakespeareOpen(false)}
                        onInsert={(text) => {
                            setIsShakespeareOpen(false);
                            const pageEls = document.querySelectorAll('[data-note-page]');
                            const activePage = pageEls[activePageIndex] ?? pageEls[pageEls.length - 1];
                            if (!activePage) return;

                            activePage.focus();
                            const sel = window.getSelection();
                            sel.removeAllRanges();
                            if (savedRangeRef.current) {
                                try {
                                    if (activePage.contains(savedRangeRef.current.startContainer)) {
                                        sel.addRange(savedRangeRef.current);
                                    } else { throw new Error('out'); }
                                } catch {
                                    const r = document.createRange();
                                    r.selectNodeContents(activePage);
                                    r.collapse(false);
                                    sel.addRange(r);
                                }
                            } else {
                                const r = document.createRange();
                                r.selectNodeContents(activePage);
                                r.collapse(false);
                                sel.addRange(r);
                            }

                            // Convert markdown → HTML and insert; the input event
                            // that execCommand fires will trigger handleInput →
                            // checkOverflow → handlePageOverflow naturally.
                            document.execCommand('insertHTML', false, markdownToHtml(text));
                            savedRangeRef.current = null;
                        }}
                    />
                )}

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
                    className="fixed bottom-10 right-10 z-50 w-9 h-9 md:w-12 md:h-12 bg-white border-2 border-primary text-primary rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
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