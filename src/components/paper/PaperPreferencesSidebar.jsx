import React from "react";

const SliderRow = ({ label, value, min, max, step = 1, unit = 'px', onChange }) => (
    <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-[11px] font-medium text-slate-600">{label}</span>
            <span className="text-[10px] md:text-[11px] font-mono text-primary bg-primary/10 px-1.5 md:px-2 py-0.5 rounded-lg">{value}{unit}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full accent-primary h-1 md:h-1.5 rounded-full cursor-pointer"
        />
        <div className="flex justify-between text-[9px] text-slate-300 font-mono">
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
            <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={onClose} />
            <aside className="fixed right-0 top-0 h-full w-64 md:w-80 bg-white shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-3 md:px-5 py-3 md:py-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <span className="material-icons-round text-primary text-[16px] md:text-[20px]">tune</span>
                        <h3 className="font-display font-bold text-[11px] md:text-sm text-slate-900">Paper Preferences</h3>
                    </div>
                    <button onClick={onClose} className="w-6 h-6 md:w-7 md:h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
                        <span className="material-icons-round text-[16px] md:text-[18px]">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-3 md:px-5 py-3 md:py-5 flex flex-col gap-4 md:gap-6">
                    {/* Layout */}
                    <section>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Page Layout</p>
                        <div className="flex flex-col gap-5">
                            <SliderRow label="Left / Right Margin" value={paddingX} min={32} max={160} step={8} onChange={setPaddingX} />
                            <SliderRow label="Top / Bottom Margin" value={paddingY} min={32} max={160} step={8} onChange={setPaddingY} />
                        </div>
                    </section>

                    <div className="h-px bg-slate-100" />

                    {/* Typography */}
                    <section>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Typography</p>
                        <div className="flex flex-col gap-5">
                            <SliderRow label="Font Size" value={fontSize} min={12} max={28} step={1} onChange={setFontSize} />
                            <SliderRow label="Line Height" value={lineSpacing} min={18} max={56} step={2} onChange={setLineSpacing} />
                        </div>
                    </section>

                    <div className="h-px bg-slate-100" />

                    {/* Font Family */}
                    <section>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Font</p>
                        <div className="grid grid-cols-2 gap-2">
                            {fonts.map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setFontFamily(f.id)}
                                    className={`py-1.5 md:py-2.5 px-2 md:px-3 rounded-lg md:rounded-xl text-left transition-all border text-[11px] md:text-sm
                                        ${fontFamily === f.id
                                            ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                            : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                                        }`}
                                    style={{ fontFamily: f.css }}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </section>

                    <div className="h-px bg-slate-100" />

                    {/* Text Color */}
                    <section>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Text Color</p>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={textColor}
                                onChange={(e) => setTextColor(e.target.value)}
                                className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl border border-slate-100 cursor-pointer p-1"
                            />
                            <input
                                type="text"
                                value={textColor}
                                onChange={(e) => { if (/^#[0-9A-F]{6}$/i.test(e.target.value)) setTextColor(e.target.value); }}
                                className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 outline-none focus:border-primary uppercase"
                            />
                        </div>
                    </section>
                </div>
            </aside>
        </>
    );
};
