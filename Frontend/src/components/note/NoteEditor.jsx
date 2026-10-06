import { forwardRef, useEffect, useLayoutEffect, useRef, useCallback, useState } from "react";
import { createPortal } from "react-dom";

// US Letter dimensions at 96 dpi: 816 × 1056 px
const PAGE_WIDTH  = 816;
const PAGE_HEIGHT = 1056;

// Remove child nodes from the end of `el` until its scrollHeight fits within
// maxHeight. Returns the removed nodes as an HTML string for the next page.
function splitContentAtMaxHeight(el, maxHeight) {
  if (el.scrollHeight <= maxHeight) return '';

  let overflow = '';
  while (el.scrollHeight > maxHeight && el.childNodes.length > 1) {
    const node = el.lastChild;
    overflow = (node.nodeType === Node.TEXT_NODE ? node.textContent : node.outerHTML) + overflow;
    el.removeChild(node);
  }
  return overflow;
}

const NotePage = ({
  index,
  content,
  activePageIndex,
  onContentChange,
  onFocus,
  onHeightOverflow,
  onKeyDown,
  paperStyle,
  paperColor,
  lineColor,
  lineSpacing,
  fontClass,
  fontSize,
  fontFamily,
  textColor,
  editorRef,
  drawMode,
  drawingDataUrl,
  onDrawingChange,
  readOnly,
}) => {
  const pageRef = useRef(null);
  const isComposingRef = useRef(false);
  const isLocalChangeRef = useRef(false);

  const checkOverflow = useCallback(() => {
    const el = pageRef.current;
    if (!el || el.scrollHeight <= PAGE_HEIGHT) return;

    const overflowHTML = splitContentAtMaxHeight(el, PAGE_HEIGHT);
    if (!overflowHTML) return;

    isLocalChangeRef.current = true;
    onContentChange(index, el.innerHTML);
    onHeightOverflow(index, overflowHTML);
  }, [index, onHeightOverflow, onContentChange]);

  // Keep a stable ref to checkOverflow so the content-sync effect below can
  // call the latest version without adding it to the dependency array.
  const checkOverflowRef = useRef(checkOverflow);
  useEffect(() => { checkOverflowRef.current = checkOverflow; });

  // Set initial content on mount; if it's already overflowing, cascade immediately.
  useLayoutEffect(() => {
    if (pageRef.current) {
      pageRef.current.innerHTML = content ?? "";
      if (content) checkOverflowRef.current();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync content from parent when it changes from outside (e.g. overflow cascade).
  // After syncing, check if THIS page now overflows so cascading works.
  useLayoutEffect(() => {
    if (!pageRef.current) return;
    if (isLocalChangeRef.current) {
      isLocalChangeRef.current = false;
      return;
    }
    if (pageRef.current.innerHTML !== content) {
      pageRef.current.innerHTML = content ?? "";
      checkOverflowRef.current();
    }
  }, [content]);

  // Assign editorRef for the active page so toolbar commands work
  useEffect(() => {
    if (index === activePageIndex && editorRef) {
      if (typeof editorRef === 'function') editorRef(pageRef.current);
      else editorRef.current = pageRef.current;
    }
  }, [index, activePageIndex, editorRef]);

  // When this page becomes active and doesn't already have focus (i.e. overflow
  // moved us here, not a user click), focus it and place cursor at the start.
  useEffect(() => {
    if (index !== activePageIndex) return;
    if (!pageRef.current) return;
    if (pageRef.current.contains(document.activeElement)) return; // user clicked, leave cursor alone

    pageRef.current.focus();
    try {
      const range = document.createRange();
      range.setStart(pageRef.current, 0);
      range.collapse(true);
      const sel = window.getSelection();
      if (sel) { sel.removeAllRanges(); sel.addRange(range); }
    } catch (_) { /* empty page — no child nodes yet */ }
  }, [index, activePageIndex]);

  const handleInput = (e) => {
    if (isComposingRef.current) return;
    const newContent = e.currentTarget.innerHTML;
    isLocalChangeRef.current = true;
    onContentChange(index, newContent);
    checkOverflow();
  };

  const handleCompositionStart = () => { isComposingRef.current = true; };
  const handleCompositionEnd = (e) => { isComposingRef.current = false; handleInput(e); };

  // ── Canvas drawing ──────────────────────────────────────────────────────────
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  // Restore saved drawing when data URL changes from outside (e.g. page load)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!drawingDataUrl) {
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    const img = new Image();
    img.onload = () => canvas.getContext('2d').drawImage(img, 0, 0);
    img.src = drawingDataUrl;
  }, [drawingDataUrl]);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const startDraw = (e) => {
    if (!drawMode?.active) return;
    e.preventDefault();
    isDrawingRef.current = true;
    lastPosRef.current = getPos(e);
  };

  const draw = (e) => {
    if (!drawMode?.active || !isDrawingRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e);

    if (drawMode.eraser) {
      ctx.clearRect(pos.x - drawMode.thickness * 4, pos.y - drawMode.thickness * 4, drawMode.thickness * 8, drawMode.thickness * 8);
    } else {
      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = drawMode.color;
      ctx.lineWidth = drawMode.thickness;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
    lastPosRef.current = pos;
  };

  const endDraw = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    onDrawingChange(index, canvasRef.current.toDataURL());
  };
  // ────────────────────────────────────────────────────────────────────────────

  // Lines only render inside a padded region — creates blank space at top and bottom
  const lineMargin = lineSpacing * 2; // 2 empty line-heights of breathing room
  const linesStyle = (() => {
    if (paperStyle === 'ruled') {
      return {
        backgroundImage: `linear-gradient(${lineColor} 1px, transparent 1px)`,
        backgroundSize: `100% ${lineSpacing}px`,
      };
    }
    if (paperStyle === 'grid') {
      return {
        backgroundImage: `linear-gradient(${lineColor} 1px, transparent 1px), linear-gradient(90deg, ${lineColor} 1px, transparent 1px)`,
        backgroundSize: `${lineSpacing}px ${lineSpacing}px`,
      };
    }
    if (paperStyle === 'dotted') {
      return {
        backgroundImage: `radial-gradient(circle, ${lineColor} 1.5px, transparent 1.5px)`,
        backgroundSize: `${lineSpacing}px ${lineSpacing}px`,
      };
    }
    return null;
  })();

  const isActive = activePageIndex === index;

  return (
    <div
      className="relative shrink-0"
      style={{ width: '816px', height: `${PAGE_HEIGHT}px` }}
    >
      {/* Paper base — color + shadow/ring only, no lines */}
      <div
        className={`absolute inset-0  transition-all duration-300 ${
          isActive
            ? 'shadow-[0_8px_40px_rgba(28,25,23,0.16)] ring-2 ring-plum-400 ring-offset-4'
            : 'shadow-[0_4px_20px_rgba(0,0,0,0.10)]'
        }`}
        style={{ backgroundColor: paperColor }}
      />

      {/* Lines layer — clipped so lines don't reach the top/bottom edges */}
      {linesStyle && (
        <div
          className="absolute inset-0  pointer-events-none"
          style={{
            ...linesStyle,
            backgroundClip: 'content-box',
            padding: `${lineMargin}px 0`,
            boxSizing: 'border-box',
          }}
        />
      )}

      {/* Ruled margin line — only in the lines region */}
      {paperStyle === 'ruled' && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: '72px',
            top: `${lineMargin}px`,
            bottom: `${lineMargin}px`,
            width: '1px',
            backgroundColor: '#D6D3D1',
            opacity: 0.5,
          }}
        />
      )}

      {/* Page number badge */}
      <div className="absolute -left-5 top-6 w-7 h-7  bg-white border border-stone-200 flex items-center justify-center shadow-sm text-xs font-medium text-stone-400 select-none">
        {index + 1}
      </div>

      {/* Editable content area — fixed height so the page never grows */}
      <div
        ref={(node) => {
          pageRef.current = node;
          if (index === activePageIndex && editorRef) {
            if (typeof editorRef === 'function') editorRef(node);
            else editorRef.current = node;
          }
        }}
        data-note-page={index}
        contentEditable={!readOnly}
        suppressContentEditableWarning
        onInput={readOnly ? undefined : handleInput}
        onCompositionStart={readOnly ? undefined : handleCompositionStart}
        onCompositionEnd={readOnly ? undefined : handleCompositionEnd}
        onFocus={() => !readOnly && onFocus(index)}
        onKeyDown={(e) => !readOnly && onKeyDown && onKeyDown(e, index)}
        spellCheck={!readOnly}
        className={`relative w-full outline-none prose prose-stone max-w-none page-content-area ${fontClass} ${readOnly ? 'cursor-wait select-none' : ''}`}
        style={{
          height: `${PAGE_HEIGHT}px`,
          padding: '72px 80px',
          fontSize: `${fontSize}px`,
          lineHeight: `${lineSpacing}px`,
          color: textColor,
          fontFamily:
            fontFamily === 'sans'        ? 'Inter, ui-sans-serif, sans-serif' :
            fontFamily === 'handwriting' ? 'Kalam, cursive' :
            fontFamily === 'casual'      ? 'Caveat, cursive' :
            fontFamily === 'fun'         ? '"Indie Flower", cursive' :
            fontFamily === 'shadows'     ? '"Shadows Into Light", cursive' :
            fontFamily === 'dancing'     ? '"Dancing Script", cursive' :
            'inherit',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          overflow: 'hidden',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 1,
        }}
      />

      {/* Drawing canvas — sits above text, only captures pointer when draw mode is on */}
      <canvas
        ref={canvasRef}
        width={816}
        height={PAGE_HEIGHT}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          borderRadius: '2px',
          cursor: drawMode?.active
            ? drawMode.eraser ? 'cell' : 'crosshair'
            : 'none',
          pointerEvents: drawMode?.active ? 'all' : 'none',
          touchAction: 'none',
        }}
      />
    </div>
  );
};


