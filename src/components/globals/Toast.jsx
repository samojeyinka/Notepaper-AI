import React, { useEffect, useState } from 'react';

export default function Toast({ message, type = 'success', onClose, duration = 8000 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) setTimeout(onClose, 500); // Allows exit animation to finish
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message && !visible) return null;

  let bgClass = "bg-emerald-600 text-white";
  let icon = "check_circle";

  if (type === 'error') {
    bgClass = "bg-red-600 text-white";
    icon = "error";
  } else if (type === 'info') {
    bgClass = "bg-slate-800 text-white";
    icon = "info";
  }

  return (
    <div 
      className={`fixed top-8 right-6 z-[100] transition-all duration-300 transform flex items-center ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0 pointer-events-none'
      }`}
    >
      <div className={`${bgClass} px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 min-w-[280px]`}>
        <span className="material-symbols-outlined opacity-90">{icon}</span>
        <p className="font-semibold text-sm flex-1">{message}</p>
        <button 
          onClick={() => {
            setVisible(false);
            if (onClose) setTimeout(onClose, 300);
          }} 
          className="opacity-60 hover:opacity-100 transition-opacity flex items-center justify-center rounded-full hover:bg-black/10 p-1"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>
    </div>
  );
}
