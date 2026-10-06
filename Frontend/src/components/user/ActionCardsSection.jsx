import { useState } from "react";
import Loader from '../globals/Loader';
import { useNavigate } from "react-router-dom";
import { presentationService } from "../../api/presentationService";
import { CreateFolderModal } from "./FloatingAIButton";

// ── Quick-create tile ─────────────────────────────────────────────────────────
export const ActionCard = ({ icon, label, hint, chipClass, onClick, loading }) => {
  const inner = (
    <>
      <div className={`${chipClass} w-11 h-11  flex items-center justify-center mb-4 transition-transform group-hover:scale-105`}>
        {loading ? <Loader size="sm" /> : <span className="material-icons-round text-[21px]">{icon}</span>}
      </div>
      <span className="block font-semibold text-[14px] text-stone-800 leading-tight">{label}</span>
      <span className="block text-[11.5px] text-stone-400 mt-1">{hint}</span>
    </>
  );

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={
        "group flex flex-col items-start text-left bg-white  ring-1 ring-stone-200/80 px-5 py-5 transition-all " +
        "hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-22px_rgba(28,25,23,0.28)] hover:ring-plum-200 disabled:opacity-60"
      }
    >
      {inner}
    </button>
  );
};

// Quick-create section
export const ActionCardsSection = () => {
  const navigate = useNavigate();
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

  const go = (path) => navigate(`/lockedin/${path}`);

  const ACTIONS = [
    { icon: 'edit_note',   label: 'New Note',    hint: 'A fresh blank page',     chipClass: 'bg-plum-50 text-plum-700', action: () => go('notes/new') },
    { icon: 'article',      label: 'New Paper',   hint: 'A longer written piece', chipClass: 'bg-plum-50 text-plum-700', action: () => go('papers/new') },
    { icon: 'mic',          label: 'Voice note',  hint: 'Speak it out loud',      chipClass: 'bg-plum-50 text-plum-700', action: () => go('voice-to-speech') },
    { icon: 'slideshow',    label: 'New Slides',  hint: 'Build a quick deck',     chipClass: 'bg-plum-50 text-plum-700', action: handleNewSlides, loading: creatingSlides },
    { icon: 'style',        label: 'Flashcards',  hint: 'Make a study deck',      chipClass: 'bg-plum-50 text-plum-700', action: () => go('flashcards/new') },
    { icon: 'create_new_folder', label: 'New Folder', hint: 'Group your pages',   chipClass: 'bg-plum-50 text-plum-700', action: () => setShowFolderModal(true) },
  ];

  return (
    <>
      <section>
        <div className="mb-5">
          <p className="eyebrow text-plum-700 mb-1.5">Quick start</p>
          <h2 className="font-display-serif text-[24px] md:text-[27px] font-semibold tracking-tight text-stone-900">
            Start something new
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
          {ACTIONS.map(({ label, hint, icon, chipClass, action, loading }) => (
            <ActionCard
              key={label}
              icon={icon}
              label={label}
              hint={hint}
              chipClass={chipClass}
              onClick={action}
              loading={loading}
            />
          ))}
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

export default ActionCardsSection;
