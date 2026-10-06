import { extractHexForPptx, getTheme } from "./themes";

// ── HTML parsing helpers for PPTX ────────────────────────────────────────────
const stripHtml = (html) => html?.replace(/<[^>]+>/g, '') ?? '';

/** Convert HTML with <strong>/<b> tags into PptxGenJS run array */
const parseHtmlRuns = (html, baseOpts = {}) => {
    if (!html) return [];
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const runs = [];
    const walk = (node, fmt) => {
        if (node.nodeType === 3) {
            if (node.textContent) runs.push({ text: node.textContent, options: { ...baseOpts, ...fmt } });
        } else if (node.nodeType === 1) {
            const tag = node.tagName;
            const next = {
                ...fmt,
                ...(tag==='STRONG'||tag==='B' ? {bold:true} : {}),
                ...(tag==='EM'||tag==='I'     ? {italic:true} : {}),
                ...(tag==='U'                 ? {underline:{style:'sng'}} : {}),
            };
            node.childNodes.forEach(c => walk(c, next));
        }
    };
    walk(tmp, false);
    return runs.length ? runs : [{ text: stripHtml(html), options: baseOpts }];
};

// PPTX theme art (coordinates clamped to 0-100% so nothing overflows)
const addThemeArtToPptx = (slide, PptxGenJS, themeId, t) => {
    const E      = PptxGenJS.ShapeType?.ellipse ?? 'ellipse';
    const R      = PptxGenJS.ShapeType?.rect    ?? 'rect';
    const noLine = { type: 'none' };
    const nofill = { type: 'none' };

    if (themeId === 'modern') {
        const ac = t.pptxAccent;
        // Large circle outline — anchored top-right, starts at y:0 (was -18%)
        slide.addShape(E, { x:'52%', y:0,    w:'48%', h:'68%', fill:nofill, line:{ color:ac, width:1.5, transparency:72 } });
        // Small circle outline — top-right
        slide.addShape(E, { x:'76%', y:'5%', w:'16%', h:'22%', fill:nofill, line:{ color:ac, width:1,   transparency:82 } });
        // Filled soft circle — bottom-left, starts at x:0 (was -4%)
        slide.addShape(E, { x:0,     y:'65%',w:'22%', h:'35%', fill:{ color:ac, transparency:86 }, line:noLine });
        // Dot grid
        [['8%','18%'],['22%','10%'],['44%','8%'],['66%','13%'],['84%','22%'],
         ['13%','42%'],['56%','36%'],['78%','48%'],['24%','66%'],['50%','74%'],
         ['70%','68%'],['87%','58%']].forEach(([x,y]) =>
            slide.addShape(E, { x, y, w:0.07, h:0.07, fill:{ color:ac, transparency:78 }, line:noLine })
        );
    }

    if (themeId === 'minimal') {
        const ac = t.pptxAccent; // 16a34a
        // Large leaf — top-right, y clamped to 0 (was -6%)
        slide.addShape(E, { x:'80%', y:0,    w:'20%', h:'28%', fill:{ color:ac, transparency:87 }, line:noLine, rotate:330 });
        // Medium leaf — top-right inner
        slide.addShape(E, { x:'84%', y:'4%', w:'13%', h:'19%', fill:{ color:ac, transparency:91 }, line:noLine, rotate:340 });
        // Stem
        slide.addShape(R, { x:'89%', y:'2%', w:0.02,  h:'22%', fill:{ color:ac, transparency:82 }, line:noLine, rotate:15 });
        // Small leaf — bottom-left, x clamped to 0 (was -3%)
        slide.addShape(E, { x:0,     y:'74%',w:'14%', h:'22%', fill:{ color:ac, transparency:90 }, line:noLine, rotate:20 });
        // Tiny leaf
        slide.addShape(E, { x:'4%',  y:'80%',w:'9%',  h:'13%', fill:{ color:ac, transparency:92 }, line:noLine, rotate:35 });
        // Dewdrop dots
        [['70%','22%',0.10],['64%','38%',0.07],['18%','68%',0.08],['78%','55%',0.07]].forEach(([x,y,s]) =>
            slide.addShape(E, { x, y, w:s, h:s, fill:{ color:ac, transparency:65 }, line:noLine })
        );
    }

    if (themeId === 'academic') {
        const ac = t.pptxAccent; // 60a5fa
        // Left vertical accent bar
        slide.addShape(R, { x:0, y:0, w:0.07, h:'100%', fill:{ color:ac, transparency:40 }, line:noLine });
        // Outer circle — top-right
        slide.addShape(E, { x:'82%', y:'3%',    w:'12%', h:'17%', fill:nofill, line:{ color:ac, width:2,   transparency:72 } });
        // Inner circle — top-right
        slide.addShape(E, { x:'84%', y:'6%',    w:'8%',  h:'11%', fill:nofill, line:{ color:ac, width:1.5, transparency:82 } });
        // Centre dot
        slide.addShape(E, { x:'87.5%', y:'10.5%', w:0.08, h:0.08, fill:{ color:ac, transparency:50 }, line:noLine });
        // Horizontal accent lines — bottom-left
        slide.addShape(R, { x:'4%', y:'87%', w:'12%', h:0.025, fill:{ color:ac, transparency:75 }, line:noLine });
        slide.addShape(R, { x:'4%', y:'91%', w:'7%',  h:0.02,  fill:{ color:ac, transparency:82 }, line:noLine });
    }

    if (themeId === 'bold') {
        const ac = t.pptxAccent; // f0abfc
        // Top-right corner blocks
        slide.addShape(R, { x:'88%', y:0,     w:'12%', h:'22%', fill:{ color:ac, transparency:82 }, line:noLine });
        slide.addShape(R, { x:'92%', y:0,     w:'8%',  h:'12%', fill:{ color:ac, transparency:88 }, line:noLine });
        // Bottom-left corner block
        slide.addShape(R, { x:0,     y:'80%', w:'10%', h:'20%', fill:{ color:ac, transparency:88 }, line:noLine });
        // Dot grid
        [['8%','18%'],['22%','8%'],['42%','14%'],['62%','8%'],['82%','12%'],
         ['15%','38%'],['35%','32%'],['55%','28%'],['75%','35%'],['90%','30%'],
         ['10%','58%'],['30%','62%'],['50%','55%'],['70%','60%'],['88%','55%'],
         ['18%','78%'],['40%','82%'],['62%','78%'],['80%','75%']].forEach(([x,y]) =>
            slide.addShape(E, { x, y, w:0.09, h:0.09, fill:{ color:ac, transparency:82 }, line:noLine })
        );
    }

    if (themeId === 'pastel') {
        const ac  = t.pptxAccent; // 8b5cf6
        const ac2 = 'ec4899';
        // Large soft blob — top-right, y clamped to 0 (was -22%)
        slide.addShape(E, { x:'55%', y:0,     w:'45%', h:'58%', fill:{ color:ac,  transparency:86 }, line:noLine });
        // Medium blob — bottom-left, x clamped to 0 (was -5%)
        slide.addShape(E, { x:0,     y:'60%', w:'35%', h:'40%', fill:{ color:ac2, transparency:90 }, line:noLine });
        // Accent dots
        [['87%','28%',0.12],['88%','58%',0.09],['6%','18%',0.10],['72%','80%',0.07]].forEach(([x,y,s]) =>
            slide.addShape(E, { x, y, w:s, h:s, fill:{ color:ac, transparency:55 }, line:noLine })
        );
    }
};

