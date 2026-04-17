import { TEMPLATES, FONT_OPTIONS } from './flashcardTemplates';

// ── Colour picker ─────────────────────────────────────────────────────────────
const ColorPicker = ({ label, value, onChange }) => (
    <label className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 cursor-pointer shrink-0 transition-colors" title={label}>
        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{label}</span>
        <div className="relative w-5 h-5">
            <div className="w-5 h-5 rounded-full border border-black/10 shadow-sm" style={{ background: value }} />
            <input type="color" value={value} onChange={e => onChange(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
        </div>
    </label>
);

// ── Separator ─────────────────────────────────────────────────────────────────
const Sep = () => <div className="w-px h-5 bg-slate-200 shrink-0 mx-0.5" />;

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
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 bg-white overflow-x-auto scrollbar-none">

            {/* Templates */}
            <div className="flex items-center gap-1 shrink-0">
                {Object.entries(TEMPLATES).map(([key, tpl]) => (
                    <button
                        key={key}
                        onClick={() => onTemplate(key)}
                        title={tpl.label}
                        className={`w-5 h-5 rounded-full border-2 transition-all hover:scale-110 ${
                            template === key ? 'border-primary scale-110 shadow-md' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: tpl.preview }}
                    />
                ))}
            </div>

            <Sep />

            {/* Colour pickers */}
            <ColorPicker label="BG"   value={bgColor}   onChange={onBgColor}   />
            <ColorPicker label="Text" value={textColor} onChange={onTextColor} />

            <Sep />

            {/* Font family */}
            <select
                value={fontFamily}
                onChange={e => onFontFamily(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-primary bg-white text-slate-700 shrink-0 cursor-pointer"
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
                    className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center text-sm transition-colors"
                >−</button>
                <span className="w-8 text-center text-xs font-medium text-slate-700 tabular-nums">{fontSize}</span>
                <button
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => onFontSize(Math.min(MAX_SIZE, fontSize + 2))}
                    className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center text-sm transition-colors"
                >+</button>
            </div>

            <Sep />

            {/* Bold / Italic */}
            <button
                onMouseDown={e => e.preventDefault()}
                onClick={() => onBold(!isBold)}
                title="Bold"
                className={`w-7 h-7 rounded-lg font-bold text-sm transition-all ${
                    isBold ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >B</button>
            <button
                onMouseDown={e => e.preventDefault()}
                onClick={() => onItalic(!isItalic)}
                title="Italic"
                className={`w-7 h-7 rounded-lg italic text-sm transition-all ${
                    isItalic ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >I</button>


        </div>
    );
};
