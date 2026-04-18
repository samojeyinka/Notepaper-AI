import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { presentationService } from "../../api/presentationService";

// ── Theme definitions ─────────────────────────────────────────────────────────
const THEME_MAP = {
    modern: {
        bg:'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)',
        titleColor:'#ffffff', accentColor:'#6366f1', subtitleColor:'#94a3b8',
        bulletColor:'#cbd5e1', sectionBg:'rgba(99,102,241,0.18)', sectionColor:'#a5b4fc',
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
const getTheme = (id) => THEME_MAP[id] ?? THEME_MAP.modern;

// ── Background helpers ────────────────────────────────────────────────────────
const isLightBg = (bg) => {
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

const extractHexForPptx = (bg) => {
    if (!bg) return null;
    const m = bg.match(/#([a-f0-9]{6})/i);
    return m ? m[1] : null;
};

// ── Background presets ────────────────────────────────────────────────────────
const BG_PRESETS = [
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

// ── Decorative theme art — adapts when a custom bg is set ─────────────────────
const ThemeArt = ({ themeId, customBg }) => {
    // When a custom bg is active, derive neutral adaptive colors
    const adapted = customBg != null && customBg !== '';
    const light   = adapted && isLightBg(customBg);
    const A = adapted ? {
        line : light ? 'rgba(0,0,0,0.07)'   : 'rgba(255,255,255,0.09)',
        dot  : light ? 'rgba(0,0,0,0.10)'   : 'rgba(255,255,255,0.13)',
        fill : light ? 'rgba(0,0,0,0.05)'   : 'rgba(255,255,255,0.07)',
        grid : light ? 'rgba(0,0,0,0.035)'  : 'rgba(255,255,255,0.045)',
    } : null;

    if (themeId === 'modern') return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex:0 }}>
            <div style={{ position:'absolute', top:'-18%', right:'-8%', width:'48%', paddingBottom:'48%', borderRadius:'50%', border:`1.5px solid ${A?A.line:'rgba(99,102,241,0.28)'}` }} />
            <div style={{ position:'absolute', top:'5%', right:'8%', width:'18%', paddingBottom:'18%', borderRadius:'50%', border:`1px solid ${A?A.line:'rgba(99,102,241,0.18)'}` }} />
            <div style={{ position:'absolute', bottom:'-12%', left:'-4%', width:'28%', paddingBottom:'28%', borderRadius:'50%', background:A?A.fill:'rgba(99,102,241,0.14)' }} />
            <div style={{ position:'absolute', inset:0, backgroundImage:`radial-gradient(${A?A.dot:'rgba(99,102,241,0.22)'} 1px,transparent 1px)`, backgroundSize:'28px 28px' }} />
        </div>
    );
    if (themeId === 'minimal') return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex:0 }}>
            {/* Large leaf — top right */}
            <div style={{ position:'absolute', top:'-6%', right:'-4%', width:'28%', paddingBottom:'32%', background:A?A.fill:'rgba(22,163,74,0.13)', borderRadius:'50% 5% 50% 5%', transform:'rotate(-30deg)' }} />
            {/* Medium leaf — top right, inner */}
            <div style={{ position:'absolute', top:'4%', right:'5%', width:'16%', paddingBottom:'19%', background:A?A.fill:'rgba(22,163,74,0.09)', borderRadius:'50% 5% 50% 5%', transform:'rotate(-20deg)' }} />
            {/* Stem line — top right */}
            <div style={{ position:'absolute', top:'2%', right:'12%', width:2, height:'28%', background:A?A.line:'rgba(22,163,74,0.18)', borderRadius:2, transform:'rotate(15deg)', transformOrigin:'top center' }} />
            {/* Small leaf — bottom left */}
            <div style={{ position:'absolute', bottom:'-4%', left:'-3%', width:'18%', paddingBottom:'22%', background:A?A.fill:'rgba(22,163,74,0.1)', borderRadius:'5% 50% 5% 50%', transform:'rotate(20deg)' }} />
            {/* Tiny leaf — bottom left accent */}
            <div style={{ position:'absolute', bottom:'10%', left:'5%', width:'10%', paddingBottom:'12%', background:A?A.fill:'rgba(22,163,74,0.08)', borderRadius:'5% 50% 5% 50%', transform:'rotate(35deg)' }} />
            {/* Dewdrop dots */}
            <div style={{ position:'absolute', top:'22%', right:'26%', width:7, height:7, borderRadius:'50%', background:A?A.dot:'rgba(22,163,74,0.35)' }} />
            <div style={{ position:'absolute', top:'38%', right:'32%', width:4, height:4, borderRadius:'50%', background:A?A.dot:'rgba(22,163,74,0.25)' }} />
            <div style={{ position:'absolute', bottom:'30%', left:'18%', width:5, height:5, borderRadius:'50%', background:A?A.dot:'rgba(22,163,74,0.3)' }} />
            <div style={{ position:'absolute', top:'55%', right:'18%', width:4, height:4, borderRadius:'50%', background:A?A.dot:'rgba(22,163,74,0.2)' }} />
        </div>
    );
    if (themeId === 'academic') return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex:0 }}>
            <div style={{ position:'absolute', top:0, left:0, bottom:0, width:7, background: A ? A.dot : 'linear-gradient(180deg,#60a5fa,#3b82f6)', opacity: A ? 0.5 : 0.6 }} />
            <div style={{ position:'absolute', inset:0, backgroundImage:`repeating-linear-gradient(135deg,transparent,transparent 22px,${A?A.grid:'rgba(96,165,250,0.05)'} 22px,${A?A.grid:'rgba(96,165,250,0.05)'} 23px)` }} />
            <div style={{ position:'absolute', top:14, right:20, width:52, height:52, border:`2px solid ${A?A.line:'rgba(96,165,250,0.28)'}`, borderRadius:'50%' }} />
            <div style={{ position:'absolute', top:22, right:28, width:36, height:36, border:`1.5px solid ${A?A.line:'rgba(96,165,250,0.18)'}`, borderRadius:'50%' }} />
            <div style={{ position:'absolute', top:37, right:43, width:6, height:6, borderRadius:'50%', background:A?A.dot:'rgba(96,165,250,0.5)' }} />
            <div style={{ position:'absolute', bottom:14, left:16, width:40, height:2, background:A?A.fill:'rgba(96,165,250,0.25)', borderRadius:2 }} />
            <div style={{ position:'absolute', bottom:20, left:16, width:24, height:1.5, background:A?A.fill:'rgba(96,165,250,0.18)', borderRadius:2 }} />
        </div>
    );
    if (themeId === 'bold') return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex:0 }}>
            <div style={{ position:'absolute', top:0, right:0, width:0, height:0, borderStyle:'solid', borderWidth:'0 160px 160px 0', borderColor:`transparent ${A?A.dot:'rgba(240,171,252,0.18)'} transparent transparent` }} />
            <div style={{ position:'absolute', top:0, right:0, width:0, height:0, borderStyle:'solid', borderWidth:'0 90px 90px 0', borderColor:`transparent ${A?A.dot:'rgba(240,171,252,0.12)'} transparent transparent` }} />
            <div style={{ position:'absolute', bottom:0, left:0, width:0, height:0, borderStyle:'solid', borderWidth:'100px 0 0 100px', borderColor:`transparent transparent transparent ${A?A.dot:'rgba(240,171,252,0.12)'}` }} />
            <div style={{ position:'absolute', inset:0, backgroundImage:`radial-gradient(${A?A.dot:'rgba(240,171,252,0.18)'} 1.5px,transparent 1.5px)`, backgroundSize:'22px 22px', opacity:0.6 }} />
        </div>
    );
    if (themeId === 'pastel') return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex:0 }}>
            <div style={{ position:'absolute', top:'-22%', right:'-12%', width:'55%', paddingBottom:'55%', borderRadius:'50%', background: A ? A.fill : 'radial-gradient(rgba(139,92,246,0.14),transparent 70%)' }} />
            <div style={{ position:'absolute', bottom:'-18%', left:'3%', width:'40%', paddingBottom:'40%', borderRadius:'50%', background: A ? A.fill : 'radial-gradient(rgba(236,72,153,0.1),transparent 70%)' }} />
            <div style={{ position:'absolute', top:'28%', right:'6%', width:10, height:10, borderRadius:'50%', background:A?A.dot:'rgba(139,92,246,0.45)' }} />
            <div style={{ position:'absolute', top:'58%', right:'14%', width:7, height:7, borderRadius:'50%', background:A?A.dot:'rgba(139,92,246,0.3)' }} />
            <div style={{ position:'absolute', top:'18%', left:'6%', width:8, height:8, borderRadius:'50%', background:A?A.dot:'rgba(236,72,153,0.4)' }} />
            <div style={{ position:'absolute', bottom:'22%', right:'22%', width:5, height:5, borderRadius:'50%', background:A?A.dot:'rgba(99,102,241,0.35)' }} />
        </div>
    );
    return null;
};

