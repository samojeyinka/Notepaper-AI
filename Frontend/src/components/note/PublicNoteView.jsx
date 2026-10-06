import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import * as htmlToImage from 'html-to-image';
import { jsPDF } from "jspdf";
import JSZip from 'jszip';
import { NoteEditor } from "./NoteEditor";
import { logo } from "../../assets/assets";
import SEO from "../globals/SEO";
import { useAuth } from "../../context/AuthContext";
import { deserializeNote, noteService } from "../../api/noteService";

const Header = ({ title, isAuthenticated }) => (
    <header className="w-full flex items-center justify-between px-5 py-3 bg-white border-b border-stone-100 shrink-0">
        <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Notepaper-ai" className="w-7" />
            <span className="text-base font-semibold text-stone-800 tracking-tight">
                Notepaper<span className="text-primary">.ai</span>
            </span>
        </Link>
        <span className="text-[12px] text-stone-400 font-medium hidden sm:block truncate max-w-xs">{title}</span>
        <Link
            to={isAuthenticated ? "/lockedin/library" : "/signup"}
            className="text-[12px] font-semibold text-plum-700 bg-plum-50 hover:bg-plum-100 border border-plum-200 px-3 py-1.5 transition-colors"
        >
            {isAuthenticated ? "My library" : "Sign up free"}
        </Link>
    </header>
);

const PublicNoteView = () => {
    const { id } = useParams();
    const { isAuthenticated } = useAuth();

    const [status, setStatus] = useState('loading'); 
    const [title, setTitle] = useState('');
    const [pages, setPages] = useState(['']);
    const [fontSize, setFontSize] = useState(18);
    const [lineSpacing, setLineSpacing] = useState(32);
    const [drawingData, setDrawingData] = useState(['']);
    const [paperStyle, setPaperStyle] = useState('ruled');
    const [paperColor, setPaperColor] = useState('#ffffff');
    const [lineColor, setLineColor] = useState('#E7E5E4');
    const [textColor, setTextColor] = useState('#1e293b');
    const [fontFamily, setFontFamily] = useState('sans');
    const [activePageIndex, setActivePageIndex] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const pageRefsRef = useRef([]);

    useEffect(() => {
        let cancelled = false;
        noteService.getPublic(id)
            .then(res => {
                if (cancelled) return;
                const s = deserializeNote(res.data ?? res);
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
                setStatus('ready');
            })
            .catch(() => { if (!cancelled) setStatus('error'); });
        return () => { cancelled = true; };
    }, [id]);

    const slug = () => (title || 'note').replace(/\s+/g, '-').toLowerCase();

    const capturePages = async () => {
        const refs = pageRefsRef.current.filter(Boolean);
        const canvases = [];
        for (const el of refs) {
            const canvas = await htmlToImage.toCanvas(el, { pixelRatio: 2, useCORS: true, skipFonts: true });
            canvases.push(canvas);
        }
        return canvases;
    };

    const handleExport = async (format) => {
        setIsMenuOpen(false);
        try {
            const canvases = await capturePages();
            if (!canvases.length) return;

            const PAGE_W = 816;
            const PAGE_H = 1056;
            const MARGIN = 40;

            if (format === 'pdf') {
                const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [PAGE_W, PAGE_H] });
                for (let i = 0; i < canvases.length; i++) {
                    if (i > 0) pdf.addPage();
                    pdf.addImage(canvases[i].toDataURL('image/png'), 'PNG', MARGIN, 0, PAGE_W - MARGIN * 2, PAGE_H);
                }
                pdf.save(`${slug()}.pdf`);
            } else if (format === 'png') {
                if (canvases.length === 1) {
                    const link = document.createElement('a');
                    link.download = `${slug()}.png`;
                    link.href = canvases[0].toDataURL('image/png');
                    link.click();
                } else {
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

    if (status === 'loading') {
        return (
            <div className="flex flex-col h-screen bg-white">
                <Header title="" isAuthenticated={isAuthenticated} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="flex flex-col h-screen bg-white">
                <Header title="" isAuthenticated={isAuthenticated} />
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
                    <span className="material-icons-round text-stone-300 text-[40px]">description</span>
                    <h2 className="text-lg font-semibold text-stone-700">This note isn't available</h2>
                    <p className="text-sm text-stone-400 max-w-xs">It may have been deleted, or the link is incorrect.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-white">
            <SEO title={title} path={`/note/${id}`} noIndex={true} />
            <Header title={title} isAuthenticated={isAuthenticated} />

            <div className="flex items-center justify-between px-4 py-2 border-b border-stone-100 shrink-0">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActivePageIndex(i => Math.max(0, i - 1))}
                        disabled={activePageIndex === 0}
                        className="w-7 h-7 flex items-center justify-center text-stone-500 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <span className="material-icons-round text-[16px]">chevron_left</span>
                    </button>
                    <span className="text-[11px] text-stone-500 font-medium">
                        Page {activePageIndex + 1} of {pages.length}
                    </span>
                    <button
                        onClick={() => setActivePageIndex(i => Math.min(pages.length - 1, i + 1))}
                        disabled={activePageIndex === pages.length - 1}
                        className="w-7 h-7 flex items-center justify-center text-stone-500 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <span className="material-icons-round text-[16px]">chevron_right</span>
                    </button>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(v => !v)}
                        className="flex items-center gap-1.5 px-3 py-1.5  text-xs font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                    >
                        <span className="material-icons-round text-[15px]">download</span>
                        Export
                    </button>
                    {isMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-20" onClick={() => setIsMenuOpen(false)} />
                            <div className="absolute right-0 mt-2 w-44 bg-white  shadow-xl border border-stone-100 py-2 z-30">
                                <button
                                    onClick={() => handleExport('pdf')}
                                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-stone-50 text-stone-700 text-sm font-medium"
                                >
                                    <span className="material-icons-round text-[16px] text-stone-400">picture_as_pdf</span>
                                    Export as PDF
                                </button>
                                <button
                                    onClick={() => handleExport('png')}
                                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-stone-50 text-stone-700 text-sm font-medium"
                                >
                                    <span className="material-icons-round text-[16px] text-stone-400">image</span>
                                    Export as Image
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-auto bg-stone-50">
                <NoteEditor
                    pages={pages}
                    paperStyle={paperStyle}
                    fontFamily={fontFamily}
                    fontSize={fontSize}
                    lineSpacing={lineSpacing}
                    textColor={textColor}
                    paperColor={paperColor}
                    lineColor={lineColor}
                    activePageIndex={activePageIndex}
                    setActivePageIndex={setActivePageIndex}
                    onPageRefsReady={(refs) => { pageRefsRef.current = refs; }}
                    readOnly={true}
                    drawingData={drawingData}
                />
            </div>
        </div>
    );
};

export default PublicNoteView;
