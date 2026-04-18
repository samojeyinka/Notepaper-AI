import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { flashcardService } from '../../api/flashcardService';
import { invalidateFlashcardCache } from '../../pages/FlashcardsPage';
import { invalidateFolderCache } from '../../pages/FolderPage';
import { TEMPLATES } from './flashcardTemplates';
import { FlashcardCard } from './FlashcardCard';
import { FlashcardHeader } from './FlashcardHeader';
import { FlashcardToolbar } from './FlashcardToolbar';

const EMPTY_CARD = { front: '', back: '' };

export const Flashcard = ({ id }) => {
    const navigate          = useNavigate();
    const location          = useLocation();
    const [searchParams]    = useSearchParams();
    const isNew             = !id;
    // folder_id from URL when creating a new flashcard from a folder page
    const urlFolderId       = searchParams.get('folder_id');

    // ── Data state ────────────────────────────────────────────────────────────
    const [flashcardId, setFlashcardId] = useState(id ?? null);
    const [title,       setTitle]       = useState('Untitled Flashcard');
    const [cards,       setCards]       = useState([{ ...EMPTY_CARD }]);
    const [template,    setTemplate]    = useState('girlies');
    const [bgColor,     setBgColor]     = useState(TEMPLATES.girlies.defaultBg);
    const [textColor,   setTextColor]   = useState(TEMPLATES.girlies.defaultText);
    const [fontFamily,  setFontFamily]  = useState('sans');
    const [fontSize,    setFontSize]    = useState(18);
    const [isBold,      setIsBold]      = useState(true);
    const [isItalic,    setIsItalic]    = useState(false);
    const [folder,      setFolder]      = useState(null);

    // ── UI state ──────────────────────────────────────────────────────────────
    const [activeIndex, setActiveIndex] = useState(0);
    const [editMode,    setEditMode]    = useState(true);
    const [editSide,    setEditSide]    = useState('front');
    const [saveStatus,  setSaveStatus]  = useState('idle');
    const [loading,     setLoading]     = useState(!isNew);
    const saveTimerRef                  = useRef(null);
    const dirtyRef                      = useRef(false);

    // ── Load existing flashcard ───────────────────────────────────────────────
    useEffect(() => {
        if (isNew) return;
        if (location.state?.skipLoad) return; // data already in memory after first save
        setLoading(true);
        flashcardService.show(id)
            .then(res => {
                const d = res.data;
                setTitle(d.title);
                setCards(d.cards?.length ? d.cards : [{ ...EMPTY_CARD }]);
                setTemplate(d.template ?? 'girlies');
                setBgColor(d.bg_color);
                setTextColor(d.text_color);
                setFontFamily(d.font_family);
                setFontSize(d.font_size);
                setIsBold(d.is_bold);
                setIsItalic(d.is_italic);
                setFolder(d.folder ?? null);
            })
            .finally(() => setLoading(false));
    }, [id, isNew]);

    // ── Auto-save ─────────────────────────────────────────────────────────────
    const save = useCallback(async (payload) => {
        setSaveStatus('saving');
        try {
            if (!flashcardId) {
                const res = await flashcardService.create(payload);
                setFlashcardId(res.data.id);
                navigate(`/lockedin/flashcards/${res.data.id}`, { replace: true, state: { skipLoad: true } });
            } else {
                await flashcardService.update(flashcardId, payload);
            }
            setSaveStatus('saved');
        } catch {
            setSaveStatus('error');
        }
    }, [flashcardId, navigate]);

    const scheduleSave = useCallback(() => {
        dirtyRef.current = true;
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            if (!dirtyRef.current) return;
            dirtyRef.current = false;
            save({ title, cards, template, bg_color: bgColor, text_color: textColor, font_family: fontFamily, font_size: fontSize, is_bold: isBold, is_italic: isItalic, ...(urlFolderId && { folder_id: urlFolderId }) });
        }, 1200);
    }, [title, cards, template, bgColor, textColor, fontFamily, fontSize, isBold, isItalic, save]);

    // Watch every style/content change
    useEffect(() => { if (!loading) scheduleSave(); }, [title, cards, template, bgColor, textColor, fontFamily, fontSize, isBold, isItalic]); // eslint-disable-line

    // ── Template change resets default colours ────────────────────────────────
    const handleTemplateChange = (tplKey) => {
        setTemplate(tplKey);
        const tpl = TEMPLATES[tplKey];
        setBgColor(tpl.defaultBg);
        setTextColor(tpl.defaultText);
    };

    // ── Card CRUD ─────────────────────────────────────────────────────────────
    const updateCard = (index, side, html) => {
        setCards(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [side]: html };
            return next;
        });
    };

    const addCard = () => {
        setCards(prev => [...prev, { ...EMPTY_CARD }]);
        setActiveIndex(cards.length);
        setEditSide('front');
    };

    const removeCard = (index) => {
        if (cards.length <= 1) return;
        setCards(prev => prev.filter((_, i) => i !== index));
        setActiveIndex(i => Math.min(i, cards.length - 2));
    };

    // ── Navigation ────────────────────────────────────────────────────────────
    const goNext = () => { setActiveIndex(i => Math.min(i + 1, cards.length - 1)); setEditSide('front'); };
    const goPrev = () => { setActiveIndex(i => Math.max(i - 1, 0)); setEditSide('front'); };

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!window.confirm('Delete this flashcard deck?')) return;
        if (flashcardId) await flashcardService.delete(flashcardId);
        invalidateFlashcardCache(folder?.id ?? null);
        if (folder?.id) invalidateFolderCache(folder.id);
        navigate(folder?.id ? `/lockedin/folders/${folder.id}` : '/lockedin/flashcards');
    };

    // ── Duplicate ─────────────────────────────────────────────────────────────
    const handleDuplicate = async () => {
        if (!flashcardId) return;
        const res = await flashcardService.duplicate(flashcardId);
        invalidateFlashcardCache(folder?.id ?? null);
        if (folder?.id) invalidateFolderCache(folder.id);
        navigate(`/lockedin/flashcards/${res.data.id}`);
    };

    if (loading) {
        return (
            <div className="flex-1 lg:ml-64 flex items-center justify-center h-screen">
                <span className="material-icons-round text-primary text-[40px] animate-spin">sync</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 h-screen overflow-hidden bg-slate-50 lg:ml-64">
            <FlashcardHeader
                title={title}
                onTitleChange={setTitle}
                saveStatus={saveStatus}
                editMode={editMode}
                onToggleEditMode={() => setEditMode(v => !v)}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
                folder={folder}
                urlFolderId={urlFolderId}
            />

            {editMode && (
                <FlashcardToolbar
                    template={template}   onTemplate={handleTemplateChange}
                    bgColor={bgColor}     onBgColor={setBgColor}
                    textColor={textColor} onTextColor={setTextColor}
                    fontFamily={fontFamily} onFontFamily={setFontFamily}
                    fontSize={fontSize}   onFontSize={setFontSize}
                    isBold={isBold}       onBold={setIsBold}
                    isItalic={isItalic}   onItalic={setIsItalic}
                />
            )}

            {/* Main area */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 overflow-auto">

                {/* Front / Back toggle (edit mode) */}
                {editMode && (
                    <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1 mb-4">
                        {['front', 'back'].map(side => (
                            <button
                                key={side}
                                onClick={() => setEditSide(side)}
                                className={`px-5 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                                    editSide === side
                                        ? 'bg-white text-slate-800 shadow-sm'
                                        : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                {side}
                            </button>
                        ))}
                    </div>
                )}

                {/* Card + side buttons */}
                <div className="relative flex items-center justify-center w-full" style={{ maxWidth: 600 }}>

                    {/* Left side — prev nav (view) / remove card (edit) */}
                    <div className="absolute left-0 flex flex-col items-center gap-2">
                        <div className="relative group">
                            <button
                                onClick={goPrev}
                                disabled={activeIndex === 0}
                                className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-primary hover:text-primary transition-all disabled:opacity-25 disabled:cursor-not-allowed shadow-sm active:scale-95"
                            >
                                <span className="material-icons-round text-[20px]">chevron_left</span>
                            </button>
                            <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                Previous
                            </span>
                        </div>

                        {editMode && cards.length > 1 && (
                            <div className="relative group">
                                <button
                                    onClick={() => removeCard(activeIndex)}
                                    className="w-9 h-9 rounded-full bg-white border border-red-200 flex items-center justify-center text-red-400 hover:bg-red-50 hover:border-red-400 transition-all shadow-sm active:scale-95"
                                >
                                    <span className="material-icons-round text-[18px]">remove</span>
                                </button>
                                <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                    Remove
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Card */}
                    <FlashcardCard
                        card={cards[activeIndex]}
                        template={template}
                        bgColor={bgColor}
                        textColor={textColor}
                        fontFamily={fontFamily}
                        fontSize={fontSize}
                        isBold={isBold}
                        isItalic={isItalic}
                        editMode={editMode}
                        editSide={editSide}
                        onChange={(side, html) => updateCard(activeIndex, side, html)}
                        onSwipeLeft={goNext}
                        onSwipeRight={goPrev}
                        cardIndex={activeIndex}
                        totalCards={cards.length}
                    />

                    {/* Right side — next nav (view) / add card (edit) */}
                    <div className="absolute right-0 flex flex-col items-center gap-2">
                        <div className="relative group">
                            <button
                                onClick={goNext}
                                disabled={activeIndex === cards.length - 1}
                                className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-primary hover:text-primary transition-all disabled:opacity-25 disabled:cursor-not-allowed shadow-sm active:scale-95"
                            >
                                <span className="material-icons-round text-[20px]">chevron_right</span>
                            </button>
                            <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                Next
                            </span>
                        </div>

                        {editMode && (
                            <div className="relative group">
                                <button
                                    onClick={addCard}
                                    className="w-9 h-9 rounded-full bg-white border border-primary/40 flex items-center justify-center text-primary hover:bg-primary/10 hover:border-primary transition-all shadow-sm active:scale-95"
                                >
                                    <span className="material-icons-round text-[18px]">add</span>
                                </button>
                                <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                    Add Card
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Dot indicators */}
                <div className="flex items-center gap-2 mt-6">
                    {cards.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveIndex(i)}
                            className={`rounded-full transition-all ${
                                i === activeIndex
                                    ? 'w-5 h-2.5 bg-primary'
                                    : 'w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