export const NoteEditor = forwardRef(function NoteEditor(
  {
    pages = [],
    onContentChange,
    paperStyle,
    fontFamily,
    fontSize,
    lineSpacing,
    textColor,
    paperColor,
    lineColor,
    activePageIndex,
    setActivePageIndex,
    onPageOverflow,
    onKeyDown,
    drawMode,
    drawingData = [],
    onDrawingChange,
    onPageRefsReady,
    readOnly = false,
  },
  ref
) {
  const fontMapping = {
    sans:        'font-sans',
    handwriting: 'font-handwriting',  // Kalam
    casual:      'font-handwriting2', // Caveat
    fun:         'font-handwriting3', // Indie Flower
    shadows:     'font-sketch',       // Shadows Into Light
    dancing:     'font-dancing',      // Dancing Script
  };
  const fontClass = fontMapping[fontFamily] || 'font-sans';

  const containerRef = useRef(null);
  const pageRefs = useRef([]);

  // Dynamically scale pages so they always fit the available container width.
  // GAP is the total horizontal breathing room we want around the scaled page.
  const GAP = 48;
  const [pageScale, setPageScale] = useState(1);

  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const available = containerRef.current.clientWidth - GAP;
      setPageScale(Math.min(1, available / PAGE_WIDTH));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Auto-scroll to active page when it changes
  useEffect(() => {
    const pageEl = pageRefs.current[activePageIndex];
    if (pageEl && containerRef.current) {
      pageEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activePageIndex]);

  // Link hover tooltip
  const [linkTooltip, setLinkTooltip] = useState(null);
  const tooltipHideTimer = useRef(null);
  const currentAnchorRef = useRef(null);

  const scheduleHide = useCallback(() => {
    clearTimeout(tooltipHideTimer.current);
    tooltipHideTimer.current = setTimeout(() => setLinkTooltip(null), 400);
  }, []);

  const cancelHide = useCallback(() => {
    clearTimeout(tooltipHideTimer.current);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseOver = (e) => {
      const anchor = e.target.closest('a[href]');
      if (!anchor) return;

      // Detach from previous anchor before switching
      if (currentAnchorRef.current && currentAnchorRef.current !== anchor) {
        currentAnchorRef.current.removeEventListener('mouseleave', scheduleHide);
      }

      // Always re-attach so it works after re-hovering the same anchor
      anchor.removeEventListener('mouseleave', scheduleHide);
      anchor.addEventListener('mouseleave', scheduleHide);
      currentAnchorRef.current = anchor;

      cancelHide();
      const rect = anchor.getBoundingClientRect();
      setLinkTooltip({
        href: anchor.getAttribute('href'),
        anchor,
        x: rect.left,
        y: rect.bottom + 6,
      });
    };

    container.addEventListener('mouseover', handleMouseOver);
    return () => {
      container.removeEventListener('mouseover', handleMouseOver);
      clearTimeout(tooltipHideTimer.current);
    };
  }, [cancelHide, scheduleHide]);

  // ── Image resize ─────────────────────────────────────────────────────────────
  const [selectedImg, setSelectedImg] = useState(null); // { el, rect }
  const resizeDragRef = useRef(null); // { handle, startX, startY, startW, startH }

  // Click inside container — select image or deselect
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onClick = (e) => {
      const img = e.target.closest('img[data-resizable]');
      if (img) {
        e.preventDefault();
        const rect = img.getBoundingClientRect();
        setSelectedImg({ el: img, rect });
      } else {
        setSelectedImg(null);
      }
    };
    container.addEventListener('mousedown', onClick);
    return () => container.removeEventListener('mousedown', onClick);
  }, []);

  // Keep overlay rect in sync with scroll / resize
  useEffect(() => {
    if (!selectedImg) return;
    const sync = () => {
      setSelectedImg(prev => prev ? { ...prev, rect: prev.el.getBoundingClientRect() } : null);
    };
    const container = containerRef.current;
    container?.addEventListener('scroll', sync);
    window.addEventListener('resize', sync);
    return () => {
      container?.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [selectedImg]);

  // Drag handlers for resize
  useEffect(() => {
    if (!selectedImg) return;

    const onMove = (e) => {
      const d = resizeDragRef.current;
      if (!d) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      const img = selectedImg.el;
      let w = d.startW, h = d.startH;

      if (d.handle.includes('e')) w = Math.max(40, d.startW + dx);
      if (d.handle.includes('w')) w = Math.max(40, d.startW - dx);
      if (d.handle.includes('s')) h = Math.max(40, d.startH + dy);
      if (d.handle.includes('n')) h = Math.max(40, d.startH - dy);

      // Corner handles — maintain aspect ratio
      if (d.handle.length === 2) {
        const ratio = d.startW / d.startH;
        if (d.handle.includes('e') || d.handle.includes('w')) h = w / ratio;
        else w = h * ratio;
      }

      img.style.width = `${Math.round(w)}px`;
      img.style.height = `${Math.round(h)}px`;
      setSelectedImg(prev => prev ? { ...prev, rect: img.getBoundingClientRect() } : null);
    };

    const onUp = () => {
      resizeDragRef.current = null;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [selectedImg]);

  // 8 handles: corners + edges
  const HANDLES = ['n','s','e','w','ne','nw','se','sw'];
  const handleCursor = { n:'ns-resize', s:'ns-resize', e:'ew-resize', w:'ew-resize', ne:'nesw-resize', sw:'nesw-resize', nw:'nwse-resize', se:'nwse-resize' };
  const handlePos = (h, rect) => {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const x = h.includes('e') ? rect.right : h.includes('w') ? rect.left : cx;
    const y = h.includes('s') ? rect.bottom : h.includes('n') ? rect.top : cy;
    return { left: x - 5, top: y - 5 };
  };
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <>
    {/* Image resize overlay */}
    {selectedImg && createPortal(
      <div style={{ position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'none' }}>
        {/* Blue border around image */}
        <div style={{
          position: 'fixed',
          left: selectedImg.rect.left,
          top: selectedImg.rect.top,
          width: selectedImg.rect.width,
          height: selectedImg.rect.height,
          border: '2px solid #8465BC',
          borderRadius: '2px',
          pointerEvents: 'none',
        }} />
        {/* 8 resize handles */}
        {HANDLES.map(h => {
          const pos = handlePos(h, selectedImg.rect);
          return (
            <div
              key={h}
              style={{
                position: 'fixed',
                left: pos.left,
                top: pos.top,
                width: 10,
                height: 10,
                background: 'white',
                border: '2px solid #8465BC',
                borderRadius: '2px',
                cursor: handleCursor[h],
                pointerEvents: 'all',
                zIndex: 9999,
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                resizeDragRef.current = {
                  handle: h,
                  startX: e.clientX,
                  startY: e.clientY,
                  startW: selectedImg.el.offsetWidth,
                  startH: selectedImg.el.offsetHeight,
                };
              }}
            />
          );
        })}
        {/* Delete button */}
        <div
          style={{
            position: 'fixed',
            left: selectedImg.rect.right - 12,
            top: selectedImg.rect.top - 12,
            pointerEvents: 'all',
          }}
        >
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              selectedImg.el.remove();
              setSelectedImg(null);
            }}
            className="w-6 h-6 bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600"
          >
            <span className="material-icons-round text-[13px]">close</span>
          </button>
        </div>
      </div>,
      document.body
    )}
    {linkTooltip && createPortal(
      <div
        style={{ position: 'fixed', top: linkTooltip.y, left: linkTooltip.x, zIndex: 9999 }}
        className="flex items-center gap-1 bg-stone-900 text-white  px-3 py-2 shadow-2xl text-[11px] max-w-xs"
        onMouseEnter={cancelHide}
        onMouseLeave={scheduleHide}
      >
        <span className="material-icons-round text-[13px] text-stone-400 shrink-0">link</span>
        <span className="truncate flex-1 text-stone-200 max-w-[180px]">{linkTooltip.href}</span>
        <button
          onMouseDown={(e) => { e.preventDefault(); window.open(linkTooltip.href, '_blank', 'noopener'); }}
          className="ml-1 p-1  hover:bg-stone-700 transition-colors shrink-0"
          title="Open link"
        >
          <span className="material-icons-round text-[13px]">open_in_new</span>
        </button>
        <button
          onMouseDown={(e) => { e.preventDefault(); navigator.clipboard.writeText(linkTooltip.href); }}
          className="p-1  hover:bg-stone-700 transition-colors shrink-0"
          title="Copy link"
        >
          <span className="material-icons-round text-[13px]">content_copy</span>
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            // Select the anchor text, then remove the link
            const sel = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(linkTooltip.anchor);
            sel.removeAllRanges();
            sel.addRange(range);
            document.execCommand('unlink');
            setLinkTooltip(null);
          }}
          className="p-1  hover:bg-red-600 transition-colors shrink-0"
          title="Remove link"
        >
          <span className="material-icons-round text-[13px]">link_off</span>
        </button>
      </div>,
      document.body
    )}
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto custom-scrollbar"
      style={{
        background: '#F5F1E9',
        padding: '32px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: `${Math.round(40 * pageScale)}px`,
      }}
    >
      {pages.map((content, index) => (
        // Outer wrapper collapses to the SCALED dimensions so the scrollable
        // container doesn't overflow horizontally, while the inner page renders
        // at its true 816 × 1056 size and is scaled via transform.
        <div
          key={index}
          style={{
            width:  `${Math.round(PAGE_WIDTH  * pageScale)}px`,
            height: `${Math.round(PAGE_HEIGHT * pageScale)}px`,
            flexShrink: 0,
            position: 'relative',
          }}
          ref={(el) => {
            pageRefs.current[index] = el;
            if (index === pages.length - 1 && onPageRefsReady) {
              onPageRefsReady(pageRefs.current.slice(0, pages.length));
            }
          }}
        >
          <div
            style={{
              transform: `scale(${pageScale})`,
              transformOrigin: 'top left',
              width:  `${PAGE_WIDTH}px`,
              height: `${PAGE_HEIGHT}px`,
            }}
          >
            <NotePage
              index={index}
              content={content}
              activePageIndex={activePageIndex}
              onContentChange={onContentChange}
              onFocus={setActivePageIndex}
              onHeightOverflow={onPageOverflow}
              onKeyDown={onKeyDown}
              paperStyle={paperStyle}
              paperColor={paperColor}
              lineColor={lineColor}
              lineSpacing={lineSpacing}
              fontClass={fontClass}
              fontSize={fontSize}
              fontFamily={fontFamily}
              textColor={textColor}
              editorRef={ref}
              drawMode={drawMode}
              drawingDataUrl={drawingData[index] ?? ""}
              onDrawingChange={onDrawingChange}
              readOnly={readOnly}
            />
          </div>
        </div>
      ))}
      <div style={{ height: '32px', flexShrink: 0 }} />
    </div>
    </>
  );
});
