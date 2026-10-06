import { isLightBg } from "./themes";

// Decorative theme art — adapts when a custom bg is set.
export const ThemeArt = ({ themeId, customBg }) => {
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