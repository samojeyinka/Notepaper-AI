import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import * as htmlToImage from 'html-to-image';
import { jsPDF } from "jspdf";
import { PaperEditor } from "./PaperEditor";
import { logo } from "../../assets/assets";
import SEO from "../globals/SEO";
import { useAuth } from "../../context/AuthContext";
import { deserializePaper, paperService } from "../../api/paperService";

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
            to="/signup"
            className="text-[12px] font-semibold text-primary bg-primary/8 hover:bg-primary/12 border border-primary/15 px-3 py-1.5 rounded-full transition-colors"
        >
            {isAuthenticated ? "Sign up free" : "Sign up free"}
        </Link>
    </header>
);

const PublicPaperView = () => {
    const { id } = useParams();
    const { isAuthenticated } = useAuth();

    const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
    const [title, setTitle] = useState('');
    const [pages, setPages] = useState(['']);
    const [fontSize, setFontSize] = useState(16);
    const [lineSpacing, setLineSpacing] = useState(28);
    const [drawingData, setDrawingData] = useState(['']);
    const [paddingX, setPaddingX] = useState(96);
    const [paddingY, setPaddingY] = useState(80);
    const [textColor, setTextColor] = useState('#1e293b');
    const [fontFamily, setFontFamily] = useState('sans');
    const [activePageIndex, setActivePageIndex] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const pageRefsRef = useRef([]);

    useEffect(() => {
        let cancelled = false;
        paperService.getPublic(id)
            .then(res => {
                if (cancelled) return;
                const s = deserializePaper(res.data ?? res);
                setTitle(s.title);
                setPages(s.pages);
                setFontSize(s.fontSize);
                setLineSpacing(s.lineSpacing);
                setDrawingData(s.drawingData);
                setPaddingX(s.paddingX);
                setPaddingY(s.paddingY);
                setTextColor(s.textColor);
                setFontFamily(s.fontFamily);
                setStatus('ready');
            })
            .catch(() => { if (!cancelled) setStatus('error'); });
        return () => { cancelled = true; };
    }, [id]);

    const slug = () => (title || 'paper').replace(/\s+/g, '-').toLowerCase();

    const capturePages = async () => {
        const refs = pageRefsRef.current.filter(Boolean);
        const canvases = [];
        const TRANSPARENT = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
        const PAGE_W = 816, PAGE_H = 1056;

        for (const el of refs) {
            const inner = el.firstElementChild;
            const clone = (inner || el).cloneNode(true);
            if (inner) {
                clone.style.transform = 'none';
                clone.style.transformOrigin = 'top left';
            }

            const origCanvases = (inner || el).querySelectorAll('canvas');
            clone.querySelectorAll('canvas').forEach((cc, i) => {
                if (origCanvases[i]) {
                    try { cc.getContext('2d').drawImage(origCanvases[i], 0, 0); } catch { /* ignore */ }
                }
            });

            clone.querySelectorAll('[class*="ring-"]').forEach(d => { d.style.boxShadow = 'none'; });

            const offscreen = document.createElement('div');
            offscreen.style.cssText =
                `position:fixed;left:-9999px;top:-9999px;pointer-events:none;` +
                `width:${PAGE_W}px;height:${PAGE_H}px;overflow:hidden;`;
            offscreen.appendChild(clone);
            document.body.appendChild(offscreen);

            await Promise.all(
                Array.from(clone.querySelectorAll('img[src]')).map(async (img) => {
                    const src = img.getAttribute('src');
                    if (!src || src.startsWith('data:') || src.startsWith('blob:')) return;
                    try {
                        const res = await fetch(src, { cache: 'force-cache' });
                        if (!res.ok) throw new Error(`HTTP ${res.status}`);
                        const blob = await res.blob();
                        const dataUrl = await new Promise((ok, fail) => {
                            const r = new FileReader();
                            r.onload = () => ok(r.result);
                            r.onerror = fail;
                            r.readAsDataURL(blob);
                        });
                        img.src = dataUrl;
                    } catch {
                        img.src = TRANSPARENT;
                    }
                })
            );

            const c = await htmlToImage.toCanvas(clone, {
                pixelRatio: 3,
                skipFonts: true,
                width: PAGE_W,
                height: PAGE_H,
            });

            document.body.removeChild(offscreen);
            canvases.push(c);
        }
        return canvases;
    };

    const handleExportPDF = async () => {
        setIsMenuOpen(false);
        try {
            const canvases = await capturePages();
            const W = 816, H = 1056;
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [W, H] });
            for (let i = 0; i < canvases.length; i++) {
                if (i > 0) pdf.addPage();
                pdf.addImage(canvases[i].toDataURL('image/png'), 'PNG', 0, 0, W, H);
            }
            pdf.save(`${slug()}.pdf`);
        } catch (err) { console.error('PDF export failed', err); alert('Export failed. Please try again.'); }
    };

    const handleExportDOCX = async () => {
        setIsMenuOpen(false);
        try {
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
        setIsMenuOpen(false);
        try {
            const PptxGenJS = (await import('pptxgenjs')).default;
            const pptx = new PptxGenJS();
            pages.forEach((p, idx) => {
                const slide = pptx.addSlide();
                slide.addText(`Page ${idx + 1}`, { x: 0.5, y: 0.3, w: '90%', h: 0.5, fontSize: 14, bold: true, color: '363636' });
                const div = document.createElement('div'); div.innerHTML = p;
                slide.addText(div.textContent || '', { x: 0.5, y: 1, w: '90%', h: 5, fontSize: 12, color: '363636', wrap: true });
            });
            await pptx.writeFile({ fileName: `${slug()}.pptx` });
        } catch (err) { console.error('PPTX export failed', err); alert('PPTX export failed. Please try again.'); }
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
                    <h2 className="text-lg font-semibold text-stone-700">This paper isn't available</h2>
                    <p className="text-sm text-stone-400 max-w-xs">It may have been deleted, or the link is incorrect.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-white">
            <SEO title={title} path={`/paper/${id}`} noIndex={true} />
            <Header title={title} isAuthenticated={isAuthenticated} />

            <div className="flex items-center gap-1 px-4 py-1.5 bg-plum-50 border-b border-plum-100 text-gray-700 text-[10px]">
                <span className="material-icons-round text-[13px]">workspace_premium</span>
                <span>
                    Exports include a <strong>NotepaperAI</strong> watermark.
                </span>
            </div>

            <div className="flex items-center justify-between px-4 py-2 border-b border-stone-100 shrink-0">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActivePageIndex(i => Math.max(0, i - 1))}
                        disabled={activePageIndex === 0}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-stone-500 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <span className="material-icons-round text-[16px]">chevron_left</span>
                    </button>
                    <span className="text-[11px] text-stone-500 font-medium">
                        Page {activePageIndex + 1} of {pages.length}
                    </span>
                    <button
                        onClick={() => setActivePageIndex(i => Math.min(pages.length - 1, i + 1))}
                        disabled={activePageIndex === pages.length - 1}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-stone-500 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
                                <button onClick={handleExportPDF} className="w-full flex items-center gap-2 px-4 py-2 hover:bg-stone-50 text-stone-700 text-sm font-medium">
                                    <span className="material-icons-round text-[16px] text-stone-400">picture_as_pdf</span>
                                    Export as PDF
                                </button>
                                <button onClick={handleExportDOCX} className="w-full flex items-center gap-2 px-4 py-2 hover:bg-stone-50 text-stone-700 text-sm font-medium">
                                    <span className="material-icons-round text-[16px] text-stone-400">description</span>
                                    Export as DOCX
                                </button>
                                <button onClick={handleExportPPTX} className="w-full flex items-center gap-2 px-4 py-2 hover:bg-stone-50 text-stone-700 text-sm font-medium">
                                    <span className="material-icons-round text-[16px] text-stone-400">slideshow</span>
                                    Export as PPTX
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-auto bg-stone-50">
                <PaperEditor
                    pages={pages}
                    fontFamily={fontFamily}
                    fontSize={fontSize}
                    lineSpacing={lineSpacing}
                    textColor={textColor}
                    paddingX={paddingX}
                    paddingY={paddingY}
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

export default PublicPaperView;
