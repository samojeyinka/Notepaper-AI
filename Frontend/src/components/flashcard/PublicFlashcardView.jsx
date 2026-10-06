import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { flashcardService } from "../../api/flashcardService";
import { FlashcardCard } from "./FlashcardCard";
import { logo } from "../../assets/assets";
import SEO from "../globals/SEO";
import { useAuth } from "../../context/AuthContext";

const Header = ({ title, isAuthenticated }) => (
    <header className="w-full flex items-center justify-between px-5 py-3 bg-white border-b border-slate-100 shrink-0">
        <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Notepaper-ai" className="w-7" />
            <span className="text-base font-semibold text-slate-800 tracking-tight">
                Notepaper<span className="text-primary">.ai</span>
            </span>
        </Link>
        <span className="text-[12px] text-slate-400 font-medium hidden sm:block truncate max-w-xs">{title}</span>
        <Link
            to={isAuthenticated ? "/lockedin/library" : "/signup"}
            className="text-[12px] font-semibold text-primary bg-primary/8 hover:bg-primary/12 border border-primary/15 px-3 py-1.5 rounded-full transition-colors"
        >
            {isAuthenticated ? "My library" : "Sign up free"}
        </Link>
    </header>
);

const PublicFlashcardView = () => {
    const { id } = useParams();
    const { isAuthenticated } = useAuth();

    const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
    const [title, setTitle] = useState('Untitled Flashcard');
    const [cards, setCards] = useState([]);
    const [template, setTemplate] = useState('girlies');
    const [bgColor, setBgColor] = useState('#ffffff');
    const [textColor, setTextColor] = useState('#1e293b');
    const [fontFamily, setFontFamily] = useState('sans');
    const [fontSize, setFontSize] = useState(18);
    const [boldSides, setBoldSides] = useState({ front: true, back: true });
    const [italicSides, setItalicSides] = useState({ front: false, back: false });
    const [activeIndex, setActiveIndex] = useState(0);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        let cancelled = false;
        flashcardService.getPublic(id)
            .then(res => {
                if (cancelled) return;
                const d = res.data ?? res;
                setTitle(d.title);
                setCards(d.cards?.length ? d.cards : []);
                setTemplate(d.template ?? 'girlies');
                setBgColor(d.bg_color);
                setTextColor(d.text_color);
                setFontFamily(d.font_family);
                setFontSize(d.font_size);
                const overrides = d.style_overrides;
                setBoldSides(overrides
                    ? { front: !!overrides.bold_front, back: !!overrides.bold_back }
                    : { front: !!d.is_bold, back: !!d.is_bold });
                setItalicSides(overrides
                    ? { front: !!overrides.italic_front, back: !!overrides.italic_back }
                    : { front: !!d.is_italic, back: !!d.is_italic });
                setStatus('ready');
            })
            .catch(() => {
                if (!cancelled) setStatus('error');
            });
        return () => { cancelled = true; };
    }, [id]);

    const goNext = () => { setActiveIndex(i => Math.min(i + 1, cards.length - 1)); };
    const goPrev = () => { setActiveIndex(i => Math.max(i - 1, 0)); };

    if (status === 'loading') {
        return (
            <div className="flex flex-col h-screen bg-white">
                <Header title="" isAuthenticated={isAuthenticated} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                </div>
            </div>
        );
    }

    if (status === 'error' || !cards.length) {
        return (
            <div className="flex flex-col h-screen bg-white">
                <Header title="" isAuthenticated={isAuthenticated} />
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
                    <span className="material-icons-round text-slate-300 text-[40px]">collections</span>
                    <h2 className="text-lg font-semibold text-slate-700">This flashcard deck isn't available</h2>
                    <p className="text-sm text-slate-400 max-w-xs">It may have been deleted, or the link is incorrect.</p>
                    <Link to="/" className="text-primary text-sm font-semibold hover:underline mt-2">Go to Notepaper-ai</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-white">
            <SEO
                title={title}
                description={`Study "${title}" flashcards on Notepaper AI — test your memory with beautiful analog styled cards.`}
                path={`/flashcards/${id}`}
                noIndex={true}
            />
            <Header title={title} isAuthenticated={isAuthenticated} />

            <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden pb-10">
                {/* Top utility row */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-white shrink-0">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                        Study Deck
                    </div>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition-colors"
                    >
                        <span className="material-icons-round text-[14px]">
                            {copied ? 'check_circle' : 'share'}
                        </span>
                        {copied ? 'Link copied!' : 'Share'}
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col lg:flex-row items-center justify-center p-6 gap-8 overflow-auto">
                    {/* Left Nudge Card for large screens */}
                    <div className="hidden lg:flex flex-col gap-5 w-64 shrink-0">
                        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                       
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Flip each card to study. Use swipe gestures or the navigation buttons to move between cards.
                            </p>
                        </div>
                        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Create Your Own</p>
                            <p className="text-[11px] text-slate-500 leading-snug mb-3">
                                Want to create your own beautiful digital flashcards?
                            </p>
                            <Link
                                to="/signup"
                                className="block w-full text-center py-2 rounded-xl bg-primary text-white text-[11px] font-semibold hover:bg-primary/90 transition-colors shadow-sm"
                            >
                                Sign up free
                            </Link>
                        </div>
                    </div>

                    {/* Card Study Container */}
                    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-xl">
                        <div className="relative flex items-center justify-center w-full px-12 md:px-16">
                            {/* Prev Button */}
                            <button
                                onClick={goPrev}
                                disabled={activeIndex === 0}
                                className="absolute left-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-primary hover:text-primary transition-all disabled:opacity-25 disabled:cursor-not-allowed shadow-sm active:scale-95 z-10"
                            >
                                <span className="material-icons-round text-[16px] md:text-[20px]">chevron_left</span>
                            </button>

                            {/* Card */}
                            <FlashcardCard
                                card={cards[activeIndex]}
                                template={template}
                                bgColor={bgColor}
                                textColor={textColor}
                                fontFamily={fontFamily}
                                fontSize={fontSize}
                                boldSides={boldSides}
                                italicSides={italicSides}
                                editMode={false}
                                cardIndex={activeIndex}
                                totalCards={cards.length}
                                onSwipeLeft={goNext}
                                onSwipeRight={goPrev}
                            />

                            {/* Next Button */}
                            <button
                                onClick={goNext}
                                disabled={activeIndex === cards.length - 1}
                                className="absolute right-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-primary hover:text-primary transition-all disabled:opacity-25 disabled:cursor-not-allowed shadow-sm active:scale-95 z-10"
                            >
                                <span className="material-icons-round text-[16px] md:text-[20px]">chevron_right</span>
                            </button>
                        </div>

                        {/* Pagination indicator */}
                        <div className="flex items-center gap-1.5 mt-6">
                            {cards.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveIndex(i)}
                                    className={`rounded-full transition-all ${
                                        i === activeIndex
                                            ? 'w-4 h-2 bg-primary'
                                            : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Mobile Nudge */}
                <div className="lg:hidden text-center text-[11px] text-slate-400 px-6">
                    Powered by{" "}
                    <Link to="/" className="text-primary hover:underline font-semibold">
                        Notepaper-ai
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PublicFlashcardView;
