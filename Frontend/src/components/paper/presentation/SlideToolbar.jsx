import { useState } from "react";
import { BgThemeModal } from "./BackgroundThemeModal";
import { LAYOUTS, getTheme } from "./themes";

export const SlideToolbar = ({ slide, onChange, onAddSlide, onMoveUp, onMoveDown, canMoveUp, canMoveDown, slideNum, total, themeId, onThemeChange, onImageUpload }) => {
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
            <div className="shrink-0 bg-paper border-b border-stone-200">

                {/* ── Row 1: Layout + Slide navigation ── */}
                <div className="flex items-center gap-1 px-2 md:px-3 py-1.5 border-b border-stone-200">
                    <span className="text-[8px] md:text-[9px] font-bold text-stone-400 uppercase tracking-wider shrink-0 mr-0.5 hidden sm:block">Layout</span>
                    <div className="flex items-center gap-0.5 bg-stone-100  p-0.5 shrink-0">
                        {LAYOUTS.map(l => (
                            <button key={l} onClick={() => setLayout(l)}
                                className={`px-1.5 md:px-2 py-0.5  text-[10px] md:text-[11px] font-semibold capitalize transition-colors shrink-0 ${slide.layout===l?'bg-stone-900 text-white':'text-stone-500 hover:bg-white'}`}>
                                {l}
                            </button>
                        ))}
                    </div>

                    <div className="ml-auto flex items-center gap-0.5 md:gap-1 shrink-0">
                        <button onClick={onMoveUp} disabled={!canMoveUp}
                            className="w-6 h-6 flex items-center justify-center  text-stone-400 hover:bg-stone-100 disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                            <span className="material-icons-round text-[14px]">arrow_upward</span>
                        </button>
                        <button onClick={onMoveDown} disabled={!canMoveDown}
                            className="w-6 h-6 flex items-center justify-center  text-stone-400 hover:bg-stone-100 disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                            <span className="material-icons-round text-[14px]">arrow_downward</span>
                        </button>
                        <button onClick={onAddSlide}
                            className="flex items-center gap-0.5 px-2 py-0.5  text-[10px] md:text-[11px] font-semibold text-plum-700 bg-plum-50 hover:bg-plum-100 transition-colors">
                            <span className="material-icons-round text-[12px]">add</span>
                            <span className="hidden sm:inline">Slide</span>
                        </button>
                        <span className="text-[10px] text-stone-400 ml-0.5 tabular-nums whitespace-nowrap">{slideNum}/{total}</span>
                    </div>
                </div>

                {/* ── Row 2: List / B·I·U / Spacing ── */}
                <div className="flex items-center gap-1 px-2 md:px-3 py-1 border-b border-stone-200 overflow-x-auto">

                    {/* List style + Add point */}
                    {hasBody && (<>
                        <button onClick={() => set({listStyle:'bullet'})} title="Bullets"
                            className={`w-6 h-6 flex items-center justify-center  transition-all shrink-0 ${!isNumbered&&!isText?'bg-stone-900 text-white':'text-stone-500 hover:bg-stone-100'}`}>
                            <span className="material-icons-round text-[13px]">format_list_bulleted</span>
                        </button>
                        <button onClick={() => set({listStyle:'numbered'})} title="Numbered"
                            className={`w-6 h-6 flex items-center justify-center  transition-all shrink-0 ${isNumbered?'bg-stone-900 text-white':'text-stone-500 hover:bg-stone-100'}`}>
                            <span className="material-icons-round text-[13px]">format_list_numbered</span>
                        </button>
                        <button onClick={() => set({listStyle:'text'})} title="Free text"
                            className={`w-6 h-6 flex items-center justify-center  transition-all shrink-0 ${isText?'bg-stone-900 text-white':'text-stone-500 hover:bg-stone-100'}`}>
                            <span className="material-icons-round text-[13px]">notes</span>
                        </button>
                        {(slide.bullets??[]).length < 7 && (
                            <button onClick={() => set({bullets:[...(slide.bullets??[]),''] })}
                                className="flex items-center gap-0.5 px-1.5 py-0.5  text-[10px] md:text-[11px] font-semibold text-stone-500 hover:bg-stone-100 transition-all shrink-0">
                                <span className="material-icons-round text-[12px]">add</span>
                                {isText ? 'Para' : 'Point'}
                            </button>
                        )}

                        <div className="w-px h-4 bg-stone-200 shrink-0 mx-0.5" />

                        {/* Bold / Italic / Underline */}
                        <button onMouseDown={e => e.preventDefault()} onClick={() => document.execCommand('bold')}
                            title="Bold" className="w-6 h-6 flex items-center justify-center  text-stone-500 hover:bg-stone-100 transition-all shrink-0 font-bold text-[13px]">B</button>
                        <button onMouseDown={e => e.preventDefault()} onClick={() => document.execCommand('italic')}
                            title="Italic" className="w-6 h-6 flex items-center justify-center  text-stone-500 hover:bg-stone-100 transition-all shrink-0 italic text-[13px] font-semibold">I</button>
                        <button onMouseDown={e => e.preventDefault()} onClick={() => document.execCommand('underline')}
                            title="Underline" className="w-6 h-6 flex items-center justify-center  text-stone-500 hover:bg-stone-100 transition-all shrink-0 underline text-[13px] font-semibold">U</button>

                        <div className="w-px h-4 bg-stone-200 shrink-0 mx-0.5" />
                    </>)}

                    {/* Spacing */}
                    <span className="text-[8px] md:text-[9px] font-bold text-stone-400 uppercase tracking-wider shrink-0">Spacing</span>
                    <button onClick={() => set({lineHeight:Math.max(1.1,+(lh-0.1).toFixed(1))})}
                        className="w-5 h-5 flex items-center justify-center  text-stone-500 hover:bg-stone-100 text-[13px] font-bold shrink-0">−</button>
                    <span className="text-[11px] font-semibold text-stone-600 w-6 text-center shrink-0 tabular-nums">{lh.toFixed(1)}</span>
                    <button onClick={() => set({lineHeight:Math.min(3,+(lh+0.1).toFixed(1))})}
                        className="w-5 h-5 flex items-center justify-center  text-stone-500 hover:bg-stone-100 text-[13px] font-bold shrink-0">+</button>
                </div>

                {/* ── Row 3: Colors / Image / BG & Theme ── */}
                <div className="flex items-center gap-1 px-2 md:px-3 py-1 overflow-x-auto">

                    {/* Title color */}
                    <span className="text-[8px] md:text-[9px] font-bold text-stone-400 uppercase tracking-wider shrink-0">Title</span>
                    <label className="relative w-5 h-5  cursor-pointer shrink-0 border border-stone-200 overflow-hidden" title="Title colour"
                        style={{ background: slide.titleColor || t.titleColor }}>
                        <input type="color" value={slide.titleColor||t.titleColor} onChange={e=>set({titleColor:e.target.value})}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                    </label>
                    {slide.titleColor && (
                        <button onClick={() => set({titleColor:''})} className="text-[10px] text-stone-400 hover:text-red-400 shrink-0" title="Reset">↺</button>
                    )}

                    {/* Body color */}
                    {hasBody && (<>
                        <div className="w-px h-4 bg-stone-200 shrink-0 mx-0.5" />
                        <span className="text-[8px] md:text-[9px] font-bold text-stone-400 uppercase tracking-wider shrink-0">Body</span>
                        <label className="relative w-5 h-5  cursor-pointer shrink-0 border border-stone-200 overflow-hidden" title="Body colour"
                            style={{ background: slide.bodyColor || t.bulletColor }}>
                            <input type="color" value={slide.bodyColor||t.bulletColor} onChange={e=>set({bodyColor:e.target.value})}
                                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                        </label>
                        {slide.bodyColor && (
                            <button onClick={() => set({bodyColor:''})} className="text-[10px] text-stone-400 hover:text-red-400 shrink-0" title="Reset">↺</button>
                        )}
                    </>)}

                    <div className="w-px h-4 bg-stone-200 shrink-0 mx-0.5" />

                    {/* Image */}
                    {!slide.image ? (
                        <button onClick={onImageUpload}
                            className="flex items-center gap-0.5 px-1.5 py-0.5  text-[10px] md:text-[11px] font-semibold text-stone-500 hover:bg-stone-100 transition-all shrink-0">
                            <span className="material-icons-round text-[12px]">image</span>
                            Image
                        </button>
                    ) : (<>
                        <div className="flex items-center gap-0.5 bg-stone-100  p-0.5 shrink-0">
                            <button onClick={() => set({image:{...slide.image,position:'right'}})}
                                className={`px-1.5 py-0.5  text-[10px] font-semibold transition-all ${slide.image?.position!=='background'?'bg-white shadow-sm text-stone-700':'text-stone-400'}`}>
                                Side
                            </button>
                            <button onClick={() => set({image:{...slide.image,position:'background'}})}
                                className={`px-1.5 py-0.5  text-[10px] font-semibold transition-all ${slide.image?.position==='background'?'bg-white shadow-sm text-stone-700':'text-stone-400'}`}>
                                BG
                            </button>
                        </div>
                        <button onClick={() => set({image:null})}
                            className="flex items-center gap-0.5 px-1.5 py-0.5  text-[10px] md:text-[11px] font-semibold text-red-500 hover:bg-red-50 transition-all shrink-0">
                            <span className="material-icons-round text-[12px]">hide_image</span>
                            Remove
                        </button>
                    </>)}

                    <div className="w-px h-4 bg-stone-200 shrink-0 mx-0.5" />

                    {/* Background & Theme */}
                    <button onClick={() => setShowBgModal(true)}
                        className={`flex items-center gap-1 px-1.5 md:px-2 py-0.5  text-[10px] md:text-[11px] font-semibold transition-colors shrink-0 border ${hasBgOverride?'border-plum-400 text-plum-700 bg-plum-50':'border-stone-200 text-stone-500 hover:bg-stone-100'}`}
                        title="Background & Theme">
                        <span className="material-icons-round text-[13px]">palette</span>
                        BG &amp; Theme
                        {hasBgOverride && <span className="w-1.5 h-1.5 rounded-full bg-plum-600 shrink-0" />}
                    </button>
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