import { useState } from 'react';

// Header Component
export const SettingsHeader = () => {
    const handleSaveChanges = () => {
        console.log('Settings saved');
    };

    return (
        <header className="flex md:items-center justify-between flex-col md:flex-row gap-2 md:gap-0">
            <div>
                <h1 className="text-xl font-semibold tracking-tight">Application Settings</h1>
                <p className="text-slate-500 mt-1 text-[14px]">Customize your AI-powered creative space</p>
            </div>
          
        </header>
    );
};

// Handwriting Style Card Component - Reusable
export const HandwritingStyleCard = ({ name, fontClass, fontLabel, isSelected, isPremium, onClick }) => {
    const handleClick = () => {
        if (isPremium) {
            console.log('Premium feature - Upgrade to unlock:', name);
            alert(`🔒 Premium Feature: ${name} style is available with Pro upgrade!`);
        } else {
            onClick();
        }
    };

    return (
        <label className="relative cursor-pointer group flex-shrink-0 w-32">
            <input
                type="radio"
                name="font"
                className="peer sr-only"
                checked={isSelected}
                onChange={handleClick}
                disabled={isPremium}
            />
            <div
                onClick={handleClick}
                className={`p-3 border-2 rounded-xl transition-all bg-slate-50 group-hover:bg-white ${isSelected
                        ? 'border-primary shadow-lg shadow-primary/20'
                        : 'border-slate-100 hover:border-slate-200'
                    } ${isPremium ? 'opacity-75' : ''}`}
            >
                <p className={`${fontClass} text-[15px] text-center pt-2 text-slate-700`}>{name}</p>
                <p className="text-[10px] text-center text-slate-400 mt-4 uppercase tracking-widest font-bnormalld">
                    {fontLabel}
                </p>
            </div>
            <div className={`absolute top-2 right-2 transition-all ${isSelected ? 'opacity-100' : 'opacity-0'} text-primary`}>
                <span className="material-icons-round text-lg">check_circle</span>
            </div>
            {isPremium && (
                <div className="absolute top-1 -right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold shadow-md flex items-center gap-0.5">
                    <span className="material-icons-round text-xs">star</span>
                    PRO
                </div>
            )}
        </label>
    );
};

