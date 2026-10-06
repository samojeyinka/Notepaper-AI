import React from "react";

const SliderRow = ({ label, value, min, max, step = 1, unit = 'px', onChange }) => (
    <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">{label}</span>
            <span className="text-[10px] font-mono text-plum-700 bg-plum-50 px-2 py-0.5 tabular-nums">{value}{unit}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full accent-plum-600 h-1.5 bg-stone-100 appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-[9px] text-stone-300 font-mono">
            <span>{min}{unit}</span>
            <span>{max}{unit}</span>
        </div>
    </div>
);

export const PaperPreferencesSidebar = ({
    isOpen,
    onClose,
    paddingX,
    setPaddingX,
    paddingY,
    setPaddingY,
    lineSpacing,
    setLineSpacing,
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
    textColor,
    setTextColor,
}) => {
    if (!isOpen) return null;

    const fonts = [
        { id: 'sans',        label: 'Sans Serif',  css: 'Inter, ui-sans-serif, sans-serif' },
        { id: 'handwriting', label: 'Handwriting', css: 'Kalam, cursive' },
        { id: 'casual',      label: 'Casual',      css: 'Caveat, cursive' },
        { id: 'fun',         label: 'Fun',         css: '"Indie Flower", cursive' },
        { id: 'shadows',     label: 'Sketchy',     css: '"Shadows Into Light", cursive' },
        { id: 'dancing',     label: 'Script',      css: '"Dancing Script", cursive' },
    ];

    return (
        <>
            <div className="fixed inset-0 z-40 bg-stone-900/20 backdrop-blur-sm" onClick={onClose} />
            <aside className="fixed right-0 top-0 h-full w-72 md:w-80 bg-paper border-l border-stone-200 shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-stone-200">
                    <div className="flex items-center gap-2">
                        <span className="material-icons-round text-plum-600 text-[19px]">tune</span>
                        <h3 className="font-display font-semibold text-[15px] text-stone-900">Paper Preferences</h3>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors">
                        <span className="material-icons-round text-[18px]">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 py-5 flex flex-col gap-6">
                    {/* Layout */}
                    <section>
                        <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.18em] mb-4">Page Layout</p>
                        <div className="flex flex-col gap-5">
                            <SliderRow label="Left / Right Margin" value={paddingX} min={32} max={160} step={8} onChange={setPaddingX} />
                            <SliderRow label="Top / Bottom Margin" value={paddingY} min={32} max={160} step={8} onChange={setPaddingY} />
                        </div>
                    </section>

                    <div className="h-px bg-stone-200" />

                    {/* Typography */}
                    <section>
                        <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.18em] mb-4">Typography</p>
                        <div className="flex flex-col gap-5">
                            <SliderRow label="Font Size" value={fontSize} min={12} max={28} step={1} onChange={setFontSize} />
                            <SliderRow label="Line Height" value={lineSpacing} min={18} max={56} step={2} onChange={setLineSpacing} />
                        </div>
                    </section>

                    <div className="h-px bg-stone-200" />

                    {/* Font Family */}
                    <section>
                        <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.18em] mb-3">Font</p>
                        <div className="grid grid-cols-2 gap-2">
                            {fonts.map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setFontFamily(f.id)}
                                    className={`py-2.5 px-3 text-left transition-colors border text-[12px]
                                        ${fontFamily === f.id
                                            ? 'border-plum-400 bg-plum-50 text-plum-700'
                                            : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                                        }`}
                                    style={{ fontFamily: f.css }}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </section>

                    <div className="h-px bg-stone-200" />

                    {/* Text Color */}
                    <section>
                        <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.18em] mb-3">Text Colour</p>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={textColor}
                                onChange={(e) => setTextColor(e.target.value)}
                                className="w-9 h-9 border border-stone-200 cursor-pointer p-0.5 bg-white"
                            />
                            <input
                                type="text"
                                value={textColor}
                                onChange={(e) => { if (/^#[0-9A-F]{6}$/i.test(e.target.value)) setTextColor(e.target.value); }}
                                className="flex-1 bg-white border border-stone-200 px-3 py-2 text-xs font-mono text-stone-700 outline-none focus:border-plum-400 uppercase"
                            />
                        </div>
                    </section>
                </div>

                <div className="px-4 md:px-6 py-4 border-t border-stone-200">
                    <button onClick={onClose} className="w-full text-[13px] bg-stone-900 text-white py-2.5 font-medium hover:bg-stone-800 transition-colors active:scale-[0.98]">
                        Apply Changes
                    </button>
                </div>
            </aside>
        </>
    );
};
