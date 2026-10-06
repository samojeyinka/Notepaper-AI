import { useEffect, useRef, useState } from "react";

// Auto-resize single-line/title field with a soft character counter.
export const Field = ({ value, onChange, placeholder, style, className, max, multiline=false, noEnter=false, align='left' }) => {
    const ref = useRef(null);
    const [focused, setFocused] = useState(false);
    const remaining = max - (value?.length ?? 0);
    const nearLimit = remaining <= 15;

    useEffect(() => {
        if (!ref.current) return;
        ref.current.style.height = '0px';
        ref.current.style.height = ref.current.scrollHeight + 'px';
    }, [value]);

    const base = {
        background:'transparent', border:'none', outline:'none', resize:'none', overflow:'hidden',
        width:'100%', fontFamily:'inherit', padding:0,
        textAlign:align, wordBreak:'break-word', overflowWrap:'break-word',
        borderBottom: focused ? `1.5px solid ${style?.focusLine ?? 'rgba(255,255,255,0.3)'}` : '1.5px solid transparent',
        transition:'border-color 0.15s',
    };
    const cleanStyle = { ...base, ...style, focusLine:undefined };

    return (
        <div className="relative w-full">
            <textarea ref={ref} value={value??''} placeholder={placeholder} maxLength={max} rows={1}
                onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
                onChange={e=>onChange(e.target.value)}
                onKeyDown={e=>{ if ((!multiline || noEnter) && e.key==='Enter') e.preventDefault(); }}
                style={cleanStyle} className={className}
            />
            {focused && nearLimit && (
                <span style={{ position:'absolute', bottom:2, right:0, fontSize:9, color:style?.focusLine??'rgba(255,255,255,0.3)', pointerEvents:'none' }}>
                    {remaining}
                </span>
            )}
        </div>
    );
};

const RICH_PLACEHOLDER_STYLE = `.rich-body-field:empty::before{content:attr(data-placeholder);opacity:0.4;pointer-events:none}`;

// Rich body field (contenteditable with inline bold/italic/underline).
export const RichBodyField = ({ value, onChange, placeholder, style, max }) => {
    const ref  = useRef(null);

    // Sync only when value changes from outside (not our own input)
    useEffect(() => {
        if (!ref.current) return;
        if (ref.current.innerHTML === (value || '')) return;
        ref.current.innerHTML = value || '';
    }, [value]);

    const emit = () => onChange(ref.current.innerHTML);

    const handleInput = () => {
        // Soft-cap: strip trailing content if text exceeds max
        if (max && ref.current.textContent.length > max) {
            // allow — just don't hard-block, presentations need flexibility
        }
        emit();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); return; }
        if (e.ctrlKey || e.metaKey) {
            if (e.key.toLowerCase() === 'b') { e.preventDefault(); document.execCommand('bold'); emit(); }
            if (e.key.toLowerCase() === 'i') { e.preventDefault(); document.execCommand('italic'); emit(); }
            if (e.key.toLowerCase() === 'u') { e.preventDefault(); document.execCommand('underline'); emit(); }
        }
    };

    // Floating bold button on selection
    const [boldPos, setBoldPos] = useState(null);
    const checkSel = () => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !ref.current?.contains(sel.anchorNode)) {
            setBoldPos(null); return;
        }
        const rect = sel.getRangeAt(0).getBoundingClientRect();
        setBoldPos({ top: rect.top + window.scrollY - 36, left: rect.left + rect.width / 2 });
    };
    const applyBold = (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.execCommand('bold');
        emit();
        setBoldPos(null);
    };
    // Hide bold btn when clicking elsewhere
    useEffect(() => {
        const hide = (e) => {
            if (!ref.current?.contains(e.target)) setBoldPos(null);
        };
        document.addEventListener('mousedown', hide);
        return () => document.removeEventListener('mousedown', hide);
    }, []);

    return (
        <>
            <style>{RICH_PLACEHOLDER_STYLE}</style>
            <div
                ref={ref}
                contentEditable
                suppressContentEditableWarning
                className="rich-body-field"
                data-placeholder={placeholder}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onMouseUp={checkSel}
                onKeyUp={checkSel}
                style={{
                    outline: 'none', resize: 'none', width: '100%',
                    fontFamily: 'inherit', padding: 0,
                    wordBreak: 'break-word', overflowWrap: 'break-word',
                    ...style,
                }}
            />
            {boldPos && (
                <div
                    onMouseDown={applyBold}
                    style={{ position: 'absolute', top: boldPos.top, left: boldPos.left, transform: 'translateX(-50%)', zIndex: 9999, pointerEvents: 'auto' }}>
                    <div style={{
                        background: '#1e293b', color: '#fff', borderRadius: 8,
                        padding: '3px 10px', fontSize: 12, fontWeight: 700,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.3)', cursor: 'pointer',
                        userSelect: 'none', letterSpacing: '0.02em',
                    }}>B</div>
                </div>
            )}
        </>
    );
};