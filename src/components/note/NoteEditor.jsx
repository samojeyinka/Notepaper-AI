import React, { forwardRef, useEffect, useRef } from "react";

export const NoteEditor = forwardRef(({ 
    content, 
    onContentChange, 
    paperStyle, 
    fontFamily, 
    fontSize,
    lineSpacing,
    textColor,
    paperColor, 
    lineColor 
}, ref) => {
    const editorEl = useRef(null);
    
    const paperClass = paperStyle === 'grid' ? 'paper-grid' : paperStyle === 'ruled' ? 'paper-ruled' : '';
    
    const fontMapping = {
        sans: 'font-sans',
        handwriting: 'font-handwriting',
        casual: 'font-handwriting2',
        neat: 'font-handwriting',
        fun: 'font-handwriting3'
    };
    
    const fontClass = fontMapping[fontFamily] || 'font-sans';

    const lastContentRef = useRef(content);

    useEffect(() => {
        // Only update the DOM if the content prop changes from an EXTERNAL source
        // (i.e. not from the user typing in this component)
        if (editorEl.current && content !== lastContentRef.current) {
            editorEl.current.innerHTML = content;
            lastContentRef.current = content;
        }
    }, [content]);

    const handleInput = (e) => {
        const newContent = e.currentTarget.innerHTML;
        lastContentRef.current = newContent;
        onContentChange(newContent);
    };

    useEffect(() => {
        if (editorEl.current) {
            editorEl.current.innerHTML = content;
        }
    }, []); // Initialize on mount

    return (
        <div className="flex-1 bg-slate-50 p-8 md:p-12 overflow-y-auto custom-scrollbar relative">
            <div 
                ref={ref}
                className={`max-w-4xl mx-auto min-h-[140vh] bg-white shadow-xl shadow-slate-200/50 p-16 transition-all relative ${paperClass}`}
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
                {paperStyle === 'ruled' && (
                    <div className="absolute left-10 top-0 bottom-0 w-px bg-red-200 pointer-events-none" />
                )}

                <div className={`prose prose-slate max-w-none ${fontClass}`} style={{ color: textColor }}>
                    <div
                        ref={(node) => {
                            editorEl.current = node;
                            if (typeof ref === 'function') ref(node);
                            else if (ref) ref.current = node;
                        }}
                        contentEditable
                        onInput={handleInput}
                        className="w-full min-h-[100vh] outline-none focus:ring-0 text-xl leading-relaxed whitespace-pre-wrap break-words"
                        style={{ 
                            fontSize: `${fontSize}px`, 
                            lineHeight: `${lineSpacing}px`,
                            fontFamily: fontFamily === 'sans' ? 'Inter, sans-serif' : 'inherit'
                        }}
                    />
                </div>
                
                <button className="absolute bottom-10 right-10 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:rotate-90 transition-transform active:scale-95 z-10">
                    <span className="material-icons-round">add</span>
                </button>
            </div>
        </div>
    );
});
