import React from "react";

export const NotePageSidebar = ({ 
    pages, 
    activePageIndex, 
    onAddPage, 
    onRemovePage, 
    onSelectPage,
    onCollapse 
}) => {
    return (
        <aside className="w-64 border-l border-slate-200 bg-white flex flex-col p-6 gap-6 relative z-20 shrink-0 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Pages</h3>
                <button 
                    onClick={onCollapse}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
                >
                    <span className="material-icons-round text-sm">close</span>
                </button>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
                {pages.map((page, index) => (
                    <div 
                        key={index}
                        onClick={() => onSelectPage(index)}
                        className={`group relative cursor-pointer border-2 rounded-xl p-3 transition-all
                            ${activePageIndex === index 
                                ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' 
                                : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                                ${activePageIndex === index ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                                Page {index + 1}
                            </span>
                            
                            {pages.length > 1 && (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemovePage(index);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center transition-all"
                                >
                                    <span className="material-icons-round text-sm">delete</span>
                                </button>
                            )}
                        </div>

                        <div className="h-24 bg-white border border-slate-50 rounded shadow-sm overflow-hidden p-2">
                            <div 
                                className="text-[6px] text-slate-300 leading-tight origin-top scale-75 whitespace-pre-wrap break-words"
                                dangerouslySetInnerHTML={{ __html: page || "Empty page..." }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <button 
                onClick={onAddPage}
                className="mt-auto w-full group flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-2xl transition-all shadow-lg shadow-slate-900/20 active:scale-95"
            >
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform">
                    <span className="material-icons-round text-sm">add</span>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">New Page</span>
            </button>

            <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-t border-slate-50 pt-4">
                <span className="material-icons-round text-[14px]">description</span>
                {pages.length} Pages Total
            </div>
        </aside>
    );
};
