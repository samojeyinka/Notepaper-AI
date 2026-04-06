import React, { useState } from "react";
import { HexColorPicker } from "react-colorful";

export const NoteToolbar = ({ onAction, activeState, recentColors = [], onAddRecentColor }) => {
  const [showTextColor, setShowTextColor] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [url, setUrl] = useState("");

  const fontSizeOptions = [
    { label: 'Small', value: '1', icon: 'text_fields' },
    { label: 'Normal', value: '3', icon: 'text_fields' },
    { label: 'Large', value: '5', icon: 'text_fields' },
    { label: 'XL', value: '7', icon: 'text_fields' },
  ];

  const ToolbarButton = ({ icon, action, active, disabled, title, onClick }) => (
    <button 
      onMouseDown={(e) => { 
        e.preventDefault(); 
        if (!disabled) {
          if (onClick) onClick();
          else onAction(action); 
        }
      }}
      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 relative
        ${active ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-100/50 text-slate-600 hover:bg-slate-200'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      title={title}
    >
      <span className="material-icons-round text-[20px]">{icon}</span>
    </button>
  );

  const UrlInputPopover = () => (
    <div 
      className="absolute left-full ml-3 top-0 bg-white border border-slate-100 rounded-2xl shadow-2xl p-4 z-50 w-64 animate-in slide-in-from-left-2 duration-150 flex flex-col gap-3"
      onMouseDown={(e) => e.preventDefault()} 
    >
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Insert Link</p>
      <input 
        type="text"
        placeholder="Paste URL here..."
        value={url}
        autoFocus
        onChange={(e) => setUrl(e.target.value)}
        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-primary"
      />
      <div className="flex gap-2">
        <button 
          onMouseDown={(e) => { e.preventDefault(); onAction('createLink', url); setShowUrlInput(false); setUrl(""); }}
          className="flex-1 bg-primary text-white py-2 rounded-xl text-[11px] font-bold"
        >
          Insert
        </button>
        <button 
          onMouseDown={(e) => { e.preventDefault(); setShowUrlInput(false); }}
          className="bg-slate-100 text-slate-500 px-3 py-2 rounded-xl text-[11px] font-bold"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  const AdvancedColorPicker = ({ color, onChange, onClose, title }) => {
    const [localColor, setLocalColor] = useState(color || "#000000");

    // Sync local color with selection color if it changes from outside
    React.useEffect(() => {
        if (color && color !== localColor) {
            setLocalColor(color);
        }
    }, [color]);

    return (
      <div 
        className="absolute left-full ml-3 top-0 bg-white border border-slate-100 rounded-3xl shadow-2xl p-4 z-50 w-64 animate-in slide-in-from-left-2 duration-150 flex flex-col gap-4"
        onMouseDown={(e) => e.preventDefault()} 
      >
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
        
        <div className="custom-toolbar-picker" onMouseDown={(e) => e.stopPropagation()}>
          <HexColorPicker 
            color={localColor} 
            onChange={(newColor) => {
              setLocalColor(newColor);
              onChange(newColor);
            }} 
          />
        </div>

        <div className="flex items-center gap-2">
          <input 
            type="text"
            value={localColor}
            onChange={(e) => {
                const val = e.target.value;
                setLocalColor(val);
                if (/^#[0-9A-F]{6}$/i.test(val)) onChange(val);
            }}
            onBlur={() => onAddRecentColor(localColor)}
            className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 outline-none focus:border-primary uppercase"
          />
          <div className="w-8 h-8 rounded-lg border border-slate-100" style={{ backgroundColor: localColor }} />
        </div>

        {recentColors.length > 0 && (
          <div className="pt-2 border-t border-slate-50">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Latest Used</p>
            <div className="flex flex-wrap gap-2">
                {recentColors.map((c, idx) => (
                    <button 
                        key={`${c}-${idx}`} 
                        onMouseDown={(e) => {
                            e.preventDefault();
                            setLocalColor(c);
                            onChange(c);
                        }} 
                        className="w-6 h-6 rounded-full border border-white shadow-sm transition-transform hover:scale-110 active:scale-90" 
                        style={{ backgroundColor: c }} 
                        title={c}
                    />
                ))}
            </div>
          </div>
        )}

        <button 
            onMouseDown={(e) => { e.preventDefault(); onAddRecentColor(localColor); onClose(); }}
            className="w-full bg-slate-900 text-white py-2 rounded-xl text-[11px] font-bold mt-1"
        >
            Done
        </button>
      </div>
    );
  };

  return (
    <aside className="w-16 border-r border-slate-200 bg-white flex flex-col items-center py-6 gap-5 relative z-30 shrink-0 select-none overflow-y-auto custom-scrollbar overflow-x-visible">
      <style>{`
        .custom-toolbar-picker .react-colorful {
            width: 100% !important;
            height: 140px !important;
            border-radius: 12px;
        }
        .custom-toolbar-picker .react-colorful__saturation {
            border-bottom: 6px solid #f8fafc;
            border-radius: 10px 10px 0 0;
        }
        .custom-toolbar-picker .react-colorful__hue {
            height: 10px !important;
            border-radius: 0 0 10px 10px;
        }
        .custom-toolbar-picker .react-colorful__pointer {
            width: 16px !important;
            height: 16px !important;
        }
      `}</style>

      {/* 1. Basic Formatting */}
      <div className="flex flex-col gap-2">
        <ToolbarButton 
          icon="format_bold" action="bold" active={activeState?.bold} title="Bold" 
        />
        <ToolbarButton 
          icon="format_italic" action="italic" active={activeState?.italic} title="Italic" 
        />
        <ToolbarButton 
          icon="format_underlined" action="underline" active={activeState?.underline} title="Underline" 
        />
        <div className="relative">
          <ToolbarButton 
            icon="link" action="link" active={showUrlInput} title="Link" onClick={() => setShowUrlInput(!showUrlInput)}
          />
          {showUrlInput && <UrlInputPopover />}
        </div>
      </div>

      <div className="h-px w-8 bg-slate-100" />

      {/* 2. Alignment tools */}
      <div className="flex flex-col gap-2">
        <ToolbarButton 
          icon="format_align_left" action="justifyLeft" active={activeState?.align === 'left'} title="Align Left" 
        />
        <ToolbarButton 
          icon="format_align_center" action="justifyCenter" active={activeState?.align === 'center'} title="Align Center" 
        />
        <ToolbarButton 
          icon="format_align_right" action="justifyRight" active={activeState?.align === 'right'} title="Align Right" 
        />
        <ToolbarButton 
          icon="format_align_justify" action="justifyFull" active={activeState?.align === 'justify'} title="Justify" 
        />
      </div>

      <div className="h-px w-8 bg-slate-100" />

      {/* 2. Text Scale Tool */}
      <div className="flex flex-col gap-2.5">
        <div className="relative">
          <button 
            onMouseDown={(e) => { e.preventDefault(); setShowFontSize(!showFontSize); setShowTextColor(false); setShowHighlight(false); setShowUrlInput(false); }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all
              ${showFontSize ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-slate-100/50 text-slate-600 hover:bg-slate-200'}`}
            title="Text Scale"
          >
            <span className="material-icons-round text-[22px]">text_fields</span>
          </button>
          
          {showFontSize && (
            <div className="absolute left-full ml-3 top-0 bg-white border border-slate-100 rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1 w-32 animate-in slide-in-from-left-2 duration-150">
              {fontSizeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onAction('fontSize', opt.value);
                    setShowFontSize(false);
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold uppercase transition-colors text-slate-600 hover:bg-slate-50"
                >
                  {opt.label}
                  <span className="material-icons-round text-slate-300" style={{ fontSize: opt.value === '1' ? '12px' : opt.value === '3' ? '16px' : opt.value === '5' ? '20px' : '24px' }}>format_size</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="h-px w-8 bg-slate-100" />

      {/* 3. Lists */}
      <div className="flex flex-col gap-2.5">
        <ToolbarButton 
          icon="format_list_bulleted" action="insertUnorderedList" active={activeState?.list === 'ul'} title="Bulleted List" 
        />
        <ToolbarButton 
          icon="format_list_numbered" action="insertOrderedList" active={activeState?.list === 'ol'} title="Numbered List" 
        />
      </div>

      <div className="h-px w-8 bg-slate-100" />

      {/* 4. Colors */}
      <div className="flex flex-col gap-2.5 relative">
        <div className="relative">
          <button 
            onMouseDown={(e) => { e.preventDefault(); setShowTextColor(!showTextColor); setShowHighlight(false); setShowFontSize(false); setShowUrlInput(false); }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${showTextColor ? 'bg-slate-900 text-white' : 'bg-slate-100/50 text-slate-600 hover:bg-slate-200'}`}
            title="Text Color"
          >
            <span className="material-icons-round text-[22px]">format_color_text</span>
          </button>
          {showTextColor && (
            <AdvancedColorPicker 
              color={activeState?.foreColor || "#000000"} 
              title="Text Color"
              onClose={() => setShowTextColor(false)}
              onChange={(color) => onAction('foreColor', color)}
            />
          )}
        </div>

        <div className="relative">
          <button 
            onMouseDown={(e) => { e.preventDefault(); setShowHighlight(!showHighlight); setShowTextColor(false); setShowFontSize(false); setShowUrlInput(false); }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${showHighlight ? 'bg-slate-900 text-white' : 'bg-slate-100/50 text-slate-600 hover:bg-slate-200'}`}
            title="Highlight"
          >
            <span className="material-icons-round text-[22px]">draw</span>
          </button>
          {showHighlight && (
            <AdvancedColorPicker 
              color={activeState?.hiliteColor || "transparent"} 
              title="Highlight"
              onClose={() => setShowHighlight(false)}
              onChange={(color) => onAction('hiliteColor', color)}
            />
          )}
        </div>
      </div>

      <div className="h-px w-8 bg-slate-100" />

      {/* 5. Special Tools */}
      <div className="flex flex-col gap-2.5">
        <ToolbarButton 
          icon="image" action="image" disabled title="Coming Soon" 
        />
        <ToolbarButton 
          icon="gesture" action="draw" disabled title="Coming Soon" 
        />
      </div>

      {/* Outside Click Helper */}
      {(showTextColor || showHighlight || showFontSize || showUrlInput) && (
        <div 
          className="fixed inset-0 z-10" 
          onMouseDown={() => {
            setShowTextColor(false);
            setShowHighlight(false);
            setShowFontSize(false);
            setShowUrlInput(false);
          }} 
        />
      )}
    </aside>
  );
};
