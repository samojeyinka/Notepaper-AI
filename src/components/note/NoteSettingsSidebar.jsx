import React, { useState } from "react";
import { FontFamilySelect } from "./FontFamilySelect";
import { HexColorPicker } from "react-colorful";

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
    setLineColor,
    recentColors,
    onAddRecentColor
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

  const [activePicker, setActivePicker] = useState(null); // 'paper', 'line', 'text' or null

  const ColorInput = ({ label, id, value, onChange }) => {
    const isExpanded = activePicker === id;
    const pickerRef = React.useRef(null);

    React.useEffect(() => {
        if (!isExpanded) return;
        const handleClickOutside = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target)) {
                onAddRecentColor(value);
                setActivePicker(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isExpanded, value]);

    return (
        <div ref={pickerRef} className="space-y-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl transition-all">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setActivePicker(isExpanded ? null : id)}>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500 uppercase">{value}</span>
                    <div className="w-8 h-8 rounded-lg shadow-sm border-2 border-white" style={{ backgroundColor: value }} />
                </div>
            </div>
            
            {isExpanded && (
                <div className="space-y-4 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="custom-color-picker">
                        <HexColorPicker 
                            color={value} 
                            onChange={(color) => {
                                onChange(color);
                            }} 
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-xs font-bold px-2">HEX</span>
                        <input 
                            type="text"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            onBlur={() => onAddRecentColor(value)}
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono text-slate-700 outline-none focus:border-primary uppercase"
                        />
                    </div>
                </div>
            )}
        </div>
    );
  };

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
      <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px]" onClick={onClose} />
      
      <aside className="relative w-80 bg-white h-full shadow-2xl p-6 flex flex-col gap-8 animate-in slide-in-from-right duration-300 overflow-y-auto custom-scrollbar border-l border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold font-display text-slate-900">Note Preferences</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
             <span className="material-icons-round">close</span>
          </button>
        </div>

        <section>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Paper Layout</p>
          <div className="grid grid-cols-3 gap-3">
            {paperOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setPaperStyle(option.id)}
                className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paperStyle === option.id ? "border-primary bg-primary/5 shadow-md shadow-primary/10" : "border-slate-50 hover:border-slate-100"}`}
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
          <FontFamilySelect value={fontFamily} onChange={setFontFamily} options={fontOptions} />
        </section>

        <section className="space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Color Customization</p>
            <ColorInput label="Paper Color" id="paper" value={paperColor} onChange={setPaperColor} />
            <ColorInput label="Line Color" id="line" value={lineColor} onChange={setLineColor} />
            <ColorInput label="Initial Ink" id="text" value={textColor} onChange={setTextColor} />
            
            <div className="pt-4 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Latest Used Colors</p>
                <div className="flex flex-wrap gap-2.5">
                    {recentColors.map((color, idx) => (
                        <button 
                            key={`${color}-${idx}`} 
                            onClick={() => {
                                if (activePicker === 'paper') setPaperColor(color);
                                else if (activePicker === 'line') setLineColor(color);
                                else if (activePicker === 'text') setTextColor(color);
                                else setPaperColor(color); // Default
                            }} 
                            className="group relative"
                        >
                            <div 
                                className="w-8 h-8 rounded-full shadow-inner border-2 border-white transition-transform hover:scale-110 active:scale-95" 
                                style={{ backgroundColor: color }} 
                            />
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-50">
                                {color}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </section>

        <div className="mt-auto py-4 border-t border-slate-100">
          <button onClick={onClose} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:bg-black transition-all active:scale-[0.98]">
            Apply Changes
          </button>
        </div>
      </aside>

      <style>{`
        .custom-color-picker .react-colorful {
            width: 100% !important;
            height: 160px !important;
            border-radius: 12px;
        }
        .custom-color-picker .react-colorful__saturation {
            border-bottom: 8px solid #f8fafc;
            border-radius: 12px 12px 0 0;
        }
        .custom-color-picker .react-colorful__hue {
            height: 12px !important;
            border-radius: 0 0 12px 12px;
        }
        .custom-color-picker .react-colorful__pointer {
            width: 18px !important;
            height: 18px !important;
        }
      `}</style>
    </div>
  );
};
