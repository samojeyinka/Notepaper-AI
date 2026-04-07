import React, { forwardRef, useEffect, useRef } from "react";

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
    editorRef
}) => {
    const pageRef = useRef(null);
    const lastContentRef = useRef(content);

    // Sync external content changes
    useEffect(() => {
        if (pageRef.current && content !== lastContentRef.current) {
            pageRef.current.innerHTML = content;
            lastContentRef.current = content;
        }
    }, [content]);

    // Initial load
    useEffect(() => {
        if (pageRef.current) {
            pageRef.current.innerHTML = content;
        }
    }, []);

    const handleInput = (e) => {
        const newContent = e.currentTarget.innerHTML;
        lastContentRef.current = newContent;
        onContentChange(index, newContent);

        // Check for height overflow
        const scrollHeight = e.currentTarget.scrollHeight;
        if (scrollHeight > 920) {
            onHeightOverflow(index);
        }
    };

    const paperClass = paperStyle === 'grid' ? 'paper-grid' : paperStyle === 'ruled' ? 'paper-ruled' : '';

    return (
        <div 
            className={`relative w-full max-w-[816px] min-h-[1056px] page-paper transition-all duration-300 p-20 ${paperClass}
                ${activePageIndex === index ? 'ring-2 ring-primary ring-offset-8 scale-[1.01]' : ''}`}
            style={{ 
                backgroundColor: paperColor,
                backgroundImage: paperStyle === 'ruled' 
                    ? `linear-gradient(${lineColor} 1px, transparent 1px)` 
                    : paperStyle === 'grid' 
                    ? `radial-gradient(${lineColor} 1px, transparent 1px)`
                    : 'none',
                backgroundSize: paperStyle === 'grid' ? '40px 40px' : `100% ${lineSpacing}px`
            }}
        >
            <div className="absolute -left-16 top-0 w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm text-xs font-bold text-slate-400">
                {index + 1}
            </div>

            {paperStyle === 'ruled' && (
                <div className="absolute left-10 top-0 bottom-0 w-px bg-red-200 pointer-events-none" />
            )}

            <div className={`prose prose-slate max-w-none h-full ${fontClass}`} style={{ color: textColor }}>
                <div
                    ref={(node) => {
                        pageRef.current = node;
                        if (index === activePageIndex && editorRef) {
                            if (typeof editorRef === 'function') editorRef(node);
                            else editorRef.current = node;
                        }
                    }}
                    contentEditable
                    onInput={handleInput}
                    onFocus={() => onFocus(index)}
                    onKeyDown={(e) => onKeyDown(e, index)}
                    className="page-content-area w-full outline-none"
                    style={{ 
                        fontSize: `${fontSize}px`, 
                        lineHeight: `${lineSpacing}px`,
                        fontFamily: fontFamily === 'sans' ? 'Inter, sans-serif' : 'inherit'
                    }}
                />
            </div>
        </div>
    );
};

export const NoteEditor = forwardRef(({ 
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
    onKeyDown
}, ref) => {
    const fontMapping = {
        sans: 'font-sans',
        handwriting: 'font-handwriting',
        casual: 'font-handwriting2',
        neat: 'font-handwriting',
        fun: 'font-handwriting3'
    };
    
    const fontClass = fontMapping[fontFamily] || 'font-sans';

    return (
        <div className="flex-1 pages-container p-12 overflow-y-auto custom-scrollbar flex flex-col items-center gap-12">
            {pages.map((content, index) => (
                <NotePage 
                    key={index}
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
            ))}
            <div className="h-32 shrink-0" />
        </div>
    );
});

