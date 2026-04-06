import React, { useState, useEffect, useRef } from "react";
import { NoteHeader } from "./NoteHeader";
import { NoteToolbar } from "./NoteToolbar";
import { NoteEditor } from "./NoteEditor";
import { NoteAISidebar } from "./NoteAISidebar";
import { NoteSettingsSidebar } from "./NoteSettingsSidebar";
import * as htmlToImage from 'html-to-image';
import { jsPDF } from "jspdf";

export const Note = () => {
    // Note Data
    const [title, setTitle] = useState("Architecture Lecture Notes");
    const [content, setContent] = useState(`Modernism in Late 20th Century Architecture...`);
    const [isSaved, setIsSaved] = useState(true);

    // Layout State
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAISidebarOpen, setIsAISidebarOpen] = useState(true);

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
        list: null
    });

    const editorRef = useRef(null);

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
            if (!editorRef.current) return;
            
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                if (!editorRef.current.contains(range.commonAncestorContainer)) return;
            }

            const foreColor = document.queryCommandValue('foreColor');
            const hiliteColor = document.queryCommandValue('hiliteColor') || document.queryCommandValue('backColor');

            setActiveToolbarState({
                bold: document.queryCommandState('bold'),
                italic: document.queryCommandState('italic'),
                underline: document.queryCommandState('underline'),
                heading: getHeadingState(),
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
    }, [title, content, fontSize, lineSpacing, textColor, paperColor, lineColor, paperStyle, fontFamily]);

    // Formatting Commands
    const handleCommand = (command, value = null) => {
        if (editorRef.current) {
            editorRef.current.focus();
        }
        document.execCommand('styleWithCSS', false, true);
        document.execCommand(command, false, value);
        if (editorRef.current) {
            setContent(editorRef.current.innerHTML);
        }
    };

    // Export Logic
    const handleExport = async (format) => {
        if (!editorRef.current) return;
        try {
            const dataUrl = await htmlToImage.toPng(editorRef.current, { quality: 1.0, pixelRatio: 2 });
            if (format === 'png') {
                const link = document.createElement('a');
                link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.png`;
                link.href = dataUrl;
                link.click();
            } else if (format === 'pdf') {
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'px',
                    format: [editorRef.current.offsetWidth, editorRef.current.offsetHeight]
                });
                pdf.addImage(dataUrl, 'PNG', 0, 0, editorRef.current.offsetWidth, editorRef.current.offsetHeight);
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
            />

            <div className="flex flex-1 overflow-hidden relative">
                <NoteToolbar 
                    onAction={handleCommand} 
                    activeState={activeToolbarState} 
                    recentColors={recentColors}
                    onAddRecentColor={addRecentColor}
                />

                <NoteEditor 
                    ref={editorRef} content={content} onContentChange={setContent}
                    paperStyle={paperStyle} fontFamily={fontFamily} fontSize={fontSize}
                    lineSpacing={lineSpacing} textColor={textColor} paperColor={paperColor} lineColor={lineColor}
                />

                {isAISidebarOpen && <NoteAISidebar />}

                <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="fixed bottom-10 right-80 z-50 w-12 h-12 bg-white border-2 border-primary text-primary rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
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
