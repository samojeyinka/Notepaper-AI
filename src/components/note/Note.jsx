import React, { useState, useEffect, useRef } from "react";
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

    const activeEditorRef = useRef(null);

    // Track selection changes to update toolbar icons
    useEffect(() => {
        const rgbToHex = (rgb) => {
            if (!rgb) return "#000000";
            if (rgb.startsWith("#")) return rgb;
            const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            if (!match) return "#000000";
            const r = parseInt(match[1]);
            const g = parseInt(match[2]);
            const b = parseInt(match[3]);
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
        };

        const handleSelectionChange = () => {
            const selection = window.getSelection();
            if (selection.rangeCount === 0) return;
            
            const range = selection.getRangeAt(0);
            
            // Check if selection is within the pages container
            const pagesContainer = document.querySelector('.pages-container');
            if (pagesContainer && !pagesContainer.contains(range.commonAncestorContainer)) return;

            const foreColor = document.queryCommandValue('foreColor');
            const hiliteColor = document.queryCommandValue('hiliteColor') || document.queryCommandValue('backColor');
            
            const getAlignment = () => {
                if (document.queryCommandState('justifyLeft')) return 'left';
                if (document.queryCommandState('justifyCenter')) return 'center';
                if (document.queryCommandState('justifyRight')) return 'right';
                if (document.queryCommandState('justifyFull')) return 'justify';
                return 'left';
            };

            setActiveToolbarState({
                bold: document.queryCommandState('bold'),
                italic: document.queryCommandState('italic'),
                underline: document.queryCommandState('underline'),
                heading: getHeadingState(),
                align: getAlignment(),
                foreColor: rgbToHex(foreColor),
                hiliteColor: rgbToHex(hiliteColor),
                list: document.queryCommandState('insertUnorderedList') ? 'ul' : 
                      document.queryCommandState('insertOrderedList') ? 'ol' : null
            });
        };

        const getHeadingState = () => {
            const block = document.queryCommandValue('formatBlock');
            if (['h1', 'h2', 'h3'].includes(block)) return block;
            return 'p';
        };

        document.addEventListener('selectionchange', handleSelectionChange);
        return () => document.removeEventListener('selectionchange', handleSelectionChange);
    }, []);

    // Handle autosave simulation
    useEffect(() => {
        setIsSaved(false);
        const timer = setTimeout(() => setIsSaved(true), 1500);
        return () => clearTimeout(timer);
    }, [title, pages, fontSize, lineSpacing, textColor, paperColor, lineColor, paperStyle, fontFamily]);

    // Formatting Commands
    const handleCommand = (command, value = null) => {
        document.execCommand('styleWithCSS', false, true);
        
        if (command === 'createLink') {
            if (!value) return;
            document.execCommand(command, false, value);
        } else {
            document.execCommand(command, false, value);
        }
        
        // Sync the current active editor's content
        if (activeEditorRef.current) {
            const newPages = [...pages];
            newPages[activePageIndex] = activeEditorRef.current.innerHTML;
            setPages(newPages);
        }
    };

    const handlePageOverflow = (index) => {
        // Only trigger if it's the last page to prevent infinite loops
        if (index === pages.length - 1) {
            setPages([...pages, ""]);
            setActivePageIndex(index + 1);
        }
    };

    const handleNoteKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                // If at the very start of the page (except first page), move to previous page
                if (range.startOffset === 0 && range.collapsed && index > 0) {
                    e.preventDefault();
                    setActivePageIndex(index - 1);
                    // Selection move logic will happen via focusing the previous editor
                }
            }
        }
    };

    const handleAddPage = () => {
        setPages([...pages, ""]);
        setActivePageIndex(pages.length);
    };

    const handleRemovePage = (index) => {
        if (pages.length <= 1) return;
        const newPages = pages.filter((_, i) => i !== index);
        setPages(newPages);
        setActivePageIndex(Math.min(activePageIndex, newPages.length - 1));
    };

    const handleExport = async (format) => {
        const editorEl = document.querySelector('.pages-container');
        if (!editorEl) return;
        try {
            const dataUrl = await htmlToImage.toPng(editorEl, { quality: 1.0, pixelRatio: 2 });
            if (format === 'png') {
                const link = document.createElement('a');
                link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.png`;
                link.href = dataUrl;
                link.click();
            } else if (format === 'pdf') {
                const pageWidth = 816;
                const pageHeight = 1056;
                const pdf = new jsPDF('p', 'px', [pageWidth, pageHeight]);
                
                const pageElems = document.querySelectorAll('.page-paper');
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

                <div className="flex-1 overflow-hidden flex">
                    <NoteEditor 
                        ref={activeEditorRef}
                        pages={pages} 
                        onContentChange={(index, content) => {
                            const newPages = [...pages];
                            newPages[index] = content;
                            setPages(newPages);
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
