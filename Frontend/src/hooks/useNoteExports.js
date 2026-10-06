import * as htmlToImage from 'html-to-image';
import { jsPDF } from "jspdf";
import JSZip from 'jszip';
import { exportSlug } from "../utils/export";

export const useNoteExports = ({ pageRefsRef, title }) => {

    const capturePages = async () => {
        const refs = pageRefsRef.current.filter(Boolean);
        const canvases = [];
        for (const el of refs) {
            // Temporarily make the page's inner contentEditable visible at full scroll height
            const canvas = await htmlToImage.toCanvas(el, { pixelRatio: 2, useCORS: true, skipFonts: true });
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
                pdf.save(`${exportSlug(title, 'note')}.pdf`);

            } else if (format === 'png') {
                if (canvases.length === 1) {
                    // Single page — direct download
                    const link = document.createElement('a');
                    link.download = `${exportSlug(title, 'note')}.png`;
                    link.href = canvases[0].toDataURL('image/png');
                    link.click();
                } else {
                    // Multiple pages — zip them
                    const zip = new JSZip();
                    const folder = zip.folder(exportSlug(title, 'note'));
                    canvases.forEach((c, i) => {
                        const base64 = c.toDataURL('image/png').split(',')[1];
                        folder.file(`page-${i + 1}.png`, base64, { base64: true });
                    });
                    const blob = await zip.generateAsync({ type: 'blob' });
                    const link = document.createElement('a');
                    link.download = `${exportSlug(title, 'note')}.zip`;
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

    return { handleExport };
};