import React, { forwardRef, useEffect, useRef } from "react";

const NotePage = ({ 
    index, 
    content, 
    activePageIndex, 
    onContentChange, 
    onFocus,
    onHeightOverflow,
    paperClass,
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
    const containerRef = useRef(null);
    const lastContentRef = useRef(content);

    // Initial content setup and handling EXTERNAL changes only
    useEffect(() => {
        if (pageRef.current && content !== lastContentRef.current) {
            pageRef.current.innerHTML = content;
            lastContentRef.current = content;
        }
    }, [content]);

    // Initialize content on mount
    useEffect(() => {
        if (pageRef.current) {
            pageRef.current.innerHTML = content;
        }
    }, []);

    // Smooth scroll logic
    useEffect(() => {
        if (activePageIndex === index && containerRef.current) {
            containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [activePageIndex, index]);

    const handleInput = (e) => {
        const newContent = e.currentTarget.innerHTML;
        lastContentRef.current = newContent;
        onContentChange(index, newContent);

        // Height overflow check (A4 is ~1056px, we use a slightly smaller limit for the content area)
        const scrollHeight = e.currentTarget.scrollHeight;
        if (scrollHeight > 920) {
            onHeightOverflow(index);
        }
    };

    return (
        <div 
            ref={containerRef}
            className={`relative w-full max-w-[816px] min-h-[1056px] bg-white shadow-2xl transition-all duration-300 p-20 ${paperClass}
                ${activePageIndex === index ? 'ring-2 ring-primary ring-offset-8 scale-[1.01]' : 'hover:shadow-xl'}`}
            style={{ 
                backgroundColor: paperColor,
                backgroundImage: paperStyleClass(paperClass, lineColor, lineSpacing),
                backgroundSize: paperClass === 'paper-grid' ? '40px 40px' : `100% ${lineSpacing}px`
            }}
        >
            {/* Page Number Badge */}
            <div className="absolute -left-16 top-0 w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm text-xs font-bold text-slate-400">
                {index + 1}
            </div>

            {paperClass === 'paper-ruled' && (
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
                    className="page-content-area w-full min-h-[900px] outline-none focus:ring-0 text-xl leading-relaxed whitespace-pre-wrap break-words cursor-text"
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

const paperStyleClass = (paperClass, lineColor, lineSpacing) => {
    if (paperClass === 'paper-ruled') {
        return `linear-gradient(${lineColor} 1px, transparent 1px)`;
    } else if (paperClass === 'paper-grid') {
        return `radial-gradient(${lineColor} 1px, transparent 1px)`;
    }
    return 'none';
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
    onPageOverflow
}, ref) => {
    const paperClass = paperStyle === 'grid' ? 'paper-grid' : paperStyle === 'ruled' ? 'paper-ruled' : '';
    
    const fontMapping = {
        sans: 'font-sans',
        handwriting: 'font-handwriting',
        casual: 'font-handwriting2',
        neat: 'font-handwriting',
        fun: 'font-handwriting3'
    };
    
    const fontClass = fontMapping[fontFamily] || 'font-sans';

    return (
        <div className="flex-1 bg-slate-100/50 p-8 md:p-12 overflow-y-auto custom-scrollbar relative flex flex-col items-center gap-12 pages-container scroll-smooth">
            {pages.map((content, index) => (
                <NotePage 
                    key={index}
                    index={index}
                    content={content}
                    activePageIndex={activePageIndex}
                    onContentChange={onContentChange}
                    onFocus={setActivePageIndex}
                    onHeightOverflow={onPageOverflow}
                    paperClass={paperClass}
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

