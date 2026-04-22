import { useState, useRef, useEffect } from 'react';
import { TEMPLATES, getFontStyle } from './flashcardTemplates';

const MAX_CHARS = 250;


let _activeEl    = null;
let _savedRange  = null;

const storeSelection = (el) => {
    const sel = window.getSelection();
    if (sel?.rangeCount > 0 && el.contains(sel.anchorNode)) {
        _activeEl   = el;
        _savedRange = sel.getRangeAt(0).cloneRange();
    }
};

export const execOnCard = (command) => {
    if (!_activeEl) return;
    _activeEl.focus();
    if (_savedRange) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(_savedRange);
    }
    document.execCommand(command, false);
};

const EditableContent = ({ content, side, cardStyle, onChange, cardKey }) => {
    const ref                       = useRef(null);
    const [charCount, setCharCount] = useState(0);

    useEffect(() => {
        if (ref.current) {
            ref.current.innerHTML = content || '';
            setCharCount(ref.current.innerText.replace(/\n$/, '').length);
        }
    }, [cardKey]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleKeyDown = (e) => {
        const len = ref.current?.innerText.replace(/\n$/, '').length ?? 0;
        const isControl = e.ctrlKey || e.metaKey || e.altKey ||
            ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab'].includes(e.key);
        if (len >= MAX_CHARS && !isControl && e.key.length === 1) {
            e.preventDefault();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted  = e.clipboardData.getData('text/plain');
        const current = ref.current?.innerText.replace(/\n$/, '') ?? '';
        const allowed = pasted.slice(0, MAX_CHARS - current.length);
        if (allowed) document.execCommand('insertText', false, allowed);
    };

    const handleInput = (e) => {
        storeSelection(e.currentTarget);
        const len = e.currentTarget.innerText.replace(/\n$/, '').length;
        setCharCount(len);
        onChange?.(side, e.currentTarget.innerHTML);
    };

    const handleSelect = (e) => storeSelection(e.currentTarget);

    return (
        <div className="w-full flex flex-col items-center gap-1">
            <div
                ref={ref}
                contentEditable
                suppressContentEditableWarning
                onKeyDown={handleKeyDown}
                onKeyUp={e  => storeSelection(e.currentTarget)}
                onMouseUp={e => storeSelection(e.currentTarget)}
                onSelect={handleSelect}
                onPaste={handlePaste}
                onInput={handleInput}
                className="w-full text-center outline-none focus:ring-0 empty:before:content-[attr(data-placeholder)] empty:before:opacity-40"
                style={{ ...cardStyle, background: 'transparent', wordBreak: 'break-word' }}
                data-placeholder={side === 'front' ? 'Write the question…' : 'Write the answer…'}
            />
            <span style={{ fontSize: '10px', opacity: 0.35, color: cardStyle.color }}>
                {charCount} / {MAX_CHARS}
            </span>
        </div>
    );
};

/**
 * One face of the card (front or back).
 * Defined outside FlashcardCard so React never sees a new component type
 * on re-render → no unmount → no cursor loss.
 */
const Face = ({
    side, content, cardStyle, textColor, tpl,
    editMode, onChange, cardIndex, totalCards, cardKey,
}) => {
    const Decoration = tpl.Decoration;
    return (
        <div
            className="absolute inset-0 flex flex-col rounded-2xl overflow-hidden shadow-2xl"
            style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: side === 'back' ? 'rotateY(180deg)' : 'rotateY(0deg)',
                ...cardStyle,
            }}
        >
            <Decoration />

            {/* face label */}
            <div className="absolute top-3 left-4 z-10">
                <span
                    className="text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(0,0,0,0.08)', color: textColor || tpl.defaultText }}
                >
                    {side === 'front' ? 'Front' : 'Back'}
                </span>
            </div>

            {/* card counter */}
            {side === 'front' && (
                <div className="absolute top-3 right-4 z-10 text-[10px] opacity-50 font-medium">
                    {cardIndex + 1} / {totalCards}
                </div>
            )}

            {/* content area */}
            <div className="flex-1 flex items-center justify-center p-4 md:p-8 pt-8 md:pt-10 relative z-10 overflow-hidden">
                {editMode ? (
                    <EditableContent
                        content={content}
                        side={side}
                        cardStyle={cardStyle}
                        onChange={onChange}
                        cardKey={cardKey}
                    />
                ) : (
                    <div
                        className="text-center overflow-hidden w-full"
                        style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 6,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                        dangerouslySetInnerHTML={{
                            __html: content ||
                                `<span style="opacity:0.35">${side === 'front' ? 'Front side' : 'Back side'}</span>`,
                        }}
                    />
                )}
            </div>

            {/* flip hint */}
            {!editMode && (
                <div className="absolute bottom-3 inset-x-0 flex justify-center z-10">
                    <span className="text-[10px] opacity-40 tracking-wide">
                        {side === 'front' ? 'tap to flip →' : '← tap to flip back'}
                    </span>
                </div>
            )}
        </div>
    );
};

