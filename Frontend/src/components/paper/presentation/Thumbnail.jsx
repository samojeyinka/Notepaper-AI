import { ThemeArt } from "./ThemeArt";
import { getTheme } from "./themes";

// Static slide thumbnail.
export const Thumbnail = ({ slide, themeId }) => {
    const t  = getTheme(themeId);
    const bg = slide.bgColor || (slide.layout==='closing' ? t.closingBg : t.bg);
    const tc = slide.titleColor || (slide.layout==='closing' ? t.closingTitle : t.titleColor);
    const bc = slide.bodyColor  || (slide.layout==='closing' ? t.closingBullet : t.bulletColor);
    return (
        <div className="w-full aspect-video  overflow-hidden relative" style={{ background:bg, border:slide.bgColor?'none':(t.border??'none') }}>
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
                    <img src={slide.image.url} style={{ maxWidth:'100%', maxHeight:'70%', objectFit:'contain' }} alt={slide.title || 'Slide image'} />
                </div>
            )}
        </div>
    );
};