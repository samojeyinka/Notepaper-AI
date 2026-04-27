import React, { useState, useEffect, useRef, useCallback } from "react";
import Loader from '../globals/Loader';
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { PaperHeader } from "./PaperHeader";
import { PaperToolbar } from "./PaperToolbar";
import { PaperEditor } from "./PaperEditor";
import { PaperAISidebar } from "./PaperAISidebar";
import { PaperPreferencesSidebar } from "./PaperPreferencesSidebar";
import { PaperVersionSidebar } from "./PaperVersionSidebar";
import { PaperPresentationsSidebar } from "./PaperPresentationsSidebar";
import { PaperPageSidebar } from "./PaperPageSidebar";
import { DocumentImportModal } from "./DocumentImportModal";
import { GeneratePresentationModal } from "./GeneratePresentationModal";
import ShakespeareModal from "../note/ShakespeareModal";
import YouTubeTranscriptModal from "../note/YouTubeTranscriptModal";
import { usePaperSync } from "../../hooks/usePaperSync";
import { useUndoHistory } from "../../hooks/useUndoHistory";
import { deserializePaper, paperService } from "../../api/paperService";
import { workspaceCache } from "../../api/workspaceCache";
import * as htmlToImage from 'html-to-image';
import { jsPDF } from "jspdf";
import JSZip from 'jszip';

