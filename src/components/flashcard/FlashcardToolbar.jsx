import { TEMPLATES, FONT_OPTIONS, FONT_SIZE_OPTIONS } from './flashcardTemplates';

const PRESET_COLORS = [
    '#ffffff', '#fff0f6', '#f0fdf4', '#eff6ff', '#fdf4ff',
    '#fffbeb', '#0f172a', '#1c1917', '#fce7f3', '#ecfdf5',
];

export const FlashcardToolbar = ({
    template, onTemplate,
    bgColor,   onBgColor,
    textColor, onTextColor,
    fontFamily, onFontFamily,
    fontSize,   onFontSize,
    isBold,    onBold,
    isItalic,  onItalic,
}) => (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-100 bg-white overflow-x-auto scrollbar-none flex-wrap">

        {/* Template picker */}
        <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Template</span>
            <div className="flex gap-1">
                {Object.entries(TEMPLATES).map(([key, tpl]) => (
                    <button
                        key={key}
                        onClick={() => onTemplate(key)}
                        title={tpl.label}
                        className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                            template === key ? 'border-primary scale-110 shadow-md' : 'border-slate-200'
                        }`}
                        style={{ backgroundColor: tpl.preview }}
                    />
                ))}
            </div>
        </div>

        <div className="w-px h-6 bg-slate-200 shrink-0" />

        {/* Background color */}
        <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">BG</span>
            <div className="flex gap-1">
                {PRESET_COLORS.map(c => (
                    <button
                        key={c}
                        onClick={() => onBgColor(c)}
                        title={c}
                        className={`w-5 h-5 rounded-full border transition-all hover:scale-110 ${
                            bgColor === c ? 'border-primary scale-110' : 'border-slate-200'
                        }`}
                        style={{ backgroundColor: c }}
                    />
                ))}
                <label title="Custom colour" className="w-5 h-5 rounded-full border border-slate-200 overflow-hidden cursor-pointer hover:scale-110 transition-all">
                    <input type="color" value={bgColor} onChange={e => onBgColor(e.target.value)} className="opacity-0 w-0 h-0 absolute"/>
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-400 via-yellow-300 to-sky-400">
                        <span className="material-icons-round text-white text-[10px]">colorize</span>
                    </div>
                </label>
            </div>
        </div>

        <div className="w-px h-6 bg-slate-200 shrink-0" />

        {/* Text color */}
        <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Text</span>
            <div className="flex gap-1">
                {['#1e293b','#ffffff','#e879a0','#166534','#1d4ed8','#7c2d12','#6d28d9'].map(c => (
                    <button
                        key={c}
                        onClick={() => onTextColor(c)}
                        title={c}
                        className={`w-5 h-5 rounded-full border transition-all hover:scale-110 ${
                            textColor === c ? 'border-primary scale-110' : 'border-slate-200'
                        }`}
                        style={{ backgroundColor: c }}
                    />
                ))}
                <label title="Custom colour" className="w-5 h-5 rounded-full border border-slate-200 overflow-hidden cursor-pointer hover:scale-110 transition-all">
                    <input type="color" value={textColor} onChange={e => onTextColor(e.target.value)} className="opacity-0 w-0 h-0 absolute"/>
                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-400 flex items-center justify-center">
                        <span className="material-icons-round text-white text-[10px]">text_format</span>
                    </div>
                </label>
            </div>
        </div>

        <div className="w-px h-6 bg-slate-200 shrink-0" />

        {/* Font */}
        <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Font</span>
            <select
                value={fontFamily}
                onChange={e => onFontFamily(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-primary bg-white text-slate-700"
            >
                {FONT_OPTIONS.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                ))}
            </select>
        </div>

        {/* Font size */}
        <div className="flex items-center gap-1 shrink-0">
            {FONT_SIZE_OPTIONS.map(s => (
                <button
                    key={s}
                    onClick={() => onFontSize(s)}
                    className={`w-6 h-6 rounded-lg text-[11px] font-medium transition-all ${
                        fontSize === s
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                    {s}
                </button>
            ))}
        </div>

        <div className="w-px h-6 bg-slate-200 shrink-0" />

        {/* Bold / Italic */}
        <div className="flex items-center gap-1 shrink-0">
            <button
                onClick={() => onBold(!isBold)}
                className={`w-7 h-7 rounded-lg font-bold text-sm transition-all ${
                    isBold ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >B</button>
            <button
                onClick={() => onItalic(!isItalic)}
                className={`w-7 h-7 rounded-lg italic text-sm transition-all ${
                    isItalic ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >I</button>
        </div>
    </div>
);
