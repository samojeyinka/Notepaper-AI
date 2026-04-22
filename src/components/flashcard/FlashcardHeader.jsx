import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const FlashcardHeader = ({
    title,
    onTitleChange,
    saveStatus,
    editMode,
    onToggleEditMode,
    onDuplicate,
    onDelete,
    folder,
    urlFolderId,
}) => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const resolvedFolderId = folder?.id ?? urlFolderId ?? null;
    const backPath  = resolvedFolderId ? `/lockedin/folders/${resolvedFolderId}` : '/lockedin/library?tab=flashcards';
    const backLabel = folder?.name ?? 'Library';

    const statusLabel = saveStatus === 'saving'  ? 'Saving…'
                      : saveStatus === 'saved'   ? 'Saved'
                      : saveStatus === 'error'   ? 'Error saving'
                      : '';

    return (
        <header className="flex items-center justify-between mt-2 md:mt-0 px-2 md:px-4 py-2 md:py-3 border-b border-slate-100 bg-white z-20 relative">
            {/* Back */}
            <button
                onClick={() => navigate(backPath)}
                className="flex items-center gap-1 text-slate-400 hover:text-slate-700 transition-colors"
            >
                <span className="material-icons-round text-[16px] md:text-[20px]">arrow_back</span>
                <span className="text-[11px] md:text-sm hidden sm:inline truncate max-w-[80px] md:max-w-[120px]">{backLabel}</span>
            </button>

            {/* Title */}
            <input
                value={title}
                onChange={e => onTitleChange(e.target.value)}
                className="flex-1 mx-2 md:mx-4 text-center font-semibold text-slate-800 text-[12px] md:text-[15px] bg-transparent outline-none border-b border-transparent focus:border-slate-300 transition-colors truncate"
                placeholder="Untitled Flashcard"
            />

            {/* Right actions */}
            <div className="flex items-center gap-1 md:gap-2">
                {statusLabel && (
                    <span className={`text-[10px] md:text-[11px] hidden sm:block ${saveStatus === 'error' ? 'text-red-400' : 'text-slate-400'}`}>
                        {statusLabel}
                    </span>
                )}

                <button
                    onClick={onToggleEditMode}
                    className={`flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-semibold transition-all ${
                        editMode
                            ? 'bg-primary text-white shadow-sm shadow-primary/30'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                    <span className="material-icons-round text-[13px] md:text-[15px]">
                        {editMode ? 'visibility' : 'edit'}
                    </span>
                    {editMode ? 'View' : 'Edit'}
                </button>

                {/* overflow menu */}
                <div className="relative">
                    <button
                        onClick={() => setMenuOpen(v => !v)}
                        className="w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
                    >
                        <span className="material-icons-round text-[16px] md:text-[20px]">more_vert</span>
                    </button>

                    {menuOpen && (
                        <div
                            className="absolute right-0 top-10 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 w-44 z-50 animate-in fade-in zoom-in-95 duration-100"
                            onMouseLeave={() => setMenuOpen(false)}
                        >
                            <button
                                onClick={() => { setMenuOpen(false); onDuplicate?.(); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                <span className="material-icons-round text-[17px] text-slate-400">content_copy</span>
                                Duplicate
                            </button>
                            <div className="h-px bg-slate-100 my-1" />
                            <button
                                onClick={() => { setMenuOpen(false); onDelete?.(); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <span className="material-icons-round text-[17px]">delete_outline</span>
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
