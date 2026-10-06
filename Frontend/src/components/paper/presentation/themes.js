// Theme definitions, presets and shared lookup helpers for the presentation editor.

export const THEME_MAP = {
    modern: {
        bg:'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)',
        titleColor:'#ffffff', accentColor:'#6366f1', subtitleColor:'#94a3b8',
        bulletColor:'#E7E5E4', sectionBg:'rgba(99,102,241,0.18)', sectionColor:'#a5b4fc',
        closingBg:'linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)',
        closingTitle:'#ffffff', closingBullet:'#e0e7ff', bulletDot:'#6366f1',
        focusLine:'rgba(99,102,241,0.5)', addBtn:'rgba(255,255,255,0.1)', addBtnH:'rgba(99,102,241,0.25)',
        pptxBg:'0f172a', pptxText:'f1f5f9', pptxAccent:'6366f1', pptxSub:'94a3b8', pptxCloseBg:'6366f1',
    },
    minimal: {
        bg:'linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%)',
        titleColor:'#14532d', accentColor:'#16a34a', subtitleColor:'#166534',
        bulletColor:'#15803d', sectionBg:'rgba(22,163,74,0.1)', sectionColor:'#15803d',
        closingBg:'linear-gradient(135deg,#14532d 0%,#166534 100%)',
        closingTitle:'#ffffff', closingBullet:'#bbf7d0', bulletDot:'#16a34a',
        border:'1px solid rgba(22,163,74,0.15)', focusLine:'rgba(22,163,74,0.35)', addBtn:'rgba(22,163,74,0.06)', addBtnH:'rgba(22,163,74,0.13)',
        pptxBg:'f0fdf4', pptxText:'14532d', pptxAccent:'16a34a', pptxSub:'166534', pptxCloseBg:'14532d',
    },
    academic: {
        bg:'linear-gradient(135deg,#1e3a5f 0%,#1d4ed8 100%)',
        titleColor:'#ffffff', accentColor:'#60a5fa', subtitleColor:'#93c5fd',
        bulletColor:'#bfdbfe', sectionBg:'rgba(96,165,250,0.15)', sectionColor:'#93c5fd',
        closingBg:'linear-gradient(135deg,#1e40af 0%,#3b82f6 100%)',
        closingTitle:'#ffffff', closingBullet:'#bfdbfe', bulletDot:'#60a5fa',
        focusLine:'rgba(96,165,250,0.5)', addBtn:'rgba(255,255,255,0.08)', addBtnH:'rgba(96,165,250,0.25)',
        pptxBg:'1e3a5f', pptxText:'ffffff', pptxAccent:'60a5fa', pptxSub:'93c5fd', pptxCloseBg:'1e40af',
    },
    bold: {
        bg:'linear-gradient(135deg,#6d28d9 0%,#c026d3 100%)',
        titleColor:'#ffffff', accentColor:'#f0abfc', subtitleColor:'#e879f9',
        bulletColor:'#f5d0fe', sectionBg:'rgba(240,171,252,0.15)', sectionColor:'#f0abfc',
        closingBg:'linear-gradient(135deg,#a21caf 0%,#7e22ce 100%)',
        closingTitle:'#ffffff', closingBullet:'#f5d0fe', bulletDot:'#f0abfc',
        focusLine:'rgba(240,171,252,0.5)', addBtn:'rgba(255,255,255,0.08)', addBtnH:'rgba(240,171,252,0.25)',
        pptxBg:'6d28d9', pptxText:'ffffff', pptxAccent:'f0abfc', pptxSub:'f5d0fe', pptxCloseBg:'a21caf',
    },
    pastel: {
        bg:'linear-gradient(135deg,#fce7f3 0%,#e0e7ff 100%)',
        titleColor:'#3730a3', accentColor:'#8b5cf6', subtitleColor:'#6d28d9',
        bulletColor:'#4c1d95', sectionBg:'rgba(139,92,246,0.1)', sectionColor:'#7c3aed',
        closingBg:'linear-gradient(135deg,#8b5cf6 0%,#6366f1 100%)',
        closingTitle:'#ffffff', closingBullet:'#e0e7ff', bulletDot:'#8b5cf6',
        border:'1px solid rgba(139,92,246,0.18)', focusLine:'rgba(139,92,246,0.4)', addBtn:'rgba(139,92,246,0.07)', addBtnH:'rgba(139,92,246,0.16)',
        pptxBg:'fce7f3', pptxText:'3730a3', pptxAccent:'8b5cf6', pptxSub:'6d28d9', pptxCloseBg:'8b5cf6',
    },
};

