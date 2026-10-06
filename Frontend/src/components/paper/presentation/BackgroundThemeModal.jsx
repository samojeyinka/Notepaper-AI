import { BG_PRESETS, THEME_SWATCHES, getTheme, isLightBg } from "./themes";

// Background & Theme picker modal for a slide.
export const BgThemeModal = ({ slide, onChange, themeId, onThemeChange, onClose }) => {
    const t       = getTheme(themeId);
    const set     = (patch) => onChange({ ...slide, ...patch });
    const themeBg = slide.layout === 'closing' ? t.closingBg : t.bg;
    const activeBg = slide.bgColor || themeBg;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onMouseDown={onClose}>
            <div className="bg-white  shadow-2xl w-full max-w-lg overflow-hidden" onMouseDown={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-200">
                    <h3 className="font-display-serif font-semibold text-[15px] text-stone-900">Background &amp; Theme</h3>
                    <button onClick={onClose} className="w-7 h-7  flex items-center justify-center text-stone-400 hover:bg-stone-100 transition-colors">
                        <span className="material-icons-round text-[18px]">close</span>
                    </button>
                </div>

                <div className="p-5 flex flex-col gap-5">
                    {/* Background presets */}
                    <div>
                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-2.5">Background</p>
                        <div className="flex flex-wrap gap-1.5">
                            {BG_PRESETS.map(preset => {
                                const presetBg = preset.bg ?? activeBg;
                                const isActive = preset.bg === null ? !slide.bgColor : slide.bgColor === preset.bg;
                                return (
                                    <button key={preset.id} onClick={() => set({bgColor: preset.bg ?? ''})}
                                        title={preset.label}
                                        className={`w-10 h-8  transition-all shrink-0 overflow-hidden relative flex items-center justify-center ${isActive?'ring-2 ring-plum-400 ring-offset-1 scale-105':'ring-1 ring-stone-200 hover:ring-stone-400 hover:scale-105'}`}
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
                            <label className="w-10 h-8  cursor-pointer border border-dashed border-stone-300 hover:border-plum-400 flex items-center justify-center transition-colors shrink-0 relative" title="Custom colour">
                                <span className="material-icons-round text-[14px] text-stone-400 pointer-events-none">colorize</span>
                                <input type="color"
                                    value={slide.bgColor?.startsWith('#') ? slide.bgColor : '#0f172a'}
                                    onChange={e => set({bgColor: e.target.value})}
                                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                            </label>
                        </div>
                        {slide.bgColor && (
                            <button onClick={() => set({bgColor:''})}
                                className="mt-2 flex items-center gap-1 text-[10px] text-stone-400 hover:text-red-400 transition-colors">
                                ↺ Reset to theme default
                            </button>
                        )}
                    </div>

                    {/* Theme */}
                    <div>
                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-2.5">Theme</p>
                        <div className="flex items-center gap-3">
                            {Object.entries(THEME_SWATCHES).map(([key, s]) => (
                                <button key={key} onClick={() => onThemeChange(key)}
                                    className="flex flex-col items-center gap-1 group transition-all">
                                    <div className="w-14 h-10  overflow-hidden relative transition-all"
                                        style={{ background:s.bg, outline:themeId===key?`2.5px solid ${s.dot}`:'2px solid transparent', outlineOffset:2, transform:themeId===key?'scale(1.08)':'scale(1)' }}>
                                        <div style={{ position:'absolute', bottom:4, right:4, width:9, height:9, borderRadius:'50%', background:s.dot, opacity:0.85 }} />
                                    </div>
                                    <span className={`text-[10px] font-semibold ${themeId===key?'text-plum-700':'text-stone-400 group-hover:text-stone-600'}`}>{s.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};