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
        <aside className="w-40 md:w-64 border-l border-stone-200 bg-paper flex flex-col p-3 md:p-5 gap-3 md:gap-5 relative z-20 shrink-0 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-semibold text-stone-500 uppercase tracking-[0.18em]">Pages</h3>
                <button
                    onClick={onCollapse}
                    className="w-7 h-7 flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
                >
                    <span className="material-icons-round text-[16px]">close</span>
                </button>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1">
                {pages.map((page, index) => (
                    <div
                        key={index}
                        onClick={() => onSelectPage(index)}
                        className={`group relative cursor-pointer border p-3 transition-colors
                            ${activePageIndex === index
                                ? 'border-plum-400 bg-plum-50'
                                : 'border-stone-200 bg-white hover:border-stone-300'}`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-[9px] md:text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5
                                ${activePageIndex === index ? 'bg-plum-600 text-white' : 'bg-stone-100 text-stone-500'}`}>
                                Page {index + 1}
                            </span>

                            {pages.length > 1 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemovePage(index);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 w-6 h-6 bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-all"
                                >
                                    <span className="material-icons-round text-[15px]">delete</span>
                                </button>
                            )}
                        </div>

                        <div className="h-16 md:h-24 bg-white border border-stone-200 overflow-hidden p-2">
                            <div
                                className="text-[6px] text-stone-300 leading-tight origin-top scale-75 whitespace-pre-wrap break-words"
                                dangerouslySetInnerHTML={{ __html: page || "Empty page..." }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={onAddPage}
                className="mt-auto w-full group flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white py-2 md:py-3 transition-colors active:scale-[0.98]"
            >
                <span className="material-icons-round text-[16px] group-hover:rotate-90 transition-transform">add</span>
                <span className="text-[10px] font-semibold uppercase tracking-widest">New Page</span>
            </button>

            <div className="flex items-center justify-center gap-2 text-stone-400 text-[10px] font-medium uppercase tracking-widest border-t border-stone-200 pt-3">
                <span className="material-icons-round text-[14px]">description</span>
                {pages.length} Pages Total
            </div>
        </aside>
    );
};
