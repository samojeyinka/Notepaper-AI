import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../globals/Loader';
import NotificationIcon from '../user/NotificationIcon';
import AccountMenu from '../user/AccountMenu';
import { APP_BASENAME } from '../../utils/basename';

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
    flashcardId,
}) => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const resolvedFolderId = folder?.id ?? urlFolderId ?? null;
    const backPath  = resolvedFolderId ? `/lockedin/folders/${resolvedFolderId}` : '/lockedin/library?tab=flashcards';
    const backLabel = folder?.name ?? 'Library';

    return (
        <header className="flex items-center justify-between px-2 md:px-4 py-2 md:py-3 border-b border-stone-200 bg-paper/95 backdrop-blur z-20 relative">
            {/* Back */}
            <button
                onClick={() => navigate(backPath)}
                className="flex items-center gap-1 text-stone-400 hover:text-stone-700 transition-colors"
            >
                <span className="material-icons-round text-[16px] md:text-[20px]">arrow_back</span>
                <span className="text-[11px] md:text-sm hidden sm:inline truncate max-w-[80px] md:max-w-[120px]">{backLabel}</span>
            </button>

            {/* Title */}
            <input
                value={title}
                onChange={e => onTitleChange(e.target.value)}
                className="flex-1 mx-2 md:mx-4 text-center font-display font-semibold text-stone-900 text-[12px] md:text-[15px] bg-transparent outline-none border-b border-transparent focus:border-plum-300 transition-colors truncate placeholder-stone-300"
                placeholder="Untitled Flashcard"
            />

            {/* Right actions */}
            <div className="flex items-center gap-1 md:gap-2">
                {saveStatus === 'saving' && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-plum-50 text-plum-600 text-[9px] md:text-[10px] font-semibold uppercase tracking-wider">
                        <Loader size="xs" />
                    </span>
                )}
                {saveStatus === 'saved' && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 text-[9px] md:text-[10px] font-semibold uppercase tracking-wider">
                        <span className="material-icons-round text-[11px]">cloud_done</span>
                        Saved
                    </span>
                )}
                {saveStatus === 'error' && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-500 text-[9px] md:text-[10px] font-semibold uppercase tracking-wider">
                        <span className="material-icons-round text-[11px]">cloud_off</span>
                        Unsaved
                    </span>
                )}

                <button
                    onClick={onToggleEditMode}
                    className={`flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs font-semibold transition-colors ${
                        editMode
                            ? 'bg-plum-600 text-white hover:bg-plum-700'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                >
                  
                    {editMode ? 'View' : 'Edit'}
                </button>

                {/* AI generate button */}
                <button
                    onClick={() => navigate('/lockedin/generate?tab=flashcards')}
                    className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs font-semibold bg-plum-50 text-plum-700 hover:bg-plum-100 transition-colors"
                    title="Generate flashcards with AI"
                >
                
                    <span className="hidden sm:inline">AI Generate</span>
                </button>

                {/* overflow menu */}
                <div className="relative">
                    <button
                        onClick={() => setMenuOpen(v => !v)}
                        className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
                    >
                        <span className="material-icons-round text-[16px] md:text-[20px]">more_vert</span>
                    </button>

                    {menuOpen && (
                        <div
                            className="absolute right-0 top-10 bg-white shadow-xl border border-stone-200 py-1.5 w-40 md:w-44 z-50 animate-in fade-in zoom-in-95 duration-100"
                            onMouseLeave={() => setMenuOpen(false)}
                        >
                            {flashcardId && (
                                <>
                                    <button
                                        onClick={() => {
                                            setMenuOpen(false);
                                            navigator.clipboard.writeText(`${window.location.origin}${APP_BASENAME}/flashcards/${flashcardId}`).then(() => {
                                                alert('Share link copied to clipboard!');
                                            });
                                        }}
                                        className="w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 text-[12px] md:text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                                    >
                                        <span className="material-icons-round text-[13px] md:text-[17px] text-stone-400">share</span>
                                        Share Link
                                    </button>
                                    <div className="h-px bg-stone-100 my-1" />
                                </>
                            )}
                            <button
                                onClick={() => { setMenuOpen(false); onDuplicate?.(); }}
                                className="w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 text-[12px] md:text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                            >
                                <span className="material-icons-round text-[13px] md:text-[17px] text-stone-400">content_copy</span>
                                Duplicate
                            </button>
                            <div className="h-px bg-stone-100 my-1" />
                            <button
                                onClick={() => { setMenuOpen(false); onDelete?.(); }}
                                className="w-full flex items-center  gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 text-[12px] md:text-sm text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <span className="material-icons-round text-[13px] md:text-[17px]">delete_outline</span>
                                Delete
                            </button>
                        </div>
                    )}
                </div>
                <NotificationIcon />
                <AccountMenu compact />
            </div>
        </header>
    );
};
