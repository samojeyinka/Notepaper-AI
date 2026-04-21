import React, { useState } from 'react';
import CustomerSupportModal from './CustomerSupportModal';

export default function CustomerSupport() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSupport = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={toggleSupport}
        className="fixed bottom-8 right-8 w-10 h-10 md:w-16 mdd:h-16 bg-white hand-drawn-border shadow-2xl flex items-center justify-center z-50 hover:scale-110 active:scale-95 transition-all rounded-full hover:shadow-xl"
        aria-label="Customer Support"
        title="Need help? Click here!"
      >
        <span className="material-symbols-outlined text-3xl text-primary">
          headset_mic
        </span>
      </button>

      {/* Modal */}
      {isOpen && <CustomerSupportModal onClose={toggleSupport} />}
    </>
  );
}