// ── PPTX export ───────────────────────────────────────────────────────────────
export const exportAsPPTX = async (slides, themeId, title) => {
    const PptxGenJS = (await import('pptxgenjs')).default;
    const pptx = new PptxGenJS();
    const t    = getTheme(themeId);
    pptx.title  = title||'Presentation';
    pptx.author = 'NotepaperAI';
    pptx.layout = 'LAYOUT_WIDE';

    slides.forEach(s => {
        const slide      = pptx.addSlide();
        const isClosing  = s.layout==='closing';
        const showBullet = s.listStyle !== 'text';
        const bulletType = s.listStyle==='numbered' ? 'number' : 'bullet';
        const filledBullets = (s.bullets??[]).filter(b=>stripHtml(b).trim());
        const titleHex  = (s.titleColor||'').replace('#','')||t.pptxText;
        const bodyHex   = (s.bodyColor||'').replace('#','')||t.pptxSub;

        // Background: custom > theme
        const customBgHex = s.bgColor ? extractHexForPptx(s.bgColor) : null;
        slide.background  = { color: customBgHex ?? (isClosing ? t.pptxCloseBg : t.pptxBg) };

        if (s.image?.url) {
            try {
                slide.addImage({ data:s.image.url, x:0, y:0, w:'100%', h:'100%', sizing:{type:'cover'} });
                if (s.image.position==='background') {
                    slide.addShape(PptxGenJS.ShapeType?.rect ?? 'rect', { x:0, y:0, w:'100%', h:'100%', fill:{color:'000000',transparency:50} });
                }
            } catch { /* skip images that fail to embed */ }
        }

        // Theme art decorations (only when no full-bleed background image)
        if (!s.image?.url || s.image?.position !== 'background') {
            addThemeArtToPptx(slide, PptxGenJS, themeId, t);
        }

        if (s.layout==='title') {
            slide.addShape(PptxGenJS.ShapeType?.rect??'rect',{ x:'35%',y:'37%',w:'30%',h:'0.5%', fill:{color:t.pptxAccent}, line:{color:t.pptxAccent,width:0} });
            slide.addText(s.title??'',{ x:'10%',y:'40%',w:'80%',h:'20%', fontSize:40,bold:true,color:titleHex, align:'center',valign:'middle',fontFace:'Calibri',wrap:true });
            if (filledBullets.length) {
                slide.addText(
                    filledBullets.flatMap(b => parseHtmlRuns(b, {fontSize:18,color:bodyHex,breakLine:true})),
                    { x:'15%',y:'62%',w:'70%',h:'20%', align:'center',valign:'top',fontFace:'Calibri',wrap:true });
            }
        } else if (s.layout==='section') {
            slide.addText('SECTION',{ x:'10%',y:'34%',w:'80%',h:'8%', fontSize:12,bold:true,color:t.pptxAccent, align:'center',charSpacing:4,fontFace:'Calibri' });
            slide.addText(s.title??'',{ x:'10%',y:'43%',w:'80%',h:'26%', fontSize:36,bold:true,color:titleHex, align:'center',valign:'middle',fontFace:'Calibri',wrap:true });
        } else if (s.layout==='closing') {
            slide.addText(s.title??'',{ x:'10%',y:'26%',w:'80%',h:'22%', fontSize:40,bold:true,color:titleHex, align:'center',valign:'middle',fontFace:'Calibri',wrap:true });
            if (filledBullets.length) {
                const closingRuns = filledBullets.flatMap((b,i) => [
                    ...parseHtmlRuns(b, {fontSize:18,color:bodyHex}),
                    ...(i < filledBullets.length-1 ? [{text:'\n',options:{fontSize:18}}] : []),
                ]);
                slide.addText(closingRuns, { x:'15%',y:'52%',w:'70%',h:'24%', align:'center',valign:'top',fontFace:'Calibri',wrap:true });
            }
        } else {
            const contentW = (s.image?.url && s.image?.position!=='background') ? '55%' : '90%';
            slide.addShape(PptxGenJS.ShapeType?.rect??'rect',{ x:'5%',y:'8%',w:'7%',h:'0.8%', fill:{color:t.pptxAccent}, line:{color:t.pptxAccent,width:0} });
            slide.addText(s.title??'',{ x:'5%',y:'10%',w:contentW,h:'17%', fontSize:28,bold:true,color:titleHex, valign:'middle',fontFace:'Calibri',wrap:true });
            if (filledBullets.length) {
                slide.addText(
                    filledBullets.flatMap(b => parseHtmlRuns(b, {...(showBullet?{bullet:{type:bulletType,indent:15}}:{}),fontSize:18,color:bodyHex,breakLine:true,paraSpaceAfter:6})),
                    { x:'5%',y:'29%',w:contentW,h:'65%', valign:'top',fontFace:'Calibri' }
                );
            }
            if (s.image?.url && s.image?.position!=='background') {
                try { slide.addImage({ data:s.image.url, x:'58%', y:'5%', w:'37%', h:'90%', sizing:{type:'contain'} }); } catch { /* skip images that fail to embed */ }
            }
        }
        if (s.speaker_notes?.trim()) slide.addNotes(s.speaker_notes);
    });
    await pptx.writeFile({ fileName:`${(title||'presentation').replace(/\s+/g,'-').toLowerCase()}.pptx` });
};