export const getTheme = (id) => THEME_MAP[id] ?? THEME_MAP.modern;

// ── Background helpers ────────────────────────────────────────────────────────
export const isLightBg = (bg) => {
    if (!bg) return false;
    const s = bg.toLowerCase();
    let hex = '';
    if (s.startsWith('#')) {
        hex = s.slice(1);
    } else if (s.includes('gradient')) {
        const m = s.match(/#([a-f0-9]{6}|[a-f0-9]{3})/);
        hex = m ? m[1] : '';
        if (!hex) return s.includes('white') || s.includes('fff') || s.includes('f8f') || s.includes('fce');
    } else if (s.includes('rgb')) {
        const m = s.match(/(\d+),\s*(\d+),\s*(\d+)/);
        if (m) return (0.299*+m[1] + 0.587*+m[2] + 0.114*+m[3]) / 255 > 0.55;
    }
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    if (hex.length !== 6) return false;
    const r=parseInt(hex.slice(0,2),16), g=parseInt(hex.slice(2,4),16), b=parseInt(hex.slice(4,6),16);
    return (0.299*r + 0.587*g + 0.114*b) / 255 > 0.55;
};

export const extractHexForPptx = (bg) => {
    if (!bg) return null;
    const m = bg.match(/#([a-f0-9]{6})/i);
    return m ? m[1] : null;
};

// ── Background presets ────────────────────────────────────────────────────────
export const BG_PRESETS = [
    { id:'theme',  label:'Theme default', bg:null },
    { id:'ink',    label:'Ink',    bg:'#0a0a0a' },
    { id:'navy',   label:'Navy',   bg:'#0f172a' },
    { id:'forest', label:'Forest', bg:'#14532d' },
    { id:'wine',   label:'Wine',   bg:'#4a0e1e' },
    { id:'violet', label:'Violet', bg:'#2e1065' },
    { id:'slate',  label:'Slate',  bg:'#334155' },
    { id:'white',  label:'White',  bg:'#ffffff' },
    { id:'cream',  label:'Cream',  bg:'#fef9f0' },
    { id:'sky',    label:'Sky',    bg:'#f0f9ff' },
    { id:'sunset', label:'Sunset', bg:'linear-gradient(135deg,#ff6b6b 0%,#ffa07a 100%)' },
    { id:'ocean',  label:'Ocean',  bg:'linear-gradient(135deg,#0f2027 0%,#203a43 50%,#2c5364 100%)' },
    { id:'grove',  label:'Grove',  bg:'linear-gradient(135deg,#134e5e 0%,#71b280 100%)' },
    { id:'flame',  label:'Flame',  bg:'linear-gradient(135deg,#f12711 0%,#f5af19 100%)' },
    { id:'dusk',   label:'Dusk',   bg:'linear-gradient(135deg,#fc5c7d 0%,#6a3093 100%)' },
    { id:'aurora', label:'Aurora', bg:'linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)' },
    { id:'rose',   label:'Rose',   bg:'linear-gradient(135deg,#f8cdda 0%,#1d2b64 100%)' },
    { id:'ash',    label:'Ash',    bg:'linear-gradient(135deg,#232526 0%,#414345 100%)' },
];

// ── Theme swatches config ─────────────────────────────────────────────────────
export const THEME_SWATCHES = {
    modern:   { label:'Modern',   bg:'#0f172a', dot:'#6366f1' },
    minimal:  { label:'Nature',   bg:'#dcfce7', dot:'#16a34a' },
    academic: { label:'Academic', bg:'#1e3a5f', dot:'#60a5fa' },
    bold:     { label:'Bold',     bg:'#7c3aed', dot:'#f0abfc' },
    pastel:   { label:'Pastel',   bg:'#fce7f3', dot:'#8b5cf6' },
};

// ── Character limits ──────────────────────────────────────────────────────────
export const LIMITS = { title:80, sectionTitle:60, body:120, closingLine:100 };

// ── Slide layouts ─────────────────────────────────────────────────────────────
export const LAYOUTS = ['title','content','section','closing'];