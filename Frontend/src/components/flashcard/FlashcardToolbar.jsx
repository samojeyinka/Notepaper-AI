import { TEMPLATES, FONT_OPTIONS } from './flashcardTemplates';

// ── Colour picker ─────────────────────────────────────────────────────────────
const ColorPicker = ({ label, value, onChange }) => (
    <label className="flex items-center gap-1.5 px-2 py-1.5 border border-stone-200 hover:border-stone-300 cursor-pointer shrink-0 transition-colors" title={label}>
        <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wide">{label}</span>
        <div className="relative w-4 h-4 md:w-5 md:h-5">
            <div className="w-4 h-4 md:w-5 md:h-5 rounded-full border border-black/10 shadow-sm" style={{ background: value }} />
            <input type="color" value={value} onChange={e => onChange(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
        </div>
    </label>
);

// ── Separator ─────────────────────────────────────────────────────────────────
const Sep = () => <div className="w-px h-5 bg-stone-200 shrink-0 mx-0.5" />;

// ── Toolbar ───────────────────────────────────────────────────────────────────
export const FlashcardToolbar = ({
    template,   onTemplate,
    bgColor,    onBgColor,
    textColor,  onTextColor,
    fontFamily, onFontFamily,
    fontSize,   onFontSize,
    isBold,     onBold,
    isItalic,   onItalic,
}) => {
    const MIN_SIZE = 12;
    const MAX_SIZE = 40;

    return (
        <div className="border-b border-stone-200 bg-paper">

            {/* ── Row 1: Templates + Colors ── */}
            <div className="flex items-center gap-1 md:gap-1.5 px-2 md:px-4 py-1.5 border-b border-stone-200 overflow-x-auto scrollbar-none">

                {/* Templates */}
                <div className="flex items-center gap-1 shrink-0">
                    {Object.entries(TEMPLATES).map(([key, tpl]) => (
                        <button
                            key={key}
                            onClick={() => onTemplate(key)}
                            title={tpl.label}
                            className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 transition-all hover:scale-110 shrink-0 ${
                                template === key ? 'border-plum-600 scale-110' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: tpl.preview }}
                        />
                    ))}
                </div>

                <Sep />

                {/* Colour pickers */}
                <ColorPicker label="BG"   value={bgColor}   onChange={onBgColor}   />
                <ColorPicker label="Text" value={textColor} onChange={onTextColor} />
            </div>

            {/* ── Row 2: Font + Size + B/I ── */}
            <div className="flex items-center gap-1 md:gap-1.5 px-2 md:px-4 py-1 md:py-1.5 overflow-x-auto scrollbar-none">

                {/* Font family */}
                <select
                    value={fontFamily}
                    onChange={e => onFontFamily(e.target.value)}
                    className="text-[10px] md:text-xs border border-stone-200 px-1.5 md:px-2 py-1 md:py-1.5 outline-none focus:border-plum-400 bg-white text-stone-700 shrink-0 cursor-pointer"
                >
                    {FONT_OPTIONS.map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                </select>

                {/* Font size stepper */}
                <div className="flex items-center gap-0.5 shrink-0">
                    <button
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => onFontSize(Math.max(MIN_SIZE, fontSize - 2))}
                        className="w-5 h-5 md:w-6 md:h-6 bg-stone-100 text-stone-600 hover:bg-stone-200 flex items-center justify-center text-xs md:text-sm transition-colors"
                    >−</button>
                    <span className="w-7 md:w-8 text-center text-[10px] md:text-xs font-medium text-stone-700 tabular-nums">{fontSize}</span>
                    <button
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => onFontSize(Math.min(MAX_SIZE, fontSize + 2))}
                        className="w-5 h-5 md:w-6 md:h-6 bg-stone-100 text-stone-600 hover:bg-stone-200 flex items-center justify-center text-xs md:text-sm transition-colors"
                    >+</button>
                </div>

                <Sep />

                {/* Bold / Italic */}
                <button
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => onBold(!isBold)}
                    title="Bold (this side only)"
                    className={`w-6 h-6 md:w-7 md:h-7 font-bold text-xs md:text-sm transition-colors ${
                        isBold ? 'bg-plum-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                >B</button>
                <button
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => onItalic(!isItalic)}
                    title="Italic (this side only)"
                    className={`w-6 h-6 md:w-7 md:h-7 italic text-xs md:text-sm transition-colors ${
                        isItalic ? 'bg-plum-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                >I</button>
            </div>

        </div>
    );
};
