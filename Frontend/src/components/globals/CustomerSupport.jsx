import React, { useState } from 'react';
import CustomerSupportModal from './CustomerSupportModal';

export default function CustomerSupport() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 md:w-14 md:h-14  bg-stone-900 text-white shadow-xl flex items-center justify-center hover:bg-stone-700 hover:scale-105 active:scale-95 transition-all"
        aria-label="Customer support"
        title="Need help?"
      >
        <span className="material-symbols-outlined text-[24px] md:text-[26px]">support_agent</span>
      </button>

      {isOpen && <CustomerSupportModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
