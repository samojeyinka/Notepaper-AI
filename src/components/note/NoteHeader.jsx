import React, { useState } from "react";

export const NoteHeader = ({ 
    title, 
    onTitleChange, 
    isSaved,
    onExportPDF,
    onExportImage,
    onCopy,
    onShare 
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const MenuButton = ({ icon, label, onClick }) => (
        <button 
            onClick={() => {
                onClick();
                setIsMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-all"
        >
            <span className="material-icons-round text-[18px] text-slate-400">{icon}</span>
            {label}
        </button>
    );

    return (
        <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                <input
                    className="bg-transparent border-none text-xl font-display font-semibold focus:ring-0 w-64 md:w-96 text-slate-900"
                    type="text"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="Untitled Note"
                />
                <span className={`px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-lg uppercase tracking-wider font-bold transition-opacity duration-300 ${isSaved ? 'opacity-100' : 'opacity-0'}`}>
                    Saved
                </span>
            </div>
            <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-100 rounded-full p-1 mr-4 relative">
                    <button className="p-2 hover:bg-white rounded-full text-slate-600 transition-all">
                        <span className="material-icons-round">grid_view</span>
                    </button>
                    <button className="p-2 bg-white shadow-sm rounded-full text-primary transition-all">
                        <span className="material-icons-round">notes</span>
                    </button>
                    
                    <div className="relative">
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`p-2 hover:bg-white rounded-full text-slate-600 transition-all ${isMenuOpen ? 'bg-white shadow-sm' : ''}`}
                        >
                            <span className="material-icons-round">more_vert</span>
                        </button>
                        
                        {isMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-20 pointer-events-auto" onClick={() => setIsMenuOpen(false)} />
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-30 animate-in fade-in zoom-in-95 duration-150">
                                    <MenuButton icon="share" label="Share Note" onClick={onShare} />
                                    <MenuButton icon="content_copy" label="Make a Copy" onClick={onCopy} />
                                    <div className="h-px bg-slate-100 my-2" />
                                    <MenuButton icon="picture_as_pdf" label="Export as PDF" onClick={onExportPDF} />
                                    <MenuButton icon="image" label="Export as Image" onClick={onExportImage} />
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <button className="flex items-center gap-2 bg-accent-green text-white px-5 py-2.5 rounded-full font-semibold shadow-lg shadow-accent-green/20 hover:scale-105 active:scale-95 transition-all">
                    <span className="material-icons-round">mic</span>
                    <span className="hidden sm:inline">Voice Record</span>
                </button>
                <button className="bg-primary text-white px-6 py-2.5 rounded-full font-semibold shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
                    Upgrade Pro
                </button>
            </div>
        </header>
    );
};
