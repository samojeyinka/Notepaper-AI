import React, { useState } from "react";
import { Link } from "react-router-dom";

const STATUS_CONFIG = {
    loading: { label: 'Loading...', icon: 'hourglass_top',  cls: 'bg-slate-100 text-slate-400' },
    saving:  { label: 'Saving...',  icon: 'sync',           cls: 'bg-amber-50  text-amber-500 animate-spin-slow' },
    saved:   { label: 'Saved',      icon: 'cloud_done',     cls: 'bg-green-50  text-green-600' },
    error:   { label: 'Unsaved',    icon: 'cloud_off',      cls: 'bg-red-50    text-red-500' },
    idle:    { label: '',           icon: '',               cls: '' },
};

export const NoteHeader = ({
    title,
    onTitleChange,
    saveStatus = 'idle',
    onSave,
    onExportPDF,
    onExportImage,
    onCopy,
    onShare,
    onToggleAI,
    isAIOpen,
    onToggleHistory,
    isHistoryOpen,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    folderId,
}) => {
    const status = STATUS_CONFIG[saveStatus] ?? STATUS_CONFIG.idle;
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
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
            {/* Back to folder — shown whenever note belongs to a folder */}
            {folderId && (
                <div className="px-6 pt-2">
                    <Link
                        to={`/lockedin/folders/${folderId}`}
                        className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-primary transition-colors"
                    >
                        <span className="material-icons-round text-[14px]">arrow_back</span>
                        Back to folder
                    </Link>
                </div>
            )}
            <div className="h-14 flex items-center justify-between px-8">
                {/* Left side */}
                <div className="flex items-center gap-4">
                    <input
                        className={`bg-transparent border-none text-[17px] font-display font-semibold focus:ring-0 w-64 md:w-96 text-slate-900 transition-opacity ${saveStatus === 'loading' ? 'opacity-40 cursor-wait pointer-events-none' : ''}`}
                        type="text"
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
                        placeholder="Untitled Note"
                        readOnly={saveStatus === 'loading'}
                    />
                    {status.label && (
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium uppercase tracking-wider transition-all duration-300 ${status.cls}`}>
                            <span className={`material-icons-round text-[14px] ${saveStatus === 'saving' ? 'animate-spin' : ''}`}>{status.icon}</span>
                            {status.label}
                        </span>
                    )}
                    <button
                        onClick={onSave}
                        disabled={saveStatus === 'saving'}
                        title="Save now (Ctrl+S)"
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-normal transition-all duration-200
                            ${saveStatus === 'saving'
                                ? 'bg-amber-50 text-amber-400 cursor-wait'
                                : 'bg-primary/10 text-primary hover:bg-primary hover:text-white active:scale-95'
                            }`}
                    >
                        <span className="material-icons-round text-[14px]">save</span>
                        Save
                    </button>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={onUndo}
                            disabled={!canUndo}
                            title="Undo (Ctrl+Z)"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90"
                        >
                            <span className="material-icons-round text-[17px]">undo</span>
                        </button>
                        <button
                            onClick={onRedo}
                            disabled={!canRedo}
                            title="Redo (Ctrl+Y)"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90"
                        >
                            <span className="material-icons-round text-[17px]">redo</span>
                        </button>
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-100 rounded-full p-1 mr-4 relative">
                        <button
                            onClick={onToggleHistory}
                            title="Version history"
                            className={`p-1 rounded-full transition-all duration-200 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95
                                ${isHistoryOpen
                                    ? 'bg-primary text-white shadow-md shadow-primary/40'
                                    : 'text-slate-400 hover:bg-white hover:text-primary hover:shadow-lg'}`}
                        >
                            <span className="material-icons-round text-[17px]">history</span>
                        </button>
                        <button
                            onClick={onToggleAI}
                            className={`p-1 rounded-full transition-all duration-500 relative flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95
                                ${isAIOpen
                                    ? 'bg-primary text-white shadow-xl shadow-primary/40'
                                    : 'text-slate-400 hover:bg-white hover:text-primary hover:shadow-lg animate-glow'}`}
                        >
                            <span className="material-icons-round text-[17px]">auto_awesome</span>
                            {!isAIOpen && (
                                <span className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping opacity-30 pointer-events-none" />
                            )}
                        </button>
                        <style>{`
                            @keyframes glow {
                                0% { box-shadow: 0 0 0 0 rgba(167, 139, 250, 0); }
                                50% { box-shadow: 0 0 15px 2px rgba(167, 139, 250, 0.3); }
                                100% { box-shadow: 0 0 0 0 rgba(167, 139, 250, 0); }
                            }
                            .animate-glow { animation: glow 2.5s infinite ease-in-out; }
                        `}</style>
                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className={`p-1 hover:bg-white rounded-full text-slate-600 transition-all ${isMenuOpen ? 'bg-white shadow-sm' : ''}`}
                            >
                                <span className="material-icons-round text-[17px]">more_vert</span>
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
                    <button className="flex items-center gap-1 bg-accent-green text-[13px] text-white px-1.5 py-1.5 rounded-full font-medium shadow-lg shadow-accent-green/20 hover:scale-105 active:scale-95 transition-all">
                        <span className="material-icons-round text-[17px]">mic</span>
                        <span className="hidden text-[13px]">Voice Record</span>
                    </button>
                </div>
            </div>
        </header>
    );
};
