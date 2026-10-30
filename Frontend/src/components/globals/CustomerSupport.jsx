import React, { useState } from 'react';
import CustomerSupportModal from './CustomerSupportModal';
import { notepaperMark } from '../../assets/assets';

export default function CustomerSupport() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#edf3ef] border border-[#d7e2dc] shadow-[0_10px_30px_-8px_rgba(35,62,57,.32)] flex items-center justify-center hover:bg-white hover:shadow-[0_14px_34px_-8px_rgba(35,62,57,.38)] hover:-translate-y-0.5 active:scale-95 transition-all"
        aria-label={isOpen ? 'Close customer support' : 'Open customer support'}
        aria-expanded={isOpen}
        aria-controls="customer-support-dialog"
        title={isOpen ? 'Close support' : 'Ask NotepaperAI'}
      >
        <img src={notepaperMark} alt="" aria-hidden="true" className="w-8 h-8 object-contain" />
      </button>

      {isOpen && <CustomerSupportModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
