import { useState } from "react";
import { BodyRow } from "./BodyRow";
import { Field } from "./editableFields";
import { ThemeArt } from "./ThemeArt";
import { LIMITS, getTheme, isLightBg } from "./themes";

// Delete button overlay.
const DeleteBtn = ({ onDelete }) => (
    <button onClick={onDelete} data-pdf-hide
        className="absolute top-2 right-2 z-30 opacity-0 group-hover/slide:opacity-100 w-7 h-7  bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center transition-all shadow-md"
        title="Delete slide">
        <span className="material-icons-round text-[14px]">delete</span>
    </button>
);

export const SlideEditor = ({ slide, themeId, onChange, onDelete, canDelete }) => {
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
                    <img src={slide.image.url} style={{ maxWidth:'100%', maxHeight:'70%', width:'100%', height:'70%', objectFit:'contain', borderRadius:6 }} alt={slide.title || 'Slide image'} />
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