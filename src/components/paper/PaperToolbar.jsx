import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { HexColorPicker } from "react-colorful";

const POPOVER_MAX_HEIGHT = 520;
const POPOVER_MARGIN     = 8;

const Popover = ({ anchorRef, children }) => {
  let top = 0, left = 0;
  if (anchorRef?.current) {
    const rect = anchorRef.current.getBoundingClientRect();
    left = rect.right + POPOVER_MARGIN;
    const maxTop = window.innerHeight - POPOVER_MAX_HEIGHT - POPOVER_MARGIN;
    top = Math.max(POPOVER_MARGIN, Math.min(rect.top, maxTop));
  }
  return createPortal(
    <div className="toolbar-popover bg-white border border-slate-100 rounded-md md:rounded-2xl shadow-2xl animate-in slide-in-from-left-2 duration-150"
      style={{ position:'fixed',top,left,zIndex:9999,minWidth:'240px',maxHeight:`${POPOVER_MAX_HEIGHT}px`,overflowY:'auto' }}
      onMouseDown={(e) => e.preventDefault()}>
      {children}
    </div>,
    document.body
  );
};

const ToolbarButton = ({ icon, action, active, disabled, title, onClick, onAction }) => (
  <button
    onMouseDown={(e) => { e.preventDefault(); if (!disabled) { if (onClick) onClick(); else if (onAction) onAction(action); } }}
    className={`w-7 h-7 md:w-10 md:h-10 rounded-md md:rounded-xl flex items-center justify-center transition-all active:scale-90
      ${active ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-100/50 text-slate-600 hover:bg-slate-200'}
      ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    title={title}
  >
    <span className="material-icons-round text-[13px] md:text-[20px]">{icon}</span>
  </button>
);

const UrlInputPopover = ({ anchorRef, url, onUrlChange, onInsert, onCancel }) => (
  <Popover anchorRef={anchorRef}>
    <div className="p-2 md:p-4 flex flex-col gap-3">
      <p className="text-[10px] font-medium md:font-bold text-slate-400 uppercase tracking-widest">Insert Link</p>
      <input type="text" placeholder="Paste URL here..." value={url} autoFocus
        onChange={(e) => onUrlChange(e.target.value)}
        onKeyDown={(e) => { if (e.key==='Enter'){e.preventDefault();onInsert();} if(e.key==='Escape'){e.preventDefault();onCancel();} }}
        className="w-full bg-slate-50 border border-slate-100 rounded-md md:rounded-xl px-1.5 py-1 md:px-3 md:py-2 text-[9px] md:text-xs text-slate-700 outline-none focus:border-primary" />
      <div className="flex gap-2">
        <button onMouseDown={(e)=>{e.preventDefault();onInsert();}} className="flex-1 bg-primary text-white py-1 md:py-2 rounded-md md:rounded-xl text-[9.5px] md:text-[11px] font-medium md:font-bold">Insert</button>
        <button onMouseDown={(e)=>{e.preventDefault();onCancel();}} className="bg-slate-100 text-slate-500 px-1 py-1 md:py-2 rounded-md md:rounded-xl text-[9.5px] md:text-[11px] font-medium md:font-bold">Cancel</button>
      </div>
    </div>
  </Popover>
);

const FontSizePopover = ({ anchorRef, options, onSelect }) => (
  <Popover anchorRef={anchorRef}>
    <div className="p-2 flex flex-col gap-1 w-36" onMouseDown={(e) => e.preventDefault()}>
      {options.map((opt) => (
        <button key={opt.value} onMouseDown={(e) => { e.preventDefault(); onSelect(opt.value); }}
          className="flex items-center justify-between px-1.5 py-1 md:px-3 md:py-2 rounded-xl text-[10px] md:text-xs font-medium md:font-bold uppercase transition-colors text-slate-600 hover:bg-slate-50">
          {opt.label}
          <span className="material-icons-round text-slate-300"
            style={{ fontSize: opt.value==='1'?'12px':opt.value==='3'?'16px':opt.value==='5'?'20px':'24px' }}>format_size</span>
        </button>
      ))}
    </div>
  </Popover>
);

const AdvancedColorPicker = ({ anchorRef, color, onChange, onClose, title, recentColors, onAddRecentColor, showNone, onNone }) => {
  const [localColor, setLocalColor] = useState(color || "#000000");
  useEffect(() => { if (color && color !== localColor) setLocalColor(color); }, [color]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Popover anchorRef={anchorRef}>
      <div className="p-4 flex flex-col gap-4 w-64">
        <div className="flex items-center justify-between">
          <p className="text-[9px] md:text-[10px] font-medium md:font-bold text-slate-400 uppercase tracking-widest">{title}</p>
          {showNone && (
            <button onMouseDown={(e) => { e.preventDefault(); onNone?.(); onClose(); }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-500 text-[10px] font-bold transition-colors" title="Remove background color">
              <span className="material-icons-round text-[12px]">format_color_reset</span>None
            </button>
          )}
        </div>
        <div className="custom-toolbar-picker" onMouseDown={(e) => e.stopPropagation()}>
          <HexColorPicker color={localColor} onChange={(c) => { setLocalColor(c); onChange(c); }} />
        </div>
        <div className="flex items-center gap-2">
          <input type="text" value={localColor}
            onChange={(e) => { const v=e.target.value; setLocalColor(v); if(/^#[0-9A-F]{6}$/i.test(v)) onChange(v); }}
            onBlur={() => onAddRecentColor(localColor)}
            className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 outline-none focus:border-primary uppercase" />
          <div className="w-8 h-8 rounded-lg border border-slate-100 shrink-0" style={{ backgroundColor: localColor }} />
        </div>
        {recentColors.length > 0 && (
          <div className="pt-2 border-t border-slate-50">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Latest Used</p>
            <div className="flex flex-wrap gap-2">
              {recentColors.map((c, idx) => (
                <button key={`${c}-${idx}`} onMouseDown={(e) => { e.preventDefault(); setLocalColor(c); onChange(c); }}
                  className="w-4 h-4 md:w-6 md:h-6 rounded-full border border-white shadow-sm transition-transform hover:scale-110 active:scale-90"
                  style={{ backgroundColor: c }} title={c} />
              ))}
            </div>
          </div>
        )}
        <button onMouseDown={(e) => { e.preventDefault(); onAddRecentColor(localColor); onClose(); }}
          className="w-full bg-slate-900 text-white py-2 rounded-xl text-[11px] font-bold">Done</button>
      </div>
    </Popover>
  );
};

const DrawPopover = ({ anchorRef, drawMode, onAction }) => {
  const [localColor, setLocalColor] = useState(drawMode?.color || '#1e293b');
  const thicknesses = [2, 4, 6, 10, 16];

  return (
    <Popover anchorRef={anchorRef}>
      <div className="p-4 flex flex-col gap-4 w-64">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Draw Mode</p>
          <button onMouseDown={(e)=>{e.preventDefault();onAction('drawToggle');}}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors ${drawMode?.active?'bg-primary text-white':'bg-slate-100 text-slate-500'}`}>
            {drawMode?.active?'On':'Off'}
          </button>
        </div>
        <div className="flex gap-2">
          <button onMouseDown={(e)=>{e.preventDefault();onAction('drawEraser',false);}}
            className={`flex-1 flex items-center justify-center gap-1 py-1 md:py-2 rounded-md md:rounded-xl text-[10px] md:text-[11px] font-medium md:font-bold transition-colors ${!drawMode?.eraser?'bg-slate-900 text-white':'bg-slate-100 text-slate-500'}`}>
            <span className="material-icons-round text-[11px] md:text-[14px]">edit</span>Pen
          </button>
          <button onMouseDown={(e)=>{e.preventDefault();onAction('drawEraser',true);}}
            className={`flex-1 flex items-center justify-center gap-1 py-1 md:py-2 rounded-md md:rounded-xl text-[10px] md:text-[11px] font-medium md:font-bold transition-colors ${drawMode?.eraser?'bg-slate-900 text-white':'bg-slate-100 text-slate-500'}`}>
            <span className="material-icons-round text-[11px] md:text-[14px]">auto_fix_normal</span>Eraser
          </button>
        </div>
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Thickness</p>
          <div className="flex items-center gap-2">
            {thicknesses.map(t => (
              <button key={t} onMouseDown={(e)=>{e.preventDefault();onAction('drawThickness',t);}}
                className={`flex items-center justify-center rounded-full transition-all ${drawMode?.thickness===t?'bg-primary':'bg-slate-200 hover:bg-slate-300'}`}
                style={{ width:`${t+16}px`,height:`${t+16}px` }} title={`${t}px`}>
                <div className="rounded-full" style={{ width:`${t}px`,height:`${t}px`,backgroundColor:drawMode?.thickness===t?'white':'#475569' }} />
              </button>
            ))}
          </div>
        </div>
        {!drawMode?.eraser && (
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Color</p>
            <div className="custom-toolbar-picker" onMouseDown={(e) => e.stopPropagation()}>
              <HexColorPicker color={localColor} onChange={(c) => { setLocalColor(c); onAction('drawColor',c); }} />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input type="text" value={localColor}
                onChange={(e) => { const v=e.target.value; setLocalColor(v); if(/^#[0-9A-F]{6}$/i.test(v)) onAction('drawColor',v); }}
                className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 outline-none focus:border-primary uppercase" />
              <div className="w-8 h-8 rounded-lg border border-slate-100 shrink-0" style={{ backgroundColor: localColor }} />
            </div>
          </div>
        )}
      </div>
    </Popover>
  );
};

export const PaperToolbar = ({ onAction, activeState, recentColors = [], onAddRecentColor, onImageUpload, onOpenShakespeare, onOpenWebImport, onOpenDocImport }) => {
  const [showTextColor, setShowTextColor]   = useState(false);
  const [showHighlight, setShowHighlight]   = useState(false);
  const [showFontSize, setShowFontSize]     = useState(false);
  const [showUrlInput, setShowUrlInput]     = useState(false);
  const [showDraw, setShowDraw]             = useState(false);
  const [isUploading, setIsUploading]       = useState(false);
  const [url, setUrl]                       = useState("");
  const fileInputRef                        = useRef(null);
  const savedRangeRef                       = useRef(null);
  const toolbarRef                          = useRef(null);
  const linkBtnRef                          = useRef(null);
  const fontSizeBtnRef                      = useRef(null);
  const textColorBtnRef                     = useRef(null);
  const highlightBtnRef                     = useRef(null);
  const drawBtnRef                          = useRef(null);

  const fontSizeOptions = [
    { label: 'Small',  value: '1' },
    { label: 'Normal', value: '3' },
    { label: 'Large',  value: '5' },
    { label: 'XL',     value: '7' },
  ];

  const closeAllPopovers = () => { setShowTextColor(false); setShowHighlight(false); setShowFontSize(false); setShowUrlInput(false); setShowDraw(false); };

  useEffect(() => {
    const isAnyOpen = showTextColor || showHighlight || showFontSize || showUrlInput || showDraw;
    if (!isAnyOpen) return;
    const handleOutside = (e) => {
      const insideToolbar = toolbarRef.current?.contains(e.target);
      const insidePopover = e.target.closest?.('.toolbar-popover');
      if (!insideToolbar && !insidePopover) closeAllPopovers();
    };
    const handleScroll = () => closeAllPopovers();
    const toolbar = toolbarRef.current;
    document.addEventListener("mousedown", handleOutside);
    toolbar?.addEventListener("scroll", handleScroll);
    return () => { document.removeEventListener("mousedown", handleOutside); toolbar?.removeEventListener("scroll", handleScroll); };
  }, [showTextColor, showHighlight, showFontSize, showUrlInput, showDraw]);

  const getSelectedAnchor = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    let node = sel.getRangeAt(0).commonAncestorContainer;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
    return node.closest?.('a') ?? null;
  };

  const saveSelection = () => { const sel = window.getSelection(); if (sel && sel.rangeCount > 0) savedRangeRef.current = sel.getRangeAt(0).cloneRange(); };

  const restoreAndInsertLink = () => {
    if (savedRangeRef.current) { const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(savedRangeRef.current); savedRangeRef.current = null; }
    if (url.trim()) { let href = url.trim(); if (!/^https?:\/\//i.test(href)) href = 'https://' + href; onAction('createLink', href); }
    setShowUrlInput(false); setUrl("");
  };

  return (
    <>
      <style>{`
        .custom-toolbar-picker .react-colorful { width:100%!important;height:140px!important;border-radius:12px; }
        .custom-toolbar-picker .react-colorful__saturation { border-bottom:6px solid #f8fafc;border-radius:10px 10px 0 0; }
        .custom-toolbar-picker .react-colorful__hue { height:10px!important;border-radius:0 0 10px 10px; }
        .custom-toolbar-picker .react-colorful__pointer { width:16px!important;height:16px!important; }
      `}</style>

      <aside ref={toolbarRef}
        className="w-10 md:w-16 border-r border-slate-200 bg-white flex flex-col items-center py-6 gap-5 shrink-0 select-none overflow-y-auto custom-scrollbar"
        style={{ position:'relative',zIndex:10 }}>

        {/* 0. Shakespeare AI */}
        <button onMouseDown={(e) => { e.preventDefault(); onOpenShakespeare?.(); }} title="Shakespeare Assist — AI writing"
          className="w-7 h-7 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-black hover:opacity-90 active:scale-90 transition-all">
          <span className="material-icons-round text-[15px] md:text-[18px]">auto_fix_high</span>
        </button>

        <div className="h-px w-8 bg-slate-100 shrink-0" />

        {/* 1. Basic Formatting */}
        <div className="flex flex-col gap-2">
          <ToolbarButton icon="format_bold"      action="bold"      active={activeState?.bold}      title="Bold"      onAction={onAction} />
          <ToolbarButton icon="format_italic"    action="italic"    active={activeState?.italic}    title="Italic"    onAction={onAction} />
          <ToolbarButton icon="format_underlined" action="underline" active={activeState?.underline} title="Underline" onAction={onAction} />
          <ToolbarButton icon="format_strikethrough" action="strikeThrough" title="Strikethrough" onAction={onAction} />
          <div ref={linkBtnRef}>
            <ToolbarButton icon="link" active={showUrlInput} title="Insert Link" onAction={onAction}
              onClick={() => {
                if (!showUrlInput) { saveSelection(); const anchor = getSelectedAnchor(); setUrl(anchor ? anchor.getAttribute('href') || '' : ''); }
                setShowUrlInput(v => !v); setShowTextColor(false); setShowHighlight(false); setShowFontSize(false);
              }} />
          </div>
        </div>

        {showUrlInput && (
          <UrlInputPopover anchorRef={linkBtnRef} url={url} onUrlChange={setUrl}
            onInsert={restoreAndInsertLink} onCancel={() => { setShowUrlInput(false); setUrl(""); }} />
        )}

        <div className="h-px w-8 bg-slate-100 shrink-0" />



        {/* 3. Alignment */}
        <div className="flex flex-col gap-2">
          <ToolbarButton icon="format_align_left"    action="justifyLeft"   active={activeState?.align==='left'}    title="Align Left"    onAction={onAction} />
          <ToolbarButton icon="format_align_center"  action="justifyCenter" active={activeState?.align==='center'}  title="Align Center"  onAction={onAction} />
          <ToolbarButton icon="format_align_right"   action="justifyRight"  active={activeState?.align==='right'}   title="Align Right"   onAction={onAction} />
          <ToolbarButton icon="format_align_justify" action="justifyFull"   active={activeState?.align==='justify'} title="Justify"       onAction={onAction} />
        </div>

        <div className="h-px w-8 bg-slate-100 shrink-0" />

        {/* 4. Font Size */}
        <div className="flex flex-col gap-2.5">
          <div ref={fontSizeBtnRef}>
            <button onMouseDown={(e) => { e.preventDefault(); setShowFontSize(v=>!v); setShowTextColor(false); setShowHighlight(false); setShowUrlInput(false); }}
              className={`w-7 h-7 md:w-10 md:h-10 rounded-md md:rounded-xl flex items-center justify-center transition-all ${showFontSize?'bg-slate-900 text-white shadow-lg':'bg-slate-100/50 text-slate-600 hover:bg-slate-200'}`}
              title="Text Size">
              <span className="material-icons-round text-[13px] md:text-[22px]">text_fields</span>
            </button>
          </div>
          {showFontSize && <FontSizePopover anchorRef={fontSizeBtnRef} options={fontSizeOptions} onSelect={(val) => { onAction('fontSize',val); setShowFontSize(false); }} />}
        </div>

        <div className="h-px w-8 bg-slate-100 shrink-0" />

        {/* 5. Lists */}
        <div className="flex flex-col gap-2.5">
          <ToolbarButton icon="format_list_bulleted" action="insertUnorderedList" active={activeState?.list==='ul'} title="Bulleted List" onAction={onAction} />
          <ToolbarButton icon="format_list_numbered" action="insertOrderedList"   active={activeState?.list==='ol'} title="Numbered List" onAction={onAction} />
        </div>

        <div className="h-px w-8 bg-slate-100 shrink-0" />

        {/* 6. Colors */}
        <div className="flex flex-col gap-2.5">
          <div ref={textColorBtnRef}>
            <button onMouseDown={(e) => { e.preventDefault(); setShowTextColor(v=>!v); setShowHighlight(false); setShowFontSize(false); setShowUrlInput(false); }}
              className={`w-7 h-7 md:w-10 md:h-10 rounded-md md:rounded-xl flex items-center justify-center transition-all ${showTextColor?'bg-slate-900 text-white':'bg-slate-100/50 text-slate-600 hover:bg-slate-200'}`}
              title="Text Color">
              <span className="material-icons-round text-[13px] md:text-[22px]">format_color_text</span>
            </button>
          </div>
          {showTextColor && (
            <AdvancedColorPicker anchorRef={textColorBtnRef} color={activeState?.foreColor||"#000000"} title="Text Color"
              onClose={() => setShowTextColor(false)} onChange={(c) => onAction('foreColor',c)}
              recentColors={recentColors} onAddRecentColor={onAddRecentColor} />
          )}
          <div ref={highlightBtnRef}>
            <button onMouseDown={(e) => { e.preventDefault(); setShowHighlight(v=>!v); setShowTextColor(false); setShowFontSize(false); setShowUrlInput(false); }}
              className={`w-7 h-7 md:w-10 md:h-10 rounded-md md:rounded-xl flex items-center justify-center transition-all ${showHighlight?'bg-slate-900 text-white':'bg-slate-100/50 text-slate-600 hover:bg-slate-200'}`}
              title="Highlight">
              <span className="material-icons-round text-[13px] md:text-[22px]">draw</span>
            </button>
          </div>
          {showHighlight && (
            <AdvancedColorPicker anchorRef={highlightBtnRef} color={activeState?.hiliteColor||"#ffffff"} title="Text Background"
              onClose={() => setShowHighlight(false)} onChange={(c) => onAction('hiliteColor',c)}
              recentColors={recentColors} onAddRecentColor={onAddRecentColor}
              showNone onNone={() => { document.execCommand('styleWithCSS',false,true); document.execCommand('hiliteColor',false,'transparent'); onAction('hiliteColor','transparent'); }} />
          )}
        </div>

        <div className="h-px w-8 bg-slate-100 shrink-0" />

        {/* 7. Special Tools */}
        <div className="flex flex-col gap-2.5">
          {/* Web import */}
          <button onMouseDown={(e) => { e.preventDefault(); onOpenWebImport?.(); }}
            title="Web to Text — extract from any article URL"
            className="w-7 h-7 md:w-10 md:h-10 rounded-md md:rounded-xl flex items-center justify-center bg-slate-100/50 text-slate-600 hover:bg-slate-200 active:scale-90 transition-all">
            <span className="material-icons-round text-[13px] md:text-[20px]">article</span>
          </button>

          {/* Doc / PDF import */}
          <button onMouseDown={(e) => { e.preventDefault(); onOpenDocImport?.(); }}
            title="Import PDF or DOCX"
            className="w-7 h-7 md:w-10 md:h-10 rounded-md md:rounded-xl flex items-center justify-center bg-slate-100/50 text-slate-600 hover:bg-slate-200 active:scale-90 transition-all">
            <span className="material-icons-round text-[13px] md:text-[20px]">upload_file</span>
          </button>

          {/* Image upload */}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]; e.target.value = '';
              if (!file) return;
              setIsUploading(true);
              try {
                const data = new FormData();
                data.append('file', file); data.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET); data.append('cloud_name',import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
                const res  = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, { method:'POST', body:data });
                const json = await res.json();
                if (json.secure_url) onImageUpload(json.secure_url);
              } catch (err) { console.error('Upload failed', err); }
              finally { setIsUploading(false); }
            }} />

          <button onMouseDown={(e) => { e.preventDefault(); saveSelection(); fileInputRef.current?.click(); }}
            disabled={isUploading}
            className={`w-7 h-7 md:w-10 md:h-10 rounded-md md:rounded-xl flex items-center justify-center transition-all ${isUploading?'bg-primary/20 text-primary animate-pulse':'bg-slate-100/50 text-slate-600 hover:bg-slate-200'}`}
            title="Insert Image">
            <span className="material-icons-round text-[13px] md:text-[20px]">{isUploading?'hourglass_top':'image'}</span>
          </button>

          {/* Draw */}
          <div ref={drawBtnRef}>
            <button onMouseDown={(e) => { e.preventDefault(); setShowDraw(v=>!v); setShowTextColor(false); setShowHighlight(false); setShowFontSize(false); setShowUrlInput(false); }}
              className={`w-7 h-7 md:w-10 md:h-10 rounded-md md:rounded-xl flex items-center justify-center transition-all
                ${activeState?.drawMode?.active?'bg-primary text-white shadow-lg shadow-primary/30':'bg-slate-100/50 text-slate-600 hover:bg-slate-200'}
                ${showDraw?'ring-2 ring-primary ring-offset-1':''}`}
              title="Draw">
              <span className="material-icons-round text-[13px] md:text-[20px]">gesture</span>
            </button>
          </div>
          {showDraw && <DrawPopover anchorRef={drawBtnRef} drawMode={activeState?.drawMode} onAction={onAction} />}
        </div>
      </aside>
    </>
  );
};
