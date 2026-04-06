import React from "react";

export const NoteToolbar = ({ onAction }) => {
  return (
    <aside className="w-16 border-r border-slate-200 bg-white flex flex-col items-center py-6 gap-6 relative z-30 shrink-0">
      <div className="flex flex-col gap-4">
        <button 
          onClick={() => onAction('bold')}
          className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all active:scale-90"
          title="Bold (Ctrl+B)"
        >
          <span className="material-icons-round text-[20px]">format_bold</span>
        </button>

        <button 
          onClick={() => onAction('italic')}
          className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all active:scale-90"
          title="Italic (Ctrl+I)"
        >
          <span className="material-icons-round text-[20px]">format_italic</span>
        </button>

        <button 
          onClick={() => onAction('insertUnorderedList')}
          className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all active:scale-90"
          title="Bullet List"
        >
          <span className="material-icons-round text-[20px]">format_list_bulleted</span>
        </button>

        <div className="h-px w-8 bg-slate-200 mx-auto my-2"></div>

        <button className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center cursor-not-allowed opacity-50">
          <span className="material-icons-round text-[20px]">draw</span>
        </button>

        <button className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center cursor-not-allowed opacity-50">
          <span className="material-icons-round text-[20px]">image</span>
        </button>
      </div>
    </aside>
  );
};
