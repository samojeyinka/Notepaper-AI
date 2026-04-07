import { forwardRef, useEffect, useRef, useCallback } from "react";

// US Letter dimensions at 96 dpi: 816 × 1056 px
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
  useEffect(() => {
    if (pageRef.current) {
      pageRef.current.innerHTML = content ?? "";
      if (content) checkOverflowRef.current();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync content from parent when it changes from outside (e.g. overflow cascade).
  // After syncing, check if THIS page now overflows so cascading works.
  useEffect(() => {
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
        className={`absolute inset-0 rounded-sm transition-all duration-300 ${
          isActive
            ? 'shadow-[0_8px_40px_rgba(0,0,0,0.18)] ring-2 ring-primary ring-offset-4'
            : 'shadow-[0_4px_20px_rgba(0,0,0,0.10)]'
        }`}
        style={{ backgroundColor: paperColor }}
      />

      {/* Lines layer — clipped so lines don't reach the top/bottom edges */}
      {linesStyle && (
        <div
          className="absolute inset-0 rounded-sm pointer-events-none"
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
            backgroundColor: '#fca5a5',
            opacity: 0.5,
          }}
        />
      )}

      {/* Page number badge */}
      <div className="absolute -left-14 top-6 w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm text-xs font-bold text-slate-400 select-none">
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
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onFocus={() => onFocus(index)}
        onKeyDown={(e) => onKeyDown && onKeyDown(e, index)}
        spellCheck={true}
        className={`relative w-full outline-none prose prose-slate max-w-none page-content-area ${fontClass}`}
        style={{
          height: `${PAGE_HEIGHT}px`,
          padding: '72px 80px',
          fontSize: `${fontSize}px`,
          lineHeight: `${lineSpacing}px`,
          color: textColor,
          fontFamily:
            fontFamily === 'sans'
              ? 'Inter, ui-sans-serif, sans-serif'
              : fontFamily === 'handwriting'
              ? 'Kalam, cursive'
              : fontFamily === 'casual'
              ? 'Caveat, cursive'
              : fontFamily === 'fun'
              ? '"Indie Flower", cursive'
              : 'inherit',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          overflow: 'hidden',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 1,
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
  },
  ref
) {
  const fontMapping = {
    sans: 'font-sans',
    handwriting: 'font-handwriting',
    casual: 'font-handwriting2',
    neat: 'font-handwriting',
    fun: 'font-handwriting3',
  };
  const fontClass = fontMapping[fontFamily] || 'font-sans';

  const containerRef = useRef(null);
  const pageRefs = useRef([]);

  // Auto-scroll to active page when it changes
  useEffect(() => {
    const pageEl = pageRefs.current[activePageIndex];
    if (pageEl && containerRef.current) {
      pageEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activePageIndex]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto custom-scrollbar"
      style={{
        background: '#f1f5f9',
        padding: '48px 80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '40px',
      }}
    >
      {pages.map((content, index) => (
        <div
          key={index}
          ref={(el) => { pageRefs.current[index] = el; }}
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
          />
        </div>
      ))}
      <div style={{ height: '80px', flexShrink: 0 }} />
    </div>
  );
});
