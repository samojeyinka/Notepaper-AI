import { useState } from "react";
import Loader from '../globals/Loader';
import { useNavigate } from "react-router-dom";
import { presentationService } from "../../api/presentationService";
import { CreateFolderModal } from "./FloatingAIButton";

// ── Simple link card ──────────────────────────────────────────────────────────
export const ActionCard = ({ icon, label, shapeClass, bgColor, url, onClick, loading }) => {
  const inner = (
    <>
      <div className={`${shapeClass} ${bgColor} w-8 h-8 md:w-24 md:h-24 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
        {loading ? <Loader size="xs" /> : <span className="material-icons-round text-[14px] md:text-3xl">{icon}</span>}
      </div>
      <span className="font-medium md:font-semibold text-[12px] md:text-lg">{label}</span>
    </>
  );

  if (onClick) {
    return (
      <button onClick={onClick} disabled={loading} className="group flex flex-col items-center justify-center p-2 md:p-4 bg-white rounded-2xl hover:shadow-sm transition-all hover:-translate-y-1 disabled:opacity-60">
        {inner}
      </button>
    );
  }
  return (
    <a href={`/lockedin/${url}`} className="group flex flex-col items-center justify-center p-2 md:p-4 bg-white rounded-2xl hover:shadow-sm transition-all hover:-translate-y-1">
      {inner}
    </a>
  );
};

const PAGE_SIZE = 3;

// Action Cards Section
export const ActionCardsSection = () => {
  const navigate = useNavigate();
  const [page, setPage]                   = useState(0);
  const [dir, setDir]                     = useState(1);
  const [animating, setAnimating]         = useState(false);
  const [creatingSlides, setCreatingSlides] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);

  const handleNewSlides = async () => {
    setCreatingSlides(true);
    try {
      const res = await presentationService.create({
        title: 'Untitled Presentation',
        slides: JSON.stringify([{ slide: 1, layout: 'title', title: '', bullets: [''], speaker_notes: '', listStyle: 'bullet' }]),
        theme: 'modern',
        slide_count: 1,
      });
      navigate(`/lockedin/presentations/${res.data?.id ?? res.id}`);
    } catch { /* non-fatal */ }
    finally { setCreatingSlides(false); }
  };

  const ALL_CARDS = [
    // Page 0 — originals
    { icon: 'add',                   label: 'New Note',      shapeClass: 'pentagon-shape', bgColor: 'bg-yellow-400', url: 'notes/new' },
    { icon: 'mic',                   label: 'Voice Record',  shapeClass: 'rounded-full',   bgColor: 'bg-green-500',  url: 'voice-to-speech' },
    { icon: 'auto_awesome',          label: 'AI Generate',   shapeClass: 'blob-shape',     bgColor: 'bg-purple-500', url: 'generate' },
    // Page 1
    { icon: 'description',           label: 'New Paper',     shapeClass: 'rounded-xl',     bgColor: 'bg-blue-500',   url: 'papers/new' },
    { icon: 'style',                 label: 'New Flashcard', shapeClass: 'pentagon-shape', bgColor: 'bg-pink-500',   url: 'flashcards/new' },
    { icon: 'present_to_all',        label: 'Presentation',  shapeClass: 'blob-shape',     bgColor: 'bg-indigo-500', onClick: handleNewSlides, loading: creatingSlides },
    // Page 2
    { icon: 'folder_open',           label: 'New Folder',    shapeClass: 'rounded-xl',     bgColor: 'bg-orange-400', onClick: () => setShowFolderModal(true) },
    { icon: 'collections_bookmark',  label: 'Library',       shapeClass: 'rounded-full',   bgColor: 'bg-teal-500',   url: 'library' },
    { icon: 'quiz',                  label: 'AI Quiz',       shapeClass: 'blob-shape',     bgColor: 'bg-rose-500',   url: 'quizzes' },
  ];

  const TOTAL_PAGES = Math.ceil(ALL_CARDS.length / PAGE_SIZE);

  const goTo = (next) => {
    if (animating || next === page) return;
    setDir(next > page ? 1 : -1);
    setAnimating(true);
    setTimeout(() => { setPage(next); setAnimating(false); }, 220);
  };

  const cards = ALL_CARDS.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <>
      <section className="mb-4">
        <div className="relative overflow-hidden">
          <div
            className="grid grid-cols-3 gap-3 md:gap-8"
            style={{
              opacity: animating ? 0 : 1,
              transform: animating ? `translateX(${dir * 24}px)` : 'translateX(0)',
              transition: 'opacity 220ms ease, transform 220ms ease',
            }}
          >
            {cards.map((card) => (
              <ActionCard key={card.label} {...card} />
            ))}
          </div>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center justify-center gap-3 mt-1.5 md:mt-3">
          <button
            onClick={() => goTo(page - 1)}
            disabled={page === 0}
            className="w-4 h-4 md:w-6 md:h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 disabled:opacity-20 transition-colors"
          >
            <span className="material-icons-round text-[15px] md:text-[18px]">chevron_left</span>
          </button>

          {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-200 ${
                i === page ? 'w-4 h-1 md:w-5 md:h-2 bg-primary' : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}

          <button
            onClick={() => goTo(page + 1)}
            disabled={page === TOTAL_PAGES - 1}
            className="w-4 h-4 md:w-6 md:h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 disabled:opacity-20 transition-colors"
          >
            <span className="material-icons-round text-[15px] md:text-[18px]">chevron_right</span>
          </button>
        </div>
      </section>

      {showFolderModal && (
        <CreateFolderModal
          onClose={() => setShowFolderModal(false)}
          onCreated={(folder) => {
            setShowFolderModal(false);
            navigate(`/lockedin/folders/${folder.id}`);
          }}
        />
      )}
    </>
  );
};



export const PolaroidCard = ({ title, content, date, rotation, isQuote = false }) => {
  return (
    <div className={`polaroid-card bg-white p-4 pb-8 transform ${rotation}`}>
      <div className="aspect-[4/5] bg-slate-100 mb-4 overflow-hidden rounded-sm relative">
        <div className={`absolute inset-0 p-4 font-handwriting text-slate-600 text-xl leading-relaxed ${isQuote ? 'italic' : ''}`}>
          {content}
        </div>
      </div>
      <h3 className="font-bold text-slate-800">{title}</h3>
      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">{date}</p>
    </div>
  );
};