// ── Markdown → HTML ───────────────────────────────────────────────────────────
function inlineFormat(text) {
    return text
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
        .replace(/\*(.+?)\*/g,'<em>$1</em>')
        .replace(/_(.+?)_/g,'<em>$1</em>')
        .replace(/`(.+?)`/g,'<code>$1</code>');
}
function markdownToHtml(md) {
    const lines = md.split('\n'), out = [];
    let inUl = false, inOl = false;
    const closeList = () => { if (inUl){out.push('</ul>');inUl=false;} if(inOl){out.push('</ol>');inOl=false;} };
    for (const raw of lines) {
        const line = raw.trimEnd();
        if (/^### /.test(line))     { closeList(); out.push(`<h3>${inlineFormat(line.slice(4))}</h3>`); }
        else if (/^## /.test(line)) { closeList(); out.push(`<h2>${inlineFormat(line.slice(3))}</h2>`); }
        else if (/^# /.test(line))  { closeList(); out.push(`<h1>${inlineFormat(line.slice(2))}</h1>`); }
        else if (/^[-*] /.test(line)) { if(!inUl){closeList();out.push('<ul>');inUl=true;} out.push(`<li>${inlineFormat(line.slice(2))}</li>`); }
        else if (/^\d+\. /.test(line)){ if(!inOl){closeList();out.push('<ol>');inOl=true;} out.push(`<li>${inlineFormat(line.replace(/^\d+\. /,''))}</li>`); }
        else if (/^-{3,}$/.test(line.trim())) { closeList(); out.push('<hr>'); }
        else if (line.trim()==='')  { closeList(); out.push('<br>'); }
        else { closeList(); out.push(`<div>${inlineFormat(line)}</div>`); }
    }
    closeList();
    return out.join('');
}

// ── Paper Component ───────────────────────────────────────────────────────────

export const Paper = () => {
    const { id: routeId } = useParams();
    const navigate        = useNavigate();
    const [searchParams]  = useSearchParams();
    const location        = useLocation();

    // Core state
    const [paperId, setPaperId]   = useState(routeId ?? null);
    const [folderId, setFolderId] = useState(() => searchParams.get('folder') ?? null);
    const [folder, setFolder]     = useState(null);
    const [title, setTitle]       = useState("Untitled Paper");
    const [pages, setPages]       = useState(() => {
        const voiceText = location.state?.voiceText;
        if (!voiceText) return [""];
        const html = voiceText.split('\n').map(l => l.trim() ? `<div>${l}</div>` : '<div><br></div>').join('');
        return [html];
    });
    const [activePageIndex, setActivePageIndex] = useState(0);
    const activePageIndexRef = useRef(0);
    const [isRecording, setIsRecording]         = useState(false);

    // UI state
    const [isSettingsOpen, setIsSettingsOpen]           = useState(false);
    const [isAISidebarOpen, setIsAISidebarOpen]         = useState(false);
    const [isShakespeareOpen, setIsShakespeareOpen]     = useState(false);
    const [isWebImportOpen, setIsWebImportOpen]         = useState(false);
    const [isDocImportOpen, setIsDocImportOpen]         = useState(false);
    const [isPresentationModalOpen, setIsPresentationModalOpen] = useState(false);
    const [isPresentationsSidebarOpen, setIsPresentationsSidebarOpen] = useState(false);
    const [isVersionSidebarOpen, setIsVersionSidebarOpen] = useState(false);
    const [isPageSidebarOpen, setIsPageSidebarOpen]     = useState(true);
    const [presentationCount, setPresentationCount]     = useState(0);
    const savedRangeRef = useRef(null);

    // Draw
    const [drawMode, setDrawMode]       = useState({ active: false, color: '#1e293b', thickness: 4, eraser: false });
    const [drawingData, setDrawingData] = useState([""]);

    // Preferences (replaces paper style)
    const [fontFamily, setFontFamily]   = useState("sans");
    const [fontSize, setFontSize]       = useState(16);
    const [lineSpacing, setLineSpacing] = useState(28);
    const [textColor, setTextColor]     = useState("#1e293b");
    const [paddingX, setPaddingX]       = useState(96);
    const [paddingY, setPaddingY]       = useState(80);
    const [recentColors, setRecentColors] = useState(["#1e293b","#ef4444","#3b82f6","#22c55e","#f59e0b","#8b5cf6"]);

    // Undo/redo
    const { push: historyPush, undo: historyUndo, redo: historyRedo, canUndo, canRedo } = useUndoHistory();
    const isHistoryApplyingRef = useRef(false);
    const contentSessionRef    = useRef(false);
    const contentIdleTimerRef  = useRef(null);
    const handleUndoRef        = useRef(null);
    const handleRedoRef        = useRef(null);

    const activeEditorRef = useRef(null);
    const pageRefsRef     = useRef([]);
    const pendingFocusEndRef = useRef(false);
    const overflowGuardRef   = useRef(new Set());
    const forceFlushRef      = useRef(null);

    // Ctrl+S
    useEffect(() => {
        const handler = (e) => {
            if (!(e.ctrlKey || e.metaKey)) return;
            if (e.key === 's') { e.preventDefault(); forceFlushRef.current?.(); return; }
            if (document.activeElement?.isContentEditable) return;
            if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); handleUndoRef.current?.(); }
            if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); handleRedoRef.current?.(); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    useEffect(() => {
        if (!pendingFocusEndRef.current) return;
        pendingFocusEndRef.current = false;
        if (!activeEditorRef.current) return;
        activeEditorRef.current.focus();
        try {
            const range = document.createRange(); range.selectNodeContents(activeEditorRef.current); range.collapse(false);
            const sel = window.getSelection(); if (sel) { sel.removeAllRanges(); sel.addRange(range); }
        } catch (_) {}
    }, [activePageIndex]);

    useEffect(() => {
        setDrawingData(prev => {
            if (prev.length === pages.length) return prev;
            if (prev.length < pages.length) return [...prev, ...Array(pages.length - prev.length).fill("")];
            return prev.slice(0, pages.length);
        });
    }, [pages.length]);

    // Sync
    const latestStateRef = useRef({});
    latestStateRef.current = { title, pages, fontSize, lineSpacing, drawingData, textColor, fontFamily, folderId, paddingX, paddingY };
    const getState = useCallback(() => latestStateRef.current, []);

    const { saveStatus, markDirty, forceFlush, loadPaper } = usePaperSync(
        getState, paperId,
        (id) => { setPaperId(id); navigate(`/lockedin/papers/${id}`, { replace: true }); }
    );
    forceFlushRef.current = forceFlush;

    // Undo/redo
    const applySnapshot = useCallback((snapshot) => {
        if (!snapshot) return;
        isHistoryApplyingRef.current = true;
        setTitle(snapshot.title); setPages(snapshot.pages); setFontSize(snapshot.fontSize);
        setLineSpacing(snapshot.lineSpacing); setDrawingData(snapshot.drawingData);
        setTextColor(snapshot.textColor); setFontFamily(snapshot.fontFamily);
        setPaddingX(snapshot.paddingX); setPaddingY(snapshot.paddingY);
        isHistoryApplyingRef.current = false;
        markDirty(['title','content','textColor','fontFamily','fontSize','lineSpacing','drawingData','paddingX','paddingY']);
    }, [markDirty]);

    const pushNow = useCallback(() => {
        if (isHistoryApplyingRef.current) return;
        historyPush({ ...latestStateRef.current });
    }, [historyPush]);

    const pushBeforeContent = useCallback(() => {
        if (isHistoryApplyingRef.current) return;
        if (!contentSessionRef.current) { contentSessionRef.current = true; historyPush({ ...latestStateRef.current }); }
        clearTimeout(contentIdleTimerRef.current);
        contentIdleTimerRef.current = setTimeout(() => { contentSessionRef.current = false; }, 800);
    }, [historyPush]);

    handleUndoRef.current = () => applySnapshot(historyUndo({ ...latestStateRef.current }));
    handleRedoRef.current = () => applySnapshot(historyRedo({ ...latestStateRef.current }));

    useEffect(() => { if (!paperId && folderId) markDirty('folderId'); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Load existing paper
    useEffect(() => {
        if (!paperId) return;
        loadPaper(paperId, (serverPaper) => {
            const s = deserializePaper(serverPaper);
            setTitle(s.title); setPages(s.pages); setFontSize(s.fontSize); setLineSpacing(s.lineSpacing);
            setDrawingData(s.drawingData); setTextColor(s.textColor); setFontFamily(s.fontFamily);
            setPaddingX(s.paddingX); setPaddingY(s.paddingY);
            if (s.folderId) setFolderId(s.folderId);
            if (s.folder)   setFolder(s.folder);
        });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Load presentation count
    useEffect(() => {
        if (!paperId) return;
        paperService.presentations(paperId).then(res => {
            setPresentationCount((res.data ?? []).length);
        }).catch(() => {});
    }, [paperId]);

    const addRecentColor = (color) => {
        if (!color) return;
        setRecentColors(prev => [color, ...prev.filter(c => c.toLowerCase() !== color.toLowerCase())].slice(0, 6));
    };

    // Toolbar state tracking
    const [activeToolbarState, setActiveToolbarState] = useState({ bold:false,italic:false,underline:false,heading:'p',align:'left',list:null });

    useEffect(() => {
        const rgbToHex = (rgb) => {
            if (!rgb) return "#000000"; if (rgb.startsWith("#")) return rgb;
            const m = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            if (!m) return "#000000";
            return "#" + [m[1],m[2],m[3]].map(n => parseInt(n).toString(16).padStart(2,'0')).join('').toUpperCase();
        };
        const handle = () => {
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return;
            const range = sel.getRangeAt(0);
            const container = document.querySelector('.paper-pages-container');
            if (container && !container.contains(range.commonAncestorContainer)) return;
            const getAlign = () => {
                if (document.queryCommandState('justifyCenter')) return 'center';
                if (document.queryCommandState('justifyRight'))  return 'right';
                if (document.queryCommandState('justifyFull'))   return 'justify';
                return 'left';
            };
            const getHeading = () => { const b = document.queryCommandValue('formatBlock'); return ['h1','h2','h3'].includes(b) ? b : 'p'; };
            setActiveToolbarState(prev => ({
                bold: document.queryCommandState('bold'), italic: document.queryCommandState('italic'), underline: document.queryCommandState('underline'),
                heading: getHeading(), align: getAlign(),
                foreColor: rgbToHex(document.queryCommandValue('foreColor')),
                hiliteColor: rgbToHex(document.queryCommandValue('hiliteColor') || document.queryCommandValue('backColor')),
                list: document.queryCommandState('insertUnorderedList') ? 'ul' : document.queryCommandState('insertOrderedList') ? 'ol' : null,
                drawMode: prev.drawMode,
            }));
        };
        document.addEventListener('selectionchange', handle);
        return () => document.removeEventListener('selectionchange', handle);
    }, []);

    useEffect(() => { setActiveToolbarState(prev => ({ ...prev, drawMode })); }, [drawMode]);

    // Formatting
    const handleCommand = useCallback((command, value = null) => {
        if (command === 'drawToggle')    { setDrawMode(prev => ({ ...prev, active: !prev.active })); return; }
        if (command === 'drawColor')     { setDrawMode(prev => ({ ...prev, color: value })); return; }
        if (command === 'drawThickness') { setDrawMode(prev => ({ ...prev, thickness: value })); return; }
        if (command === 'drawEraser')    { setDrawMode(prev => ({ ...prev, eraser: value })); return; }
        if (activeEditorRef.current) activeEditorRef.current.focus();
        document.execCommand('styleWithCSS', false, true);
        if (command === 'createLink') { if (!value) return; document.execCommand(command, false, value); }
        else { document.execCommand(command, false, value); }
        if (activeEditorRef.current) {
            const newPages = [...pages];
            newPages[activePageIndex] = activeEditorRef.current.innerHTML;
            setPages(newPages); markDirty('content');
        }
    }, [pages, activePageIndex, markDirty]);

    // Overflow
    const handlePageOverflow = useCallback((index, overflowContent = "") => {
        if (overflowGuardRef.current.has(index)) return;
        overflowGuardRef.current.add(index);
        setPages(prev => {
            const newPages = [...prev];
            if (index >= newPages.length - 1) { newPages.push(overflowContent); }
            else { newPages[index+1] = overflowContent + (newPages[index+1] || ''); }
            return newPages;
        });
        activePageIndexRef.current = index + 1;
        setActivePageIndex(index + 1);
        pendingFocusEndRef.current = true;
        markDirty('content');
        setTimeout(() => { overflowGuardRef.current.delete(index); }, 300);
    }, [markDirty]);

    const handleKeyDown = useCallback((e, index) => {
        if (e.key !== 'Backspace' || index === 0) return;
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount || !sel.isCollapsed) return;
        const range = sel.getRangeAt(0);
        try {
            const preRange = document.createRange(); preRange.setStart(e.currentTarget, 0); preRange.setEnd(range.startContainer, range.startOffset);
            if (preRange.collapsed) {
                e.preventDefault(); pendingFocusEndRef.current = true;
                const isEmpty = e.currentTarget.textContent.trim() === '';
                if (isEmpty) { setPages(prev => prev.filter((_,i) => i !== index)); markDirty('content'); }
                setActivePageIndex(index - 1);
            }
        } catch (_) {}
    }, [markDirty]);

    const handleAddPage    = () => { setPages(prev => [...prev,""]); setActivePageIndex(pages.length); markDirty('content'); };
    const handleRemovePage = (i) => { if (pages.length <= 1) return; setPages(prev => prev.filter((_,idx) => idx !== i)); setActivePageIndex(prev => Math.min(prev, pages.length - 2)); markDirty('content'); };

    // Export
    const slug = () => title.replace(/\s+/g,'-').toLowerCase() || 'paper';

    // const applyWatermark = (canvas) => {
    //     const ctx = canvas.getContext('2d'); const r = 2;
    //     const lY = canvas.height - 28*r, sY = lY - 20*r - 8*r;
    //     ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    //     ctx.font = `300 ${13*r}px 'DM Sans',sans-serif`; ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillText('Written with', canvas.width/2, sY);
    //     ctx.font = `500 ${20*r}px 'DM Sans',sans-serif`; ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.fillText('Notepaper-ai.com', canvas.width/2, lY);
    // };

    const capturePages = async () => {
        const refs = pageRefsRef.current.filter(Boolean); const canvases = [];
        for (const el of refs) { const c = await htmlToImage.toCanvas(el, { pixelRatio:2,useCORS:true }); canvases.push(c); }
        return canvases;
    };

    const handleExportPDF = async () => {
        try {
            await forceFlush();
            const canvases = await capturePages();
            const W = 816, H = 1056, M = 40;
            const pdf = new jsPDF({ orientation:'portrait',unit:'px',format:[W,H] });
            for (let i=0;i<canvases.length;i++) {
                if (i>0) pdf.addPage();
                pdf.addImage(canvases[i].toDataURL('image/png'),'PNG',M,0,W-M*2,H);
            }
            pdf.save(`${slug()}.pdf`);
        } catch (err) { console.error('PDF export failed',err); }
    };

    const handleExportDOCX = async () => {
        try {
            await forceFlush();
            const { Document, Packer, Paragraph, TextRun } = await import('docx');
            const plainPages = pages.map(p => { const div = document.createElement('div'); div.innerHTML = p; return div.textContent || ''; });
            const children = plainPages.flatMap((text, idx) => [
                new Paragraph({ children: [new TextRun({ text: text, size: fontSize * 2 })], spacing: { after: 240 } }),
                ...(idx < plainPages.length - 1 ? [new Paragraph({ children: [], pageBreakBefore: true })] : []),
            ]);
            const doc = new Document({ sections: [{ children }] });
            const blob = await Packer.toBlob(doc);
            const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `${slug()}.docx`; link.click();
            setTimeout(() => URL.revokeObjectURL(link.href), 10000);
        } catch (err) { console.error('DOCX export failed', err); alert('DOCX export failed. Please try again.'); }
    };

    const handleExportPPTX = async () => {
        try {
            await forceFlush();
            const PptxGenJS = (await import('pptxgenjs')).default;
            const pptx = new PptxGenJS();
            pages.forEach((p, idx) => {
                const slide = pptx.addSlide();
                slide.addText(`Page ${idx+1}`, { x:0.5,y:0.3,w:'90%',h:0.5,fontSize:14,bold:true,color:'363636' });
                const div = document.createElement('div'); div.innerHTML = p;
                slide.addText(div.textContent || '', { x:0.5,y:1,w:'90%',h:5,fontSize:12,color:'363636',wrap:true });
            });
            await pptx.writeFile({ fileName: `${slug()}.pptx` });
        } catch (err) { console.error('PPTX export failed', err); alert('PPTX export failed. Please try again.'); }
    };

    // Voice insert
    const handleVoiceResult = (transcript) => {
        const sentences = transcript.split(/(?<=[.!?])\s+|(?<=,)\s+|\s{2,}/).flatMap(s => {
            if (s.length <= 80) return [s];
            const words = s.split(' '); const chunks = []; let chunk = '';
            for (const w of words) { if ((chunk+' '+w).length > 80){if(chunk)chunks.push(chunk);chunk=w;} else{chunk=chunk?chunk+' '+w:w;} }
            if (chunk) chunks.push(chunk); return chunks;
        }).filter(Boolean);
        const pageEls  = document.querySelectorAll('[data-paper-page]');
        const activePg = pageEls[activePageIndexRef.current] ?? pageEls[pageEls.length-1];
        if (activePg) {
            activePg.focus();
            const sel = window.getSelection(); sel.removeAllRanges();
            const r = document.createRange(); r.selectNodeContents(activePg); r.collapse(false); sel.addRange(r);
            document.execCommand('insertHTML', false, sentences.map(s=>`<div>${s}</div>`).join(''));
            activePg.dispatchEvent(new Event('input',{bubbles:true}));
        }
    };

    // Insert text at cursor (from web import / shakespeare)
    const insertAtCursor = (html, asText = false) => {
        const pageEls  = document.querySelectorAll('[data-paper-page]');
        const activePg = pageEls[activePageIndex] ?? pageEls[pageEls.length-1];
        if (!activePg) return;
        activePg.focus();
        const sel = window.getSelection(); sel.removeAllRanges();
        if (savedRangeRef.current) {
            try { if (activePg.contains(savedRangeRef.current.startContainer)){ sel.addRange(savedRangeRef.current); } else { throw 0; } }
            catch { const r = document.createRange(); r.selectNodeContents(activePg); r.collapse(false); sel.addRange(r); }
        } else { const r = document.createRange(); r.selectNodeContents(activePg); r.collapse(false); sel.addRange(r); }
        if (asText) { document.execCommand('insertText', false, html); }
        else { document.execCommand('insertHTML', false, html); }
        savedRangeRef.current = null;
    };

    return (
        <div className="flex flex-col flex-1 h-screen overflow-hidden bg-white border-l border-slate-200 lg:ml-64 pt-16 lg:pt-0">
            <PaperHeader
                title={title}
                onTitleChange={(v) => { pushNow(); setTitle(v); markDirty('title'); }}
                saveStatus={saveStatus}
                onSave={forceFlush}
                folderId={folderId}
                onExportPDF={handleExportPDF}
                onExportDOCX={handleExportDOCX}
                onExportPPTX={handleExportPPTX}
                onCopy={async () => {
                    if (!paperId) return;
                    try {
                        const res = await paperService.duplicate(paperId);
                        const newId = res.data?.id;
                        if (newId) { workspaceCache.invalidateNotes(); window.open(`/lockedin/papers/${newId}`,'_blank'); }
                    } catch { /* silent */ }
                }}
                onToggleAI={() => {
                    if (!isAISidebarOpen) {
                        const sel = window.getSelection();
                        savedRangeRef.current = sel && sel.rangeCount > 0 ? sel.getRangeAt(0).cloneRange() : null;
                        setIsVersionSidebarOpen(false);
                        setIsPresentationsSidebarOpen(false);
                    }
                    setIsAISidebarOpen(v => !v);
                }}
                isAIOpen={isAISidebarOpen}
                onToggleHistory={() => {
                    if (!isVersionSidebarOpen) {
                        setIsAISidebarOpen(false);
                        setIsPresentationsSidebarOpen(false);
                    }
                    setIsVersionSidebarOpen(v => !v);
                }}
                isHistoryOpen={isVersionSidebarOpen}
                onTogglePresentations={() => {
                    if (!isPresentationsSidebarOpen) {
                        setIsAISidebarOpen(false);
                        setIsVersionSidebarOpen(false);
                    }
                    setIsPresentationsSidebarOpen(v => !v);
                }}
                isPresentationsOpen={isPresentationsSidebarOpen}
                canUndo={canUndo} canRedo={canRedo}
                onUndo={() => handleUndoRef.current?.()} onRedo={() => handleRedoRef.current?.()}
                onVoiceResult={handleVoiceResult}
                onVoiceStateChange={setIsRecording}
                onGeneratePresentation={() => setIsPresentationModalOpen(true)}
                presentationCount={presentationCount}
            />

            <div className="flex flex-1 overflow-hidden relative">
                <PaperToolbar
                    onAction={handleCommand}
                    activeState={activeToolbarState}
                    recentColors={recentColors}
                    onAddRecentColor={addRecentColor}
                    onOpenShakespeare={() => {
                        const sel = window.getSelection();
                        savedRangeRef.current = sel && sel.rangeCount > 0 ? sel.getRangeAt(0).cloneRange() : null;
                        setIsShakespeareOpen(true);
                    }}
                    onOpenWebImport={() => {
                        const sel = window.getSelection();
                        savedRangeRef.current = sel && sel.rangeCount > 0 ? sel.getRangeAt(0).cloneRange() : null;
                        setIsWebImportOpen(true);
                    }}
                    onOpenDocImport={() => setIsDocImportOpen(true)}
                    onImageUpload={(url) => {
                        if (activeEditorRef.current) activeEditorRef.current.focus();
                        document.execCommand('insertHTML', false, `<img src="${url}" style="max-width:100%;height:auto;display:inline-block;" data-resizable="true" />`);
                        if (activeEditorRef.current) {
                            const np = [...pages]; np[activePageIndex] = activeEditorRef.current.innerHTML;
                            setPages(np); markDirty('content');
                        }
                    }}
                />

                <div className="flex-1 overflow-hidden flex" style={{ position:'relative' }}>
                    {saveStatus === 'loading' && (
                        <div style={{ position:'absolute',inset:0,zIndex:20,pointerEvents:'all',display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(241,245,249,0.7)',backdropFilter:'blur(2px)' }}>
                            <div className="flex flex-col items-center gap-3">
                                <Loader size="xl" />
                                <p className="text-xs font-semibold text-slate-500 tracking-wide">Loading paper…</p>
                            </div>
                        </div>
                    )}
                    <div className="paper-pages-container flex-1 overflow-hidden flex relative">
                        {isRecording && <div style={{ position:'absolute',inset:0,zIndex:50,cursor:'not-allowed' }} />}
                        <PaperEditor
                            ref={activeEditorRef}
                            pages={pages}
                            onContentChange={(index, content) => {
                                pushBeforeContent();
                                setPages(prev => { const np=[...prev]; np[index]=content; return np; });
                                markDirty('content');
                            }}
                            fontFamily={fontFamily}
                            fontSize={fontSize}
                            lineSpacing={lineSpacing}
                            textColor={textColor}
                            paddingX={paddingX}
                            paddingY={paddingY}
                            activePageIndex={activePageIndex}
                            setActivePageIndex={(i) => { activePageIndexRef.current = i; setActivePageIndex(i); }}
                            onPageOverflow={handlePageOverflow}
                            onKeyDown={handleKeyDown}
                            onPageRefsReady={(refs) => { pageRefsRef.current = refs; }}
                            readOnly={saveStatus === 'loading'}
                            drawMode={drawMode}
                            drawingData={drawingData}
                            onDrawingChange={(index, dataUrl) => {
                                pushBeforeContent();
                                setDrawingData(prev => { const n=[...prev]; n[index]=dataUrl; return n; });
                                markDirty('drawingData');
                            }}
                        />
                    </div>

                    {isPageSidebarOpen && (
                        <PaperPageSidebar
                            pages={pages}
                            activePageIndex={activePageIndex}
                            onAddPage={handleAddPage}
                            onRemovePage={handleRemovePage}
                            onSelectPage={setActivePageIndex}
                            onCollapse={() => setIsPageSidebarOpen(false)}
                        />
                    )}
                    {!isPageSidebarOpen && (
                        <button onClick={() => setIsPageSidebarOpen(true)}
                            className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-10 md:w-6 md:h-20 bg-white border border-slate-200 rounded-l-xl flex items-center justify-center hover:bg-slate-50 transition-colors z-20">
                            <span className="material-icons-round text-slate-400">chevron_left</span>
                        </button>
                    )}
                </div>

                {isAISidebarOpen && <PaperAISidebar />}

                {isWebImportOpen && (
                    <YouTubeTranscriptModal
                        onClose={() => setIsWebImportOpen(false)}
                        onInsert={(text) => { setIsWebImportOpen(false); insertAtCursor(text, true); }}
                    />
                )}

                {isShakespeareOpen && (
                    <ShakespeareModal
                        onClose={() => setIsShakespeareOpen(false)}
                        onInsert={(text) => { setIsShakespeareOpen(false); insertAtCursor(markdownToHtml(text)); }}
                    />
                )}

                {isVersionSidebarOpen && (
                    <PaperVersionSidebar
                        paperId={paperId}
                        onClose={() => setIsVersionSidebarOpen(false)}
                        onRevert={(revertedPaper) => {
                            const s = deserializePaper(revertedPaper);
                            setTitle(s.title); setPages(s.pages); setFontSize(s.fontSize); setLineSpacing(s.lineSpacing);
                            setDrawingData(s.drawingData); setTextColor(s.textColor); setFontFamily(s.fontFamily);
                            setPaddingX(s.paddingX); setPaddingY(s.paddingY);
                        }}
                    />
                )}

                {isPresentationsSidebarOpen && (
                    <PaperPresentationsSidebar
                        paperId={paperId}
                        onClose={() => setIsPresentationsSidebarOpen(false)}
                        onNewPresentation={() => { setIsPresentationsSidebarOpen(false); setIsPresentationModalOpen(true); }}
                    />
                )}

                {/* Preferences button */}
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="fixed bottom-10 right-10 z-50 w-8 h-8 md:w-12 md:h-12 bg-white border-2 border-primary text-primary rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                >
                    <span className="material-icons-round">tune</span>
                </button>
            </div>

            <PaperPreferencesSidebar
                isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}
                paddingX={paddingX} setPaddingX={(v) => { pushNow(); setPaddingX(v); markDirty('paddingX'); }}
                paddingY={paddingY} setPaddingY={(v) => { pushNow(); setPaddingY(v); markDirty('paddingY'); }}
                lineSpacing={lineSpacing} setLineSpacing={(v) => { pushNow(); setLineSpacing(v); markDirty('lineSpacing'); }}
                fontSize={fontSize} setFontSize={(v) => { pushNow(); setFontSize(v); markDirty('fontSize'); }}
                fontFamily={fontFamily} setFontFamily={(v) => { pushNow(); setFontFamily(v); markDirty('fontFamily'); }}
                textColor={textColor} setTextColor={(v) => { pushNow(); setTextColor(v); markDirty('textColor'); }}
            />

            {isDocImportOpen && (
                <DocumentImportModal
                    onClose={() => setIsDocImportOpen(false)}
                    onInsert={(html) => {
                        const pageEls = document.querySelectorAll('[data-paper-page]');
                        const activePg = pageEls[activePageIndex] ?? pageEls[pageEls.length-1];
                        if (!activePg) return;
                        activePg.focus();
                        const sel = window.getSelection(); sel.removeAllRanges();
                        const r = document.createRange(); r.selectNodeContents(activePg); r.collapse(false); sel.addRange(r);
                        document.execCommand('insertHTML', false, html);
                        activePg.dispatchEvent(new Event('input', { bubbles: true }));
                        markDirty('content');
                    }}
                />
            )}

            {isPresentationModalOpen && (
                <GeneratePresentationModal
                    onClose={() => setIsPresentationModalOpen(false)}
                    paperId={paperId}
                    paperTitle={title}
                    pages={pages}
                    onGenerated={(saved) => {
                        setPresentationCount(c => c + 1);
                        setIsPresentationModalOpen(false);
                        setIsPresentationsSidebarOpen(true);
                        if (saved?.id) navigate(`/lockedin/presentations/${saved.id}`);
                    }}
                />
            )}
        </div>
    );
};