// Theme swatches config
const THEME_SWATCHES = {
    modern:   { label:'Modern',   bg:'#0f172a', dot:'#6366f1' },
    minimal:  { label:'Nature',   bg:'#dcfce7', dot:'#16a34a' },
    academic: { label:'Academic', bg:'#1e3a5f', dot:'#60a5fa' },
    bold:     { label:'Bold',     bg:'#7c3aed', dot:'#f0abfc' },
    pastel:   { label:'Pastel',   bg:'#fce7f3', dot:'#8b5cf6' },
};

// Character limits
const LIMITS = { title:80, sectionTitle:60, body:120, closingLine:100 };

// ── Auto-resize field ─────────────────────────────────────────────────────────
const Field = ({ value, onChange, placeholder, style, className, max, multiline=false, noEnter=false, align='left' }) => {
    const ref = useRef(null);
    const [focused, setFocused] = useState(false);
    const remaining = max - (value?.length ?? 0);
    const nearLimit = remaining <= 15;

    useEffect(() => {
        if (!ref.current) return;
        ref.current.style.height = '0px';
        ref.current.style.height = ref.current.scrollHeight + 'px';
    }, [value]);

    const base = {
        background:'transparent', border:'none', outline:'none', resize:'none', overflow:'hidden',
        width:'100%', fontFamily:'inherit', padding:0,
        textAlign:align, wordBreak:'break-word', overflowWrap:'break-word',
        borderBottom: focused ? `1.5px solid ${style?.focusLine ?? 'rgba(255,255,255,0.3)'}` : '1.5px solid transparent',
        transition:'border-color 0.15s',
    };
    const cleanStyle = { ...base, ...style, focusLine:undefined };

    return (
        <div className="relative w-full">
            <textarea ref={ref} value={value??''} placeholder={placeholder} maxLength={max} rows={1}
                onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
                onChange={e=>onChange(e.target.value)}
                onKeyDown={e=>{ if ((!multiline || noEnter) && e.key==='Enter') e.preventDefault(); }}
                style={cleanStyle} className={className}
            />
            {focused && nearLimit && (
                <span style={{ position:'absolute', bottom:2, right:0, fontSize:9, color:style?.focusLine??'rgba(255,255,255,0.3)', pointerEvents:'none' }}>
                    {remaining}
                </span>
            )}
        </div>
    );
};

// ── Rich body field (contenteditable with inline bold) ────────────────────────
const RICH_PLACEHOLDER_STYLE = `.rich-body-field:empty::before{content:attr(data-placeholder);opacity:0.4;pointer-events:none}`;

const RichBodyField = ({ value, onChange, placeholder, style, max }) => {
    const ref  = useRef(null);

    // Sync only when value changes from outside (not our own input)
    useEffect(() => {
        if (!ref.current) return;
        if (ref.current.innerHTML === (value || '')) return;
        ref.current.innerHTML = value || '';
    }, [value]);

    const emit = () => onChange(ref.current.innerHTML);

    const handleInput = () => {
        // Soft-cap: strip trailing content if text exceeds max
        if (max && ref.current.textContent.length > max) {
            // allow — just don't hard-block, presentations need flexibility
        }
        emit();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); return; }
        if (e.ctrlKey || e.metaKey) {
            if (e.key.toLowerCase() === 'b') { e.preventDefault(); document.execCommand('bold'); emit(); }
            if (e.key.toLowerCase() === 'i') { e.preventDefault(); document.execCommand('italic'); emit(); }
            if (e.key.toLowerCase() === 'u') { e.preventDefault(); document.execCommand('underline'); emit(); }
        }
    };

    // Floating bold button on selection
    const [boldPos, setBoldPos] = useState(null);
    const checkSel = () => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !ref.current?.contains(sel.anchorNode)) {
            setBoldPos(null); return;
        }
        const rect = sel.getRangeAt(0).getBoundingClientRect();
        setBoldPos({ top: rect.top + window.scrollY - 36, left: rect.left + rect.width / 2 });
    };
    const applyBold = (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.execCommand('bold');
        emit();
        setBoldPos(null);
    };
    // Hide bold btn when clicking elsewhere
    useEffect(() => {
        const hide = (e) => {
            if (!ref.current?.contains(e.target)) setBoldPos(null);
        };
        document.addEventListener('mousedown', hide);
        return () => document.removeEventListener('mousedown', hide);
    }, []);

    return (
        <>
            <style>{RICH_PLACEHOLDER_STYLE}</style>
            <div
                ref={ref}
                contentEditable
                suppressContentEditableWarning
                className="rich-body-field"
                data-placeholder={placeholder}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onMouseUp={checkSel}
                onKeyUp={checkSel}
                style={{
                    outline: 'none', resize: 'none', width: '100%',
                    fontFamily: 'inherit', padding: 0,
                    wordBreak: 'break-word', overflowWrap: 'break-word',
                    ...style,
                }}
            />
            {boldPos && (
                <div
                    onMouseDown={applyBold}
                    style={{ position: 'absolute', top: boldPos.top, left: boldPos.left, transform: 'translateX(-50%)', zIndex: 9999, pointerEvents: 'auto' }}>
                    <div style={{
                        background: '#1e293b', color: '#fff', borderRadius: 8,
                        padding: '3px 10px', fontSize: 12, fontWeight: 700,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.3)', cursor: 'pointer',
                        userSelect: 'none', letterSpacing: '0.02em',
                    }}>B</div>
                </div>
            )}
        </>
    );
};