// Handwriting Styles Section with Scrollable Container
export const HandwritingStylesSection = () => {
    const [selectedFont, setSelectedFont] = useState('elegant');

    const styles = [
        { id: 'elegant', name: 'Elegant', fontClass: 'font-handwriting1', fontLabel: 'Dancing Script', isPremium: false },
        { id: 'casual', name: 'Casual', fontClass: 'font-handwriting2', fontLabel: 'Caveat', isPremium: false },
        { id: 'playful', name: 'Playful', fontClass: 'font-handwriting3', fontLabel: 'Shadows Light', isPremium: false },
        { id: 'modern', name: 'Modern', fontClass: 'font-display', fontLabel: 'Plus Jakarta', isPremium: true },
        { id: 'artistic', name: 'Artistic', fontClass: 'font-handwriting1', fontLabel: 'Brush Script', isPremium: true },
        { id: 'minimalist', name: 'Minimalist', fontClass: 'font-display', fontLabel: 'Clean Sans', isPremium: true },
        { id: 'vintage', name: 'Vintage', fontClass: 'font-handwriting2', fontLabel: 'Retro Style', isPremium: true },
        { id: 'script', name: 'Script', fontClass: 'font-handwriting3', fontLabel: 'Cursive Flow', isPremium: true },
    ];

    return (
        <section className="bg-white p-4 rounded-large shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-7 h-7 bg-orange-100 text-orange-500 rounded-xl flex items-center justify-center">
                    <span className="material-icons-round">draw</span>
                </div>
                <h2 className="text-[17px] font-medium">Handwriting Styles</h2>
            </div>

            {/* Scrollable container with custom scrollbar */}
            <div className="overflow-x-auto pb-4 scroll-smooth custom-scrollbar">
                <div className="flex gap-4 min-w-min">
                    {styles.map((style) => (
                        <HandwritingStyleCard
                            key={style.id}
                            name={style.name}
                            fontClass={style.fontClass}
                            fontLabel={style.fontLabel}
                            isSelected={selectedFont === style.id}
                            isPremium={style.isPremium}
                            onClick={() => setSelectedFont(style.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Pen Thickness Slider */}
            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">Pen Thickness</p>
                        <p className="text-xs text-slate-400">Adjust the stroke width of your digital ink</p>
                    </div>
                    <span className="text-primary font-semibold text-[18px]">1.5px</span>
                </div>
                <input
                    type="range"
                    min="0.5"
                    max="5"
                    step="0.5"
                    defaultValue="1.5"
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                />
            </div>
        </section>
    );
};

// Paper Preferences Section with Color Pickers
export const PaperPreferencesSection = () => {
    const [selectedPaper, setSelectedPaper] = useState('plain');
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [lineColor, setLineColor] = useState('#cbd5e1');

    const papers = [
        { id: 'plain', name: 'Plain', pattern: '' },
        { id: 'lined', name: 'Lined', pattern: 'paper-lined' },
        { id: 'grid', name: 'Grid', pattern: 'paper-grid' },
        { id: 'cream', name: 'Cream', pattern: '', bgColor: '#fef3c7' },
    ];

    const bgPresets = [
        { color: '#ffffff', label: 'White' },
        { color: '#fef3c7', label: 'Cream' },
        { color: '#f0fdf4', label: 'Mint' },
        { color: '#fef2f2', label: 'Rose' },
        { color: '#f0f9ff', label: 'Sky' },
    ];

    const linePresets = [
        { color: '#cbd5e1', label: 'Gray' },
        { color: '#e0e7ff', label: 'Purple' },
        { color: '#dbeafe', label: 'Blue' },
        { color: '#fca5a5', label: 'Red' },
        { color: '#86efac', label: 'Green' },
    ];

    return (
        <section className="bg-white p-4 rounded-large shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-7 h-7 bg-green-100 text-green-500 rounded-xl flex items-center justify-center">
                    <span className="material-icons-round">article</span>
                </div>
                <h2 className="text-xl font-semibold">Paper Preferences</h2>
            </div>

            {/* Paper Pattern Selection */}
            <div className="mb-4">
                <p className="font-medium mb-2 text-slate-700">Paper Pattern</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {papers.map((paper) => (
                        <label key={paper.id} className="relative cursor-pointer group">
                            <input
                                type="radio"
                                name="paper"
                                className="peer sr-only"
                                checked={selectedPaper === paper.id}
                                onChange={() => setSelectedPaper(paper.id)}
                            />
                            <div
                                className={`aspect-square border-2 rounded-xl transition-all flex flex-col items-center justify-center gap-2 ${selectedPaper === paper.id
                                        ? 'border-primary shadow-lg shadow-primary/20 bg-white'
                                        : 'border-slate-100 bg-slate-50 group-hover:bg-white'
                                    } ${paper.pattern}`}
                                style={{ backgroundColor: paper.bgColor || (selectedPaper === paper.id ? '#ffffff' : '#f3f4f6') }}
                            >
                                <div
                                    className={`w-7 h-7 bg-white shadow-sm rounded-sm ${paper.pattern}`}
                                    style={{ backgroundColor: paper.bgColor ? 'rgba(255,255,255,0.5)' : '#ffffff' }}
                                ></div>
                                <span className="text-xs font-semibold text-slate-600">{paper.name}</span>
                            </div>
                            <div
                                className={`absolute top-2 right-2 transition-all ${selectedPaper === paper.id ? 'opacity-100' : 'opacity-0'
                                    } text-primary`}
                            >
                                <span className="material-icons-round text-lg">check_circle</span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Color Selection - Background & Lines */}
            
            <div className="space-y-4 border-t border-slate-100 pt-4">
                {/* Background Color */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-icons-round text-orange-500">palette</span>
                        <p className="font-semibold text-slate-700">Paper Background Color</p>
                    </div>
                    <div className="space-y-4">
                        <div className="flex gap-3 flex-wrap">
                            {bgPresets.map((preset) => (
                                <button
                                    key={preset.color}
                                    onClick={() => setBackgroundColor(preset.color)}
                                    className={`w-12 h-12 rounded-2xl border-2 transition-all shadow-sm hover:shadow-md ${backgroundColor === preset.color ? 'border-primary shadow-primary/30' : 'border-slate-200'
                                        }`}
                                    style={{ backgroundColor: preset.color }}
                                    title={preset.label}
                                />
                            ))}
                            <div className="relative">
                                <input
                                    type="color"
                                    value={backgroundColor}
                                    onChange={(e) => setBackgroundColor(e.target.value)}
                                    className="w-12 h-12 rounded-2xl cursor-pointer border-2 border-slate-200 hover:border-slate-300 transition-all"
                                />
                                <span className="absolute -bottom-1 -right-1 text-xs font-bold bg-white rounded-full w-5 h-5 flex items-center justify-center border border-slate-200">
                                    +
                                </span>
                            </div>
                        </div>
                        <div className="text-xs text-slate-400">Selected: {backgroundColor}</div>
                    </div>
                </div>

                {/* Line Color */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-icons-round text-blue-500">border_color</span>
                        <p className="font-semibold text-slate-700">Line Color</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex gap-3 flex-wrap">
                            {linePresets.map((preset) => (
                                <button
                                    key={preset.color}
                                    onClick={() => setLineColor(preset.color)}
                                    className={`w-7 h-7 rounded-xl border-2 transition-all shadow-sm hover:shadow-md ${lineColor === preset.color ? 'border-primary shadow-primary/30 ring-2 ring-primary/20' : 'border-slate-200'
                                        }`}
                                    style={{ backgroundColor: preset.color }}
                                    title={preset.label}
                                />
                            ))}
                            <div className="relative">
                                <input
                                    type="color"
                                    value={lineColor}
                                    onChange={(e) => setLineColor(e.target.value)}
                                    className="w-7 h-7 rounded-xl cursor-pointer border-2 border-slate-200 hover:border-slate-300 transition-all"
                                />
                                <span className="absolute -bottom-1 -right-1 text-xs font-bold bg-white rounded-full w-5 h-5 flex items-center justify-center border border-slate-200">
                                    +
                                </span>
                            </div>
                        </div>
                        <div className="text-xs text-slate-400">Selected: {lineColor}</div>
                    </div>
                </div>
            </div>

           
        </section>
    );
};



// System & Sync Section
export const SystemSyncSection = () => {
    return (
        <section className="bg-white p-8 rounded-large shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-7 h-7 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <span className="material-icons-round">notifications</span>
                </div>
                <h2 className="text-[17px] font-semibold">System & Sync</h2>
            </div>

            <div className="space-y-2">
                {/* Auto-Cloud Sync */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <span className="material-icons-round text-slate-400">cloud_done</span>
                        <div>
                            <p className="font-medium text-[15px]">Auto-Cloud Sync</p>
                            <p className="text-xs text-slate-400">Keep notes updated across devices</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>

                {/* AI Weekly Insights */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <span className="material-icons-round text-slate-400">smart_toy</span>
                        <div>
                            <p className="font-medium text-[15px]">AI Weekly Insights</p>
                            <p className="text-xs text-slate-400">Receive summaries of your study sessions</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
            </div>
        </section>
    );
};

// Live Preview Component with Dynamic Colors
export const LivePreview = ({ selectedFont, backgroundColor, lineColor }) => {
    const fontClasses = {
        elegant: 'font-handwriting1',
        casual: 'font-handwriting2',
        playful: 'font-handwriting3',
        modern: 'font-display',
        artistic: 'font-handwriting1',
        minimalist: 'font-display',
        vintage: 'font-handwriting2',
        script: 'font-handwriting3',
    };

    return (
        <div className="sticky top-10">
            <div className="bg-white p-3 rounded-large shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-slate-400 uppercase tracking-widest text-xs">Live Preview</h3>
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                </div>

                <div
                    className="relative aspect-[3/3] rounded-xl shadow-inner border-4 border-slate-200 overflow-hidden"
                    style={{ backgroundColor, backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 27px, ${lineColor} 27px, ${lineColor} 28px)` }}
                >
                    <div className="relative p-4 h-full">
                        <div className="space-y-3">
                            <p
                                className={`${fontClasses[selectedFont]} text-xl leading-relaxed border-b pb-1 font-bold`}
                                style={{ borderColor: lineColor, color: '#1e293b' }}
                            >
                                Weekly Planning
                            </p>
                            <div className="space-y-1.5">
                                <p className={`${fontClasses[selectedFont]} text-[16px]`} style={{ color: '#475569' }}>
                                    1. Buy more oil paints and canvas
                                </p>
                                <p className={`${fontClasses[selectedFont]} text-[16px]`} style={{ color: '#475569' }}>
                                    2. Review dashboard concept
                                </p>
                                <p className={`${fontClasses[selectedFont]} text-[16px]`} style={{ color: '#475569' }}>
                                    3. Coffee at 3pm to discuss launch
                                </p>
                            </div>
                            <div className="pt-6 opacity-60">
                                <p className={`${fontClasses[selectedFont]} text-[13px] italic`} style={{ color: '#64748b' }}>
                                    "The only way to do great work is to love what you do."
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="mt-6 p-4 bg-slate-50 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-500 rounded-xl flex items-center justify-center shrink-0">
                        <span className="material-icons-round">lightbulb</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Pro tip: Using <span className="font-bold text-slate-700">Lined Paper</span>
                        <span className="font-bold text-slate-700"> </span>significantly helps human readers by improving the physical structure and neatness of handwriting.
                    </p>
                </div>
            </div>
        </div>
    );
};



// Main Settings Page
export const ApplicationSettings = () => {
    const [selectedFont, setSelectedFont] = useState('elegant');
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [lineColor, setLineColor] = useState('#cbd5e1');

    return (
        <main className="flex-1 lg:ml-64 p-3 lg:p-8 pt-20 lg:pt-8 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
            <SettingsHeader />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="xl:col-span-7 space-y-8">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-8 mt-8">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                        <p className="text-sm font-medium">Dark Mode Paper</p>
                        <p className="text-xs text-slate-400">Match canvas to theme</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                        <p className="text-sm font-medium">Auto-Correction</p>
                        <p className="text-xs text-slate-400">Straighten lines automatically</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
            </div>
                    <SystemSyncSection />
                </div>

              
            </div>


        </main>
    );
};

