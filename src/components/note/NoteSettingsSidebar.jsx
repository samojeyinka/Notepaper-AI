import React from "react";

export const NoteSettingsSidebar = ({ 
    isOpen, 
    onClose, 
    paperStyle, 
    setPaperStyle, 
    fontFamily, 
    setFontFamily,
    fontSize,
    setFontSize,
    lineSpacing,
    setLineSpacing,
    textColor,
    setTextColor,
    paperColor,
    setPaperColor,
    lineColor,
    setLineColor
}) => {
  const paperOptions = [
    { id: "plain", name: "Plain", pattern: "" },
    { id: "ruled", name: "Ruled", pattern: "paper-ruled" },
    { id: "grid", name: "Grid", pattern: "paper-grid" },
  ];

  const fontOptions = [
    { id: "sans", name: "Modern Sans", class: "font-sans" },
    { id: "handwriting", name: "Elegant (Kalam)", class: "font-handwriting" },
    { id: "casual", name: "Casual (Caveat)", class: "font-handwriting2" },
    { id: "fun", name: "Fun (Indie Flower)", class: "font-handwriting3" },
  ];

  const colorPresets = [
    { id: "white", color: "#ffffff" },
    { id: "cream", color: "#FDFBF7" },
    { id: "mint", color: "#F0FDF4" },
    { id: "sky", color: "#F0F9FF" },
  ];

  const ColorInput = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between gap-4 p-3 bg-slate-50 border border-slate-100 rounded-xl">
        <label className="text-xs font-bold text-slate-500 uppercase">{label}</label>
        <input 
            type="color" 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent"
        />
    </div>
  );

  const SliderInput = ({ label, value, min, max, unit, onChange }) => (
    <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase">
            <label className="text-slate-500">{label}</label>
            <span className="text-primary">{value}{unit}</span>
        </div>
        <input 
            type="range" min={min} max={max} value={value} 
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full accent-primary h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
        />
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />
      
      <aside className="relative w-80 bg-white h-full shadow-2xl p-6 flex flex-col gap-8 animate-in slide-in-from-right duration-300 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold font-display text-slate-900">Note Preferences</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <span className="material-icons-round text-slate-500">close</span>
          </button>
        </div>

        <section>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Paper Layout</p>
          <div className="grid grid-cols-3 gap-3">
            {paperOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setPaperStyle(option.id)}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${paperStyle === option.id ? "border-primary bg-primary/5 shadow-md shadow-primary/20" : "border-slate-100 hover:border-slate-200"}`}
              >
                <div className={`w-8 h-8 rounded bg-white shadow-sm border border-slate-100 ${option.pattern}`} />
                <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-600">{option.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-6">
            <SliderInput label="Text Size" value={fontSize} min={12} max={36} unit="px" onChange={setFontSize} />
            <SliderInput label="Line Height" value={lineSpacing} min={20} max={64} unit="px" onChange={setLineSpacing} />
        </section>

        <section>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Typography</p>
          <div className="grid grid-cols-1 gap-2">
            {fontOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setFontFamily(option.id)}
                className={`w-full p-3 rounded-xl border-2 transition-all text-left flex items-center justify-between ${fontFamily === option.id ? "border-primary bg-primary/5" : "border-slate-100 hover:border-slate-200"}`}
              >
                <span className={`${option.class} text-[15px] text-slate-700`}>{option.name}</span>
                {fontFamily === option.id && <span className="material-icons-round text-primary text-sm">check_circle</span>}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Color Customization</p>
            <ColorInput label="Paper Color" value={paperColor} onChange={setPaperColor} />
            <ColorInput label="Line Color" value={lineColor} onChange={setLineColor} />
            <ColorInput label="Initial Ink" value={textColor} onChange={setTextColor} />
            <div className="flex gap-2 pt-2">
                {colorPresets.map((preset) => (
                    <button key={preset.id} onClick={() => setPaperColor(preset.color)} className={`w-8 h-8 rounded-full border-2 transition-all p-0.5 ${paperColor === preset.color ? "border-primary" : "border-transparent"}`}>
                        <div className="w-full h-full rounded-full shadow-inner border border-slate-200" style={{ backgroundColor: preset.color }} />
                    </button>
                ))}
            </div>
        </section>

        <div className="mt-auto py-4 border-t border-slate-100">
          <button onClick={onClose} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-black transition-all">
            Done
          </button>
        </div>
      </aside>
    </div>
  );
};