// ── Background & Theme modal ──────────────────────────────────────────────────
const BgThemeModal = ({ slide, onChange, themeId, onThemeChange, onClose }) => {
    const t       = getTheme(themeId);
    const set     = (patch) => onChange({ ...slide, ...patch });
    const themeBg = slide.layout === 'closing' ? t.closingBg : t.bg;
    const activeBg = slide.bgColor || themeBg;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onMouseDown={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onMouseDown={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                    <h3 className="font-semibold text-sm text-slate-800">Background & Theme</h3>
                    <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
                        <span className="material-icons-round text-[18px]">close</span>
                    </button>
                </div>

                <div className="p-5 flex flex-col gap-5">
                    {/* Background presets */}
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Background</p>
                        <div className="flex flex-wrap gap-1.5">
                            {BG_PRESETS.map(preset => {
                                const presetBg = preset.bg ?? activeBg;
                                const isActive = preset.bg === null ? !slide.bgColor : slide.bgColor === preset.bg;
                                return (
                                    <button key={preset.id} onClick={() => set({bgColor: preset.bg ?? ''})}
                                        title={preset.label}
                                        className={`w-10 h-8 rounded-lg transition-all shrink-0 overflow-hidden relative flex items-center justify-center ${isActive?'ring-2 ring-primary ring-offset-1 scale-105':'ring-1 ring-slate-200 hover:ring-slate-400 hover:scale-105'}`}
                                        style={{ background: presetBg }}>
                                        {preset.bg === null && (
                                            <span className="text-[9px] font-bold"
                                                style={{ color: isLightBg(activeBg) ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.7)' }}>
                                                T
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                            {/* Custom picker */}
                            <label className="w-10 h-8 rounded-lg cursor-pointer border border-dashed border-slate-300 hover:border-primary flex items-center justify-center transition-colors shrink-0 relative" title="Custom colour">
                                <span className="material-icons-round text-[14px] text-slate-400 pointer-events-none">colorize</span>
                                <input type="color"
                                    value={slide.bgColor?.startsWith('#') ? slide.bgColor : '#0f172a'}
                                    onChange={e => set({bgColor: e.target.value})}
                                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                            </label>
                        </div>
                        {slide.bgColor && (
                            <button onClick={() => set({bgColor:''})}
                                className="mt-2 flex items-center gap-1 text-[10px] text-slate-400 hover:text-red-400 transition-colors">
                                ↺ Reset to theme default
                            </button>
                        )}
                    </div>

                    {/* Theme */}
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Theme</p>
                        <div className="flex items-center gap-3">
                            {Object.entries(THEME_SWATCHES).map(([key, s]) => (
                                <button key={key} onClick={() => onThemeChange(key)}
                                    className="flex flex-col items-center gap-1 group transition-all">
                                    <div className="w-14 h-10 rounded-xl overflow-hidden relative transition-all"
                                        style={{ background:s.bg, outline:themeId===key?`2.5px solid ${s.dot}`:'2px solid transparent', outlineOffset:2, transform:themeId===key?'scale(1.08)':'scale(1)' }}>
                                        <div style={{ position:'absolute', bottom:4, right:4, width:9, height:9, borderRadius:'50%', background:s.dot, opacity:0.85 }} />
                                    </div>
                                    <span className={`text-[10px] font-semibold ${themeId===key?'text-primary':'text-slate-400 group-hover:text-slate-600'}`}>{s.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Slide toolbar ─────────────────────────────────────────────────────────────
const LAYOUTS = ['title','content','section','closing'];

const SlideToolbar = ({ slide, onChange, onAddSlide, onMoveUp, onMoveDown, canMoveUp, canMoveDown, slideNum, total, themeId, onThemeChange, onImageUpload }) => {
    const [showBgModal, setShowBgModal] = useState(false);

    const t       = getTheme(themeId);
    const set     = (patch) => onChange({ ...slide, ...patch });
    const lh      = slide.lineHeight ?? 1.6;
    const hasBody = slide.layout !== 'section';
    const isNumbered = slide.listStyle === 'numbered';
    const isText     = slide.listStyle === 'text';

    const setLayout = (layout) => {
        const patch = { layout };
        if (layout === 'section') patch.bullets = undefined;
        if (slide.layout === 'section' && layout !== 'section') patch.bullets = [''];
        onChange({ ...slide, ...patch });
    };

    const hasBgOverride = !!slide.bgColor;

    return (
        <>
            <div className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-white border-b border-slate-100 overflow-x-auto" style={{ minHeight:40 }}>
                {/* Layout */}
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-0.5">Layout</span>
                {LAYOUTS.map(l => (
                    <button key={l} onClick={() => setLayout(l)}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-semibold capitalize transition-all shrink-0 ${slide.layout===l?'bg-primary text-white':'text-slate-500 hover:bg-slate-100'}`}>
                        {l}
                    </button>
                ))}

                <div className="w-px h-4 bg-slate-200 shrink-0 mx-1" />

                {/* List style */}
                {hasBody && (<>
                    <button onClick={() => set({listStyle:'bullet'})} title="Bullets"
                        className={`w-6 h-6 flex items-center justify-center rounded-md transition-all shrink-0 ${!isNumbered&&!isText?'bg-slate-900 text-white':'text-slate-500 hover:bg-slate-100'}`}>
                        <span className="material-icons-round text-[13px]">format_list_bulleted</span>
                    </button>
                    <button onClick={() => set({listStyle:'numbered'})} title="Numbered"
                        className={`w-6 h-6 flex items-center justify-center rounded-md transition-all shrink-0 ${isNumbered?'bg-slate-900 text-white':'text-slate-500 hover:bg-slate-100'}`}>
                        <span className="material-icons-round text-[13px]">format_list_numbered</span>
                    </button>
                    <button onClick={() => set({listStyle:'text'})} title="Free text"
                        className={`w-6 h-6 flex items-center justify-center rounded-md transition-all shrink-0 ${isText?'bg-slate-900 text-white':'text-slate-500 hover:bg-slate-100'}`}>
                        <span className="material-icons-round text-[13px]">notes</span>
                    </button>
                    {(slide.bullets??[]).length < 7 && (
                        <button onClick={() => set({bullets:[...(slide.bullets??[]),''] })}
                            className="flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-semibold text-slate-500 hover:bg-slate-100 transition-all shrink-0">
                            <span className="material-icons-round text-[12px]">add</span>{isText?'Para':'Point'}
                        </button>
                    )}
                    {/* Bold / Italic / Underline */}
                    <button
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => document.execCommand('bold')}
                        title="Bold (Ctrl+B)"
                        className="w-6 h-6 flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 transition-all shrink-0 font-bold text-[13px]">
                        B
                    </button>
                    <button
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => document.execCommand('italic')}
                        title="Italic (Ctrl+I)"
                        className="w-6 h-6 flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 transition-all shrink-0 italic text-[13px] font-semibold">
                        I
                    </button>
                    <button
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => document.execCommand('underline')}
                        title="Underline (Ctrl+U)"
                        className="w-6 h-6 flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 transition-all shrink-0 underline text-[13px] font-semibold">
                        U
                    </button>
                    <div className="w-px h-4 bg-slate-200 shrink-0 mx-1" />
                </>)}

                {/* Spacing */}
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Spacing</span>
                <button onClick={() => set({lineHeight:Math.max(1.1,+(lh-0.1).toFixed(1))})}
                    className="w-5 h-5 flex items-center justify-center rounded text-slate-500 hover:bg-slate-100 text-[13px] font-bold shrink-0">−</button>
                <span className="text-[11px] font-semibold text-slate-600 w-6 text-center shrink-0 tabular-nums">{lh.toFixed(1)}</span>
                <button onClick={() => set({lineHeight:Math.min(3,+(lh+0.1).toFixed(1))})}
                    className="w-5 h-5 flex items-center justify-center rounded text-slate-500 hover:bg-slate-100 text-[13px] font-bold shrink-0">+</button>

                <div className="w-px h-4 bg-slate-200 shrink-0 mx-1" />

                {/* Title color */}
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Title</span>
                <label className="relative w-5 h-5 rounded cursor-pointer shrink-0 border border-slate-200 overflow-hidden" title="Title colour"
                    style={{ background: slide.titleColor || t.titleColor }}>
                    <input type="color" value={slide.titleColor||t.titleColor} onChange={e=>set({titleColor:e.target.value})}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                </label>
                {slide.titleColor && <button onClick={() => set({titleColor:''})} className="text-[10px] text-slate-400 hover:text-red-400 shrink-0" title="Reset">↺</button>}

                {/* Body color */}
                {hasBody && (<>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Body</span>
                    <label className="relative w-5 h-5 rounded cursor-pointer shrink-0 border border-slate-200 overflow-hidden" title="Body colour"
                        style={{ background: slide.bodyColor || t.bulletColor }}>
                        <input type="color" value={slide.bodyColor||t.bulletColor} onChange={e=>set({bodyColor:e.target.value})}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                    </label>
                    {slide.bodyColor && <button onClick={() => set({bodyColor:''})} className="text-[10px] text-slate-400 hover:text-red-400 shrink-0" title="Reset">↺</button>}
                </>)}

                <div className="w-px h-4 bg-slate-200 shrink-0 mx-1" />

                {/* Image */}
                {!slide.image ? (
                    <button onClick={onImageUpload}
                        className="flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-semibold text-slate-500 hover:bg-slate-100 transition-all shrink-0">
                        <span className="material-icons-round text-[13px]">image</span>
                        Image
                    </button>
                ) : (<>
                    <div className="flex items-center gap-0.5 bg-slate-100 rounded-md p-0.5 shrink-0">
                        <button onClick={() => set({image:{...slide.image,position:'right'}})}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-all ${slide.image?.position!=='background'?'bg-white shadow-sm text-slate-700':'text-slate-400'}`}>
                            Side
                        </button>
                        <button onClick={() => set({image:{...slide.image,position:'background'}})}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-all ${slide.image?.position==='background'?'bg-white shadow-sm text-slate-700':'text-slate-400'}`}>
                            BG
                        </button>
                    </div>
                    <button onClick={() => set({image:null})}
                        className="flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-semibold text-red-500 hover:bg-red-50 transition-all shrink-0">
                        <span className="material-icons-round text-[13px]">hide_image</span>
                        Remove
                    </button>
                </>)}

                <div className="w-px h-4 bg-slate-200 shrink-0 mx-1" />

                {/* Background & Theme button */}
                <button onClick={() => setShowBgModal(true)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all shrink-0 border ${hasBgOverride?'border-primary/40 text-primary bg-primary/5':'border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                    title="Background & Theme">
                    <span className="material-icons-round text-[13px]">palette</span>
                    BG &amp; Theme
                    {hasBgOverride && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                </button>

                {/* Actions */}
                <div className="ml-auto flex items-center gap-1 shrink-0">
                    <button onClick={onMoveUp} disabled={!canMoveUp}
                        className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:bg-slate-100 disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                        <span className="material-icons-round text-[14px]">arrow_upward</span>
                    </button>
                    <button onClick={onMoveDown} disabled={!canMoveDown}
                        className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:bg-slate-100 disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                        <span className="material-icons-round text-[14px]">arrow_downward</span>
                    </button>
                    <button onClick={onAddSlide}
                        className="flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-all ml-1">
                        <span className="material-icons-round text-[12px]">add</span>Slide
                    </button>
                    <span className="text-[10px] text-slate-400 ml-1 tabular-nums">{slideNum}/{total}</span>
                </div>
            </div>

            {/* Background & Theme modal */}
            {showBgModal && (
                <BgThemeModal
                    slide={slide} onChange={onChange}
                    themeId={themeId} onThemeChange={onThemeChange}
                    onClose={() => setShowBgModal(false)}
                />
            )}
        </>
    );
};

// ── Delete button overlay ─────────────────────────────────────────────────────
const DeleteBtn = ({ onDelete }) => (
    <button onClick={onDelete} data-pdf-hide
        className="absolute top-2 right-2 z-30 opacity-0 group-hover/slide:opacity-100 w-7 h-7 rounded-lg bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center transition-all shadow-md"
        title="Delete slide">
        <span className="material-icons-round text-[14px]">delete</span>
    </button>
);

// ── Body row ──────────────────────────────────────────────────────────────────
const BodyRow = ({ value, index, total, listStyle, onChange, onRemove, color, dotColor, focusLine, fontSize, lineHeight, addBtn, addBtnH }) => {
    const [hovered, setHovered] = useState(false);
    const hasValue   = value?.trim().length > 0;
    const showMarker = listStyle !== 'text' && hasValue;
    return (
        <div className="flex items-start gap-2 group/bullet"
            onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}>
            {listStyle !== 'text' && (
                <span style={{ color:dotColor, fontSize, fontWeight:listStyle==='numbered'?700:400, lineHeight, flexShrink:0, minWidth:listStyle==='numbered'?22:12, marginTop:2, opacity:showMarker?1:0, transition:'opacity 0.15s' }}>
                    {listStyle==='numbered' ? `${index+1}.` : '•'}
                </span>
            )}
            <RichBodyField value={value} onChange={onChange} max={LIMITS.body}
                placeholder={listStyle==='text' ? `Paragraph ${index+1}…` : `Point ${index+1}…`}
                style={{ color, fontSize, lineHeight }}
            />
            {total > 1 && hovered && (
                <button onClick={onRemove}
                    className="w-5 h-5 mt-1 rounded-full flex items-center justify-center shrink-0 transition-all"
                    style={{ background:'rgba(239,68,68,0.15)', color:'#ef4444' }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,0.3)'}
                    onMouseLeave={e=>e.currentTarget.style.background='rgba(239,68,68,0.15)'}>
                    <span className="material-icons-round text-[12px]">close</span>
                </button>
            )}
        </div>
    );
};

// ── Slide editor ──────────────────────────────────────────────────────────────
const SlideEditor = ({ slide, themeId, onChange, onDelete, canDelete }) => {
    const t         = getTheme(themeId);
    const set       = (patch) => onChange({ ...slide, ...patch });
    const setBullet = (i,v) => { const b=[...(slide.bullets??[])]; b[i]=v; set({bullets:b}); };
    const addBullet = () => set({ bullets:[...(slide.bullets??[]),''] });
    const removeBullet = (i) => set({ bullets:(slide.bullets??[]).filter((_,j)=>j!==i) });
    const [imgHovered, setImgHovered] = useState(false);

    const listStyle = slide.listStyle ?? 'bullet';
    const bullets   = slide.bullets ?? [];
    const lh        = slide.lineHeight ?? 1.6;

    const rTitle  = slide.titleColor  || t.titleColor;
    const rBody   = slide.bodyColor   || t.bulletColor;
    const rSub    = slide.bodyColor   || t.subtitleColor;
    const rAccent = t.accentColor;

    // Effective backgrounds — slide.bgColor overrides theme
    const themeBg    = slide.layout === 'closing' ? t.closingBg : t.bg;
    const effectiveBg = slide.bgColor || themeBg;
    const customBg   = slide.bgColor || null; // null → ThemeArt uses theme colors

    const hasImage = !!slide.image?.url;
    const imgBg    = slide.image?.position === 'background';

    // For text on a custom bg, resolve safe contrast colors
    const rFocusLine = slide.bgColor
        ? (isLightBg(slide.bgColor) ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.3)')
        : t.focusLine;
    const rAddBtn  = slide.bgColor
        ? (isLightBg(slide.bgColor) ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)')
        : t.addBtn;
    const rAddBtnH = slide.bgColor
        ? (isLightBg(slide.bgColor) ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.18)')
        : t.addBtnH;

    const commonWrap = (children, border) => (
        <div className="w-full h-full relative group/slide" style={{ background:effectiveBg, border:border??'none', overflow:'hidden' }}>
            <ThemeArt themeId={themeId} customBg={customBg} />
            {hasImage && imgBg && (
                <div
                    onMouseEnter={() => setImgHovered(true)}
                    onMouseLeave={() => setImgHovered(false)}
                    style={{ position:'absolute', inset:0, zIndex:1 }}>
                    <img src={slide.image.url} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt="" />
                    <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.52)' }} />
                    <button onClick={() => set({image:null})} data-pdf-hide
                        style={{ position:'absolute', top:8, right:8, zIndex:10, opacity: imgHovered ? 1 : 0, transition:'opacity 0.15s' }}
                        className="w-7 h-7 rounded-full bg-black/60 hover:bg-red-500 text-white flex items-center justify-center shadow-lg"
                        title="Remove image">
                        <span className="material-icons-round text-[14px]">close</span>
                    </button>
                </div>
            )}
            {canDelete && <DeleteBtn onDelete={onDelete} />}
            <div style={{ position:'relative', zIndex:2, width:'100%', height:'100%' }}>
                {children}
            </div>
        </div>
    );

    const addBtn = (label) => bullets.length < 7 && (
        <button onClick={addBullet} data-pdf-hide className="flex items-center gap-1 self-start text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 transition-all"
            style={{ color:rBody, background:rAddBtn }}
            onMouseEnter={e=>e.currentTarget.style.background=rAddBtnH}
            onMouseLeave={e=>e.currentTarget.style.background=rAddBtn}>
            <span className="material-icons-round text-[11px]">add</span>{label}
        </button>
    );

    if (slide.layout === 'title') return commonWrap(
        <div className="w-full h-full flex flex-col items-center justify-center text-center px-[8%]">
            <div style={{ width:40, height:4, background:rAccent, borderRadius:2, marginBottom:22, flexShrink:0 }} />
            <Field value={slide.title} onChange={v=>set({title:v})} max={LIMITS.title}
                placeholder="Presentation title…" align="center"
                style={{ color:rTitle, fontSize:'clamp(20px,3vw,44px)', fontWeight:800, lineHeight:1.2, letterSpacing:'-0.02em', marginBottom:14, focusLine:rFocusLine }}
            />
            <div style={{ width:'70%', display:'flex', flexDirection:'column', gap:6 }}>
                {bullets.map((b,i) => (
                    <BodyRow key={i} value={b} index={i} total={bullets.length} listStyle={listStyle}
                        onChange={v=>setBullet(i,v)} onRemove={()=>removeBullet(i)}
                        color={rSub} dotColor={rSub} focusLine={rFocusLine}
                        fontSize={'clamp(11px,1.3vw,18px)'} lineHeight={lh}
                        addBtn={rAddBtn} addBtnH={rAddBtnH}
                    />
                ))}
                {bullets.length < 4 && addBtn('Add line')}
            </div>
        </div>,
        slide.bgColor ? 'none' : t.border
    );

    if (slide.layout === 'section') return commonWrap(
        <div className="w-full h-full flex flex-col items-center justify-center text-center px-[8%]">
            <div style={{ background:t.sectionBg, borderRadius:14, padding:'26px 44px', maxWidth:'80%', width:'100%' }}>
                <p style={{ color:rAccent, fontSize:'clamp(9px,1vw,12px)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:12 }}>Section</p>
                <Field value={slide.title} onChange={v=>set({title:v})} max={LIMITS.sectionTitle}
                    placeholder="Section title…" align="center"
                    style={{ color:slide.titleColor||t.sectionColor, fontSize:'clamp(18px,2.6vw,36px)', fontWeight:700, lineHeight:1.25, textAlign:'center', focusLine:rFocusLine }}
                />
            </div>
        </div>,
        slide.bgColor ? 'none' : t.border
    );

    if (slide.layout === 'closing') return commonWrap(
        <div className="w-full h-full flex flex-col items-center justify-center text-center px-[8%]">
            <div style={{ width:48, height:48, borderRadius:'50%', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18, flexShrink:0 }}>
                <span className="material-icons-round" style={{ color:'#fff', fontSize:24 }}>celebration</span>
            </div>
            <Field value={slide.title} onChange={v=>set({title:v})} max={LIMITS.title}
                placeholder="Closing title…" align="center"
                style={{ color:rTitle, fontSize:'clamp(20px,3vw,44px)', fontWeight:800, lineHeight:1.2, letterSpacing:'-0.02em', marginBottom:12, focusLine:rFocusLine }}
            />
            <div style={{ width:'66%', display:'flex', flexDirection:'column', gap:8 }}>
                {bullets.map((b,i) => (
                    <BodyRow key={i} value={b} index={i} total={bullets.length} listStyle={listStyle}
                        onChange={v=>setBullet(i,v)} onRemove={()=>removeBullet(i)}
                        color={slide.bodyColor||t.closingBullet} dotColor={slide.bodyColor||t.closingBullet}
                        focusLine={rFocusLine} fontSize={'clamp(11px,1.3vw,17px)'} lineHeight={lh}
                        addBtn={rAddBtn} addBtnH={rAddBtnH}
                    />
                ))}
                {bullets.length < 5 && addBtn('Add line')}
            </div>
        </div>
    );

    // content
    const contentLeft = (
        <div style={{ display:'flex', flexDirection:'column', padding:'5% 4% 5% 6%', flex: hasImage&&!imgBg ? '0 0 58%' : '1' }}>
            <div style={{ marginBottom:'clamp(10px,1.8vh,18px)', flexShrink:0 }}>
                <div style={{ width:26, height:3, background:rAccent, borderRadius:2, marginBottom:9 }} />
                <Field value={slide.title} onChange={v=>set({title:v})} max={LIMITS.title}
                    placeholder="Slide title…"
                    style={{ color:rTitle, fontSize:'clamp(14px,1.9vw,28px)', fontWeight:700, lineHeight:1.25, focusLine:rFocusLine }}
                />
            </div>
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:`clamp(4px,${lh*4}px,${lh*9}px)`, overflow:'hidden' }}>
                {bullets.map((b,i) => (
                    <BodyRow key={i} value={b} index={i} total={bullets.length} listStyle={listStyle}
                        onChange={v=>setBullet(i,v)} onRemove={()=>removeBullet(i)}
                        color={rBody} dotColor={t.bulletDot}
                        focusLine={rFocusLine} fontSize={'clamp(10px,1.25vw,18px)'} lineHeight={lh}
                        addBtn={rAddBtn} addBtnH={rAddBtnH}
                    />
                ))}
                {bullets.length < 7 && addBtn('Add')}
            </div>
        </div>
    );

    return commonWrap(
        <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'row' }}>
            {contentLeft}
            {hasImage && !imgBg && (
                <div
                    onMouseEnter={() => setImgHovered(true)}
                    onMouseLeave={() => setImgHovered(false)}
                    style={{ flex:'0 0 42%', position:'relative', display:'flex', alignItems:'center', justifyContent:'center', padding:'5% 4%', borderLeft:'1px solid rgba(255,255,255,0.08)' }}>
                    <img src={slide.image.url} style={{ maxWidth:'100%', maxHeight:'70%', width:'100%', height:'70%', objectFit:'contain', borderRadius:6 }} alt="" />
                    <button onClick={() => set({image:null})} data-pdf-hide
                        style={{ position:'absolute', top:8, right:8, zIndex:10, opacity: imgHovered ? 1 : 0, transition:'opacity 0.15s' }}
                        className="w-7 h-7 rounded-full bg-black/60 hover:bg-red-500 text-white flex items-center justify-center shadow-lg"
                        title="Remove image">
                        <span className="material-icons-round text-[14px]">close</span>
                    </button>
                </div>
            )}
        </div>,
        slide.bgColor ? 'none' : t.border
    );
};

// ── Static thumbnail ──────────────────────────────────────────────────────────
const Thumbnail = ({ slide, themeId }) => {
    const t  = getTheme(themeId);
    const bg = slide.bgColor || (slide.layout==='closing' ? t.closingBg : t.bg);
    const tc = slide.titleColor || (slide.layout==='closing' ? t.closingTitle : t.titleColor);
    const bc = slide.bodyColor  || (slide.layout==='closing' ? t.closingBullet : t.bulletColor);
    return (
        <div className="w-full aspect-video rounded overflow-hidden relative" style={{ background:bg, border:slide.bgColor?'none':(t.border??'none') }}>
            <ThemeArt themeId={themeId} customBg={slide.bgColor||null} />
            <div className="absolute inset-0 p-1.5 flex flex-col justify-center" style={{ zIndex:1 }}>
                {slide.layout!=='section' && <div style={{ width:8,height:1.5,background:t.accentColor,borderRadius:1,marginBottom:2 }} />}
                <p style={{ color:tc, fontSize:5, fontWeight:700, lineHeight:1.3, overflow:'hidden', maxHeight:16 }}>{slide.title}</p>
                {(slide.bullets??[]).filter(b=>b?.trim()).slice(0,3).map((b,i)=>(
                    <p key={i} style={{ color:bc, fontSize:3.5, lineHeight:1.4, overflow:'hidden', marginTop:1.5, opacity:0.75 }}>{b}</p>
                ))}
            </div>
            {slide.image?.url && !slide.image?.position?.includes('background') && (
                <div style={{ position:'absolute', right:0, top:0, bottom:0, width:'38%', display:'flex', alignItems:'center', justifyContent:'center', padding:'6% 4%', zIndex:1 }}>
                    <img src={slide.image.url} style={{ maxWidth:'100%', maxHeight:'70%', objectFit:'contain' }} alt="" />
                </div>
            )}
        </div>
    );
};

// ── Canvas ambient background ─────────────────────────────────────────────────
/** Returns a very soft tint derived from the slide's effective background */
const getCanvasBg = (slide, themeId) => {
    const t = getTheme(themeId);
    const activeBg = (slide?.bgColor) || (slide?.layout === 'closing' ? t.closingBg : t.bg);
    const m = activeBg.match(/#([a-f0-9]{6})/i);
    if (!m) return '#e8eaed';
    const r = parseInt(m[1].slice(0,2),16);
    const g = parseInt(m[1].slice(2,4),16);
    const b = parseInt(m[1].slice(4,6),16);
    // Blend 14% of the slide color into a light neutral base (218)
    const mix = (c) => Math.round(c * 0.14 + 218 * 0.86);
    return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
};

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

// ── PPTX theme art (coordinates clamped to 0-100% so nothing overflows) ───────
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
const exportAsPPTX = async (slides, themeId, title) => {
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
            } catch (_) {}
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
                try { slide.addImage({ data:s.image.url, x:'58%', y:'5%', w:'37%', h:'90%', sizing:{type:'contain'} }); } catch(_){}
            }
        }
        if (s.speaker_notes?.trim()) slide.addNotes(s.speaker_notes);
    });
    await pptx.writeFile({ fileName:`${(title||'presentation').replace(/\s+/g,'-').toLowerCase()}.pptx` });
};

// ── Main Presentation viewer ──────────────────────────────────────────────────
export const Presentation = () => {
    const { id }   = useParams();
    const navigate = useNavigate();

    const [presentation, setPresentation] = useState(null);
    const [slides, setSlides]             = useState([]);
    const [idx, setIdx]                   = useState(0);
    const [themeId, setThemeId]           = useState('modern');
    const [showNotes, setShowNotes]       = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [loading, setLoading]           = useState(true);
    const [saving, setSaving]             = useState(false);
    const [saveMsg, setSaveMsg]           = useState('');
    const [exporting, setExporting]         = useState(false);
    const [exportingPdf, setExportingPdf]   = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [error, setError]               = useState(null);
    const [title, setTitle]               = useState('');
    const titleSaveTimer                  = useRef(null);
    const slideAreaRef  = useRef(null);
    const slideRef      = useRef(null);
    const exportMenuRef = useRef(null);
    const saveTimer     = useRef(null);
    const slidesRef     = useRef(slides);
    const imgInputRef   = useRef(null);
    slidesRef.current   = slides;

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        presentationService.get(id)
            .then(res => {
                const p = res.data;
                setPresentation(p);
                setTitle(p.title ?? '');
                setThemeId(p.theme ?? 'modern');
                try {
                    const raw = p.slides;
                    setSlides(Array.isArray(raw) ? raw : JSON.parse(raw ?? '[]'));
                } catch { setSlides([]); }
            })
            .catch(() => setError('Could not load presentation.'))
            .finally(() => setLoading(false));
    }, [id]);

    // Debounced auto-save
    useEffect(() => {
        if (!id || loading) return;
        clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(async () => {
            setSaving(true); setSaveMsg('');
            try {
                await presentationService.update(id, { slides: JSON.stringify(slidesRef.current) });
                setSaveMsg('saved');
                setTimeout(() => setSaveMsg(''), 2500);
            } catch { setSaveMsg('error'); }
            finally { setSaving(false); }
        }, 1000);
        return () => clearTimeout(saveTimer.current);
    }, [slides, id, loading]);

    const goTo   = useCallback((i) => setIdx(Math.max(0, Math.min(slides.length-1, i))), [slides.length]);
    const goPrev = useCallback(() => goTo(idx-1), [idx, goTo]);
    const goNext = useCallback(() => goTo(idx+1), [idx, goTo]);

    useEffect(() => {
        const h = (e) => {
            const tag = document.activeElement?.tagName;
            if (tag==='INPUT'||tag==='TEXTAREA') return;
            if (e.key==='ArrowRight'||e.key==='ArrowDown') { e.preventDefault(); goNext(); }
            if (e.key==='ArrowLeft' ||e.key==='ArrowUp')   { e.preventDefault(); goPrev(); }
            if (e.key==='Escape' && isFullscreen) document.exitFullscreen?.();
        };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [goNext, goPrev, isFullscreen]);

    const toggleFS = () => {
        if (!document.fullscreenElement) { slideAreaRef.current?.requestFullscreen?.(); setIsFullscreen(true); }
        else { document.exitFullscreen?.(); setIsFullscreen(false); }
    };
    useEffect(() => {
        const h = () => { if (!document.fullscreenElement) setIsFullscreen(false); };
        document.addEventListener('fullscreenchange', h);
        return () => document.removeEventListener('fullscreenchange', h);
    }, []);

    const updateSlide = useCallback((i, s) => setSlides(p => { const n=[...p]; n[i]=s; return n; }), []);
    const deleteSlide = useCallback((i) => {
        if (slides.length <= 1) return;
        setSlides(p => p.filter((_,j) => j!==i));
        setIdx(c => Math.min(c, slides.length-2));
    }, [slides.length]);
    const moveSlide = useCallback((i, dir) => {
        const j = i+dir; if (j<0||j>=slides.length) return;
        setSlides(p => { const n=[...p]; [n[i],n[j]]=[n[j],n[i]]; return n; });
        setIdx(j);
    }, [slides.length]);
    const addSlide = useCallback(() => {
        const blank = { slide:slides.length+1, layout:'content', title:'', bullets:[''], speaker_notes:'', listStyle:'bullet' };
        setSlides(p => { const n=[...p]; n.splice(idx+1, 0, blank); return n; });
        setIdx(idx+1);
    }, [idx, slides.length]);

    const handleTitleChange = (val) => {
        setTitle(val);
        clearTimeout(titleSaveTimer.current);
        titleSaveTimer.current = setTimeout(async () => {
            if (!id) return;
            try { await presentationService.update(id, { title: val }); } catch {}
        }, 800);
    };

    const handleTitleKeyDown = (e) => {
        if (e.key === 'Enter') e.target.blur();
    };

    const handleThemeChange = useCallback(async (t) => {
        setThemeId(t);
        if (!id) return;
        try { await presentationService.update(id, { theme:t }); } catch {}
    }, [id]);

    // Close export menu on outside click
    useEffect(() => {
        if (!showExportMenu) return;
        const h = (e) => { if (!exportMenuRef.current?.contains(e.target)) setShowExportMenu(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [showExportMenu]);

    const handleExportPDF = async () => {
        if (!slideRef.current) return;
        setShowExportMenu(false);
        setExportingPdf(true);
        const originalIdx = idx;
        try {
            const { toPng }  = await import('html-to-image');
            const { jsPDF }  = await import('jspdf');
            // 16:9 page in mm
            const W = 267.75, H = 150.57;
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [W, H] });
            const nextFrame = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

            for (let i = 0; i < slides.length; i++) {
                setIdx(i);
                await nextFrame();
                const dataUrl = await toPng(slideRef.current, {
                    pixelRatio: 2,
                    cacheBust: true,
                    filter: (node) => !node.dataset?.pdfHide,
                });
                if (i > 0) pdf.addPage([W, H], 'landscape');
                pdf.addImage(dataUrl, 'PNG', 0, 0, W, H);
            }
            pdf.save(`${(title || 'presentation').replace(/\s+/g, '-').toLowerCase()}.pdf`);
        } catch (e) {
            console.error(e);
            alert('PDF export failed.');
        } finally {
            setIdx(originalIdx);
            setExportingPdf(false);
        }
    };

    const handleImageUpload = useCallback((e) => {
        const file = e.target.files?.[0]; e.target.value = '';
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const url = ev.target?.result;
            if (url) updateSlide(idx, { ...slidesRef.current[idx], image:{url, position:'right'} });
        };
        reader.readAsDataURL(file);
    }, [idx, updateSlide]);

    const handleExportPPTX = async () => {
        if (!presentation) return;
        setExporting(true);
        try { await exportAsPPTX(slides, themeId, title); }
        catch (e) { console.error(e); alert('Export failed.'); }
        finally { setExporting(false); }
    };

    const current = slides[idx];
    const pct     = slides.length > 1 ? (idx/(slides.length-1))*100 : 0;

    if (loading) return (
        <div className="flex flex-col flex-1 h-screen items-center justify-center bg-slate-50 lg:ml-64">
            <span className="material-icons-round text-primary text-[48px] animate-spin">sync</span>
            <p className="text-sm text-slate-400 mt-4">Loading presentation…</p>
        </div>
    );
    if (error || !presentation) return (
        <div className="flex flex-col flex-1 h-screen items-center justify-center bg-slate-50 lg:ml-64">
            <span className="material-icons-round text-slate-300 text-[56px]">broken_image</span>
            <p className="text-slate-500 mt-3 text-sm">{error ?? 'Presentation not found.'}</p>
            <button onClick={() => navigate(-1)} className="mt-4 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold">Go back</button>
        </div>
    );

    return (
        <div className="flex flex-col flex-1 h-screen overflow-hidden bg-slate-100 lg:ml-64 pt-16 lg:pt-0">
            {/* Hidden image input */}
            <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

            {/* App header */}
            <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-slate-200 shrink-0 z-10 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors shrink-0">
                        <span className="material-icons-round text-[20px]">arrow_back</span>
                    </button>
                    <div className="min-w-0">
                        <input
                            value={title}
                            onChange={e => handleTitleChange(e.target.value)}
                            onKeyDown={handleTitleKeyDown}
                            placeholder="Untitled Presentation"
                            className="text-slate-900 font-semibold text-sm bg-transparent outline-none border-b border-transparent focus:border-slate-300 hover:border-slate-200 transition-colors w-full truncate placeholder-slate-400"
                        />
                        <p className="text-slate-400 text-[10px]">{slides.length} slides · {themeId}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {saving && <span className="flex items-center gap-1 text-[11px] text-amber-500"><span className="material-icons-round text-[13px] animate-spin">sync</span>Saving…</span>}
                    {!saving && saveMsg==='saved' && <span className="flex items-center gap-1 text-[11px] text-green-500"><span className="material-icons-round text-[13px]">check</span>Saved</span>}
                    <button onClick={() => setShowNotes(v=>!v)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${showNotes?'bg-amber-50 text-amber-600 border border-amber-200':'text-slate-500 hover:bg-slate-100'}`}>
                        <span className="material-icons-round text-[15px]">speaker_notes</span>Notes
                    </button>
                    <button onClick={toggleFS} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-all">
                        <span className="material-icons-round text-[18px]">{isFullscreen?'fullscreen_exit':'fullscreen'}</span>
                    </button>
                    {/* Export dropdown */}
                    <div ref={exportMenuRef} className="relative">
                        <button
                            onClick={() => setShowExportMenu(v => !v)}
                            disabled={exporting || exportingPdf}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary/90 active:scale-95 transition-all shadow-md shadow-primary/20 disabled:opacity-60"
                        >
                            {(exporting || exportingPdf)
                                ? <><span className="material-icons-round text-[14px] animate-spin">sync</span>{exportingPdf ? 'Exporting PDF…' : 'Exporting…'}</>
                                : <><span className="material-icons-round text-[14px]">download</span>Export<span className="material-icons-round text-[14px] ml-0.5">expand_more</span></>}
                        </button>
                        {showExportMenu && (
                            <div className="absolute right-0 top-9 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 w-44 z-50 animate-in fade-in zoom-in-95 duration-100">
                                <button
                                    onClick={() => { setShowExportMenu(false); handleExportPPTX(); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <span className="material-icons-round text-[17px] text-indigo-400">slideshow</span>
                                    Export PPTX
                                </button>
                                <button
                                    onClick={handleExportPDF}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <span className="material-icons-round text-[17px] text-rose-400">picture_as_pdf</span>
                                    Export PDF
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Slide toolbar */}
            {current && (
                <SlideToolbar
                    slide={current} onChange={s => updateSlide(idx, s)}
                    onAddSlide={addSlide}
                    onMoveUp={() => moveSlide(idx,-1)} onMoveDown={() => moveSlide(idx,1)}
                    canMoveUp={idx>0} canMoveDown={idx<slides.length-1}
                    slideNum={idx+1} total={slides.length}
                    themeId={themeId} onThemeChange={handleThemeChange}
                    onImageUpload={() => imgInputRef.current?.click()}
                />
            )}

            <div className="flex flex-1 overflow-hidden">
                {/* Thumbnails */}
                <div className="w-44 border-r border-slate-200 overflow-y-auto custom-scrollbar shrink-0 hidden md:flex flex-col" style={{ background: getCanvasBg(current, themeId), transition: 'background 0.6s ease' }}>
                    <p className="px-3 pt-3 pb-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Slides</p>
                    <div className="flex flex-col gap-1.5 px-2 pb-3">
                        {slides.map((s,i) => (
                            <div key={i} className="relative group/thumb">
                                <button onClick={() => goTo(i)}
                                    className={`w-full text-left rounded-lg p-1.5 transition-all ${i===idx?'ring-2 ring-primary bg-primary/5':'hover:bg-slate-50'}`}>
                                    <Thumbnail slide={s} themeId={themeId} />
                                    <p className={`text-[9px] font-medium truncate mt-1 ${i===idx?'text-primary':'text-slate-500'}`}>{i+1}. {s.title||'Untitled'}</p>
                                </button>
                                {slides.length > 1 && (
                                    <button onClick={(e) => { e.stopPropagation(); deleteSlide(i); }}
                                        className="absolute top-2 right-2 opacity-0 group-hover/thumb:opacity-100 w-5 h-5 rounded bg-red-500 text-white flex items-center justify-center transition-all shadow"
                                        title="Delete slide">
                                        <span className="material-icons-round text-[11px]">delete</span>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Slide canvas */}
                <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                    <div ref={slideAreaRef} className="flex-1 flex items-center justify-center p-4 md:p-6 relative" style={{ background: getCanvasBg(current, themeId), transition: 'background 0.6s ease' }}>
                        <div ref={slideRef} className="w-full max-w-4xl" style={{ aspectRatio:'16/9', boxShadow:'0 8px 40px rgba(0,0,0,0.15)', borderRadius:12, overflow:'hidden', position:'relative' }}>
                            {current && (
                                <SlideEditor
                                    slide={current} themeId={themeId}
                                    onChange={s => updateSlide(idx, s)}
                                    onDelete={() => deleteSlide(idx)}
                                    canDelete={slides.length > 1}
                                />
                            )}
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-0.5 bg-slate-200 shrink-0">
                        <div className="h-full bg-primary transition-all duration-300" style={{ width:`${pct}%` }} />
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between px-5 py-2.5 bg-white border-t border-slate-100 shrink-0">
                        <button onClick={goPrev} disabled={idx===0}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                            <span className="material-icons-round text-[18px]">chevron_left</span>Prev
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="text-[12px] font-semibold text-slate-700 tabular-nums">{idx+1}</span>
                            <span className="text-[11px] text-slate-400">of {slides.length}</span>
                        </div>
                        <button onClick={goNext} disabled={idx===slides.length-1}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                            Next<span className="material-icons-round text-[18px]">chevron_right</span>
                        </button>
                    </div>

                    {/* Speaker notes */}
                    {showNotes && current && (
                        <div className="border-t border-amber-100 bg-amber-50 px-5 py-3 shrink-0">
                            <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest mb-1.5">Speaker Notes</p>
                            <p className="text-[12px] text-amber-900 leading-relaxed">{current.speaker_notes || <span className="opacity-40 italic">No notes for this slide.</span>}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
