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
    { id: "dotted", name: "Dotted", pattern: "paper-dotted" },
  ];

  const [paperPage, setPaperPage] = useState(0);
  const PAPERS_PER_PAGE = 3;

  const fontOptions = [
    { id: "sans",        name: "Modern (Inter)",               class: "font-sans" },
    { id: "handwriting", name: "Elegant (Kalam)",              class: "font-handwriting" },
    { id: "casual",      name: "Casual (Caveat)",              class: "font-handwriting2" },
    { id: "fun",         name: "Fun (Indie Flower)",           class: "font-handwriting3" },
    { id: "shadows",     name: "Sketchy (Shadows Into Light)", class: "font-sketch" },
    { id: "dancing",     name: "Script (Dancing Script)",      class: "font-dancing" },
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
        <div ref={pickerRef} className="space-y-1.5 p-2.5 bg-white border border-stone-200 transition-all">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setActivePicker(isExpanded ? null : id)}>
                <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-[0.16em]">{label}</label>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-stone-500 uppercase">{value}</span>
                    <div className="w-7 h-7 border border-stone-200" style={{ backgroundColor: value }} />
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
                        <span className="text-stone-400 text-xs font-semibold px-1">HEX</span>
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            onBlur={() => onAddRecentColor(value)}
                            className="flex-1 bg-stone-50 border border-stone-200 px-3 py-2 text-sm font-mono text-stone-700 outline-none focus:border-plum-400 uppercase"
                        />
                    </div>
                </div>
            )}
        </div>
    );
  };

  const SliderInput = ({ label, value, min, max, unit, onChange }) => (
    <div className="space-y-2">
        <div className="flex justify-between items-center text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
            <label>{label}</label>
            <span className="text-plum-700 tabular-nums">{value}{unit}</span>
        </div>
        <input
            type="range" min={min} max={max} value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full accent-plum-600 h-1.5 bg-stone-100 appearance-none cursor-pointer"
        />
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-stone-900/10 backdrop-blur-[2px]" onClick={onClose} />

      <aside className="relative w-72 md:w-80 bg-paper h-full shadow-2xl p-4 md:p-6 flex flex-col gap-5 md:gap-6 animate-in slide-in-from-right duration-300 overflow-y-auto custom-scrollbar border-l border-stone-200">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] md:text-[17px] font-semibold font-display text-stone-900">Note Preferences</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors">
             <span className="material-icons-round text-[18px]">close</span>
          </button>
        </div>

        <section>
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.18em] mb-3">Paper Layout</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPaperPage(p => Math.max(0, p - 1))}
              disabled={paperPage === 0}
              className="w-7 h-7 flex items-center justify-center bg-stone-100 text-stone-500 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed shrink-0 transition-colors"
            >
              <span className="material-icons-round text-[16px]">chevron_left</span>
            </button>

            <div className="grid grid-cols-3 gap-2.5 flex-1">
              {paperOptions.slice(paperPage * PAPERS_PER_PAGE, paperPage * PAPERS_PER_PAGE + PAPERS_PER_PAGE).map((option) => (
                <button
                  key={option.id}
                  onClick={() => setPaperStyle(option.id)}
                  className={`p-1.5 border flex flex-col items-center gap-2 transition-colors ${paperStyle === option.id ? "border-plum-400 bg-plum-50" : "border-stone-200 hover:border-stone-300"}`}
                >
                  <div className={`w-5 h-5 md:w-6 md:h-6 bg-white border border-stone-200 ${option.pattern}`} />
                  <span className="text-[9px] font-medium uppercase tracking-tight text-stone-600">{option.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setPaperPage(p => Math.min(Math.ceil(paperOptions.length / PAPERS_PER_PAGE) - 1, p + 1))}
              disabled={paperPage >= Math.ceil(paperOptions.length / PAPERS_PER_PAGE) - 1}
              className="w-7 h-7 flex items-center justify-center bg-stone-100 text-stone-500 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed shrink-0 transition-colors"
            >
              <span className="material-icons-round text-[16px]">chevron_right</span>
            </button>
          </div>
        </section>

        <section className="space-y-6">
            <SliderInput label="Text Size" value={fontSize} min={12} max={36} unit="px" onChange={setFontSize} />
            <SliderInput label="Line Height" value={lineSpacing} min={20} max={64} unit="px" onChange={setLineSpacing} />
        </section>

        <section>
          <FontFamilySelect value={fontFamily} onChange={setFontFamily} options={fontOptions} />
        </section>

        <section className="space-y-3">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.18em] mb-1">Colour Customization</p>
            <ColorInput label="Paper Colour" id="paper" value={paperColor} onChange={setPaperColor} />
            <ColorInput label="Line Colour" id="line" value={lineColor} onChange={setLineColor} />
            <ColorInput label="Initial Ink" id="text" value={textColor} onChange={setTextColor} />

            <div className="pt-4 border-t border-stone-200">
                <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-[0.18em] mb-3">Latest Used Colours</p>
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
                                className="w-7 h-7 border border-stone-200 transition-transform hover:scale-110 active:scale-95"
                                style={{ backgroundColor: color }}
                            />
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-stone-900 text-white text-[10px] px-2 py-1 whitespace-nowrap z-50">
                                {color}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </section>

        <div className="mt-auto py-2 border-t border-stone-200">
          <button onClick={onClose} className="w-full text-[13px] bg-stone-900 text-white py-2.5 font-medium hover:bg-stone-800 transition-colors active:scale-[0.98]">
            Apply Changes
          </button>
        </div>
      </aside>

      <style>{`
        .custom-color-picker .react-colorful {
            width: 100% !important;
            height: 160px !important;
        }
        .custom-color-picker .react-colorful__saturation {
            border-bottom: 8px solid #f5f5f4;
            border-radius: 0;
        }
        .custom-color-picker .react-colorful__hue {
            height: 12px !important;
            border-radius: 0;
        }
        .custom-color-picker .react-colorful__pointer {
            width: 18px !important;
            height: 18px !important;
        }
      `}</style>
    </div>
  );
};