/**
 * Single flashcard with:
 *  - CSS 3D flip (front → back on click / tap)
 *  - Drag/swipe left-right to navigate between cards
 *  - Inline editing when editMode is true (cursor-safe)
 */
export const FlashcardCard = ({
    card,
    template = 'girlies',
    bgColor,
    textColor,
    fontFamily,
    fontSize,
    boldSides  = { front: true,  back: true  },
    italicSides = { front: false, back: false },
    editMode = false,
    editSide = 'front',
    onChange,
    onSwipeLeft,
    onSwipeRight,
    cardIndex,
    totalCards,
}) => {
    const [flipped, setFlipped] = useState(false);
    const dragRef               = useRef({ startX: 0, dragging: false });
    const tpl                   = TEMPLATES[template] ?? TEMPLATES.girlies;
    const fontStyle             = getFontStyle(fontFamily);

    const baseStyle = {
        backgroundColor: bgColor || tpl.defaultBg,
        color: textColor || tpl.defaultText,
        ...fontStyle,
        fontSize: fontSize ? `${fontSize}px` : '18px',
    };

    const frontCardStyle = { ...baseStyle, fontWeight: boldSides.front ? '700' : '400', fontStyle: italicSides.front ? 'italic' : 'normal' };
    const backCardStyle  = { ...baseStyle, fontWeight: boldSides.back  ? '700' : '400', fontStyle: italicSides.back  ? 'italic' : 'normal' };

    // In edit mode the flip is driven by the parent's editSide toggle
    const isFlipped = editMode ? editSide === 'back' : flipped;

    // ── swipe / drag ──────────────────────────────────────────────────────────
    const onPointerDown = (e) => {
        dragRef.current = { startX: e.clientX, dragging: true };
    };
    const onPointerUp = (e) => {
        if (!dragRef.current.dragging) return;
        dragRef.current.dragging = false;
        const delta = e.clientX - dragRef.current.startX;
        if (Math.abs(delta) < 40) return;
        if (delta < 0) onSwipeLeft?.();
        else            onSwipeRight?.();
    };

    const handleFlip = (e) => {
        if (editMode) return;
        const delta = Math.abs(e.clientX - dragRef.current.startX);
        if (delta > 20) return;
        setFlipped(f => !f);
    };

    // Reset flip when navigating to a different card
    const prevIndex = useRef(cardIndex);
    if (prevIndex.current !== cardIndex) {
        prevIndex.current = cardIndex;
        if (flipped) setFlipped(false);
    }

    return (
        <div
            className="relative select-none cursor-pointer w-full h-[220px] md:h-[280px]"
            style={{ perspective: '1200px' }}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onClick={handleFlip}
        >
            {/* flip container */}
            <div
                className="relative w-full h-full"
                style={{
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.5s cubic-bezier(0.4, 0.2, 0.2, 1)',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
            >
                <Face
                    side="front"
                    content={card?.front}
                    cardStyle={frontCardStyle}
                    textColor={textColor}
                    tpl={tpl}
                    editMode={editMode}
                    onChange={onChange}
                    cardIndex={cardIndex}
                    totalCards={totalCards}
                    cardKey={cardIndex}
                />
                <Face
                    side="back"
                    content={card?.back}
                    cardStyle={backCardStyle}
                    textColor={textColor}
                    tpl={tpl}
                    editMode={editMode}
                    onChange={onChange}
                    cardIndex={cardIndex}
                    totalCards={totalCards}
                    cardKey={cardIndex}
                />
            </div>
        </div>
    );
};
